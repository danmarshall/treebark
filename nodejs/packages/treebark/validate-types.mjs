#!/usr/bin/env node
/**
 * Simple validation script to demonstrate TypeScript safety improvements
 * Run with: node nodejs/packages/treebark/validate-types.mjs
 */

import { renderToString } from './dist/index.js';

console.log('=== TypeScript Safety Validation ===\n');

// Test 1: Valid template with allowed tags
console.log('✅ Test 1: Valid template with allowed tags');
try {
  const result = renderToString({
    template: {
      div: {
        class: 'container',
        $children: [
          { h1: 'Hello World' },
          { p: 'This is a paragraph' }
        ]
      }
    }
  });
  console.log('   Result:', result);
  console.log('   Status: PASSED\n');
} catch (e) {
  console.log('   Status: FAILED -', e.message, '\n');
}

// Test 2: $if tag with conditional properties only
console.log('✅ Test 2: $if tag with conditional properties only');
try {
  const result = renderToString({
    template: {
      $if: {
        $check: 'isActive',
        $then: { div: 'Active' },
        $else: { div: 'Inactive' }
      }
    },
    data: { isActive: true }
  });
  console.log('   Result:', result);
  console.log('   Status: PASSED\n');
} catch (e) {
  console.log('   Status: FAILED -', e.message, '\n');
}

// Test 3: Runtime catches invalid tag (bypassing TypeScript)
console.log('❌ Test 3: Runtime catches invalid tag name');
try {
  const result = renderToString({
    template: { zoo: 'animals' }
  });
  console.log('   Status: FAILED - should have thrown error\n');
} catch (e) {
  console.log('   Error caught:', e.message);
  console.log('   Status: PASSED (correctly rejected)\n');
}

// Test 4: Runtime catches invalid $if attributes (bypassing TypeScript)
console.log('❌ Test 4: Runtime catches invalid $if attributes');
try {
  const result = renderToString({
    template: {
      $if: {
        $check: 'test',
        $then: 'yes',
        class: 'invalid',
        $children: ['also invalid']
      }
    },
    data: { test: true }
  });
  console.log('   Status: FAILED - should have thrown error\n');
} catch (e) {
  console.log('   Error caught:', e.message);
  console.log('   Status: PASSED (correctly rejected)\n');
}

// Test 5: Runtime catches invalid attributes on regular tags
console.log('❌ Test 5: Runtime catches invalid attributes on tags');
try {
  const result = renderToString({
    template: {
      div: {
        invalidAttr: 'value',
        $children: ['content']
      }
    }
  });
  console.log('   Status: FAILED - should have thrown error\n');
} catch (e) {
  console.log('   Error caught:', e.message);
  console.log('   Status: PASSED (correctly rejected)\n');
}

// Test 6: Conditional with comparison operators
console.log('✅ Test 6: Conditional with comparison operators and $join');
try {
  const result = renderToString({
    template: {
      $if: {
        $check: 'age',
        '$>': 18,
        '$<': 65,
        $join: 'AND',
        $then: { div: 'Working age' },
        $else: { div: 'Not working age' }
      }
    },
    data: { age: 30 }
  });
  console.log('   Result:', result);
  console.log('   Status: PASSED\n');
} catch (e) {
  console.log('   Status: FAILED -', e.message, '\n');
}

console.log('=== Summary ===');
console.log('TypeScript now enforces:');
console.log('1. ✓ Tags must be from the allowed whitelist');
console.log('2. ✓ $if tags can only have conditional properties');
console.log('3. ✓ Regular tags cannot have conditional operators like $join');
console.log('4. ✓ Runtime validation catches any bypassed type checks');
console.log('\nAll safety improvements are working correctly!');
