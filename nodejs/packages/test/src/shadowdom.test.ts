/**
 * @jest-environment jsdom
 */
import { renderToDOM, renderToString } from 'treebark';

describe('Shadow DOM Support', () => {
  describe('Basic Shadow DOM rendering', () => {
    test('renders simple element without shadow DOM by default', () => {
      const fragment = renderToDOM({
        template: { div: 'Hello world' }
      });

      expect(fragment.childNodes.length).toBe(1);
      const div = fragment.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello world');
      expect(div.shadowRoot).toBeNull();
    });

    test('renders simple element with shadow DOM when useShadowDOM is true', () => {
      const fragment = renderToDOM(
        {
          template: { div: 'Hello world' }
        },
        { useShadowDOM: true }
      );

      expect(fragment.childNodes.length).toBe(1);
      const container = fragment.firstChild as HTMLElement;
      expect(container.tagName).toBe('DIV');
      expect(container.shadowRoot).not.toBeNull();
      
      const shadowRoot = container.shadowRoot!;
      expect(shadowRoot.childNodes.length).toBe(1);
      const div = shadowRoot.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello world');
    });

    test('renders multiple elements with shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: [
            { h1: 'Title' },
            { p: 'Content' }
          ]
        },
        { useShadowDOM: true }
      );

      expect(fragment.childNodes.length).toBe(1);
      const container = fragment.firstChild as HTMLElement;
      expect(container.shadowRoot).not.toBeNull();
      
      const shadowRoot = container.shadowRoot!;
      expect(shadowRoot.childNodes.length).toBe(2);
      expect((shadowRoot.childNodes[0] as HTMLElement).tagName).toBe('H1');
      expect((shadowRoot.childNodes[0] as HTMLElement).textContent).toBe('Title');
      expect((shadowRoot.childNodes[1] as HTMLElement).tagName).toBe('P');
      expect((shadowRoot.childNodes[1] as HTMLElement).textContent).toBe('Content');
    });

    test('preserves nested structure within shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: {
            div: {
              class: 'container',
              $children: [
                { h1: 'Title' },
                { p: 'Content' }
              ]
            }
          }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const div = shadowRoot.firstChild as HTMLElement;
      expect(div.className).toBe('container');
      expect(div.children.length).toBe(2);
      expect(div.children[0].tagName).toBe('H1');
      expect(div.children[1].tagName).toBe('P');
    });
  });

  describe('Shadow DOM with data binding', () => {
    test('renders data interpolation in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: { div: 'Hello {{name}}' },
          data: { name: 'Alice' }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const div = shadowRoot.firstChild as HTMLElement;
      expect(div.textContent).toBe('Hello Alice');
    });

    test('renders array binding in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: {
            ul: {
              $bind: 'items',
              $children: [
                { li: '{{name}}' }
              ]
            }
          },
          data: {
            items: [
              { name: 'Item 1' },
              { name: 'Item 2' },
              { name: 'Item 3' }
            ]
          }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const ul = shadowRoot.firstChild as HTMLElement;
      expect(ul.tagName).toBe('UL');
      expect(ul.children.length).toBe(3);
      expect(ul.children[0].textContent).toBe('Item 1');
      expect(ul.children[1].textContent).toBe('Item 2');
      expect(ul.children[2].textContent).toBe('Item 3');
    });
  });

  describe('Shadow DOM with attributes', () => {
    test('preserves attributes on elements in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: {
            div: {
              id: 'test-id',
              class: 'test-class',
              'data-value': 'test-data',
              $children: ['Content']
            }
          }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const div = shadowRoot.firstChild as HTMLElement;
      expect(div.id).toBe('test-id');
      expect(div.className).toBe('test-class');
      expect(div.getAttribute('data-value')).toBe('test-data');
      expect(div.textContent).toBe('Content');
    });

    test('preserves style attribute in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: {
            div: {
              style: {
                color: 'red',
                'font-size': '16px'
              },
              $children: ['Styled content']
            }
          }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const div = shadowRoot.firstChild as HTMLElement;
      expect(div.style.color).toBe('red');
      expect(div.style.fontSize).toBe('16px');
    });
  });

  describe('Shadow DOM with special tags', () => {
    test('renders comments in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: { $comment: 'This is a comment' }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      expect(shadowRoot.childNodes.length).toBe(1);
      expect(shadowRoot.childNodes[0].nodeType).toBe(Node.COMMENT_NODE);
      expect(shadowRoot.childNodes[0].textContent).toBe('This is a comment');
    });

    test('renders conditional elements in shadow DOM', () => {
      const fragment = renderToDOM(
        {
          template: {
            $if: {
              $check: 'show',
              $then: { p: 'Visible' },
              $else: { p: 'Hidden' }
            }
          },
          data: { show: true }
        },
        { useShadowDOM: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const shadowRoot = container.shadowRoot!;
      const p = shadowRoot.firstChild as HTMLElement;
      expect(p.tagName).toBe('P');
      expect(p.textContent).toBe('Visible');
    });
  });

  describe('Shadow DOM compatibility', () => {
    test('shadow DOM option does not affect renderToString', () => {
      // This test verifies that the useShadowDOM option is only relevant for DOM rendering
      // renderToString should ignore it completely
      
      const result1 = renderToString({
        template: { div: 'Test' }
      });
      
      const result2 = renderToString(
        {
          template: { div: 'Test' }
        },
        { useShadowDOM: true }
      );
      
      expect(result1).toBe(result2);
      expect(result1).toBe('<div>Test</div>');
    });
  });
});
