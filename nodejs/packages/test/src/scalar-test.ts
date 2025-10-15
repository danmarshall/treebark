import { renderToString } from '../../treebark/src/string.js';

console.log('\n=== Testing Scalar Data Input ===\n');

// Test 1: Scalar number as data
const test1 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: 42
});
console.log('Test 1 (scalar number 42):', test1);

// Test 2: Scalar zero as data
const test2 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: 0
});
console.log('Test 2 (scalar zero):', test2);

// Test 3: Try to access property on scalar
const test3 = renderToString({
  template: { div: 'Value: {{count}}' },
  data: 42
});
console.log('Test 3 (accessing property on scalar):', test3);

// Test 4: Scalar string
const test4 = renderToString({
  template: { div: 'Value: {{.}}' },
  data: "hello"
});
console.log('Test 4 (scalar string):', test4);

console.log('\n=== Test Complete ===\n');
