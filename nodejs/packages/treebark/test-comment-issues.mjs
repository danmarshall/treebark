import { renderToString } from './dist/index.js';

console.log('Testing the issues from the comment...\n');

// Test 1: $join in regular tag
console.log('Test 1: $join should not be allowed in regular tags');
try {
  const result = renderToString({
    template: [
      {
        em: {
          $join: 'should not be allowed',
          thisShouldNotBeAnAllowedAttr: 'bar'
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: This should have been rejected!\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: GOOD - rejected as expected\n');
}

// Test 2: $children in void tag
console.log('Test 2: $children should not be allowed in void tags');
try {
  const result = renderToString({
    template: [
      {
        img: {
          thisShouldNotBeAnAllowedAttr: 'bar',
          $children: ['This should not be allowed in a void tag']
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: This should have been rejected!\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: GOOD - rejected as expected\n');
}

// Test 3: $if without $then
console.log('Test 3: $then should be mandatory in $if');
try {
  const result = renderToString({
    template: [
      {
        $if: {
          $check: "this looks good!",
          // $then is missing - should this be mandatory?
        }
      }
    ]
  });
  console.log('Result:', result);
  console.log('Status: This might need $then to be mandatory\n');
} catch (e) {
  console.log('Error:', e.message);
  console.log('Status: Error caught\n');
}
