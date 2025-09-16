/**
 * @jest-environment jsdom
 */
const { renderToDOM } = require('treebark');
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
          case 'handles self-contained template':
            const p = fragment.firstChild as HTMLElement;
            expect(p.tagName).toBe('P');
            expect(p.textContent).toBe('Hello Alice!');
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

  // HTML comment tag tests
  describe('HTML Comment Tags', () => {
    commentTagTests.forEach(testCase => {
      createTest(testCase, renderToDOM, (fragment, tc) => {
        switch (tc.name) {
          case 'renders simple comment tag':
            expect(fragment.childNodes.length).toBe(1);
            expect(fragment.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
            expect(fragment.childNodes[0].textContent).toBe('This is a comment');
            break;
          case 'renders comment tag with data interpolation':
            const comment = fragment.childNodes[0] as Comment;
            expect(comment.nodeType).toBe(Node.COMMENT_NODE);
            expect(comment.textContent).toBe('User: Alice');
            break;
          case 'renders comment tag with HTML content':
            const htmlComment = fragment.childNodes[0] as Comment;
            expect(htmlComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(htmlComment.textContent).toBe('Start <span>middle</span> end');
            break;
          case 'renders comment tag in mixed content':
            const div = fragment.firstChild as HTMLElement;
            expect(div.childNodes.length).toBe(3);
            expect(div.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
            expect(div.childNodes[0].textContent).toBe('Before comment');
            expect(div.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);
            expect(div.childNodes[1].textContent).toBe('This is a comment');
            expect(div.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
            expect(div.childNodes[2].textContent).toBe('After comment');
            break;
          case 'renders multiple comment tags':
            expect(fragment.childNodes.length).toBe(2);
            expect(fragment.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
            expect(fragment.childNodes[0].textContent).toBe('First comment');
            expect(fragment.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);
            expect(fragment.childNodes[1].textContent).toBe('Second comment');
            break;
          case 'renders comment tag within nested structure':
            const nestedDiv = fragment.firstChild as HTMLElement;
            expect(nestedDiv.childNodes.length).toBe(3);
            expect(nestedDiv.childNodes[0].nodeName).toBe('H1');
            expect(nestedDiv.childNodes[1].nodeType).toBe(Node.COMMENT_NODE);
            expect(nestedDiv.childNodes[1].textContent).toBe('TODO: Add more content here');
            expect(nestedDiv.childNodes[2].nodeName).toBe('P');
            break;
          case 'renders empty comment tag':
            const emptyComment = fragment.childNodes[0] as Comment;
            expect(emptyComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(emptyComment.textContent).toBe('');
            break;
          case 'renders comment tag with nested property interpolation':
            const nestedComment = fragment.childNodes[0] as Comment;
            expect(nestedComment.nodeType).toBe(Node.COMMENT_NODE);
            expect(nestedComment.textContent).toBe('Debug: 123 - Bob');
            break;
        }
      });
    });

    commentTagErrorTests.forEach(testCase => {
      createErrorTest(testCase, renderToDOM);
    });

    test('comment tags handle escaped interpolation correctly in DOM', () => {
      const fragment = renderToDOM(
        { comment: 'Comment with {{{escaped}}} content' },
        { data: { escaped: 'test' } }
      );
      const comment = fragment.childNodes[0] as Comment;
      expect(comment.nodeType).toBe(Node.COMMENT_NODE);
      expect(comment.textContent).toBe('Comment with {{escaped}} content');
    });

    test('comment tags in self-contained templates in DOM', () => {
      const fragment = renderToDOM({
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
      const div = fragment.firstChild as HTMLElement;
      expect(div.childNodes.length).toBe(2);
      expect(div.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(div.childNodes[0].textContent).toBe('Template comment for Test Page');
      expect(div.childNodes[1].nodeName).toBe('H1');
      expect(div.childNodes[1].textContent).toBe('Test Page');
    });

    test('comment tags with array binding in DOM', () => {
      const fragment = renderToDOM({
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
      const ul = fragment.firstChild as HTMLElement;
      expect(ul.childNodes.length).toBe(4); // 2 comments + 2 li elements
      expect(ul.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(ul.childNodes[0].textContent).toBe('Item: Apple');
      expect(ul.childNodes[1].nodeName).toBe('LI');
      expect(ul.childNodes[1].textContent).toBe('Apple - $1');
      expect(ul.childNodes[2].nodeType).toBe(Node.COMMENT_NODE);
      expect(ul.childNodes[2].textContent).toBe('Item: Banana');
      expect(ul.childNodes[3].nodeName).toBe('LI');
      expect(ul.childNodes[3].textContent).toBe('Banana - $2');
    });

    test('comment tag nodes can be inserted into actual DOM', () => {
      document.body.innerHTML = '';
      const fragment = renderToDOM({
        div: {
          id: 'comment-test',
          $children: [
            { comment: 'This is a test comment' },
            { p: 'Content after comment' }
          ]
        }
      });
      
      document.body.appendChild(fragment);
      
      const container = document.getElementById('comment-test');
      expect(container).toBeTruthy();
      expect(container?.childNodes.length).toBe(2);
      expect(container?.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(container?.childNodes[0].textContent).toBe('This is a test comment');
      expect(container?.childNodes[1].nodeName).toBe('P');
    });
  });
});