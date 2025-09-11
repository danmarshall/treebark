const { renderToString } = require('treebark');

describe('String Renderer', () => {
  test('renders simple text', () => {
    const result = renderToString('Hello world');
    expect(result).toBe('Hello world');
  });

  test('renders simple element', () => {
    const result = renderToString({ div: 'Hello world' });
    expect(result).toBe('<div>Hello world</div>');
  });

  test('renders element with attributes', () => {
    const result = renderToString({
      div: {
        class: 'greeting',
        id: 'hello',
        $children: ['Hello world']
      }
    });
    expect(result).toBe('<div class="greeting" id="hello">Hello world</div>');
  });

  test('renders nested elements', () => {
    const result = renderToString({
      div: {
        $children: [
          { h1: 'Title' },
          { p: 'Content' }
        ]
      }
    });
    expect(result).toBe('<div><h1>Title</h1><p>Content</p></div>');
  });

  test('renders array as fragment', () => {
    const result = renderToString([
      { h1: 'Title' },
      { p: 'Content' }
    ]);
    expect(result).toBe('<h1>Title</h1><p>Content</p>');
  });

  test('renders mixed content', () => {
    const result = renderToString({
      div: {
        $children: [
          'Hello ',
          { span: 'world' },
          '!'
        ]
      }
    });
    expect(result).toBe('<div>Hello <span>world</span>!</div>');
  });

  test('interpolates data', () => {
    const result = renderToString(
      { div: 'Hello {{name}}!' },
      { data: { name: 'Alice' } }
    );
    expect(result).toBe('<div>Hello Alice!</div>');
  });

  test('interpolates nested properties', () => {
    const result = renderToString(
      { div: 'Price: {{product.price}}' },
      { data: { product: { price: '$99' } } }
    );
    expect(result).toBe('<div>Price: $99</div>');
  });

  test('interpolates in attributes', () => {
    const result = renderToString(
      {
        a: {
          href: '/user/{{id}}',
          $children: ['{{name}}']
        }
      },
      { data: { id: '123', name: 'Alice' } }
    );
    expect(result).toBe('<a href="/user/123">Alice</a>');
  });

  test('handles array binding', () => {
    const result = renderToString(
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
    expect(result).toBe('<ul><li>Apple - $1</li><li>Banana - $2</li></ul>');
  });

  test('handles object binding', () => {
    const result = renderToString(
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
    expect(result).toBe('<div class="user-card"><h2>Alice</h2><p>alice@example.com</p></div>');
  });

  test('handles self-contained template', () => {
    const result = renderToString({
      $template: { p: 'Hello {{name}}!' },
      $data: { name: 'Alice' }
    });
    expect(result).toBe('<p>Hello Alice!</p>');
  });

  test('escapes HTML in content', () => {
    const result = renderToString(
      { div: '{{content}}' },
      { data: { content: '<script>alert("xss")</script>' } }
    );
    expect(result).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>');
  });

  test('escapes HTML in attributes', () => {
    const result = renderToString(
      {
        div: {
          title: '{{title}}',
          $children: ['Content']
        }
      },
      { data: { title: '<script>alert("xss")</script>' } }
    );
    expect(result).toBe('<div title="&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;">Content</div>');
  });

  test('handles escaped interpolation', () => {
    const result = renderToString('Hello {{{name}}}!', { data: { name: 'Alice' } });
    expect(result).toBe('Hello {{name}}!');
  });

  test('throws error for disallowed tags', () => {
    expect(() => {
      renderToString({ script: 'alert("xss")' });
    }).toThrow('Tag "script" is not allowed');
  });

  test('throws error for disallowed attributes', () => {
    expect(() => {
      renderToString({
        div: {
          onclick: 'alert("xss")',
          $children: ['Content']
        }
      });
    }).toThrow('Attribute "onclick" is not allowed');
  });

  test('allows data- and aria- attributes', () => {
    const result = renderToString({
      div: {
        'data-test': 'value',
        'aria-label': 'Test',
        $children: ['Content']
      }
    });
    expect(result).toBe('<div data-test="value" aria-label="Test">Content</div>');
  });
});