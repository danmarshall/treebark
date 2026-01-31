import { renderToString, TreebarkInput } from 'treebark';
import { jest } from '@jest/globals';
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
  voidTagWarningTests,
  commentTests,
  commentErrorTests,
  bindValidationErrorTests,
  ifTagTests,
  ifTagOperatorTests,
  ifTagThenElseTests,
  conditionalAttributeTests,
  ifTagErrorTests,
  styleObjectTests,
  styleObjectWarningTests,
  styleObjectErrorTests,
  jailbreakDefenseTests,
  jailbreakValidationTests,
  jailbreakPropertyAccessTests,
  urlProtocolValidationTests,
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
          case 'handles special characters without HTML encoding':
            expect(result).toBe("<div>I&#39;ll help you analyze the Q4 sales data. Let me start by loading and examining the data structure.</div>");
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

    // Test that dangerous attributes are blocked (logged as warning, not rendered)
    test('warns and blocks dangerous attributes like onclick', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const result = renderToString({
        template: {
          div: {
            onclick: 'alert("xss")',
            $children: ['Content']
          } as any
        }
      }, { logger: mockLogger });

      // Should log a warning
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Attribute "onclick" is not allowed')
      );
      // Should render without the dangerous attribute (XSS prevented)
      expect(result).toBe('<div>Content</div>');
      expect(result).not.toContain('onclick');
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
          case 'warns but continues for invalid attribute on tag':
            // Should render with valid attributes, invalid ones skipped
            expect(result).toBe('<div class="valid">Content</div>');
            break;
        }
      });
    });

    // Test that warning is logged for invalid attributes
    test('logs warning for invalid attributes on tag', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const result = renderToString({
        template: {
          div: {
            src: 'image.jpg',  // Invalid for div
            class: 'valid',
            $children: ['Content']
          } as any
        }
      }, { logger: mockLogger });

      // Should log a warning
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Attribute "src" is not allowed on tag "div"')
      );
      // Should still render with valid attributes
      expect(result).toBe('<div class="valid">Content</div>');
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

    voidTagWarningTests.forEach(testCase => {
      test(testCase.name, () => {
        const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
        const result = renderToString(testCase.input, { logger: mockLogger });
        
        // Should warn about void tag with children
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('is a void element and cannot have children')
        );
        
        // Should render the void tag without children
        expect(result).toBeTruthy();
        expect(result).toContain('<img');
      });
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
              { $comment: 'Start of content' },
              { h1: 'Title' },
              { $comment: 'End of content' }
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
              { $comment: 'Outer comment' },
              {
                section: {
                  $children: [
                    { $comment: 'Inner comment' },
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
          $comment: {
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
              { $comment: 'Container start' },
              {
                section: {
                  $children: [
                    { $comment: 'Section content' },
                    {
                      article: {
                        $children: [
                          { $comment: 'Article metadata' },
                          { h1: 'Title' },
                          { p: 'Content' },
                          { $comment: 'Article end' }
                        ]
                      }
                    }
                  ]
                }
              },
              { $comment: 'Container end' }
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
                $comment: {
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
          $comment: {
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
                $comment: {
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
          case 'works with multiple children (wrapped in div)':
            expect(result).toBe('<div><div><h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p></div></div>');
            break;
          case 'works with nested if tags':
            expect(result).toBe('<div><div><p>Level 1 visible</p><p>Level 2 visible</p></div></div>');
            break;
          case 'works at root level':
            expect(result).toBe('<div>Content</div>');
            break;
          case 'renders nothing at root level when falsy':
            expect(result).toBe('');
            break;
          case 'renders children with $not when condition is falsy':
            expect(result).toBe('<div><p>Message is hidden, showing this instead</p></div>');
            break;
          case 'does not render children with $not when condition is truthy':
            expect(result).toBe('<div><p>Before</p><p>After</p></div>');
            break;
          case 'works with $not and nested properties':
            expect(result).toBe('<div><p>Welcome back, member!</p></div>');
            break;
          case 'works with $not and zero':
            expect(result).toBe('<div><p>No items</p></div>');
            break;
          case 'works with $not and empty string':
            expect(result).toBe('<div><p>No message provided</p></div>');
            break;
          case 'preserves indentation with multiple children (one level)':
            expect(result).toBe('<div class="container">\n  <p>Before</p>\n  <div>\n    <p>First</p>\n    <p>Second</p>\n    <p>Third</p>\n  </div>\n  <p>After</p>\n</div>');
            break;
          case 'preserves indentation with multiple children (two levels)':
            expect(result).toBe('<div class="outer">\n  <h1>Title</h1>\n  <div class="inner">\n    <div>\n      <p>First</p>\n      <p>Second</p>\n      <p>Third</p>\n    </div>\n  </div>\n  <p>Footer</p>\n</div>');
            break;
          case 'warns but continues when $if tag has unsupported attributes':
            // Should still render the content despite the warning
            expect(result).toBe('<p>Content</p>');
            break;
          case 'warns but continues when $if tag has $children':
            // Should render $then, ignore $children
            expect(result).toBe('<p>Content</p>');
            break;
        }
      });
    });

    // Test that warning is logged for unsupported attributes
    test('logs warning for unsupported attributes on $if tag', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const result = renderToString({
        template: {
          $if: {
            $check: 'show',
            class: 'my-class',  // Unsupported attribute
            $then: { p: 'Content' }
          } as any
        },
        data: { show: true }
      }, { logger: mockLogger });

      // Should log a warning
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('"$if" tag does not support attributes')
      );
      // Should still render the content
      expect(result).toBe('<p>Content</p>');
    });

    // Test that warning is logged for $children on $if tag
    test('logs warning for $children on $if tag', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const result = renderToString({
        template: {
          $if: {
            $check: 'show',
            $children: [{ p: 'Ignored' }],
            $then: { p: 'Content' }
          } as any
        },
        data: { show: true }
      }, { logger: mockLogger });

      // Should log a warning
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('"$if" tag does not support $children')
      );
      // Should render $then, not $children
      expect(result).toBe('<p>Content</p>');
    });

    // Operator tests
    ifTagOperatorTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'less than operator: renders when true':
            expect(result).toBe('<div><p>Minor</p></div>');
            break;
          case 'less than operator: does not render when false':
            expect(result).toBe('<div></div>');
            break;
          case 'greater than operator: renders when true':
            expect(result).toBe('<div><p>Excellent</p></div>');
            break;
          case 'greater than operator: does not render when false':
            expect(result).toBe('<div></div>');
            break;
          case 'equals operator: renders when equal':
            expect(result).toBe('<div><p>User is active</p></div>');
            break;
          case 'equals operator: does not render when not equal':
            expect(result).toBe('<div></div>');
            break;
          case '$in operator: renders when value is in array':
            expect(result).toBe('<div><p>Has special privileges</p></div>');
            break;
          case '$in operator: does not render when value is not in array':
            expect(result).toBe('<div></div>');
            break;
          case 'multiple operators with AND (default): all must be true':
            expect(result).toBe('<div><p>Working age adult</p></div>');
            break;
          case 'multiple operators with AND: does not render if one is false':
            expect(result).toBe('<div></div>');
            break;
          case 'multiple operators with OR: renders if one is true':
            expect(result).toBe('<div><p>Non-working age</p></div>');
            break;
          case 'multiple operators with OR: does not render if all are false':
            expect(result).toBe('<div></div>');
            break;
          case 'operator with $not: inverts result':
            expect(result).toBe('<div><p>Adult</p></div>');
            break;
          case 'complex condition: multiple operators with OR and $not':
            expect(result).toBe('<div><p>Valid status</p></div>');
            break;
        }
      });
    });

    // $then and $else tests
    ifTagThenElseTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders $then when condition is true':
            expect(result).toBe('<div><p>Active user</p></div>');
            break;
          case 'renders $else when condition is false':
            expect(result).toBe('<div><p>Inactive user</p></div>');
            break;
          case 'renders $then when condition is true with both branches':
            expect(result).toBe('<div><p>Excellent!</p></div>');
            break;
          case 'renders empty when $else not provided and condition false':
            expect(result).toBe('<div></div>');
            break;
        }
      });
    });

    // Conditional attribute tests
    conditionalAttributeTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'conditional attribute with $then and $else':
            expect(result).toBe('<div class="active">Content</div>');
            break;
          case 'conditional attribute evaluates to $else when false':
            expect(result).toBe('<div class="inactive">Content</div>');
            break;
          case 'conditional attribute with operator':
            expect(result).toBe('<div class="excellent">Score display</div>');
            break;
          case 'conditional attribute with $in operator':
            expect(result).toBe('<div class="privileged">User</div>');
            break;
          case 'conditional attribute with $not modifier':
            expect(result).toBe('<div class="member">User</div>');
            break;
          case 'multiple attributes with conditionals':
            expect(result).toBe('<div class="dark-mode" data-theme="dark">Themed content</div>');
            break;
        }
      });
    });

    ifTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });
  });

  // Style object tests
  describe('Style Objects', () => {
    styleObjectTests.forEach(testCase => {
      createTest(testCase, renderToString, (result, tc) => {
        switch (tc.name) {
          case 'renders style object with single property':
            expect(result).toBe('<div style="color: red">Styled content</div>');
            break;
          case 'renders style object with multiple properties':
            expect(result).toBe('<div style="color: red; background-color: blue; font-size: 14px">Multiple styles</div>');
            break;
          case 'handles kebab-case CSS properties':
            expect(result).toBe('<div style="font-size: 16px; font-weight: bold; text-align: center; border-radius: 5px">Kebab-case properties</div>');
            break;
          case 'handles numeric values':
            expect(result).toBe('<div style="width: 100px; height: 50px; opacity: 0.5; z-index: 10">Numeric values</div>');
            break;
          case 'skips null and undefined style values':
            expect(result).toBe('<div style="color: red; padding: 10px">Skip null/undefined</div>');
            break;
          case 'works with flexbox properties':
            expect(result).toBe('<div style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px">Flexbox</div>');
            break;
          case 'works with grid properties':
            expect(result).toBe('<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px">Grid layout</div>');
            break;
          case 'handles conditional style object':
            expect(result).toBe('<div style="color: green; font-weight: bold">Conditional style</div>');
            break;
        }
      });
    });

    // Style warning tests
    styleObjectWarningTests.forEach(testCase => {
      test(`warns for ${testCase.name}`, () => {
        const mockLogger = {
          error: jest.fn(),
          warn: jest.fn(),
          log: jest.fn()
        };

        const result = renderToString(testCase.input, { logger: mockLogger });
        
        // Check results based on test case
        switch (testCase.name) {
          case 'allows new CSS properties (future-proof)':
            // This should NOT warn - new properties are allowed
            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toContain('new-css-property: some-value');
            expect(result).toContain('experimental-feature: enabled');
            break;
          case 'warns for invalid property name format (uppercase)':
          case 'warns for invalid property name format (underscores)':
            expect(mockLogger.warn).toHaveBeenCalled();
            expect(result).toBe('<div style="color: red">Invalid format</div>');
            break;
          case 'blocks behavior property':
          case 'blocks -moz-binding property':
            expect(mockLogger.warn).toHaveBeenCalled();
            expect(result).toBe('<div style="color: red">Blocked property</div>');
            break;
          case 'accepts trailing semicolon in style values':
            expect(mockLogger.warn).toHaveBeenCalled(); // Warns about semicolon but accepts value
            expect(result).toBe('<div style="color: red">Trailing semicolon accepted</div>');
            break;
          case 'sanitizes semicolon injection by taking first chunk':
            expect(mockLogger.warn).toHaveBeenCalled(); // Warns about semicolon
            expect(result).toBe('<div style="color: red">Semicolon sanitized</div>');
            break;
          case 'blocks url() in style object values':
          case 'blocks expression() in style object values':
          case 'blocks javascript: protocol in style object values':
            expect(mockLogger.warn).toHaveBeenCalled();
            // Style attribute should be omitted entirely
            expect(result).not.toContain('style=');
            break;
        }
      });
    });

    // Style error tests
    styleObjectErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToString);
    });
  });

  // Jailbreak defense tests - comprehensive security tests
  describe('Jailbreak Defense', () => {
    describe('Tag Name Manipulation Attacks', () => {
      jailbreakDefenseTests.forEach(testCase => {
        createErrorTest(testCase, renderToString);
      });
    });

    describe('CSS Injection and Style Attacks', () => {
      jailbreakValidationTests.forEach(testCase => {
        test(testCase.name, () => {
          const mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn()
          };

          const result = renderToString(testCase.input, { logger: mockLogger });

          // Check specific expectations based on test name
          switch (testCase.name) {
            case 'blocks url() with spacing variations':
            case 'blocks URL() with uppercase':
            case 'blocks uRl() with mixed case':
            case 'blocks @import with url':
            case 'blocks expression() with spacing':
            case 'blocks EXPRESSION() with uppercase':
            case 'blocks javascript: protocol variations':
            case 'blocks JavaScript: with mixed case':
              // Should warn about dangerous patterns
              expect(mockLogger.warn).toHaveBeenCalled();
              // Should not include the dangerous style
              expect(result).not.toContain('url(http');
              // Don't check for 'expression' text as it might appear in the content itself
              expect(result).not.toContain('javascript:');
              expect(result).not.toContain('@import');
              break;

            case 'allows data: URIs in url()':
              // Data URIs should be allowed
              expect(result).toContain('data:image');
              break;

            case 'blocks multiple property injection via semicolon':
            case 'blocks property injection with important':
              // Should warn about semicolon injection
              expect(mockLogger.warn).toHaveBeenCalled();
              // Should only include the first property value
              expect(result).toContain('color: red');
              expect(result).not.toContain('position:');
              expect(result).not.toContain('background:');
              break;

            case 'blocks event handler attributes':
            case 'blocks on* attributes with uppercase':
              // Should warn about invalid attributes
              expect(mockLogger.warn).toHaveBeenCalled();
              // Should not include event handlers
              expect(result).not.toContain('onclick');
              expect(result).not.toContain('onload');
              expect(result).not.toContain('onerror');
              expect(result).not.toContain('onmouseover');
              expect(result).not.toContain('onClick');
              expect(result).not.toContain('ONCLICK');
              break;

            case 'allows safe href protocols':
              expect(result).toBe('<a href="https://example.com">Safe link</a>');
              break;

            case 'allows safe img src':
              expect(result).toBe('<img src="https://example.com/image.png" alt="Safe image">');
              break;

            default:
              throw new Error(`Unhandled test case: ${testCase.name}`);
          }
        });
      });
    });

    describe('Property Access Attacks', () => {
      jailbreakPropertyAccessTests.forEach(testCase => {
        test(testCase.name, () => {
          const mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn()
          };

          const result = renderToString(testCase.input, { logger: mockLogger });

          // Prototype chain properties should now be blocked
          switch (testCase.name) {
            case 'blocks constructor property access':
            case 'blocks __proto__ property access':
            case 'blocks prototype property access':
              // Should warn about blocked property access
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Access to property .* is blocked for security reasons/)
              );
              // Should render as empty string since property is blocked
              expect(result).toBe('<div></div>');
              break;

            default:
              throw new Error(`Unhandled test case: ${testCase.name}`);
          }
        });
      });
    });

    describe('URL Protocol Validation', () => {
      urlProtocolValidationTests.forEach(testCase => {
        test(testCase.name, () => {
          const mockLogger = {
            error: jest.fn(),
            warn: jest.fn(),
            log: jest.fn()
          };

          const result = renderToString(testCase.input, { logger: mockLogger });

          // Check specific expectations based on test name
          switch (testCase.name) {
            case 'blocks javascript: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              expect(result).not.toContain('href=');
              expect(result).toContain('<a>');
              break;

            case 'blocks javascript: protocol in src':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "src" contains blocked protocol/)
              );
              expect(result).not.toContain('src=');
              expect(result).toContain('<img');
              break;

            case 'blocks data: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              expect(result).not.toContain('href=');
              break;

            case 'blocks data: protocol in src':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "src" contains blocked protocol/)
              );
              expect(result).not.toContain('src=');
              break;

            case 'blocks vbscript: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              expect(result).not.toContain('href=');
              break;

            case 'blocks file: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              expect(result).not.toContain('href=');
              break;

            case 'allows https: protocol in href':
              expect(result).toContain('href="https://example.com"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows http: protocol in href':
              expect(result).toContain('href="http://example.com"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows https: protocol in src':
              expect(result).toContain('src="https://example.com/image.png"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows mailto: protocol in href':
              expect(result).toContain('href="mailto:test@example.com"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows tel: protocol in href':
              expect(result).toContain('href="tel:+1234567890"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL with slash in href':
              expect(result).toContain('href="/path/to/page"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL with hash in href':
              expect(result).toContain('href="#section"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL without protocol in href':
              expect(result).toContain('href="page.html"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows query string in href':
              expect(result).toContain('href="?param=value"');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            default:
              throw new Error(`Unhandled test case: ${testCase.name}`);
          }
        });
      });
    });
  });
});