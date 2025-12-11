import { renderToString, renderToDOM } from 'treebark';

describe('$filter on databinding', () => {
  describe('String Renderer', () => {
    it('should filter array items based on simple truthiness', () => {
      const input = {
        template: {
          ul: {
            $bind: 'items',
            $filter: {
              $check: 'active'
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          items: [
            { name: 'Item 1', active: true },
            { name: 'Item 2', active: false },
            { name: 'Item 3', active: true }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Item 1</li><li>Item 3</li></ul>');
    });

    it('should filter array items with comparison operators', () => {
      const input = {
        template: {
          ul: {
            $bind: 'products',
            $filter: {
              $check: 'price',
              '$<': 500
            },
            $children: [
              { li: '{{name}} - ${{price}}' }
            ]
          }
        },
        data: {
          products: [
            { name: 'Laptop', price: 999 },
            { name: 'Mouse', price: 25 },
            { name: 'Keyboard', price: 75 },
            { name: 'Monitor', price: 699 }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Mouse - $25</li><li>Keyboard - $75</li></ul>');
    });

    it('should filter array items with greater than operator', () => {
      const input = {
        template: {
          ul: {
            $bind: 'products',
            $filter: {
              $check: 'price',
              '$>': 500
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          products: [
            { name: 'Laptop', price: 999 },
            { name: 'Mouse', price: 25 },
            { name: 'Monitor', price: 699 }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Laptop</li><li>Monitor</li></ul>');
    });

    it('should filter array items with $in operator', () => {
      const input = {
        template: {
          ul: {
            $bind: 'users',
            $filter: {
              $check: 'role',
              $in: ['admin', 'moderator']
            },
            $children: [
              { li: '{{name}} ({{role}})' }
            ]
          }
        },
        data: {
          users: [
            { name: 'Alice', role: 'admin' },
            { name: 'Bob', role: 'user' },
            { name: 'Charlie', role: 'moderator' },
            { name: 'Dave', role: 'user' }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Alice (admin)</li><li>Charlie (moderator)</li></ul>');
    });

    it('should filter array items with equality operator', () => {
      const input = {
        template: {
          ul: {
            $bind: 'items',
            $filter: {
              $check: 'status',
              '$=': 'published'
            },
            $children: [
              { li: '{{title}}' }
            ]
          }
        },
        data: {
          items: [
            { title: 'Post 1', status: 'published' },
            { title: 'Post 2', status: 'draft' },
            { title: 'Post 3', status: 'published' }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Post 1</li><li>Post 3</li></ul>');
    });

    it('should filter with range using multiple operators', () => {
      const input = {
        template: {
          ul: {
            $bind: 'people',
            $filter: {
              $check: 'age',
              '$>=': 18,
              '$<=': 65
            },
            $children: [
              { li: '{{name}} ({{age}})' }
            ]
          }
        },
        data: {
          people: [
            { name: 'Alice', age: 15 },
            { name: 'Bob', age: 25 },
            { name: 'Charlie', age: 70 },
            { name: 'Dave', age: 40 }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Bob (25)</li><li>Dave (40)</li></ul>');
    });

    it('should filter with OR logic', () => {
      const input = {
        template: {
          ul: {
            $bind: 'people',
            $filter: {
              $check: 'age',
              '$<': 18,
              '$>': 65,
              $join: 'OR' as const
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          people: [
            { name: 'Alice', age: 15 },
            { name: 'Bob', age: 25 },
            { name: 'Charlie', age: 70 }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Alice</li><li>Charlie</li></ul>');
    });

    it('should filter with $not modifier', () => {
      const input = {
        template: {
          ul: {
            $bind: 'items',
            $filter: {
              $check: 'hidden',
              $not: true
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          items: [
            { name: 'Item 1', hidden: false },
            { name: 'Item 2', hidden: true },
            { name: 'Item 3', hidden: false }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Item 1</li><li>Item 3</li></ul>');
    });

    it('should return empty when all items are filtered out', () => {
      const input = {
        template: {
          ul: {
            $bind: 'products',
            $filter: {
              $check: 'price',
              '$<': 10
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          products: [
            { name: 'Laptop', price: 999 },
            { name: 'Mouse', price: 25 }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul></ul>');
    });

    it('should work without $filter (no filtering)', () => {
      const input = {
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
            { name: 'Item 2' }
          ]
        }
      };

      const result = renderToString(input);
      expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });
  });

  describe('DOM Renderer', () => {
    it('should filter array items in DOM', () => {
      const input = {
        template: {
          ul: {
            $bind: 'items',
            $filter: {
              $check: 'active'
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          items: [
            { name: 'Item 1', active: true },
            { name: 'Item 2', active: false },
            { name: 'Item 3', active: true }
          ]
        }
      };

      const fragment = renderToDOM(input);
      const div = document.createElement('div');
      div.appendChild(fragment);
      
      expect(div.innerHTML).toBe('<ul><li>Item 1</li><li>Item 3</li></ul>');
    });

    it('should filter with comparison operators in DOM', () => {
      const input = {
        template: {
          ul: {
            $bind: 'products',
            $filter: {
              $check: 'price',
              '$<': 100
            },
            $children: [
              { li: '{{name}}' }
            ]
          }
        },
        data: {
          products: [
            { name: 'Laptop', price: 999 },
            { name: 'Mouse', price: 25 },
            { name: 'Keyboard', price: 75 }
          ]
        }
      };

      const fragment = renderToDOM(input);
      const div = document.createElement('div');
      div.appendChild(fragment);
      
      expect(div.innerHTML).toBe('<ul><li>Mouse</li><li>Keyboard</li></ul>');
    });
  });
});
