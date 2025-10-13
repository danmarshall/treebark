/**
 * This file demonstrates the TypeScript safety improvements in treebark.
 * 
 * The improvements address three key requirements:
 * 1. Tags are now restricted to the allowed whitelist
 * 2. $if tags are separated from regular tags - conditionals cannot be mixed with regular attributes
 * 3. Type safety ensures proper template structure
 * 
 * To see the type checking in action, uncomment the "INVALID EXAMPLES" sections below
 * and run `npx tsc --noEmit` to see TypeScript errors.
 */

import { renderToString } from 'treebark';
import type { TemplateObject } from 'treebark/src/common.js';

// ===========================
// VALID EXAMPLES - These compile and work correctly
// ===========================

// ✅ Valid: Standard HTML tags from the whitelist
const validTemplate1: TemplateObject = {
  div: {
    class: 'container',
    $children: [
      { h1: 'Hello World' },
      { p: 'This is a paragraph' }
    ]
  }
};

// ✅ Valid: $if tag with conditional properties only
const validTemplate2: TemplateObject = {
  $if: {
    $check: 'isActive',
    $then: { div: 'Active' },
    $else: { div: 'Inactive' }
  }
};

// ✅ Valid: $if tag with comparison operators and $join
const validTemplate3: TemplateObject = {
  $if: {
    $check: 'age',
    '$>': 18,
    '$<': 65,
    $join: 'AND',
    $then: { div: 'Working age adult' },
    $else: { div: 'Not working age' }
  }
};

// ✅ Valid: All allowed container tags
const validTemplate4: TemplateObject = {
  div: {
    $children: [
      { header: 'Header' },
      { main: {
        $children: [
          { section: 'Section content' },
          { article: 'Article content' }
        ]
      }},
      { footer: 'Footer' }
    ]
  }
};

// ✅ Valid: Void tags
const validTemplate5: TemplateObject = {
  div: {
    $children: [
      { img: { src: 'image.jpg', alt: 'An image' } },
      { br: {} },
      { hr: {} }
    ]
  }
};

// ✅ Valid: Special $comment tag
const validTemplate6: TemplateObject = {
  $comment: 'This is a comment'
};

// ===========================
// INVALID EXAMPLES - These should NOT compile
// ===========================

// ❌ INVALID: Arbitrary tag names are NOT allowed
// Uncomment to see TypeScript error:
/*
const invalidTemplate1: TemplateObject = {
  zoo: 'animals'  // ❌ TypeScript Error: Type '{ zoo: string; }' is not assignable to type 'TemplateObject'
};
*/

// ❌ INVALID: Custom/unknown tags are NOT allowed
// Uncomment to see TypeScript error:
/*
const invalidTemplate2: TemplateObject = {
  customTag: 'content'  // ❌ TypeScript Error: Property 'customTag' does not exist
};
*/

// ❌ INVALID: Cannot mix conditional properties with regular tag properties
// Uncomment to see TypeScript error:
/*
const invalidTemplate3: TemplateObject = {
  $if: {
    $check: 'test',
    $then: 'yes',
    class: 'my-class',  // ❌ TypeScript Error: Object literal may only specify known properties
    $children: ['content']  // ❌ TypeScript Error: Object literal may only specify known properties
  }
};
*/

// ❌ INVALID: $join should only be used in $if conditionals, not regular tags
// Note: TypeScript allows this because of index signature in TemplateAttributes,
// but it's semantically wrong and would be caught at runtime if used incorrectly
// The type system properly separates $if from regular tags though.

// ===========================
// RUNTIME VALIDATION
// ===========================

// Even if TypeScript is bypassed (using 'as any'), runtime validation still catches errors
try {
  const runtimeInvalid1 = { zoo: 'animals' } as any;
  renderToString({ template: runtimeInvalid1 });
} catch (e) {
  console.log('✅ Runtime caught invalid tag:', (e as Error).message);
  // Output: Tag "zoo" is not allowed
}

try {
  const runtimeInvalid2 = {
    $if: {
      $check: 'test',
      $then: 'yes',
      class: 'invalid',
      $children: ['also invalid']
    }
  } as any;
  renderToString({ template: runtimeInvalid2, data: { test: true } });
} catch (e) {
  console.log('✅ Runtime caught invalid $if attributes:', (e as Error).message);
  // Output: "$if" tag does not support $children, use $then and $else instead
}

try {
  const runtimeInvalid3 = {
    div: {
      invalidAttr: 'value',
      $children: ['content']
    }
  };
  renderToString({ template: runtimeInvalid3 });
} catch (e) {
  console.log('✅ Runtime caught invalid attribute:', (e as Error).message);
  // Output: Attribute "invalidAttr" is not allowed on tag "div"
}

// ===========================
// SUCCESSFUL RENDERS
// ===========================

console.log('\n=== Successful renders ===\n');

console.log('1. Standard div with content:');
console.log(renderToString({ template: validTemplate1 }));

console.log('\n2. Conditional $if tag:');
console.log(renderToString({ template: validTemplate2, data: { isActive: true } }));

console.log('\n3. Conditional with operators:');
console.log(renderToString({ template: validTemplate3, data: { age: 30 } }));

console.log('\n4. Nested structure:');
console.log(renderToString({ template: validTemplate4 }));

console.log('\n5. Void tags:');
console.log(renderToString({ template: validTemplate5 }));

console.log('\n6. Comment:');
console.log(renderToString({ template: validTemplate6 }));

export {
  validTemplate1,
  validTemplate2,
  validTemplate3,
  validTemplate4,
  validTemplate5,
  validTemplate6
};
