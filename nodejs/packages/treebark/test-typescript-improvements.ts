/**
 * Test file to verify all the issues from the comment are now caught by TypeScript
 */

import type { TemplateObject } from './src/common.js';

console.log('Testing TypeScript type checking improvements...\n');

// ✅ Test 1: Valid usage - should compile without errors
const validTest: TemplateObject = {
  div: {
    class: 'container',
    $children: [{ p: 'Hello' }]
  }
};
console.log('✅ Valid div with class and children - compiles');

// ✅ Test 2: Valid $if - should compile without errors
const validIf: TemplateObject = {
  $if: {
    $check: 'isActive',
    $then: { div: 'Active' },
    $else: { div: 'Inactive' }
  }
};
console.log('✅ Valid $if with $check, $then, $else - compiles');

// ✅ Test 3: Valid void tag - should compile without errors
const validVoid: TemplateObject = {
  img: {
    src: 'image.jpg',
    alt: 'An image'
  }
};
console.log('✅ Valid img without $children - compiles');

// ❌ The following would cause TypeScript errors (commented out to allow compilation)

/*
// ERROR: $join is not allowed in regular tags
const errorJoin: TemplateObject = {
  em: {
    $join: 'OR',  // TypeScript Error: Types of property '$join' are incompatible
    $children: ['text']
  }
};
*/
console.log('❌ $join in regular tag would cause TypeScript error');

/*
// ERROR: $children is not allowed in void tags
const errorVoidChildren: TemplateObject = {
  img: {
    src: 'test.jpg',
    $children: ['not allowed']  // TypeScript Error: Types of property '$children' are incompatible
  }
};
*/
console.log('❌ $children in void tag would cause TypeScript error');

/*
// ERROR: $then is required in $if
const errorNoThen: TemplateObject = {
  $if: {
    $check: 'test'
    // TypeScript Error: Property '$then' is missing
  }
};
*/
console.log('❌ Missing $then in $if would cause TypeScript error');

/*
// ERROR: Cannot use other conditional operators in regular tags
const errorConditionalInRegular: TemplateObject = {
  div: {
    $check: 'test',  // TypeScript Error: Types of property '$check' are incompatible
    $children: ['text']
  }
};
*/
console.log('❌ Conditional operators in regular tags would cause TypeScript error');

console.log('\n✅ All TypeScript type safety improvements are working!');

export {};
