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
});