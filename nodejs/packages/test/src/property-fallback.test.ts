import { renderToString, renderToDOM } from 'treebark';
import { jest } from '@jest/globals';

describe('Property Fallback Handler', () => {
  describe('renderToString', () => {
    it('should use fallback handler for missing properties in interpolation', () => {
      const globalProps = {
        siteName: 'My Website',
        author: 'John Doe'
      };
      
      const fallback = (path: string) => {
        return globalProps[path as keyof typeof globalProps] || undefined;
      };
      
      const result = renderToString(
        {
          template: { div: 'Welcome to {{siteName}} by {{author}}' },
          data: {}
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Welcome to My Website by John Doe</div></div>');
    });

    it('should prefer local data over fallback', () => {
      const globalProps = { name: 'Global Name' };
      const fallback = (path: string) => globalProps[path as keyof typeof globalProps];
      
      const result = renderToString(
        {
          template: { div: 'Hello {{name}}' },
          data: { name: 'Local Name' }
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Hello Local Name</div></div>');
    });

    it('should use fallback in conditional attributes', () => {
      const globalProps = { isActive: true };
      const fallback = (path: string) => globalProps[path as keyof typeof globalProps];
      
      const result = renderToString(
        {
          template: {
            div: {
              class: {
                $check: 'isActive',
                $then: 'active',
                $else: 'inactive'
              },
              $children: ['Status']
            }
          },
          data: {}
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div class="active">Status</div></div>');
    });

    it('should use fallback in $if tags', () => {
      const globalProps = { showMessage: true };
      const fallback = (path: string) => globalProps[path as keyof typeof globalProps];
      
      const result = renderToString(
        {
          template: {
            div: {
              $children: [
                {
                  $if: {
                    $check: 'showMessage',
                    $then: { p: 'This message is shown' },
                    $else: { p: 'Hidden' }
                  }
                }
              ]
            }
          },
          data: {}
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div><p>This message is shown</p></div></div>');
    });

    it('should use fallback in $bind', () => {
      const globalProps = {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' }
        ]
      };
      const fallback = (path: string) => globalProps[path as keyof typeof globalProps];
      
      const result = renderToString(
        {
          template: {
            ul: {
              $bind: 'items',
              $children: [
                { li: '{{name}}' }
              ]
            }
          },
          data: {}
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><ul><li>Item 1</li><li>Item 2</li></ul></div>');
    });

    it('should pass path, data, and parents to fallback handler', () => {
      const fallback = jest.fn((path, data, parents) => {
        return `fallback-${path}`;
      });
      
      renderToString(
        {
          template: { div: '{{missing}}' },
          data: { existing: 'value' }
        },
        { propertyFallback: fallback }
      );
      
      expect(fallback).toHaveBeenCalledWith('missing', { existing: 'value' }, []);
    });

    it('should support dictionary-based fallback', () => {
      const dictionary = {
        'app.title': 'My Application',
        'app.version': '1.0.0',
        'user.greeting': 'Welcome!'
      };
      
      const fallback = (path: string) => (dictionary as Record<string, string>)[path];
      
      const result = renderToString(
        {
          template: {
            div: {
              $children: [
                { h1: '{{app.title}}' },
                { p: 'Version: {{app.version}}' },
                { p: '{{user.greeting}}' }
              ]
            }
          },
          data: {}
        },
        { propertyFallback: fallback }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div><h1>My Application</h1><p>Version: 1.0.0</p><p>Welcome!</p></div></div>');
    });
  });

  describe('Array Index Access', () => {
    it('should support numeric array indices in dot notation', () => {
      const result = renderToString(
        {
          template: { div: '{{items.0.name}}' },
          data: { items: [{ name: 'First' }, { name: 'Second' }] }
        }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>First</div></div>');
    });

    it('should support multiple array indices in same path', () => {
      const result = renderToString(
        {
          template: {
            div: {
              $children: [
                { p: '{{items.0.value}}' },
                { p: '{{items.1.value}}' }
              ]
            }
          },
          data: {
            items: [
              { value: 'Item 1' },
              { value: 'Item 2' }
            ]
          }
        }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div><p>Item 1</p><p>Item 2</p></div></div>');
    });

    it('should support nested arrays with numeric indices', () => {
      const result = renderToString(
        {
          template: { div: '{{matrix.0.1.val}}' },
          data: {
            matrix: [
              [{ val: 'a' }, { val: 'b' }],
              [{ val: 'c' }, { val: 'd' }]
            ]
          }
        }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>b</div></div>');
    });

    it('should work with array at root level', () => {
      const result = renderToString(
        {
          template: { div: '{{0.name}} and {{1.name}}' },
          data: [{ name: 'Alice' }, { name: 'Bob' }]
        }
      );
      
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Alice and Bob</div></div>');
    });
  });
});
