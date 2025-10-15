import { renderToString } from '../../treebark/src/string.js';

console.log('\n=== Testing Final Implementation ===\n');

// Create mock logger to capture errors
const mockLogger = {
  error: (msg: string) => console.log('ERROR:', msg),
  warn: (msg: string) => console.log('WARN:', msg),
  log: (msg: string) => console.log('LOG:', msg)
};

// Test 1: Scalar zero as data
console.log('Test 1: Scalar zero as data');
const test1 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: 0
}, { logger: mockLogger });
console.log('Result:', test1);
console.log('Expected: <div>Value: 0</div>\n');

// Test 2: Scalar null as data
console.log('Test 2: Scalar null as data');
const test2 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: null
}, { logger: mockLogger });
console.log('Result:', test2);
console.log('Expected: <div>Value: </div>\n');

// Test 3: Scalar number with property access (should error)
console.log('Test 3: Accessing property on scalar (should error)');
const test3 = renderToString({
  template: { div: 'Value: {{count}}' },
  data: 42
}, { logger: mockLogger });
console.log('Result:', test3);
console.log('Expected: Error logged + <div>Value: </div>\n');

// Test 4: $bind to scalar with children (should error)
console.log('Test 4: $bind to scalar with children (should error)');
const test4 = renderToString({
  template: {
    div: {
      $bind: 'score',
      $children: ['Score: {{.}}']
    }
  },
  data: { score: 42 }
}, { logger: mockLogger });
console.log('Result:', test4);
console.log('Expected: Error logged + empty string\n');

// Test 5: $bind to array with zero
console.log('Test 5: $bind to array with zero');
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
}, { logger: mockLogger });
console.log('Result:', test5);
console.log('Expected: <ul><li>Value: 0</li><li>Value: 1</li><li>Value: 2</li></ul>\n');

// Test 6: Regular object data (should work as before)
console.log('Test 6: Regular object data');
const test6 = renderToString({
  template: { div: 'Count: {{count}}' },
  data: { count: 0 }
}, { logger: mockLogger });
console.log('Result:', test6);
console.log('Expected: <div>Count: 0</div>\n');

console.log('=== Test Complete ===\n');
