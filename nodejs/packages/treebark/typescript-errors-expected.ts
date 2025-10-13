/**
 * Test file to verify TypeScript catches invalid templates
 * This file SHOULD NOT compile - it contains intentional errors
 * 
 * Run: npx tsc --noEmit typescript-errors-expected.ts
 * Expected: TypeScript compilation errors
 */

import type { TemplateObject } from './src/common.js';

// This file demonstrates that TypeScript PREVENTS invalid templates at compile time

// ❌ ERROR: Invalid tag name 'zoo'
const error1: TemplateObject = {
  zoo: 'animals'
};

// ❌ ERROR: Invalid tag name 'customElement'
const error2: TemplateObject = {
  customElement: 'content'
};

// ❌ ERROR: Cannot have 'class' property in $if
const error3: TemplateObject = {
  $if: {
    $check: 'test',
    $then: 'yes',
    class: 'invalid'
  }
};

// ❌ ERROR: Cannot have '$children' property in $if
const error4: TemplateObject = {
  $if: {
    $check: 'test',
    $then: 'yes',
    $children: ['invalid']
  }
};

export {};
