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

  test('deep nesting should not cause exponential slowdown', () => {
    // Create deeply nested structure to test recursion performance
    let template: any = { span: 'Deep content {{depth}}' };
    
    // Create 50 levels of nesting
    for (let i = 0; i < 50; i++) {
      template = { div: { class: `level-${i}`, $children: [template] } };
    }

    const start = performance.now();
    
    const result = renderToString({
      template,
      data: { depth: 50 }
    });
    
    const end = performance.now();
    const duration = end - start;
    
    // The result should be correct
    expect(result).toContain('<span>Deep content 50</span>');
    expect(result).toContain('class="level-0"');
    expect(result).toContain('class="level-49"');
    
    console.log(`Deep nesting (50 levels) took ${duration.toFixed(2)}ms`);
    
    // Deep nesting should still be fast
    expect(duration).toBeLessThan(100);
  });
});