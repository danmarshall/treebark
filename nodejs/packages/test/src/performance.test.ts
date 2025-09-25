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

  test('verify linear time complexity', () => {
    // Test different sizes to verify O(n) scaling
    const sizes = [100, 200, 400];
    const times: number[] = [];
    
    for (const size of sizes) {
      const items = Array.from({ length: size }, (_, i) => ({ 
        name: `Item ${i}`, 
        value: i 
      }));
      
      const children = Array.from({ length: 10 }, (_, i) => ({ 
        p: `Child ${i}: {{name}} = {{value}}` 
      }));

      const start = performance.now();
      
      renderToString({
        template: {
          div: {
            $bind: 'items',
            $children: children
          }
        },
        data: { items }
      });
      
      const end = performance.now();
      times.push(end - start);
    }
    
    console.log(`Linear time test: ${sizes[0]} items: ${times[0].toFixed(2)}ms, ${sizes[1]} items: ${times[1].toFixed(2)}ms, ${sizes[2]} items: ${times[2].toFixed(2)}ms`);
    
    // Verify roughly linear scaling (allow some variance due to JIT optimization)
    // If truly linear, doubling input should roughly double time
    const ratio1 = times[1] / times[0]; // Should be ~2
    const ratio2 = times[2] / times[1]; // Should be ~2
    
    // Allow generous bounds to account for measurement variance and JIT effects
    expect(ratio1).toBeGreaterThan(1.5);
    expect(ratio1).toBeLessThan(3.0);
    expect(ratio2).toBeGreaterThan(1.5);
    expect(ratio2).toBeLessThan(3.0);
    
    // Also verify all times are reasonable
    times.forEach(time => expect(time).toBeLessThan(1000));
  });
});