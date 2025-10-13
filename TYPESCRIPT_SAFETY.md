# TypeScript Safety Improvements

This document describes the TypeScript safety improvements made to the treebark template system.

## Problem Statement

Previously, the `TemplateObject` type accepted any string as a tag name, allowing code like this:

```typescript
renderToString({
  template: {
    zoo: {  // ❌ No compile-time error for invalid tag
      $children: [],
      $join: 'OR',  // ❌ Can mix conditionals with regular tags
    }
  }
});
```

This had three main issues:
1. **Any tag name was accepted** - No compile-time validation of tag names
2. **Mixing conditionals with regular tags** - `$if` conditionals could be mixed with regular tag attributes
3. **Weak attribute validation** - Attributes weren't strongly typed per tag

## Solution

### 1. Type-Safe Tag Names

Created union types for all allowed tags:

```typescript
export type ContainerTag = 'div' | 'span' | 'p' | 'header' | 'footer' | 'main' | 'section' | 'article' |
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'blockquote' | 'code' | 'pre' |
  'ul' | 'ol' | 'li' | 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td' | 'a';

export type VoidTag = 'img' | 'br' | 'hr';
export type SpecialTag = '$comment' | '$if';
export type AllowedTag = ContainerTag | VoidTag | SpecialTag;
```

Now invalid tags are caught at compile time:

```typescript
// ❌ TypeScript Error: Property 'zoo' does not exist in type 'TemplateObject'
const invalid: TemplateObject = {
  zoo: 'animals'
};
```

### 2. Separated $if from Regular Tags

Created distinct types for $if and regular tags:

```typescript
// $if can only have conditional properties
export type IfTemplateObject = {
  $if: ConditionalValueOrTemplate;
};

// Regular tags exclude $if
export type RegularTemplateObject = {
  [K in Exclude<AllowedTag, '$if'>]?: string | (string | TemplateObject)[] | TemplateAttributes;
};

// Union of both
export type TemplateObject = IfTemplateObject | RegularTemplateObject;
```

This prevents mixing conditionals with regular attributes:

```typescript
// ❌ TypeScript Error: Object literal may only specify known properties
const invalid: TemplateObject = {
  $if: {
    $check: 'test',
    $then: 'yes',
    class: 'invalid',      // ❌ Error: 'class' does not exist
    $children: ['content']  // ❌ Error: '$children' does not exist
  }
};
```

### 3. Runtime Validation

Even when TypeScript is bypassed (using `as any`), runtime validation catches errors:

```typescript
// Runtime still validates
const template = { zoo: 'animals' } as any;
renderToString({ template });  // Throws: Tag "zoo" is not allowed
```

## Benefits

### Type Safety
- **Compile-time validation** of tag names
- **Prevents** mixing of conditional and regular tag properties
- **IntelliSense support** shows only allowed tags

### Maintainability
- **Single source of truth** for allowed tags
- **Clear separation** between tag types
- **Type-driven development** catches errors early

### Backwards Compatibility
- All existing valid templates continue to work
- Runtime validation remains as a safety net
- No breaking changes to the API

## Examples

### Valid Templates

```typescript
// ✅ Valid: Standard HTML tags
const template1: TemplateObject = {
  div: {
    class: 'container',
    $children: [
      { h1: 'Title' },
      { p: 'Content' }
    ]
  }
};

// ✅ Valid: $if with conditional properties
const template2: TemplateObject = {
  $if: {
    $check: 'isActive',
    $then: { div: 'Active' },
    $else: { div: 'Inactive' }
  }
};

// ✅ Valid: $if with operators and $join
const template3: TemplateObject = {
  $if: {
    $check: 'age',
    '$>': 18,
    '$<': 65,
    $join: 'AND',
    $then: { div: 'Adult' }
  }
};
```

### Invalid Templates (Caught by TypeScript)

```typescript
// ❌ Invalid tag name
const invalid1: TemplateObject = {
  zoo: 'animals'  // Error: Property 'zoo' does not exist
};

// ❌ Mixing conditionals with regular properties
const invalid2: TemplateObject = {
  $if: {
    $check: 'test',
    class: 'my-class'  // Error: 'class' does not exist in type 'ConditionalValueOrTemplate'
  }
};
```

## Testing

Run the validation script to see the improvements in action:

```bash
# Run validation tests
node nodejs/packages/treebark/validate-types.mjs

# Run TypeScript compilation on error examples (should show errors)
cd nodejs/packages/treebark
npx tsc --noEmit typescript-errors-expected.ts
```

## Files Changed

- `nodejs/packages/treebark/src/common.ts` - Updated type definitions
- `nodejs/packages/test/src/type-safety.test.ts` - New comprehensive tests
- `nodejs/packages/treebark/validate-types.mjs` - Validation script
- `nodejs/packages/treebark/type-examples.ts` - Type safety examples
- `nodejs/packages/treebark/typescript-errors-expected.ts` - Error demonstration

All 261 tests pass, including 13 new type safety tests.
