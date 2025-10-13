/**
 * Test TypeScript type checking for the issues mentioned in the comment
 */

import type { TemplateObject } from './src/common.js';

// Test 1: These should cause TypeScript errors but currently don't
const test1: TemplateObject = {
  em: {
    $join: 'should not be allowed',  // ❌ Should be a TypeScript error
    thisShouldNotBeAnAllowedAttr: 'bar'  // ❌ Should be a TypeScript error
  }
};

// Test 2: These should cause TypeScript errors but currently don't
const test2: TemplateObject = {
  img: {
    thisShouldNotBeAnAllowedAttr: 'bar',  // ❌ Should be a TypeScript error
    $children: ['This should not be allowed in a void tag']  // ❌ Should be a TypeScript error
  }
};

// Test 3: $then should be mandatory
const test3: TemplateObject = {
  $if: {
    $check: "this looks good!",
    // $then is missing - should this cause a TypeScript error?
  }
};

export {};
