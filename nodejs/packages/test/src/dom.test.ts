/**
 * @jest-environment jsdom
 */
import { renderToDOM } from 'treebark';
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
  zeroValueAttributeTests,
  createTest,
  createErrorTest,
  TestCase
} from './common-tests';

describe('DOM Renderer', () => {
  // Basic rendering tests
  describe('Basic Rendering', () => {
    basicRenderingTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'renders simple text':
            expect(fragment.textContent).toBe('Hello world');
            expect(fragment.childNodes.length).toBe(1);
            expect(fragment.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
            break;
          case 'renders simple element':
            const div = fragment.firstChild as HTMLElement;
            expect(div.tagName).toBe('DIV');
            expect(div.textContent).toBe('Hello world');
            break;
          case 'renders element with attributes':
            const divWithAttrs = fragment.firstChild as HTMLElement;
            expect(divWithAttrs.tagName).toBe('DIV');
            expect(divWithAttrs.className).toBe('greeting');
            expect(divWithAttrs.id).toBe('hello');
            expect(divWithAttrs.textContent).toBe('Hello world');
            break;
          case 'renders nested elements':
            const divNested = fragment.firstChild as HTMLElement;
            expect(divNested.tagName).toBe('DIV');
            expect(divNested.children.length).toBe(2);
            expect(divNested.children[0].tagName).toBe('H1');
            expect(divNested.children[0].textContent).toBe('Title');
            expect(divNested.children[1].tagName).toBe('P');
            expect(divNested.children[1].textContent).toBe('Content');
            break;
          case 'renders array as fragment':
            expect(fragment.children.length).toBe(2);
            expect(fragment.children[0].tagName).toBe('H1');
            expect(fragment.children[0].textContent).toBe('Title');
            expect(fragment.children[1].tagName).toBe('P');
            expect(fragment.children[1].textContent).toBe('Content');
            break;
          case 'renders mixed content':
            const divMixed = fragment.firstChild as HTMLElement;
            expect(divMixed.childNodes.length).toBe(3);
            expect(divMixed.childNodes[0].textContent).toBe('Hello ');
            expect((divMixed.childNodes[1] as HTMLElement).tagName).toBe('SPAN');
            expect(divMixed.childNodes[1].textContent).toBe('world');
            expect(divMixed.childNodes[2].textContent).toBe('!');
            break;
        }
      });
    });
  });

  // Data interpolation tests
  describe('Data Interpolation', () => {
    dataInterpolationTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'interpolates data':
            const div = fragment.firstChild as HTMLElement;
            expect(div.textContent).toBe('Hello Alice!');
            break;
          case 'interpolates nested properties':
            const divNested = fragment.firstChild as HTMLElement;
            expect(divNested.textContent).toBe('Price: $99');
            break;
          case 'interpolates in attributes':
            const a = fragment.firstChild as HTMLAnchorElement;
            expect(a.href).toBe('http://localhost/user/123');
            expect(a.textContent).toBe('Alice');
            break;
          case 'handles escaped interpolation':
            expect(fragment.textContent).toBe('Hello {{name}}!');
            break;
          case 'handles special characters without HTML encoding':
            const divSpecial = fragment.firstChild as HTMLElement;
            expect(divSpecial.textContent).toBe("I'll help you analyze the Q4 sales data. Let me start by loading and examining the data structure.");
            break;
        }
      });
    });
  });

  // Binding tests
  describe('Data Binding', () => {
    bindingTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'handles array binding':
            const ul = fragment.firstChild as HTMLElement;
            expect(ul.tagName).toBe('UL');
            const lis = ul.querySelectorAll('li');
            expect(lis.length).toBe(2);
            expect(lis[0].textContent).toBe('Apple - $1');
            expect(lis[1].textContent).toBe('Banana - $2');
            break;
          case 'handles object binding':
            const div = fragment.firstChild as HTMLElement;
            expect(div.className).toBe('user-card');
            expect(div.querySelector('h2')?.textContent).toBe('Alice');
            expect(div.querySelector('p')?.textContent).toBe('alice@example.com');
            break;
          case 'handles TreebarkInput format':
            const pNew = fragment.firstChild as HTMLElement;
            expect(pNew.tagName).toBe('P');
            expect(pNew.textContent).toBe('Hello Bob!');
            break;
          case 'handles TreebarkInput format without data':
            const divNew = fragment.firstChild as HTMLElement;
            expect(divNew.tagName).toBe('DIV');
            expect(divNew.textContent).toBe('Static content');
            break;
          case 'handles $bind: "." to bind to current data object (array)':
            const ulDotArray = fragment.firstChild as HTMLElement;
            expect(ulDotArray.tagName).toBe('UL');
            expect(ulDotArray.querySelectorAll('li').length).toBe(3);
            expect(ulDotArray.querySelectorAll('li')[0].textContent).toBe('Item 1');
            expect(ulDotArray.querySelectorAll('li')[1].textContent).toBe('Item 2');
            expect(ulDotArray.querySelectorAll('li')[2].textContent).toBe('Item 3');
            break;
          case 'handles $bind: "." to bind to current data object (nested)':
            const divDotNested = fragment.firstChild as HTMLElement;
            expect(divDotNested.querySelector('h2')?.textContent).toBe('Alice');
            expect(divDotNested.querySelectorAll('p')[0].textContent).toBe('Email: alice@example.com');
            expect(divDotNested.querySelectorAll('p')[1].textContent).toBe('Role: Admin');
            break;
        }
      });
    });
  });

  // Parent property access tests
  describe('Parent Property Access', () => {
    parentPropertyTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'accesses parent property with double dots':
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('h2')?.textContent).toBe('Alice');
            expect(div.querySelector('p')?.textContent).toBe('Organization: ACME Corp');
            break;
          case 'accesses grandparent property with double dots and slash':
            const outerDiv = fragment.firstChild as HTMLElement;
            const innerDiv = outerDiv.firstChild as HTMLElement;
            const spans = innerDiv.querySelectorAll('span');
            expect(spans.length).toBe(2);
            expect(spans[0].textContent).toBe('Alice works at Tech Solutions Inc');
            expect(spans[1].textContent).toBe('Bob works at Tech Solutions Inc');
            break;
          case 'handles parent property in attributes':
            const container = fragment.firstChild as HTMLElement;
            const links = container.querySelectorAll('a');
            expect(links.length).toBe(2);
            expect(links[0].getAttribute('href')).toBe('/products/1');
            expect(links[0].textContent).toBe('Laptop');
            expect(links[1].getAttribute('href')).toBe('/products/2');
            expect(links[1].textContent).toBe('Mouse');
            break;
          case 'returns empty string when parent not found':
            const containerDiv = fragment.firstChild as HTMLElement;
            expect(containerDiv.querySelector('p')?.textContent).toBe('Missing: ');
            break;
          case 'returns empty string when too many parent levels requested':
            const containerDiv2 = fragment.firstChild as HTMLElement;
            expect(containerDiv2.querySelector('p')?.textContent).toBe('Missing: ');
            break;
          case 'works with nested object binding':
            const companyDiv = fragment.firstChild as HTMLElement;
            expect(companyDiv.querySelector('h1')?.textContent).toBe('ACME Corp');
            const deptDiv = companyDiv.querySelector('div');
            expect(deptDiv?.querySelector('h2')?.textContent).toBe('Engineering');
            expect(deptDiv?.querySelector('p')?.textContent).toBe('Part of ACME Corp');
            break;
        }
      });
    });
  });

  // Security and validation tests
  describe('Security and Validation', () => {
    securityErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });

    // Test that dangerous attributes are blocked (logged as warning, not rendered)
    test('warns and blocks dangerous attributes like onclick in DOM', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const fragment = renderToDOM({
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
      const div = fragment.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Content');
      expect(div.hasAttribute('onclick')).toBe(false);
    });

    securityValidTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'allows data- and aria- attributes':
            const div = fragment.firstChild as HTMLElement;
            expect(div.getAttribute('data-test')).toBe('value');
            expect(div.getAttribute('aria-label')).toBe('Test');
            break;
        }
      });
    });
  });

  // Tag-specific attribute tests
  describe('Tag-specific Attributes', () => {
    tagSpecificAttributeTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'allows tag-specific attributes for img':
            const img = fragment.firstChild as HTMLImageElement;
            expect(img.src).toBe('http://localhost/image.jpg');
            expect(img.alt).toBe('An image');
            expect(img.getAttribute('width')).toBe('100');
            expect(img.getAttribute('height')).toBe('200');
            break;
          case 'allows tag-specific attributes for a':
            const a = fragment.firstChild as HTMLAnchorElement;
            expect(a.href).toBe('https://example.com/');
            expect(a.target).toBe('_blank');
            expect(a.rel).toBe('noopener');
            expect(a.textContent).toBe('Link text');
            break;
          case 'allows global attributes on any tag':
            const span = fragment.firstChild as HTMLElement;
            expect(span.id).toBe('test-id');
            expect(span.className).toBe('test-class');
            expect(span.getAttribute('style')).toBe('color: red');
            expect(span.title).toBe('Test title');
            expect(span.getAttribute('role')).toBe('button');
            expect(span.textContent).toBe('Content');
            break;
          case 'allows tag-specific attributes for table elements':
            const table = fragment.firstChild as HTMLTableElement;
            expect(table.getAttribute('summary')).toBe('Test table');
            const th = table.querySelector('th') as HTMLTableCellElement;
            expect(th.getAttribute('scope')).toBe('col');
            expect(th.getAttribute('colspan')).toBe('2');
            const td = table.querySelector('td') as HTMLTableCellElement;
            expect(td.getAttribute('rowspan')).toBe('1');
            break;
          case 'allows tag-specific attributes for blockquote':
            const blockquote = fragment.firstChild as HTMLElement;
            expect(blockquote.getAttribute('cite')).toBe('https://example.com');
            expect(blockquote.textContent).toBe('Quote text');
            break;
          case 'warns but continues for invalid attribute on tag': {
            // Should render with valid attributes, invalid ones skipped
            const div = fragment.firstChild as HTMLElement;
            expect(div.tagName).toBe('DIV');
            expect(div.getAttribute('class')).toBe('valid');
            expect(div.getAttribute('src')).toBeNull(); // Invalid attribute not rendered
            expect(div.textContent).toBe('Content');
            break;
          }
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

      const fragment = renderToDOM({
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
      const div = fragment.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.getAttribute('class')).toBe('valid');
      expect(div.textContent).toBe('Content');
    });

    tagSpecificAttributeErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });
  });

  // DOM-specific test
  test('can be inserted into DOM', () => {
    document.body.innerHTML = '';
    const fragment = renderToDOM({
      template: {
        div: {
          id: 'test-container',
          $children: [
            { h1: 'Test Title' },
            { p: 'Test content' }
          ]
        }
      }
    });

    document.body.appendChild(fragment);

    const container = document.getElementById('test-container');
    expect(container).toBeTruthy();
    expect(container?.querySelector('h1')?.textContent).toBe('Test Title');
    expect(container?.querySelector('p')?.textContent).toBe('Test content');
  });

  // Shorthand array syntax tests
  describe('Shorthand Array Syntax', () => {
    shorthandArrayTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'renders shorthand array syntax for nodes without attributes':
            const div = fragment.firstChild as HTMLElement;
            expect(div.tagName).toBe('DIV');
            expect(div.children.length).toBe(2);
            expect(div.children[0].tagName).toBe('H2');
            expect(div.children[0].textContent).toBe('Title');
            expect(div.children[1].tagName).toBe('P');
            expect(div.children[1].textContent).toBe('Content');
            break;
          case 'shorthand array syntax with mixed content':
            const divMixed = fragment.firstChild as HTMLElement;
            expect(divMixed.childNodes.length).toBe(3);
            expect(divMixed.childNodes[0].textContent).toBe('Hello ');
            expect((divMixed.childNodes[1] as HTMLElement).tagName).toBe('SPAN');
            expect(divMixed.childNodes[1].textContent).toBe('world');
            expect(divMixed.childNodes[2].textContent).toBe('!');
            break;
          case 'shorthand array syntax with data interpolation':
            const divInterp = fragment.firstChild as HTMLElement;
            expect(divInterp.querySelector('h1')?.textContent).toBe('Welcome');
            expect(divInterp.querySelector('p')?.textContent).toBe('This is a test.');
            break;
          case 'shorthand array syntax works with empty arrays':
            const divEmpty = fragment.firstChild as HTMLElement;
            expect(divEmpty.tagName).toBe('DIV');
            expect(divEmpty.children.length).toBe(0);
            expect(divEmpty.textContent).toBe('');
            break;
        }
      });
    });

    test('shorthand array syntax equivalent to $children in DOM', () => {
      const shorthand = renderToDOM({
        template: {
          ul: [
            { li: 'Item 1' },
            { li: 'Item 2' },
            { li: 'Item 3' }
          ]
        }
      });

      const explicit = renderToDOM({
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

      const shorthandDiv = shorthand.firstChild as HTMLElement;
      const explicitDiv = explicit.firstChild as HTMLElement;

      expect(shorthandDiv.tagName).toBe(explicitDiv.tagName);
      expect(shorthandDiv.children.length).toBe(explicitDiv.children.length);
      expect(shorthandDiv.outerHTML).toBe(explicitDiv.outerHTML);
    });
  });

  // Void tag tests
  describe('Void Tag Validation', () => {
    voidTagTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'allows void tags without children':
            const img = fragment.firstChild as HTMLImageElement;
            expect(img.tagName).toBe('IMG');
            expect(img.src).toContain('image.jpg');
            expect(img.alt).toBe('Test image');
            expect(img.children.length).toBe(0);
            break;
        }
      });
    });

    voidTagWarningTests.forEach(testCase => {
      test(testCase.name, () => {
        const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
        const fragment = renderToDOM(testCase.input, { logger: mockLogger });
        
        // Should warn about void tag with children
        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining('is a void element and cannot have children')
        );
        
        // Should render the void tag without children
        const img = fragment.querySelector('img');
        expect(img).toBeTruthy();
        // Should have no child nodes
        expect(img?.childNodes.length).toBe(0);
      });
    });

    test('void tags render correctly in DOM', () => {
      const fragment = renderToDOM({
        template: {
          div: {
            $children: [
              { img: { src: 'image1.jpg', alt: 'First' } },
              { img: { src: 'image2.jpg', alt: 'Second' } }
            ]
          }
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

  // Comment tests
  describe('Comment Rendering', () => {
    commentTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'renders basic comment':
            const basicComment = fragment.firstChild as Comment;
            expect(basicComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(basicComment.textContent).toBe('This is a comment');
            break;
          case 'renders comment with interpolation':
            const interpolatedComment = fragment.firstChild as Comment;
            expect(interpolatedComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(interpolatedComment.textContent).toBe('User: Alice');
            break;
          case 'renders comment containing other tags':
            const tagComment = fragment.firstChild as Comment;
            expect(tagComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(tagComment.textContent).toBe('Start: <span>highlighted text</span> :End');
            break;
          case 'renders empty comment':
            const emptyComment = fragment.firstChild as Comment;
            expect(emptyComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(emptyComment.textContent).toBe('');
            break;
          case 'renders comment with special characters':
            const specialComment = fragment.firstChild as Comment;
            expect(specialComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(specialComment.textContent).toBe('Special chars: &amp; &lt; &gt; " \'');
            break;
          case 'safely handles malicious interpolation':
            const secureComment = fragment.firstChild as Comment;
            expect(secureComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(secureComment.textContent).toBe('User input: evil --&amp;gt; &amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;');
            break;
        }
      });
    });

    commentErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });

    bindValidationErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });
  });

  // "if" tag tests
  describe('"if" Tag', () => {
    ifTagTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'renders children when condition is truthy (true)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.tagName).toBe('DIV');
            expect(div.querySelector('p')?.textContent).toBe('Message is shown');
            break;
          }
          case 'renders children when condition is truthy (non-empty string)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('Hello Alice');
            break;
          }
          case 'renders children when condition is truthy (number)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('Count: 5');
            break;
          }
          case 'does not render children when condition is falsy (false)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelectorAll('p').length).toBe(2);
            expect(div.querySelectorAll('p')[0].textContent).toBe('Before');
            expect(div.querySelectorAll('p')[1].textContent).toBe('After');
            break;
          }
          case 'does not render children when condition is falsy (null)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.childNodes.length).toBe(0);
            break;
          }
          case 'does not render children when condition is falsy (undefined)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.childNodes.length).toBe(0);
            break;
          }
          case 'does not render children when condition is falsy (empty string)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.childNodes.length).toBe(0);
            break;
          }
          case 'does not render children when condition is falsy (zero)': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.childNodes.length).toBe(0);
            break;
          }
          case 'works with nested property access': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('Admin panel');
            break;
          }
          case 'works with multiple children (wrapped in div)': {
            const outerDiv = fragment.firstChild as HTMLElement;
            const innerDiv = outerDiv.firstChild as HTMLElement;
            expect(innerDiv.querySelector('h1')?.textContent).toBe('Title');
            expect(innerDiv.querySelectorAll('p').length).toBe(2);
            expect(innerDiv.querySelectorAll('p')[0].textContent).toBe('Paragraph 1');
            expect(innerDiv.querySelectorAll('p')[1].textContent).toBe('Paragraph 2');
            break;
          }
          case 'works with nested if tags': {
            const outerDiv = fragment.firstChild as HTMLElement;
            const innerDiv = outerDiv.firstChild as HTMLElement;
            expect(innerDiv.querySelectorAll('p').length).toBe(2);
            expect(innerDiv.querySelectorAll('p')[0].textContent).toBe('Level 1 visible');
            expect(innerDiv.querySelectorAll('p')[1].textContent).toBe('Level 2 visible');
            break;
          }
          case 'works at root level': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.tagName).toBe('DIV');
            expect(div.textContent).toBe('Content');
            break;
          }
          case 'renders nothing at root level when falsy': {
            expect(fragment.childNodes.length).toBe(0);
            break;
          }
          case 'renders children with $not when condition is falsy': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('Message is hidden, showing this instead');
            break;
          }
          case 'does not render children with $not when condition is truthy': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelectorAll('p').length).toBe(2);
            expect(div.querySelectorAll('p')[0].textContent).toBe('Before');
            expect(div.querySelectorAll('p')[1].textContent).toBe('After');
            break;
          }
          case 'works with $not and nested properties': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('Welcome back, member!');
            break;
          }
          case 'works with $not and zero': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('No items');
            break;
          }
          case 'works with $not and empty string': {
            const div = fragment.firstChild as HTMLElement;
            expect(div.querySelector('p')?.textContent).toBe('No message provided');
            break;
          }
          case 'preserves indentation with multiple children (one level)': {
            const outerDiv = fragment.firstChild as HTMLElement;
            expect(outerDiv.className).toBe('container');
            const paragraphs = outerDiv.querySelectorAll('p');
            expect(paragraphs.length).toBe(5); // Before, First, Second, Third, After
            expect(paragraphs[0].textContent).toBe('Before');
            expect(paragraphs[1].textContent).toBe('First');
            expect(paragraphs[2].textContent).toBe('Second');
            expect(paragraphs[3].textContent).toBe('Third');
            expect(paragraphs[4].textContent).toBe('After');
            break;
          }
          case 'preserves indentation with multiple children (two levels)': {
            const outerDiv = fragment.firstChild as HTMLElement;
            expect(outerDiv.className).toBe('outer');
            expect(outerDiv.querySelector('h1')?.textContent).toBe('Title');
            const inner = outerDiv.querySelector('.inner');
            expect(inner).toBeTruthy();
            const paragraphs = inner?.querySelectorAll('p');
            expect(paragraphs?.length).toBe(3);
            expect(paragraphs?.[0].textContent).toBe('First');
            expect(paragraphs?.[1].textContent).toBe('Second');
            expect(paragraphs?.[2].textContent).toBe('Third');
            expect(outerDiv.querySelector('.inner + p')?.textContent).toBe('Footer');
            break;
          }
          case 'warns but continues when $if tag has unsupported attributes': {
            // Should still render the content despite the warning
            const p = fragment.firstChild as HTMLElement;
            expect(p.tagName).toBe('P');
            expect(p.textContent).toBe('Content');
            break;
          }
          case 'warns but continues when $if tag has $children': {
            // Should render $then, ignore $children
            const p = fragment.firstChild as HTMLElement;
            expect(p.tagName).toBe('P');
            expect(p.textContent).toBe('Content');
            break;
          }
        }
      });
    });

    // Test that warning is logged for unsupported attributes in DOM
    test('logs warning for unsupported attributes on $if tag', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const fragment = renderToDOM({
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
      const p = fragment.firstChild as HTMLElement;
      expect(p.tagName).toBe('P');
      expect(p.textContent).toBe('Content');
    });

    // Test that warning is logged for $children on $if tag
    test('logs warning for $children on $if tag', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const fragment = renderToDOM({
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
      const p = fragment.firstChild as HTMLElement;
      expect(p.tagName).toBe('P');
      expect(p.textContent).toBe('Content');
    });

    // Operator tests
    ifTagOperatorTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        const div = fragment.firstChild as HTMLElement;
        switch (tc.name) {
          case 'less than operator: renders when true':
            expect(div.querySelector('p')?.textContent).toBe('Minor');
            break;
          case 'less than operator: does not render when false':
            expect(div.childNodes.length).toBe(0);
            break;
          case 'greater than operator: renders when true':
            expect(div.querySelector('p')?.textContent).toBe('Excellent');
            break;
          case 'greater than operator: does not render when false':
            expect(div.childNodes.length).toBe(0);
            break;
          case 'equals operator: renders when equal':
            expect(div.querySelector('p')?.textContent).toBe('User is active');
            break;
          case 'equals operator: does not render when not equal':
            expect(div.childNodes.length).toBe(0);
            break;
          case '$in operator: renders when value is in array':
            expect(div.querySelector('p')?.textContent).toBe('Has special privileges');
            break;
          case '$in operator: does not render when value is not in array':
            expect(div.childNodes.length).toBe(0);
            break;
          case 'multiple operators with AND (default): all must be true':
            expect(div.querySelector('p')?.textContent).toBe('Working age adult');
            break;
          case 'multiple operators with AND: does not render if one is false':
            expect(div.childNodes.length).toBe(0);
            break;
          case 'multiple operators with OR: renders if one is true':
            expect(div.querySelector('p')?.textContent).toBe('Non-working age');
            break;
          case 'multiple operators with OR: does not render if all are false':
            expect(div.childNodes.length).toBe(0);
            break;
          case 'operator with $not: inverts result':
            expect(div.querySelector('p')?.textContent).toBe('Adult');
            break;
          case 'complex condition: multiple operators with OR and $not':
            expect(div.querySelector('p')?.textContent).toBe('Valid status');
            break;
        }
      });
    });

    // $then and $else tests
    ifTagThenElseTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        const div = fragment.firstChild as HTMLElement;
        switch (tc.name) {
          case 'renders $then when condition is true':
            expect(div.querySelector('p')?.textContent).toBe('Active user');
            break;
          case 'renders $else when condition is false':
            expect(div.querySelector('p')?.textContent).toBe('Inactive user');
            break;
          case 'renders $then when condition is true with both branches':
            expect(div.querySelector('p')?.textContent).toBe('Excellent!');
            break;
          case 'renders empty when $else not provided and condition false':
            expect(div.childNodes.length).toBe(0);
            break;
        }
      });
    });

    // Conditional attribute tests
    conditionalAttributeTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        const div = fragment.firstChild as HTMLElement;
        switch (tc.name) {
          case 'conditional attribute with $then and $else':
            expect(div.className).toBe('active');
            break;
          case 'conditional attribute evaluates to $else when false':
            expect(div.className).toBe('inactive');
            break;
          case 'conditional attribute with operator':
            expect(div.className).toBe('excellent');
            break;
          case 'conditional attribute with $in operator':
            expect(div.className).toBe('privileged');
            break;
          case 'conditional attribute with $not modifier':
            expect(div.className).toBe('member');
            break;
          case 'multiple attributes with conditionals':
            expect(div.className).toBe('dark-mode');
            expect(div.getAttribute('data-theme')).toBe('dark');
            break;
        }
      });
    });

    ifTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });
  });

  // Style object tests
  describe('Style Objects', () => {
    styleObjectTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        const element = fragment.firstChild as HTMLElement;
        
        switch (tc.name) {
          case 'renders style object with single property':
            expect(element.getAttribute('style')).toBe('color: red');
            expect(element.textContent).toBe('Styled content');
            break;
          case 'renders style object with multiple properties':
            expect(element.getAttribute('style')).toBe('color: red; background-color: blue; font-size: 14px');
            break;
          case 'handles kebab-case CSS properties':
            expect(element.getAttribute('style')).toBe('font-size: 16px; font-weight: bold; text-align: center; border-radius: 5px');
            break;
          case 'handles numeric values':
            expect(element.getAttribute('style')).toBe('width: 100px; height: 50px; opacity: 0.5; z-index: 10');
            break;
          case 'skips null and undefined style values':
            expect(element.getAttribute('style')).toBe('color: red; padding: 10px');
            break;
          case 'works with flexbox properties':
            expect(element.getAttribute('style')).toBe('display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px');
            break;
          case 'works with grid properties':
            expect(element.getAttribute('style')).toBe('display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px');
            break;
          case 'handles conditional style object':
            expect(element.getAttribute('style')).toBe('color: green; font-weight: bold');
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

        const fragment = renderToDOM(testCase.input, { logger: mockLogger });
        const element = fragment.firstChild as HTMLElement;
        
        // Check results based on test case
        switch (testCase.name) {
          case 'allows new CSS properties (future-proof)':
            // This should NOT warn - new properties are allowed
            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(element.getAttribute('style')).toContain('new-css-property: some-value');
            expect(element.getAttribute('style')).toContain('experimental-feature: enabled');
            break;
          case 'warns for invalid property name format (uppercase)':
          case 'warns for invalid property name format (underscores)':
          case 'blocks behavior property':
          case 'blocks -moz-binding property':
            expect(mockLogger.warn).toHaveBeenCalled();
            expect(element.getAttribute('style')).toBe('color: red');
            break;
          case 'accepts trailing semicolon in style values':
            expect(mockLogger.warn).toHaveBeenCalled(); // Warns about semicolon but accepts value
            expect(element.getAttribute('style')).toBe('color: red');
            break;
          case 'sanitizes semicolon injection by taking first chunk':
            expect(mockLogger.warn).toHaveBeenCalled(); // Warns about semicolon
            expect(element.getAttribute('style')).toBe('color: red');
            break;
          case 'blocks url() in style object values':
          case 'blocks expression() in style object values':
          case 'blocks javascript: protocol in style object values':
            expect(mockLogger.warn).toHaveBeenCalled();
            // Style attribute should be omitted entirely
            expect(element.hasAttribute('style')).toBe(false);
            break;
        }
      });
    });

    // Style error tests
    styleObjectErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });
  });

  // Jailbreak defense tests - comprehensive security tests
  describe('Jailbreak Defense', () => {
    describe('Tag Name Manipulation Attacks', () => {
      jailbreakDefenseTests.forEach(testCase => {
        createErrorTest(testCase, renderToDOM);
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

          const fragment = renderToDOM(testCase.input, { logger: mockLogger });

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
              // Check that the dangerous style was not applied
              const el1 = fragment.firstChild as HTMLElement;
              expect(el1).toBeTruthy();
              if (el1 && el1.style) {
                // Style should either be empty or not contain dangerous patterns
                const styleText = el1.getAttribute('style') || '';
                expect(styleText).not.toContain('url(http');
                // Don't check for 'expression' text as it might appear in element content
                expect(styleText).not.toContain('javascript:');
                expect(styleText).not.toContain('@import');
              }
              break;

            case 'allows data: URIs in url()':
              // Data URIs should be allowed
              const el2 = fragment.firstChild as HTMLElement;
              expect(el2).toBeTruthy();
              if (el2 && el2.style) {
                const styleText = el2.getAttribute('style') || '';
                expect(styleText).toContain('data:image');
              }
              break;

            case 'blocks multiple property injection via semicolon':
            case 'blocks property injection with important':
              // Should warn about semicolon injection
              expect(mockLogger.warn).toHaveBeenCalled();
              // Should only include the first property value
              const el3 = fragment.firstChild as HTMLElement;
              expect(el3).toBeTruthy();
              if (el3 && el3.style) {
                const styleText = el3.getAttribute('style') || '';
                expect(styleText).toContain('color: red');
                expect(styleText).not.toContain('position:');
                expect(styleText).not.toContain('background:');
              }
              break;

            case 'blocks event handler attributes':
            case 'blocks on* attributes with uppercase':
              // Should warn about invalid attributes
              expect(mockLogger.warn).toHaveBeenCalled();
              // Should not include event handlers
              const el4 = fragment.firstChild as HTMLElement;
              expect(el4).toBeTruthy();
              if (el4) {
                expect(el4.getAttribute('onclick')).toBeNull();
                expect(el4.getAttribute('onload')).toBeNull();
                expect(el4.getAttribute('onerror')).toBeNull();
                expect(el4.getAttribute('onmouseover')).toBeNull();
                expect(el4.getAttribute('onClick')).toBeNull();
                expect(el4.getAttribute('ONCLICK')).toBeNull();
              }
              break;

            case 'allows safe href protocols':
              const link = fragment.firstChild as HTMLAnchorElement;
              expect(link.tagName).toBe('A');
              expect(link.href).toBe('https://example.com/');
              expect(link.textContent).toBe('Safe link');
              break;

            case 'allows safe img src':
              const img = fragment.firstChild as HTMLImageElement;
              expect(img.tagName).toBe('IMG');
              expect(img.src).toBe('https://example.com/image.png');
              expect(img.alt).toBe('Safe image');
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

          const fragment = renderToDOM(testCase.input, { logger: mockLogger });

          const div = fragment.firstChild as HTMLElement;
          expect(div).toBeDefined();
          expect(div.tagName).toBe('DIV');

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
              expect(div.textContent).toBe('');
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

          const fragment = renderToDOM(testCase.input, { logger: mockLogger });

          // Check specific expectations based on test name
          switch (testCase.name) {
            case 'blocks javascript: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              const a1 = fragment.firstChild as HTMLAnchorElement;
              expect(a1.tagName).toBe('A');
              expect(a1.hasAttribute('href')).toBe(false);
              break;

            case 'blocks javascript: protocol in src':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "src" contains blocked protocol/)
              );
              const img1 = fragment.firstChild as HTMLImageElement;
              expect(img1.tagName).toBe('IMG');
              expect(img1.hasAttribute('src')).toBe(false);
              break;

            case 'blocks data: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              const a2 = fragment.firstChild as HTMLAnchorElement;
              expect(a2.hasAttribute('href')).toBe(false);
              break;

            case 'blocks data: protocol in src':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "src" contains blocked protocol/)
              );
              const img2 = fragment.firstChild as HTMLImageElement;
              expect(img2.hasAttribute('src')).toBe(false);
              break;

            case 'blocks vbscript: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              const a3 = fragment.firstChild as HTMLAnchorElement;
              expect(a3.hasAttribute('href')).toBe(false);
              break;

            case 'blocks file: protocol in href':
              expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringMatching(/Attribute "href" contains blocked protocol/)
              );
              const a4 = fragment.firstChild as HTMLAnchorElement;
              expect(a4.hasAttribute('href')).toBe(false);
              break;

            case 'allows https: protocol in href':
              const a5 = fragment.firstChild as HTMLAnchorElement;
              expect(a5.href).toBe('https://example.com/');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows http: protocol in href':
              const a6 = fragment.firstChild as HTMLAnchorElement;
              expect(a6.href).toBe('http://example.com/');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows https: protocol in src':
              const img3 = fragment.firstChild as HTMLImageElement;
              expect(img3.src).toBe('https://example.com/image.png');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows mailto: protocol in href':
              const a7 = fragment.firstChild as HTMLAnchorElement;
              expect(a7.href).toBe('mailto:test@example.com');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows tel: protocol in href':
              const a8 = fragment.firstChild as HTMLAnchorElement;
              expect(a8.href).toBe('tel:+1234567890');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL with slash in href':
              const a9 = fragment.firstChild as HTMLAnchorElement;
              expect(a9.getAttribute('href')).toBe('/path/to/page');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL with hash in href':
              const a10 = fragment.firstChild as HTMLAnchorElement;
              expect(a10.getAttribute('href')).toBe('#section');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows relative URL without protocol in href':
              const a11 = fragment.firstChild as HTMLAnchorElement;
              expect(a11.getAttribute('href')).toBe('page.html');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            case 'allows query string in href':
              const a12 = fragment.firstChild as HTMLAnchorElement;
              expect(a12.getAttribute('href')).toBe('?param=value');
              expect(mockLogger.warn).not.toHaveBeenCalled();
              break;

            default:
              throw new Error(`Unhandled test case: ${testCase.name}`);
          }
        });
      });
    });

    describe('Zero Value Handling', () => {
      zeroValueAttributeTests.forEach(testCase => {
        test(testCase.name, () => {
          const fragment = renderToDOM(testCase.input);

          switch (testCase.name) {
            case 'allows zero in data-* attribute':
              const div1 = fragment.firstChild as HTMLElement;
              expect(div1.getAttribute('data-count')).toBe('0');
              expect(div1.textContent).toBe('Items');
              break;

            case 'allows zero string in attribute':
              const div2 = fragment.firstChild as HTMLElement;
              expect(div2.getAttribute('data-index')).toBe('0');
              expect(div2.textContent).toBe('Item');
              break;

            case 'allows zero in title attribute':
              const div3 = fragment.firstChild as HTMLElement;
              expect(div3.getAttribute('title')).toBe('0');
              expect(div3.textContent).toBe('Score');
              break;

            case 'allows zero in width attribute':
              const img = fragment.firstChild as HTMLImageElement;
              expect(img.getAttribute('width')).toBe('0');
              expect(img.alt).toBe('test');
              break;

            default:
              throw new Error(`Unhandled test case: ${testCase.name}`);
          }
        });
      });
    });
  });
});