const { renderToString } = require('treebark');
import { 
  basicRenderingTests, 
  dataInterpolationTests, 
  bindingTests, 
  securityErrorTests, 
  securityValidTests, 
  tagSpecificAttributeTests, 
  tagSpecificAttributeErrorTests, 
  shorthandArrayTests, 
  voidTagTests, 
  voidTagErrorTests,
  commentTagTests,
  commentTagErrorTests,
  createTest,
  createErrorTest,
  TestCase 
} from './common-tests';

describe('String Renderer', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    basicRenderingTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders simple text':
            expect(result).toBe('Hello world');
            break;
          case 'renders simple element':
            expect(result).toBe('<div>Hello world</div>');
            break;
          case 'renders element with attributes':
            expect(result).toBe('<div class="greeting" id="hello">Hello world</div>');
            break;
          case 'renders nested elements':
            expect(result).toBe('<div><h1>Title</h1><p>Content</p></div>');
            break;
          case 'renders array as fragment':
            expect(result).toBe('<h1>Title</h1><p>Content</p>');
            break;
          case 'renders mixed content':
            expect(result).toBe('<div>Hello <span>world</span>!</div>');
            break;
        }
      });
    });
  });

  // Data interpolation tests
  describe('Data Interpolation', () => {
    dataInterpolationTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'interpolates data':
            expect(result).toBe('<div>Hello Alice!</div>');
            break;
          case 'interpolates nested properties':
            expect(result).toBe('<div>Price: $99</div>');
            break;
          case 'interpolates in attributes':
            expect(result).toBe('<a href="/user/123">Alice</a>');
            break;
          case 'handles escaped interpolation':
            expect(result).toBe('Hello {{name}}!');
            break;
        }
      });
    });
  });

  // Binding tests
  describe('Data Binding', () => {
    bindingTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'handles array binding':
            expect(result).toBe('<ul><li>Apple - $1</li><li>Banana - $2</li></ul>');
            break;
          case 'handles object binding':
            expect(result).toBe('<div class="user-card"><h2>Alice</h2><p>alice@example.com</p></div>');
            break;
          case 'handles self-contained template':
            expect(result).toBe('<p>Hello Alice!</p>');
            break;
        }
      });
    });
  });

  // String-specific tests (HTML escaping, etc.)
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

  // Security and validation tests
  describe('Security and Validation', () => {
    securityErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });

    securityValidTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'allows data- and aria- attributes':
            expect(result).toBe('<div data-test="value" aria-label="Test">Content</div>');
            break;
        }
      });
    });
  });

  // Tag-specific attribute tests
  describe('Tag-specific Attributes', () => {
    tagSpecificAttributeTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'allows tag-specific attributes for img':
            expect(result).toBe('<img src="image.jpg" alt="An image" width="100" height="200">');
            break;
          case 'allows tag-specific attributes for a':
            expect(result).toBe('<a href="https://example.com" target="_blank" rel="noopener">Link text</a>');
            break;
          case 'allows global attributes on any tag':
            expect(result).toBe('<span id="test-id" class="test-class" style="color: red" title="Test title" role="button">Content</span>');
            break;
          case 'allows tag-specific attributes for table elements':
            expect(result).toBe('<table summary="Test table"><tr><th scope="col" colspan="2">Header</th><td rowspan="1">Data</td></tr></table>');
            break;
          case 'allows tag-specific attributes for blockquote':
            expect(result).toBe('<blockquote cite="https://example.com">Quote text</blockquote>');
            break;
        }
      });
    });

    tagSpecificAttributeErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });
  });

  // Shorthand array syntax tests
  describe('Shorthand Array Syntax', () => {
    shorthandArrayTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders shorthand array syntax for nodes without attributes':
            expect(result).toBe('<div><h2>Title</h2><p>Content</p></div>');
            break;
          case 'shorthand array syntax with mixed content':
            expect(result).toBe('<div>Hello <span>world</span>!</div>');
            break;
          case 'shorthand array syntax with data interpolation':
            expect(result).toBe('<div><h1>Welcome</h1><p>This is a test.</p></div>');
            break;
          case 'shorthand array syntax works with empty arrays':
            expect(result).toBe('<div></div>');
            break;
        }
      });
    });

    test('shorthand array syntax equivalent to $children', () => {
      const shorthand = renderToString({
        ul: [
          { li: 'Item 1' },
          { li: 'Item 2' },
          { li: 'Item 3' }
        ]
      });
      
      const explicit = renderToString({
        ul: {
          $children: [
            { li: 'Item 1' },
            { li: 'Item 2' },
            { li: 'Item 3' }
          ]
        }
      });
      
      expect(shorthand).toBe(explicit);
      expect(shorthand).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
    });

    test('shorthand array syntax with nested structures', () => {
      const result = renderToString({
        div: [
          { 
            div: [
              { h1: 'Article Title' },
              { p: 'Published on 2024' }
            ]
          },
          { 
            div: [
              { p: 'First paragraph' },
              { p: 'Second paragraph' }
            ]
          }
        ]
      });
      expect(result).toBe('<div><div><h1>Article Title</h1><p>Published on 2024</p></div><div><p>First paragraph</p><p>Second paragraph</p></div></div>');
    });
  });

  // Void tag tests
  describe('Void Tag Validation', () => {
    voidTagTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'allows void tags without children':
            expect(result).toBe('<img src="image.jpg" alt="Test image">');
            break;
        }
      });
    });

    voidTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });

    test('void tags render without closing tags', () => {
      const result = renderToString({
        div: {
          $children: [
            { img: { src: 'image1.jpg', alt: 'First' } },
            ' ',
            { img: { src: 'image2.jpg', alt: 'Second' } }
          ]
        }
      });
      expect(result).toBe('<div><img src="image1.jpg" alt="First"> <img src="image2.jpg" alt="Second"></div>');
    });
  });

  // HTML comment tag tests
  describe('HTML Comment Tags', () => {
    commentTagTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders simple comment tag':
            expect(result).toBe('<!-- This is a comment -->');
            break;
          case 'renders comment tag with data interpolation':
            expect(result).toBe('<!-- User: Alice -->');
            break;
          case 'renders comment tag with HTML content':
            expect(result).toBe('<!-- Start <span>middle</span> end -->');
            break;
          case 'renders comment tag in mixed content':
            expect(result).toBe('<div>Before comment<!-- This is a comment -->After comment</div>');
            break;
          case 'renders multiple comment tags':
            expect(result).toBe('<!-- First comment --><!-- Second comment -->');
            break;
          case 'renders comment tag within nested structure':
            expect(result).toBe('<div class="container"><h1>Title</h1><!-- TODO: Add more content here --><p>Content paragraph</p></div>');
            break;
          case 'renders empty comment tag':
            expect(result).toBe('<!-- -->');
            break;
          case 'renders comment tag with nested property interpolation':
            expect(result).toBe('<!-- Debug: 123 - Bob -->');
            break;
        }
      });
    });

    commentTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });

    test('comment tags handle escaped interpolation correctly', () => {
      const result = renderToString(
        { comment: 'Comment with {{{escaped}}} content' },
        { data: { escaped: 'test' } }
      );
      expect(result).toBe('<!-- Comment with {{escaped}} content -->');
    });

    test('comment tags in self-contained templates', () => {
      const result = renderToString({
        $template: {
          div: {
            $children: [
              { comment: 'Template comment for {{title}}' },
              { h1: '{{title}}' }
            ]
          }
        },
        $data: { title: 'Test Page' }
      });
      expect(result).toBe('<div><!-- Template comment for Test Page --><h1>Test Page</h1></div>');
    });

    test('comment tags with array binding', () => {
      const result = renderToString({
        ul: {
          $bind: 'items',
          $children: [
            { comment: 'Item: {{name}}' },
            { li: '{{name}} - {{price}}' }
          ]
        }
      }, {
        data: {
          items: [
            { name: 'Apple', price: '$1' },
            { name: 'Banana', price: '$2' }
          ]
        }
      });
      expect(result).toBe('<ul><!-- Item: Apple --><li>Apple - $1</li><!-- Item: Banana --><li>Banana - $2</li></ul>');
    });
  });
});