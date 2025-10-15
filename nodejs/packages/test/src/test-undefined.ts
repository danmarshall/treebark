import { renderToString } from '../../treebark/src/string.js';

console.log('\n=== Testing Undefined Data ===\n');

// Test 1: No data provided (undefined)
console.log('Test 1: No data provided (undefined)');
const test1 = renderToString({
  template: { div: 'Hello World' }
});
console.log('Result:', test1);
console.log('Expected: <div>Hello World</div>\n');

// Test 2: Interpolation with undefined data
console.log('Test 2: Interpolation with undefined data');
const test2 = renderToString({
  template: { div: 'Count: {{count}}' }
});
console.log('Result:', test2);
console.log('Expected: <div>Count: </div>\n');

// Test 3: Zero as data still works
console.log('Test 3: Zero as data');
const test3 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: 0
});
console.log('Result:', test3);
console.log('Expected: <div>Value: 0</div>\n');

// Test 4: null as data
console.log('Test 4: null as data');
const test4 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: null
});
console.log('Result:', test4);
console.log('Expected: <div>Value: </div>\n');

console.log('=== Test Complete ===\n');
