import { renderToReact, Treebark } from 'treebark/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, isValidElement } from 'react';
import type { ReactElement } from 'react';
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
  urlProtocolValidationTests,
  zeroValueAttributeTests,
  createTest,
  createErrorTest,
  TestCase,
} from './common-tests';

// Render to a static HTML string so React output can be asserted with exact markup,
// mirroring how the string renderer suite asserts. React-specific differences from the
// string renderer are intentional and reflected in the expected values below:
//   - void tags self-close ("<img .../>")
//   - inline styles serialize as a React style object ("color:red", no spaces)
//   - "class"/"colspan" are mapped to React prop names internally (className/colSpan)
//   - "$comment" produces nothing (React has no comment node)
const renderMarkup = (input: any, options?: any) =>
  renderToStaticMarkup(renderToReact(input, options));

// Build a createTest assertion that looks the expected markup up by test name.
const expectMarkup = (expected: Record<string, string>) => (result: string, tc: TestCase) => {
  expect(Object.prototype.hasOwnProperty.call(expected, tc.name)).toBe(true);
  expect(result).toBe(expected[tc.name]);
};

describe('React Renderer', () => {
  describe('Basic Rendering', () => {
    const expected: Record<string, string> = {
      'renders simple text': 'Hello world',
      'renders simple element': '<div>Hello world</div>',
      'renders element with attributes': '<div class="greeting" id="hello">Hello world</div>',
      'renders nested elements': '<div><h1>Title</h1><p>Content</p></div>',
      'renders array as fragment': '<h1>Title</h1><p>Content</p>',
      'renders mixed content': '<div>Hello <span>world</span>!</div>',
    };
    basicRenderingTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Data Interpolation', () => {
    const expected: Record<string, string> = {
      'interpolates data': '<div>Hello Alice!</div>',
      'interpolates nested properties': '<div>Price: $99</div>',
      'interpolates in attributes': '<a href="/user/123">Alice</a>',
      'handles escaped interpolation': 'Hello {{name}}!',
      'handles special characters without HTML encoding':
        '<div>I&#x27;ll help you analyze the Q4 sales data. Let me start by loading and examining the data structure.</div>',
    };
    dataInterpolationTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Data Binding', () => {
    const expected: Record<string, string> = {
      'handles array binding': '<ul><li>Apple - $1</li><li>Banana - $2</li></ul>',
      'handles object binding': '<div class="user-card"><h2>Alice</h2><p>alice@example.com</p></div>',
      'handles TreebarkInput format': '<p>Hello Bob!</p>',
      'handles TreebarkInput format without data': '<div>Static content</div>',
      'handles $bind: "." to bind to current data object (array)':
        '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
      'handles $bind: "." to bind to current data object (nested)':
        '<div><h2>Alice</h2><div><p>Email: alice@example.com</p><p>Role: Admin</p></div></div>',
    };
    bindingTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Parent Property Access', () => {
    const expected: Record<string, string> = {
      'accesses parent property with double dots': '<div><h2>Alice</h2><p>Organization: ACME Corp</p></div>',
      'accesses grandparent property with double dots and slash':
        '<div><div><span>Alice works at Tech Solutions Inc</span><span>Bob works at Tech Solutions Inc</span></div></div>',
      'handles parent property in attributes':
        '<div><a href="/products/1">Laptop</a><a href="/products/2">Mouse</a></div>',
      'returns empty string when parent not found': '<div><p>Missing: </p></div>',
      'returns empty string when too many parent levels requested': '<div><p>Missing: </p></div>',
      'works with nested object binding':
        '<div><h1>ACME Corp</h1><div><h2>Engineering</h2><p>Part of ACME Corp</p></div></div>',
    };
    parentPropertyTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Security - Valid', () => {
    const expected: Record<string, string> = {
      'allows data- and aria- attributes': '<div data-test="value" aria-label="Test">Content</div>',
      'allows tabindex and role attributes': '<div role="button" tabindex="0">Click me</div>',
    };
    securityValidTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Security - Errors', () => {
    securityErrorTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('Tag-Specific Attributes', () => {
    const expected: Record<string, string> = {
      'allows tag-specific attributes for img': '<img src="image.jpg" alt="An image" width="100" height="200"/>',
      'allows tag-specific attributes for a':
        '<a href="https://example.com" target="_blank" rel="noopener">Link text</a>',
      'allows global attributes on any tag':
        '<span id="test-id" class="test-class" style="color:red" title="Test title" role="button">Content</span>',
      'allows tag-specific attributes for table elements':
        '<table summary="Test table"><tr><th scope="col" colSpan="2">Header</th><td rowspan="1">Data</td></tr></table>',
      'allows tag-specific attributes for blockquote':
        '<blockquote cite="https://example.com">Quote text</blockquote>',
      'warns but continues for invalid attribute on tag': '<div class="valid">Content</div>',
    };
    tagSpecificAttributeTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Tag-Specific Attribute Errors', () => {
    tagSpecificAttributeErrorTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('Shorthand Array Syntax', () => {
    const expected: Record<string, string> = {
      'renders shorthand array syntax for nodes without attributes': '<div><h2>Title</h2><p>Content</p></div>',
      'shorthand array syntax with mixed content': '<div>Hello <span>world</span>!</div>',
      'shorthand array syntax with data interpolation': '<div><h1>Welcome</h1><p>This is a test.</p></div>',
      'shorthand array syntax works with empty arrays': '<div></div>',
    };
    shorthandArrayTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Void Tags', () => {
    const expected: Record<string, string> = {
      'allows void tags without children': '<img src="image.jpg" alt="Test image"/>',
    };
    voidTagTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Void Tag Warnings', () => {
    const expected: Record<string, string> = {
      'warns about children on void tags and renders tag without children': '<img src="image.jpg"/>',
      'warns about children on void tags with shorthand syntax and renders tag without children': '<img/>',
    };
    voidTagWarningTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Comments (dropped in React)', () => {
    test('renders nothing for a $comment tag', () => {
      expect(renderMarkup({ template: { $comment: 'a note' } })).toBe('');
    });

    test('omits comment but keeps sibling content', () => {
      const input = { template: { div: { $children: [{ $comment: 'note' }, 'visible'] } } };
      expect(renderMarkup(input)).toBe('<div>visible</div>');
    });
  });

  describe('$bind Validation Errors', () => {
    bindValidationErrorTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('$if Tag', () => {
    const expected: Record<string, string> = {
      'renders children when condition is truthy (true)': '<div><p>Message is shown</p></div>',
      'renders children when condition is truthy (non-empty string)': '<div><p>Hello Alice</p></div>',
      'renders children when condition is truthy (number)': '<div><p>Count: 5</p></div>',
      'does not render children when condition is falsy (false)': '<div><p>Before</p><p>After</p></div>',
      'does not render children when condition is falsy (null)': '<div></div>',
      'does not render children when condition is falsy (undefined)': '<div></div>',
      'does not render children when condition is falsy (empty string)': '<div></div>',
      'does not render children when condition is falsy (zero)': '<div></div>',
      'works with nested property access': '<div><p>Admin panel</p></div>',
      'works with multiple children (wrapped in div)':
        '<div><div><h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p></div></div>',
      'works with nested if tags': '<div><div><p>Level 1 visible</p><p>Level 2 visible</p></div></div>',
      'works at root level': '<div>Content</div>',
      'renders nothing at root level when falsy': '',
      'renders children with $not when condition is falsy':
        '<div><p>Message is hidden, showing this instead</p></div>',
      'does not render children with $not when condition is truthy': '<div><p>Before</p><p>After</p></div>',
      'works with $not and nested properties': '<div><p>Welcome back, member!</p></div>',
      'works with $not and zero': '<div><p>No items</p></div>',
      'works with $not and empty string': '<div><p>No message provided</p></div>',
      // React has no indentation concept; output is structural regardless of indent option.
      'preserves indentation with multiple children (one level)':
        '<div class="container"><p>Before</p><div><p>First</p><p>Second</p><p>Third</p></div><p>After</p></div>',
      'preserves indentation with multiple children (two levels)':
        '<div class="outer"><h1>Title</h1><div class="inner"><div><p>First</p><p>Second</p><p>Third</p></div></div><p>Footer</p></div>',
      'warns but continues when $if tag has unsupported attributes': '<p>Content</p>',
      'warns but continues when $if tag has $children': '<p>Content</p>',
    };
    ifTagTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('$if Tag Operators', () => {
    const expected: Record<string, string> = {
      'less than operator: renders when true': '<div><p>Minor</p></div>',
      'less than operator: does not render when false': '<div></div>',
      'greater than operator: renders when true': '<div><p>Excellent</p></div>',
      'greater than operator: does not render when false': '<div></div>',
      'equals operator: renders when equal': '<div><p>User is active</p></div>',
      'equals operator: does not render when not equal': '<div></div>',
      '$in operator: renders when value is in array': '<div><p>Has special privileges</p></div>',
      '$in operator: does not render when value is not in array': '<div></div>',
      'less than or equal operator: renders when less than': '<div><p>Youth</p></div>',
      'less than or equal operator: renders when equal': '<div><p>Youth</p></div>',
      'less than or equal operator: does not render when greater than': '<div></div>',
      'greater than or equal operator: renders when greater than': '<div><p>Excellent</p></div>',
      'greater than or equal operator: renders when equal': '<div><p>Excellent</p></div>',
      'greater than or equal operator: does not render when less than': '<div></div>',
      'stacking $>= and $<=: renders for inclusive range': '<div><p>Working age adult</p></div>',
      'stacking $>= and $<=: renders for middle of range': '<div><p>Working age adult</p></div>',
      'stacking $>= and $<=: renders at upper bound': '<div><p>Working age adult</p></div>',
      'stacking $>= and $<=: does not render below range': '<div></div>',
      'stacking $>= and $<=: does not render above range': '<div></div>',
      'multiple operators with AND (default): all must be true': '<div><p>Working age adult</p></div>',
      'multiple operators with AND: does not render if one is false': '<div></div>',
      'multiple operators with OR: renders if one is true': '<div><p>Non-working age</p></div>',
      'multiple operators with OR: does not render if all are false': '<div></div>',
      'operator with $not: inverts result': '<div><p>Adult</p></div>',
      'complex condition: multiple operators with OR and $not': '<div><p>Valid status</p></div>',
    };
    ifTagOperatorTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('$if Tag $then/$else', () => {
    const expected: Record<string, string> = {
      'renders $then when condition is true': '<div><p>Active user</p></div>',
      'renders $else when condition is false': '<div><p>Inactive user</p></div>',
      'renders $then when condition is true with both branches': '<div><p>Excellent!</p></div>',
      'renders empty when $else not provided and condition false': '<div></div>',
    };
    ifTagThenElseTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('$if Tag Errors', () => {
    ifTagErrorTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('Conditional Attributes', () => {
    const expected: Record<string, string> = {
      'conditional attribute with $then and $else': '<div class="active">Content</div>',
      'conditional attribute evaluates to $else when false': '<div class="inactive">Content</div>',
      'conditional attribute with operator': '<div class="excellent">Score display</div>',
      'conditional attribute with $in operator': '<div class="privileged">User</div>',
      'conditional attribute with $not modifier': '<div class="member">User</div>',
      'multiple attributes with conditionals': '<div class="dark-mode" data-theme="dark">Themed content</div>',
    };
    conditionalAttributeTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Style Objects', () => {
    const expected: Record<string, string> = {
      'renders style object with single property': '<div style="color:red">Styled content</div>',
      'renders style object with multiple properties':
        '<div style="color:red;background-color:blue;font-size:14px">Multiple styles</div>',
      'handles kebab-case CSS properties':
        '<div style="font-size:16px;font-weight:bold;text-align:center;border-radius:5px">Kebab-case properties</div>',
      'handles numeric values': '<div style="width:100px;height:50px;opacity:0.5;z-index:10">Numeric values</div>',
      'skips null and undefined style values': '<div style="color:red;padding:10px">Skip null/undefined</div>',
      'works with flexbox properties':
        '<div style="display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px">Flexbox</div>',
      'works with grid properties':
        '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:20px">Grid layout</div>',
      'handles conditional style object': '<div style="color:green;font-weight:bold">Conditional style</div>',
      // Style values are not interpolated (matches the string renderer's behavior).
      'handles interpolation in style object values':
        '<div style="color:{{primaryColor}};font-size:{{fontSize}}px;border:2px solid {{borderColor}}">Interpolated styles</div>',
      'handles interpolation in conditional style $then branch':
        '<div style="background-color:{{darkBg}};color:{{darkText}}">Theme-based interpolated styles</div>',
      'handles interpolation in conditional style $else branch':
        '<div style="background-color:{{lightBg}};color:{{lightText}}">Theme-based interpolated styles</div>',
    };
    styleObjectTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Style Object Warnings', () => {
    const expected: Record<string, string> = {
      'warns for invalid property name format (uppercase)': '<div style="color:red">Invalid format</div>',
      'warns for invalid property name format (underscores)': '<div style="color:red">Invalid format</div>',
      'blocks behavior property': '<div style="color:red">Blocked property</div>',
      'blocks -moz-binding property': '<div style="color:red">Blocked property</div>',
      'allows new CSS properties (future-proof)':
        '<div style="color:red;new-css-property:some-value;experimental-feature:enabled">Future CSS</div>',
      'blocks url() in style object values': '<div>URL blocked</div>',
      'blocks expression() in style object values': '<div>Expression blocked</div>',
      'blocks javascript: protocol in style object values': '<div>JavaScript protocol blocked</div>',
      'accepts trailing semicolon in style values': '<div style="color:red">Trailing semicolon accepted</div>',
      'sanitizes semicolon injection by taking first chunk': '<div style="color:red">Semicolon sanitized</div>',
    };
    styleObjectWarningTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Style Object Errors', () => {
    styleObjectErrorTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('Jailbreak Defense', () => {
    jailbreakDefenseTests.forEach(tc => createErrorTest(tc, renderToReact));
  });

  describe('URL Protocol Validation', () => {
    const expected: Record<string, string> = {
      'blocks javascript: protocol in href': '<a>Click me</a>',
      'blocks javascript: protocol in src': '<img alt="test"/>',
      'blocks data: protocol in href': '<a>Click me</a>',
      'blocks data: protocol in src': '<img alt="test"/>',
      'blocks vbscript: protocol in href': '<a>Click me</a>',
      'blocks file: protocol in href': '<a>Click me</a>',
      'allows https: protocol in href': '<a href="https://example.com">Safe link</a>',
      'allows http: protocol in href': '<a href="http://example.com">Safe link</a>',
      'allows https: protocol in src': '<img src="https://example.com/image.png" alt="Safe image"/>',
      'allows mailto: protocol in href': '<a href="mailto:test@example.com">Email link</a>',
      'allows tel: protocol in href': '<a href="tel:+1234567890">Phone link</a>',
      'allows relative URL with slash in href': '<a href="/path/to/page">Relative link</a>',
      'allows relative URL with hash in href': '<a href="#section">Anchor link</a>',
      'allows relative URL without protocol in href': '<a href="page.html">Relative link</a>',
      'allows query string in href': '<a href="?param=value">Query link</a>',
    };
    urlProtocolValidationTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('Zero and Empty Value Attributes', () => {
    const expected: Record<string, string> = {
      'allows zero in data-* attribute': '<div data-count="0">Items</div>',
      'allows zero string in attribute': '<div data-index="0">Item</div>',
      'allows zero in title attribute': '<div title="0">Score</div>',
      'allows zero in width attribute': '<img src="https://example.com/image.png" width="0" alt="test"/>',
      'allows empty string in alt attribute': '<img src="https://example.com/image.png" alt=""/>',
      'allows empty string in title attribute': '<div title="">Content</div>',
      'allows empty string from interpolation': '<div data-value="">Content</div>',
    };
    zeroValueAttributeTests.forEach(tc => createTest(tc, renderMarkup, expectMarkup(expected)));
  });

  describe('React keys', () => {
    const firstElementChild = (node: unknown): ReactElement => {
      const kids = (node as ReactElement).props.children;
      const arr = Array.isArray(kids) ? kids : [kids];
      return arr.find(isValidElement) as ReactElement;
    };

    test('top-level array children each receive a key', () => {
      const node = renderToReact({ template: [{ p: 'a' }, { p: 'b' }] });
      const children = (node as ReactElement).props.children as ReactElement[];
      expect(children.length).toBe(2);
      expect(children.every(c => c.key != null)).toBe(true);
    });

    test('array-bound list items each receive a key', () => {
      const node = renderToReact({
        template: { ul: { $bind: 'items', $children: [{ li: '{{name}}' }] } },
        data: { items: [{ name: 'a' }, { name: 'b' }] },
      });
      const ul = firstElementChild(node);
      const items = ul.props.children as ReactElement[];
      expect(items.length).toBe(2);
      expect(items.every(c => c.key != null)).toBe(true);
    });
  });

  describe('<Treebark> component', () => {
    test('renders a template as a component', () => {
      const html = renderToStaticMarkup(
        createElement(Treebark, {
          template: { div: { class: 'card', $children: ['Hello {{name}}'] } },
          data: { name: 'Alice' },
        })
      );
      expect(html).toBe('<div class="card">Hello Alice</div>');
    });

    test('renders identically to renderToReact', () => {
      const input = {
        template: { ul: { $bind: 'items', $children: [{ li: '{{name}}' }] } },
        data: { items: [{ name: 'a' }, { name: 'b' }] },
      };
      const viaComponent = renderToStaticMarkup(createElement(Treebark, input));
      const viaFunction = renderToStaticMarkup(renderToReact(input));
      expect(viaComponent).toBe(viaFunction);
      expect(viaComponent).toBe('<ul><li>a</li><li>b</li></ul>');
    });

    test('forwards a custom logger', () => {
      const logger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      renderToStaticMarkup(
        createElement(Treebark, { template: { script: 'alert(1)' } as any, logger })
      );
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('is not allowed'));
    });
  });
});
