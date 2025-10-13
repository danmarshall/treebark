/**
 * This file demonstrates TypeScript compile-time type checking for templates.
 * 
 * To see the type safety in action, uncomment any of the "INVALID" examples
 * and run: npx tsc --noEmit
 * 
 * You should see TypeScript errors preventing invalid template structures.
 */

import type { TemplateObject } from './src/common.js';

// ===========================
// VALID EXAMPLES
// ===========================

// ✅ Valid: Using allowed HTML tags
const validExample1: TemplateObject = {
  div: {
    class: 'container',
    $children: [
      { h1: 'Title' },
      { p: 'Content' }
    ]
  }
};

// ✅ Valid: Using $if with conditional properties
const validExample2: TemplateObject = {
  $if: {
    $check: 'isActive',
    $then: { span: 'Active' },
    $else: { span: 'Inactive' }
  }
};

// ✅ Valid: Using $if with operators
const validExample3: TemplateObject = {
  $if: {
    $check: 'age',
    '$>': 18,
    '$<': 65,
    $join: 'AND',
    $then: { div: 'Adult' }
  }
};

// ✅ Valid: Using all types of allowed tags
const validExample4: TemplateObject = {
  div: {
    $children: [
      { img: { src: 'pic.jpg', alt: 'Picture' } },  // void tag
      { br: {} },                                    // void tag
      { p: 'Text' },                                 // container tag
      { $comment: 'A comment' }                      // special tag
    ]
  }
};

// ===========================
// INVALID EXAMPLES - Uncomment to see TypeScript errors
// ===========================

/*
// ❌ INVALID: Arbitrary tag names are rejected
const invalidExample1: TemplateObject = {
  zoo: 'animals'  
  // TypeScript Error: Type '{ zoo: string; }' is not assignable to type 'TemplateObject'
  // Property 'zoo' does not exist in type 'RegularTemplateObject'
};
*/

/*
// ❌ INVALID: Custom/unknown tags are rejected
const invalidExample2: TemplateObject = {
  customElement: 'content'
  // TypeScript Error: Property 'customElement' does not exist
};
*/

/*
// ❌ INVALID: Cannot mix $if conditional properties with regular properties
const invalidExample3: TemplateObject = {
  $if: {
    $check: 'test',
    $then: 'yes',
    class: 'my-class',      // ❌ Error: Object literal may only specify known properties
    $children: ['content']  // ❌ Error: Object literal may only specify known properties
  }
};
*/

/*
// ❌ INVALID: Cannot use $join property outside of $if context
// Note: This is semantically wrong. While TypeScript may allow it due to index
// signature in TemplateAttributes, it would be caught at runtime if misused.
const invalidExample4: TemplateObject = {
  div: {
    $join: 'OR',  // This makes no sense on a regular tag
    $children: ['content']
  }
};
// The type system successfully separates $if from regular tags, preventing
// the mixing of conditional operators with regular tag attributes at the
// TemplateObject level.
*/

// ===========================
// Export for module system
// ===========================

export {
  validExample1,
  validExample2,
  validExample3,
  validExample4
};
