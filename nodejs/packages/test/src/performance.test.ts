import { renderToString, Data } from 'treebark';

describe('Performance Tests', () => {
  test('array binding should run in linear time', () => {
    // Create test data with large arrays to demonstrate O(n×m) vs O(n+m)
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({ 
      name: `Item ${i}`, 
      value: i 
    }));
    
    const manyChildren = Array.from({ length: 100 }, (_, i) => ({ 
      p: `Child ${i}: {{name}} = {{value}}` 
    }));

    // This should demonstrate the performance issue in the current implementation
    const start = performance.now();
    
    const result = renderToString({
      template: {
        div: {
          $bind: 'items',
          $children: manyChildren
        }
      },
      data: { items: largeArray }
    });
    
    const end = performance.now();
    const duration = end - start;
    
    // The result should be correct
    expect(result).toContain('<div><p>Child 0: Item 0 = 0</p>');
    expect(result).toContain('<p>Child 99: Item 999 = 999</p></div>');
    
    // Log timing for analysis (this will help us verify the improvement)
    console.log(`Array binding with 1000 items × 100 children took ${duration.toFixed(2)}ms`);
    
    // With the fix, this should complete much faster
    // We'll use a generous timeout but the fix should make this much faster
    expect(duration).toBeLessThan(5000); // 5 second timeout for safety
  });

  test('automatic array iteration should be linear', () => {
    // Test the automatic array iteration feature (renderToString lines 31-36)
    const largeArray = Array.from({ length: 10000 }, (_, i) => ({ 
      name: `Card ${i}`,
      id: i
    }));

    const start = performance.now();
    
    const result = renderToString({
      template: {
        div: {
          class: 'card',
          $children: [
            { h2: '{{name}}' },
            { p: 'ID: {{id}}' }
          ]
        }
      },
      data: largeArray as unknown as Data
    });
    
    const end = performance.now();
    const duration = end - start;
    
    // The result should be correct
    expect(result).toContain('<div class="card"><h2>Card 0</h2><p>ID: 0</p></div>');
    expect(result).toContain('<div class="card"><h2>Card 9999</h2><p>ID: 9999</p></div>');
    
    console.log(`Automatic array iteration with 10000 items took ${duration.toFixed(2)}ms`);
    
    // This should be linear and fast
    expect(duration).toBeLessThan(1000); // 1 second should be plenty
  });

  test('identify specific performance bottlenecks', () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ 
      name: `Item ${i}`, 
      value: i 
    }));

    // Test 1: Simple string interpolation
    console.time('Simple interpolation');
    const result1 = renderToString({
      template: {
        div: {
          $bind: 'items',
          $children: [{ p: '{{name}} - {{value}}' }]
        }
      },
      data: { items }
    });
    console.timeEnd('Simple interpolation');

    // Test 2: Complex nested structure
    console.time('Complex nested');
    const result2 = renderToString({
      template: {
        div: {
          $bind: 'items',
          $children: [
            { h3: { class: 'title', $children: ['{{name}}'] } },
            { p: { class: 'description', $children: ['Value: {{value}}'] } },
            { span: { 'data-id': '{{value}}', $children: ['ID: {{value}}'] } }
          ]
        }
      },
      data: { items }
    });
    console.timeEnd('Complex nested');

    // Test 3: Many simple children  
    const manySimpleChildren = Array.from({ length: 20 }, (_, i) => ({ 
      span: `Child ${i}: {{name}}` 
    }));

    console.time('Many simple children');
    const result3 = renderToString({
      template: {
        div: {
          $bind: 'items',
          $children: manySimpleChildren
        }
      },
      data: { items }
    });
    console.timeEnd('Many simple children');

    // Validate results are correct
    expect(result1).toContain('<p>Item 0 - 0</p>');
    expect(result2).toContain('<h3 class="title">Item 0</h3>');
    expect(result3).toContain('<span>Child 0: Item 0</span>');
  });
});