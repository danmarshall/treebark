/**
 * @jest-environment jsdom
 */
// Test that subpath imports work correctly for tree shaking
import { renderToDOM } from 'treebark/dom';

describe('Subpath Imports - DOM Renderer', () => {
  it('should render using DOM subpath import', () => {
    const fragment = renderToDOM({
      template: {
        div: {
          class: 'test',
          $children: ['Hello from DOM subpath import']
        }
      }
    });

    const div = fragment.firstChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.className).toBe('test');
    expect(div.textContent).toBe('Hello from DOM subpath import');
  });

  it('should handle data interpolation with subpath import', () => {
    const fragment = renderToDOM({
      template: { p: 'Hello {{name}}!' },
      data: { name: 'World' }
    });

    const p = fragment.firstChild as HTMLElement;
    expect(p.tagName).toBe('P');
    expect(p.textContent).toBe('Hello World!');
  });
});
