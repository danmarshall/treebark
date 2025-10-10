import { renderToString, TreebarkInput } from 'treebark';
import {
  basicRenderingTests,
  dataInterpolationTests,
  bindingTests,
  parentPropertyTests,
  securityErrorTests,
  securityValidTests,
  tagSpecificAttributeTests,
  tagSpecificAttributeErrorTests,
  shorthandArrayTests,
  voidTagTests,
  voidTagErrorTests,
  commentTests,
  commentErrorTests,
  bindValidationErrorTests,
  ifTagTests,
  ifTagErrorTests,
  createTest,
  createErrorTest,
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
          case 'handles TreebarkInput format':
            expect(result).toBe('<p>Hello Bob!</p>');
            break;
          case 'handles TreebarkInput format without data':
            expect(result).toBe('<div>Static content</div>');
            break;
          case 'handles $bind: "." to bind to current data object (array)':
            expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
            break;
          case 'handles $bind: "." to bind to current data object (nested)':
            expect(result).toBe('<div><h2>Alice</h2><div><p>Email: alice@example.com</p><p>Role: Admin</p></div></div>');
            break;
          case 'handles single template with array data':
            expect(result).toBe('<div class="card"><h3>Laptop</h3><p>Price: $999</p></div><div class="card"><h3>Mouse</h3><p>Price: $25</p></div>');
            break;
        }
      });
    });
  });

  // Parent property access tests
  describe('Parent Property Access', () => {
    parentPropertyTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'accesses parent property with double dots':
            expect(result).toBe('<div><h2>Alice</h2><p>Organization: ACME Corp</p></div>');
            break;
          case 'accesses grandparent property with double dots and slash':
            expect(result).toBe('<div><div><span>Alice works at Tech Solutions Inc</span><span>Bob works at Tech Solutions Inc</span></div></div>');
            break;
          case 'handles parent property in attributes':
            expect(result).toBe('<div><a href="/products/1">Laptop</a><a href="/products/2">Mouse</a></div>');
            break;
          case 'returns empty string when parent not found':
            expect(result).toBe('<div><p>Missing: </p></div>');
            break;
          case 'returns empty string when too many parent levels requested':
            expect(result).toBe('<div><p>Missing: </p></div>');
            break;
          case 'works with nested object binding':
            expect(result).toBe('<div><h1>ACME Corp</h1><div><h2>Engineering</h2><p>Part of ACME Corp</p></div></div>');
            break;
        }
      });
    });
  });

  // String-specific tests (HTML escaping, etc.)
  test('escapes HTML in content', () => {
    const result = renderToString({
      template: { div: '{{content}}' },
      data: { content: '<script>alert("xss")</script>' }
    });
    expect(result).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>');
  });

  test('escapes HTML in attributes', () => {
    const result = renderToString({
      template: {
        div: {
          title: '{{title}}',
          $children: ['Content']
        }
      },
      data: { title: '<script>alert("xss")</script>' }
    });
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
        template: {
          ul: [
            { li: 'Item 1' },
            { li: 'Item 2' },
            { li: 'Item 3' }
          ]
        }
      });

      const explicit = renderToString({
        template: {
          ul: {
            $children: [
              { li: 'Item 1' },
              { li: 'Item 2' },
              { li: 'Item 3' }
            ]
          }
        }
      });

      expect(shorthand).toBe(explicit);
      expect(shorthand).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
    });

    test('shorthand array syntax with nested structures', () => {
      const result = renderToString({
        template: {
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
        }
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
        template: {
          div: {
            $children: [
              { img: { src: 'image1.jpg', alt: 'First' } },
              ' ',
              { img: { src: 'image2.jpg', alt: 'Second' } }
            ]
          }
        }
      });
      expect(result).toBe('<div><img src="image1.jpg" alt="First"> <img src="image2.jpg" alt="Second"></div>');
    });
  });

  // Comment tests
  describe('Comment Rendering', () => {
    commentTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders basic comment':
            expect(result).toBe('<!--This is a comment-->');
            break;
          case 'renders comment with interpolation':
            expect(result).toBe('<!--User: Alice-->');
            break;
          case 'renders comment containing other tags':
            expect(result).toBe('<!--Start: <span>highlighted text</span> :End-->');
            break;
          case 'renders empty comment':
            expect(result).toBe('<!---->');
            break;
          case 'renders comment with special characters':
            expect(result).toBe('<!--Special chars: & < > " \'-->');
            break;
          case 'safely handles malicious interpolation':
            expect(result).toBe('<!--User input: evil --&gt; &lt;script&gt;alert(1)&lt;/script&gt;-->');
            break;
        }
      });
    });

    commentErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });

    bindValidationErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });

    test('renders comments with indentation', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              { comment: 'Start of content' },
              { h1: 'Title' },
              { comment: 'End of content' }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  <!--Start of content-->\n  <h1>Title</h1>\n  <!--End of content-->\n</div>');
    });

    test('renders nested comments with proper indentation', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              { comment: 'Outer comment' },
              {
                section: {
                  $children: [
                    { comment: 'Inner comment' },
                    { p: 'Content' }
                  ]
                }
              }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  <!--Outer comment-->\n  <section>\n    <!--Inner comment-->\n    <p>Content</p>\n  </section>\n</div>');
    });
  });

  // Indent functionality tests
  describe('Indent Functionality', () => {
    test('renders without indentation by default', () => {
      const result = renderToString({
        template: {
          div: {
            class: 'card',
            $children: [
              { h2: 'Title' },
              { p: 'Content' }
            ]
          }
        }
      });
      expect(result).toBe('<div class="card"><h2>Title</h2><p>Content</p></div>');
    });

    test('renders with default indentation when indent is true', () => {
      const result = renderToString({
        template: {
          div: {
            class: 'card',
            $children: [
              { h2: 'Title' },
              { p: 'Content' }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div class="card">\n  <h2>Title</h2>\n  <p>Content</p>\n</div>');
    });

    test('renders with custom space indentation', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              { h1: 'Header' }
            ]
          }
        }
      }, { indent: 4 });
      expect(result).toBe('<div>\n    <h1>Header</h1>\n</div>');
    });

    test('renders with custom string indentation', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              { h1: 'Header' }
            ]
          }
        }
      }, { indent: '\t' });
      expect(result).toBe('<div>\n\t<h1>Header</h1>\n</div>');
    });

    test('renders nested elements with proper indentation', () => {
      const result = renderToString({
        template: {
          div: [
            { h1: 'Welcome' },
            {
              ul: [
                { li: 'Item 1' },
                { li: 'Item 2' }
              ]
            }
          ]
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  <h1>Welcome</h1>\n  <ul>\n    <li>Item 1</li>\n    <li>Item 2</li>\n  </ul>\n</div>');
    });

    test('does not indent elements with only text content', () => {
      const result = renderToString({
        template: { p: 'Simple text content' }
      }, { indent: true });
      expect(result).toBe('<p>Simple text content</p>');
    });

    test('works with bound arrays', () => {
      const result = renderToString({
        template: {
          ul: {
            $bind: 'items',
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] }
      }, { indent: true });
      expect(result).toBe('<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>');
    });

    test('indents multiple text strings in sequence', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              'First string',
              'Second string',
              'Third string'
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  First string\n  Second string\n  Third string\n</div>');
    });

    test('preserves template functionality with indentation', () => {
      const input: TreebarkInput = {
        template: {
          div: {
            $children: [
              { h1: '{{title}}' },
              { p: '{{content}}' }
            ]
          }
        },
        data: {
          title: 'Test Title',
          content: 'Test Content'
        }
      };
      const result = renderToString(input, { indent: true });
      expect(result).toBe('<div>\n  <h1>Test Title</h1>\n  <p>Test Content</p>\n</div>');
    });

    test('renders comment surrounding nested content', () => {
      const result = renderToString({
        template: {
          comment: {
            $children: [
              'Before content',
              {
                div: {
                  $children: [
                    { h1: 'Nested Title' },
                    { p: 'Nested paragraph' }
                  ]
                }
              },
              'After content'
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<!--\n  Before content\n  <div>\n    <h1>Nested Title</h1>\n    <p>Nested paragraph</p>\n  </div>\n  After content\n-->');
    });

    test('handles interpolated data with newlines when indentation is enabled', () => {
      const result = renderToString({
        template: {
          p: '{{text}}'
        },
        data: {
          text: 'Line 1\nLine 2\nLine 3'
        }
      }, { indent: true });
      expect(result).toBe('<p>\n  Line 1\n  Line 2\n  Line 3\n</p>');
    });

    test('handles mixed literal and interpolated newlines with indentation', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              'First line',
              { p: '{{multiline}}' },
              'Last line'
            ]
          }
        },
        data: {
          multiline: 'Data line 1\nData line 2'
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  First line\n  <p>\n    Data line 1\n    Data line 2\n  </p>\n  Last line\n</div>');
    });

    test('renders complex nested structure with comments at multiple levels', () => {
      const result = renderToString({
        template: {
          div: {
            class: 'container',
            $children: [
              { comment: 'Container start' },
              {
                section: {
                  $children: [
                    { comment: 'Section content' },
                    {
                      article: {
                        $children: [
                          { comment: 'Article metadata' },
                          { h1: 'Title' },
                          { p: 'Content' },
                          { comment: 'Article end' }
                        ]
                      }
                    }
                  ]
                }
              },
              { comment: 'Container end' }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div class="container">\n  <!--Container start-->\n  <section>\n    <!--Section content-->\n    <article>\n      <!--Article metadata-->\n      <h1>Title</h1>\n      <p>Content</p>\n      <!--Article end-->\n    </article>\n  </section>\n  <!--Container end-->\n</div>');
    });

    test('properly indents comments containing HTML elements', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              {
                comment: {
                  $children: [
                    'Start: ',
                    { h2: 'Welcome' },
                    { p: 'This is much cleaner with shorthand array syntax!' },
                    {
                      ul: [
                        { li: 'Item 1' },
                        { li: 'Item 2' },
                        { li: 'Item 3' }
                      ]
                    },
                    ' :End'
                  ]
                }
              },
              { p: 'Regular content' }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  <!--\n    Start: \n    <h2>Welcome</h2>\n    <p>This is much cleaner with shorthand array syntax!</p>\n    <ul>\n      <li>Item 1</li>\n      <li>Item 2</li>\n      <li>Item 3</li>\n    </ul>\n     :End\n  -->\n  <p>Regular content</p>\n</div>');
    });

    test('comments with mixed text and HTML content indent properly', () => {
      const result = renderToString({
        template: {
          comment: {
            $children: [
              'Debug info:',
              { div: { class: 'debug', $children: [{ span: 'value: 42' }] } },
              'End debug'
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<!--\n  Debug info:\n  <div class="debug">\n    <span>value: 42</span>\n  </div>\n  End debug\n-->');
    });

    test('deeply nested comment content indents correctly', () => {
      const result = renderToString({
        template: {
          div: {
            $children: [
              {
                comment: {
                  $children: [
                    {
                      section: {
                        $children: [
                          {
                            article: {
                              $children: [
                                { h3: 'Deep Title' },
                                { p: 'Deep content' }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      }, { indent: true });
      expect(result).toBe('<div>\n  <!--\n    <section>\n      <article>\n        <h3>Deep Title</h3>\n        <p>Deep content</p>\n      </article>\n    </section>\n  -->\n</div>');
    });
  });

  // "if" tag tests
  describe('"if" Tag', () => {
    ifTagTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders children when condition is truthy (true)':
            expect(result).toBe('<div><p>Message is shown</p></div>');
            break;
          case 'renders children when condition is truthy (non-empty string)':
            expect(result).toBe('<div><p>Hello Alice</p></div>');
            break;
          case 'renders children when condition is truthy (number)':
            expect(result).toBe('<div><p>Count: 5</p></div>');
            break;
          case 'does not render children when condition is falsy (false)':
            expect(result).toBe('<div><p>Before</p><p>After</p></div>');
            break;
          case 'does not render children when condition is falsy (null)':
            expect(result).toBe('<div></div>');
            break;
          case 'does not render children when condition is falsy (undefined)':
            expect(result).toBe('<div></div>');
            break;
          case 'does not render children when condition is falsy (empty string)':
            expect(result).toBe('<div></div>');
            break;
          case 'does not render children when condition is falsy (zero)':
            expect(result).toBe('<div></div>');
            break;
          case 'works with nested property access':
            expect(result).toBe('<div><p>Admin panel</p></div>');
            break;
          case 'works with multiple children':
            expect(result).toBe('<div><h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p></div>');
            break;
          case 'works with nested if tags':
            expect(result).toBe('<div><p>Level 1 visible</p><p>Level 2 visible</p></div>');
            break;
          case 'works at root level':
            expect(result).toBe('<div>Content</div>');
            break;
          case 'renders nothing at root level when falsy':
            expect(result).toBe('');
            break;
        }
      });
    });

    ifTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });
  });
});