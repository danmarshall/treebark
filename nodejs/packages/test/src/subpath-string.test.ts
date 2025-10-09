// Test that subpath imports work correctly for tree shaking
import { renderToString } from 'treebark/string';

describe('Subpath Imports - String Renderer', () => {
  it('should render using string subpath import', () => {
    const html = renderToString({
      template: {
        div: {
          class: 'test',
          $children: ['Hello from subpath import']
        }
      }
    });

    expect(html).toBe('<div class="test">Hello from subpath import</div>');
  });

  it('should handle data interpolation with subpath import', () => {
    const html = renderToString({
      template: { p: 'Hello {{name}}!' },
      data: { name: 'World' }
    });

    expect(html).toBe('<p>Hello World!</p>');
  });
});
