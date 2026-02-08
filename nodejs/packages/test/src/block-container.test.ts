/**
 * @jest-environment jsdom
 */
import { renderToDOM } from 'treebark';

describe('Block Container', () => {
  describe('Basic functionality', () => {
    test('renders without block container by default', () => {
      const fragment = renderToDOM({
        template: { div: 'Hello world' }
      });

      expect(fragment.childNodes.length).toBe(1);
      const div = fragment.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello world');
      expect(div.getAttribute('data-treebark-container')).toBeNull();
    });

    test('wraps content in block container when useBlockContainer is true', () => {
      const fragment = renderToDOM(
        {
          template: { div: 'Hello world' }
        },
        { useBlockContainer: true }
      );

      expect(fragment.childNodes.length).toBe(1);
      const container = fragment.firstChild as HTMLElement;
      
      // Check container has the right attributes
      expect(container.tagName).toBe('DIV');
      expect(container.getAttribute('data-treebark-container')).toBe('true');
      
      // Check CSS containment styles are applied
      expect(container.style.contain).toBe('content');
      expect(container.style.isolation).toBe('isolate');
      
      // Check actual content is inside the container
      expect(container.childNodes.length).toBe(1);
      const div = container.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello world');
    });

    test('wraps multiple elements in block container', () => {
      const fragment = renderToDOM(
        {
          template: [
            { h1: 'Title' },
            { p: 'Content' }
          ]
        },
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      expect(container.getAttribute('data-treebark-container')).toBe('true');
      expect(container.childNodes.length).toBe(2);
      expect((container.childNodes[0] as HTMLElement).tagName).toBe('H1');
      expect((container.childNodes[1] as HTMLElement).tagName).toBe('P');
    });
  });

  describe('With data binding', () => {
    test('renders data interpolation in block container', () => {
      const fragment = renderToDOM(
        {
          template: { div: 'Hello {{name}}' },
          data: { name: 'Alice' }
        },
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const div = container.firstChild as HTMLElement;
      expect(div.textContent).toBe('Hello Alice');
    });

    test('renders array binding in block container', () => {
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
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const ul = container.firstChild as HTMLElement;
      expect(ul.tagName).toBe('UL');
      expect(ul.children.length).toBe(3);
      expect(ul.children[0].textContent).toBe('Item 1');
      expect(ul.children[1].textContent).toBe('Item 2');
      expect(ul.children[2].textContent).toBe('Item 3');
    });
  });

  describe('With attributes', () => {
    test('preserves attributes on elements in block container', () => {
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
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const div = container.firstChild as HTMLElement;
      expect(div.id).toBe('test-id');
      expect(div.className).toBe('test-class');
      expect(div.getAttribute('data-value')).toBe('test-data');
      expect(div.textContent).toBe('Content');
    });

    test('preserves style attribute in block container', () => {
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
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      const div = container.firstChild as HTMLElement;
      expect(div.style.color).toBe('red');
      expect(div.style.fontSize).toBe('16px');
    });
  });

  describe('Security - stacking context isolation', () => {
    test('creates new stacking context with isolation: isolate', () => {
      const fragment = renderToDOM(
        {
          template: {
            a: {
              href: 'https://example.com',
              style: {
                position: 'fixed',
                top: '0',
                right: '0',
                'z-index': '9999'
              },
              $children: ['Link']
            }
          }
        },
        { useBlockContainer: true }
      );

      const container = fragment.firstChild as HTMLElement;
      
      // Verify isolation is applied - this creates a stacking context
      expect(container.style.isolation).toBe('isolate');
      
      // The link inside is positioned, but scoped to the container
      const link = container.firstChild as HTMLAnchorElement;
      expect(link.style.position).toBe('fixed');
      expect(link.style.zIndex).toBe('9999');
    });
  });
});
