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
  voidTagErrorTests,
  commentTests,
  commentErrorTests,
  bindValidationErrorTests,
  ifTagTests,
  ifTagOperatorTests,
  ifTagThenElseTests,
  conditionalAttributeTests,
  ifTagErrorTests,
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
        }
      });
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

    voidTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
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
});