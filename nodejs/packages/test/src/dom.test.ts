/**
 * @jest-environment jsdom
 */
const { renderToDOM } = require('treebark');

describe('DOM Renderer', () => {
  test('renders simple text', () => {
    const fragment = renderToDOM('Hello world');
    expect(fragment.textContent).toBe('Hello world');
    expect(fragment.childNodes.length).toBe(1);
    expect(fragment.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  });

  test('renders simple element', () => {
    const fragment = renderToDOM({ div: 'Hello world' });
    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.textContent).toBe('Hello world');
  });

  test('renders element with attributes', () => {
    const fragment = renderToDOM({
      div: {
        class: 'greeting',
        id: 'hello',
        $children: ['Hello world']
      }
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.className).toBe('greeting');
    expect(div.id).toBe('hello');
    expect(div.textContent).toBe('Hello world');
  });

  test('renders nested elements', () => {
    const fragment = renderToDOM({
      div: {
        $children: [
          { h1: 'Title' },
          { p: 'Content' }
        ]
      }
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.children.length).toBe(2);
    expect(div.children[0].tagName).toBe('H1');
    expect(div.children[0].textContent).toBe('Title');
    expect(div.children[1].tagName).toBe('P');
    expect(div.children[1].textContent).toBe('Content');
  });

  test('renders array as fragment', () => {
    const fragment = renderToDOM([
      { h1: 'Title' },
      { p: 'Content' }
    ]);
    expect(fragment.children.length).toBe(2);
    expect(fragment.children[0].tagName).toBe('H1');
    expect(fragment.children[0].textContent).toBe('Title');
    expect(fragment.children[1].tagName).toBe('P');
    expect(fragment.children[1].textContent).toBe('Content');
  });

  test('renders mixed content', () => {
    const fragment = renderToDOM({
      div: {
        $children: [
          'Hello ',
          { span: 'world' },
          '!'
        ]
      }
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.childNodes.length).toBe(3);
    expect(div.childNodes[0].textContent).toBe('Hello ');
    expect((div.childNodes[1] as HTMLElement).tagName).toBe('SPAN');
    expect(div.childNodes[1].textContent).toBe('world');
    expect(div.childNodes[2].textContent).toBe('!');
  });

  test('interpolates data', () => {
    const fragment = renderToDOM(
      { div: 'Hello {{name}}!' },
      { data: { name: 'Alice' } }
    );
    const div = fragment.firstChild as HTMLElement;
    expect(div.textContent).toBe('Hello Alice!');
  });

  test('interpolates nested properties', () => {
    const fragment = renderToDOM(
      { div: 'Price: {{product.price}}' },
      { data: { product: { price: '$99' } } }
    );
    const div = fragment.firstChild as HTMLElement;
    expect(div.textContent).toBe('Price: $99');
  });

  test('interpolates in attributes', () => {
    const fragment = renderToDOM(
      {
        a: {
          href: '/user/{{id}}',
          $children: ['{{name}}']
        }
      },
      { data: { id: '123', name: 'Alice' } }
    );
    const a = fragment.firstChild as HTMLAnchorElement;
    expect(a.href).toBe('http://localhost/user/123');
    expect(a.textContent).toBe('Alice');
  });

  test('handles array binding', () => {
    const fragment = renderToDOM(
      {
        ul: {
          $bind: 'items',
          $children: [{ li: '{{name}} - {{price}}' }]
        }
      },
      {
        data: {
          items: [
            { name: 'Apple', price: '$1' },
            { name: 'Banana', price: '$2' }
          ]
        }
      }
    );
    const ul = fragment.firstChild as HTMLElement;
    expect(ul.tagName).toBe('UL');
    const lis = ul.querySelectorAll('li');
    expect(lis.length).toBe(2);
    expect(lis[0].textContent).toBe('Apple - $1');
    expect(lis[1].textContent).toBe('Banana - $2');
  });

  test('handles object binding', () => {
    const fragment = renderToDOM(
      {
        div: {
          $bind: 'user',
          class: 'user-card',
          $children: [
            { h2: '{{name}}' },
            { p: '{{email}}' }
          ]
        }
      },
      {
        data: {
          user: { name: 'Alice', email: 'alice@example.com' }
        }
      }
    );
    const div = fragment.firstChild as HTMLElement;
    expect(div.className).toBe('user-card');
    expect(div.querySelector('h2')?.textContent).toBe('Alice');
    expect(div.querySelector('p')?.textContent).toBe('alice@example.com');
  });

  test('handles self-contained template', () => {
    const fragment = renderToDOM({
      $template: { p: 'Hello {{name}}!' },
      $data: { name: 'Alice' }
    });
    const p = fragment.firstChild as HTMLElement;
    expect(p.tagName).toBe('P');
    expect(p.textContent).toBe('Hello Alice!');
  });

  test('handles escaped interpolation', () => {
    const fragment = renderToDOM('Hello {{{name}}}!', { data: { name: 'Alice' } });
    expect(fragment.textContent).toBe('Hello {{name}}!');
  });

  test('throws error for disallowed tags', () => {
    expect(() => {
      renderToDOM({ script: 'alert("xss")' });
    }).toThrow('Tag "script" is not allowed');
  });

  test('throws error for disallowed attributes', () => {
    expect(() => {
      renderToDOM({
        div: {
          onclick: 'alert("xss")',
          $children: ['Content']
        }
      });
    }).toThrow('Attribute "onclick" is not allowed');
  });

  test('allows data- and aria- attributes', () => {
    const fragment = renderToDOM({
      div: {
        'data-test': 'value',
        'aria-label': 'Test',
        $children: ['Content']
      }
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.getAttribute('data-test')).toBe('value');
    expect(div.getAttribute('aria-label')).toBe('Test');
  });

  test('allows tag-specific attributes for img', () => {
    const fragment = renderToDOM({
      img: {
        src: 'image.jpg',
        alt: 'An image',
        width: '100',
        height: '200'
      }
    });
    const img = fragment.firstChild as HTMLImageElement;
    expect(img.src).toBe('http://localhost/image.jpg');
    expect(img.alt).toBe('An image');
    expect(img.getAttribute('width')).toBe('100');
    expect(img.getAttribute('height')).toBe('200');
  });

  test('allows tag-specific attributes for a', () => {
    const fragment = renderToDOM({
      a: {
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener',
        $children: ['Link text']
      }
    });
    const a = fragment.firstChild as HTMLAnchorElement;
    expect(a.href).toBe('https://example.com/');
    expect(a.target).toBe('_blank');
    expect(a.rel).toBe('noopener');
    expect(a.textContent).toBe('Link text');
  });

  test('throws error for tag-specific attribute on wrong tag', () => {
    expect(() => {
      renderToDOM({
        div: {
          src: 'image.jpg',
          $children: ['Content']
        }
      });
    }).toThrow('Attribute "src" is not allowed on tag "div"');
  });

  test('throws error for img-specific attribute on div', () => {
    expect(() => {
      renderToDOM({
        div: {
          width: '100',
          $children: ['Content']
        }
      });
    }).toThrow('Attribute "width" is not allowed on tag "div"');
  });

  test('throws error for a-specific attribute on div', () => {
    expect(() => {
      renderToDOM({
        div: {
          target: '_blank',
          $children: ['Content']
        }
      });
    }).toThrow('Attribute "target" is not allowed on tag "div"');
  });

  test('allows global attributes on any tag', () => {
    const fragment = renderToDOM({
      span: {
        id: 'test-id',
        class: 'test-class',
        style: 'color: red',
        title: 'Test title',
        role: 'button',
        $children: ['Content']
      }
    });
    const span = fragment.firstChild as HTMLElement;
    expect(span.id).toBe('test-id');
    expect(span.className).toBe('test-class');
    expect(span.getAttribute('style')).toBe('color: red');
    expect(span.title).toBe('Test title');
    expect(span.getAttribute('role')).toBe('button');
    expect(span.textContent).toBe('Content');
  });

  test('allows tag-specific attributes for table elements', () => {
    const fragment = renderToDOM({
      table: {
        summary: 'Test table',
        $children: [
          {
            tr: [
              {
                th: {
                  scope: 'col',
                  colspan: '2',
                  $children: ['Header']
                }
              },
              {
                td: {
                  rowspan: '1',
                  $children: ['Data']
                }
              }
            ]
          }
        ]
      }
    });
    const table = fragment.firstChild as HTMLTableElement;
    expect(table.getAttribute('summary')).toBe('Test table');
    const th = table.querySelector('th') as HTMLTableCellElement;
    expect(th.getAttribute('scope')).toBe('col');
    expect(th.getAttribute('colspan')).toBe('2');
    const td = table.querySelector('td') as HTMLTableCellElement;
    expect(td.getAttribute('rowspan')).toBe('1');
  });

  test('allows tag-specific attributes for blockquote', () => {
    const fragment = renderToDOM({
      blockquote: {
        cite: 'https://example.com',
        $children: ['Quote text']
      }
    });
    const blockquote = fragment.firstChild as HTMLElement;
    expect(blockquote.getAttribute('cite')).toBe('https://example.com');
    expect(blockquote.textContent).toBe('Quote text');
  });

  test('can be inserted into DOM', () => {
    document.body.innerHTML = '';
    const fragment = renderToDOM({
      div: {
        id: 'test-container',
        $children: [
          { h1: 'Test Title' },
          { p: 'Test content' }
        ]
      }
    });
    
    document.body.appendChild(fragment);
    
    const container = document.getElementById('test-container');
    expect(container).toBeTruthy();
    expect(container?.querySelector('h1')?.textContent).toBe('Test Title');
    expect(container?.querySelector('p')?.textContent).toBe('Test content');
  });

  // Tests for shorthand array syntax feature
  test('renders shorthand array syntax for nodes without attributes', () => {
    const fragment = renderToDOM({
      div: [
        { h2: 'Title' },
        { p: 'Content' }
      ]
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.children.length).toBe(2);
    expect(div.children[0].tagName).toBe('H2');
    expect(div.children[0].textContent).toBe('Title');
    expect(div.children[1].tagName).toBe('P');
    expect(div.children[1].textContent).toBe('Content');
  });

  test('shorthand array syntax equivalent to $children in DOM', () => {
    const shorthand = renderToDOM({
      ul: [
        { li: 'Item 1' },
        { li: 'Item 2' },
        { li: 'Item 3' }
      ]
    });
    
    const explicit = renderToDOM({
      ul: {
        $children: [
          { li: 'Item 1' },
          { li: 'Item 2' },
          { li: 'Item 3' }
        ]
      }
    });
    
    const shorthandDiv = shorthand.firstChild as HTMLElement;
    const explicitDiv = explicit.firstChild as HTMLElement;
    
    expect(shorthandDiv.tagName).toBe(explicitDiv.tagName);
    expect(shorthandDiv.children.length).toBe(explicitDiv.children.length);
    expect(shorthandDiv.outerHTML).toBe(explicitDiv.outerHTML);
  });

  test('shorthand array syntax with mixed content in DOM', () => {
    const fragment = renderToDOM({
      div: [
        'Hello ',
        { span: 'world' },
        '!'
      ]
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.childNodes.length).toBe(3);
    expect(div.childNodes[0].textContent).toBe('Hello ');
    expect((div.childNodes[1] as HTMLElement).tagName).toBe('SPAN');
    expect(div.childNodes[1].textContent).toBe('world');
    expect(div.childNodes[2].textContent).toBe('!');
  });

  test('shorthand array syntax with data interpolation in DOM', () => {
    const fragment = renderToDOM(
      {
        div: [
          { h1: '{{title}}' },
          { p: '{{content}}' }
        ]
      },
      { data: { title: 'Welcome', content: 'This is a test.' } }
    );
    const div = fragment.firstChild as HTMLElement;
    expect(div.querySelector('h1')?.textContent).toBe('Welcome');
    expect(div.querySelector('p')?.textContent).toBe('This is a test.');
  });

  test('shorthand array syntax works with empty arrays in DOM', () => {
    const fragment = renderToDOM({
      div: []
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.children.length).toBe(0);
    expect(div.textContent).toBe('');
  });

  // Tests for void tag validation
  test('prevents children on void tags in DOM', () => {
    expect(() => {
      renderToDOM({
        img: {
          src: 'image.jpg',
          $children: ['This should not work']
        }
      });
    }).toThrow('Tag "img" is a void element and cannot have children');
  });

  test('prevents children on void tags with shorthand syntax in DOM', () => {
    expect(() => {
      renderToDOM({
        img: ['This should not work']
      });
    }).toThrow('Tag "img" is a void element and cannot have children');
  });

  test('allows void tags without children in DOM', () => {
    const fragment = renderToDOM({
      img: {
        src: 'image.jpg',
        alt: 'Test image'
      }
    });
    const img = fragment.firstChild as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toContain('image.jpg');
    expect(img.alt).toBe('Test image');
    expect(img.children.length).toBe(0);
  });

  test('void tags render correctly in DOM', () => {
    const fragment = renderToDOM({
      div: {
        $children: [
          { img: { src: 'image1.jpg', alt: 'First' } },
          { img: { src: 'image2.jpg', alt: 'Second' } }
        ]
      }
    });
    const div = fragment.firstChild as HTMLElement;
    expect(div.children.length).toBe(2);
    expect((div.children[0] as HTMLImageElement).tagName).toBe('IMG');
    expect((div.children[1] as HTMLImageElement).tagName).toBe('IMG');
    expect((div.children[0] as HTMLImageElement).alt).toBe('First');
    expect((div.children[1] as HTMLImageElement).alt).toBe('Second');
  });
});