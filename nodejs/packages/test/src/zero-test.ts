import { renderToString } from 'treebark';

console.log('\n=== Testing Zero Handling ===\n');

// Test 1: Zero in interpolation
const test1 = renderToString({
  template: { div: 'Count: {{count}}' },
  data: { count: 0 }
});
console.log('Test 1 (interpolation with zero):', test1);
console.log('Expected: <div>Count: 0</div>');

// Test 2: Zero as direct content
const test2 = renderToString({
  template: { div: '{{value}}' },
  data: { value: 0 }
});
console.log('\nTest 2 (direct zero value):', test2);
console.log('Expected: <div>0</div>');

// Test 3: Zero in attributes
const test3 = renderToString({
  template: {
    div: {
      'data-count': '{{count}}',
      $children: ['Items']
    }
  },
  data: { count: 0 }
});
console.log('\nTest 3 (zero in attribute):', test3);
console.log('Expected: <div data-count="0">Items</div>');

// Test 4: Zero in $if condition (currently falsy)
const test4 = renderToString({
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'count',
            $then: { p: 'Has count' }
          }
        }
      ]
    }
  },
  data: { count: 0 }
});
console.log('\nTest 4 ($if with zero - currently falsy):', test4);
console.log('Expected (current): <div></div>');
console.log('Expected (desired): <div><p>Has count</p></div>');

// Test 5: Zero in $bind with array
const test5 = renderToString({
  template: {
    ul: {
      $bind: 'items',
      $children: [
        { li: 'Value: {{.}}' }
      ]
    }
  },
  data: { items: [0, 1, 2] }
});
console.log('\nTest 5 ($bind with zero in array):', test5);
console.log('Expected: <ul><li>Value: 0</li><li>Value: 1</li><li>Value: 2</li></ul>');

// Test 6: Zero in $bind with direct value
const test6 = renderToString({
  template: {
    div: {
      $bind: 'score',
      $children: ['Score: {{.}}']
    }
  },
  data: { score: 0 }
});
console.log('\nTest 6 ($bind with zero as object):', test6);
console.log('Expected: <div>Score: 0</div>');

console.log('\n=== Test Complete ===\n');
