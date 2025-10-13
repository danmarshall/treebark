# Tag-Specific Attribute Validation Implementation

This document describes the implementation of per-tag attribute type validation in response to code review feedback.

## Problem Statement

The previous implementation used a generic `[key: string]: unknown` index signature that allowed any attribute on any tag. This meant TypeScript wouldn't catch errors like:

```typescript
// No TypeScript error, but semantically wrong
const template: TemplateObject = {
  a: { src: "a should not have src" },
  img: { href: "img should not have href" }
};
```

Additionally, the implementation had repetitive `never` type declarations for conditional properties:

```typescript
// Repetitive and verbose
$check?: never;
$then?: never;
$else?: never;
// ... etc
```

## Solution

### 1. Per-Tag Attribute Types

Created specific attribute type definitions for each HTML tag:

```typescript
// Base types with global attributes
type GlobalAttrs = {
  id?: string;
  class?: string;
  style?: string;
  title?: string;
  role?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
};

type BaseContainerAttrs = GlobalAttrs & {
  $bind?: string;
  $children?: (string | TemplateObject)[];
};

type BaseVoidAttrs = GlobalAttrs & {
  $bind?: string;
};

// Tag-specific types
type AAttrs = BaseContainerAttrs & { 
  href?: string; 
  target?: string; 
  rel?: string;
};

type ImgAttrs = BaseVoidAttrs & { 
  src?: string; 
  alt?: string; 
  width?: string; 
  height?: string;
};

// ... and so on for all tags
```

### 2. Explicit TemplateObject Definition

Instead of using mapped types with generic attributes, explicitly defined each tag:

```typescript
export type TemplateObject = IfTemplateObject | {
  div?: string | (string | TemplateObject)[] | DivAttrs;
  span?: string | (string | TemplateObject)[] | SpanAttrs;
  a?: string | (string | TemplateObject)[] | AAttrs;
  img?: string | (string | TemplateObject)[] | ImgAttrs;
  // ... etc for all tags
};
```

### 3. Removed Repetitive Never Types

The previous implementation had 11 lines of repetitive `never` declarations:

```typescript
// OLD - Removed
$check?: never;
$then?: never;
$else?: never;
'$<'?: never;
'$>'?: never;
'$<='?: never;
'$>='?: never;
'$='?: never;
$in?: never;
$not?: never;
$join?: never;
```

Now, conditional properties are simply not included in the attribute types, which achieves the same effect more cleanly.

## Results

### TypeScript Compile-Time Validation

TypeScript now catches tag-specific attribute errors:

```bash
$ npx tsc --noEmit test-attribute-validation.ts

test-attribute-validation.ts(10,5): error TS2353: Object literal may only specify known properties, 
  and 'src' does not exist in type '(string | TemplateObject)[] | AAttrs'.

test-attribute-validation.ts(17,5): error TS2353: Object literal may only specify known properties, 
  and 'href' does not exist in type '(string | TemplateObject)[] | ImgAttrs'.
```

### Runtime Validation

Runtime validation continues to work as a safety net:

```javascript
renderToString({ template: { a: { src: 'invalid' } } });
// Error: Attribute "src" is not allowed on tag "a"

renderToString({ template: { img: { href: 'invalid' } } });
// Error: Attribute "href" is not allowed on tag "img"
```

### Valid Templates Work Correctly

```typescript
// ✅ Valid - TypeScript accepts and runtime works
const template: TemplateObject = {
  a: {
    href: 'http://example.com',
    target: '_blank',
    rel: 'noopener'
  }
};

// ✅ Valid - TypeScript accepts and runtime works
const template2: TemplateObject = {
  img: {
    src: 'image.jpg',
    alt: 'An image',
    width: '100',
    height: '100'
  }
};
```

## Benefits

1. **Precise Type Safety**: Each tag only accepts its specific attributes
2. **Better IntelliSense**: IDEs show only valid attributes for each tag
3. **Cleaner Code**: Removed 22 lines of repetitive `never` declarations
4. **Maintainability**: Each tag's attributes are clearly defined in one place
5. **No Breaking Changes**: All existing valid templates continue to work

## Test Coverage

Added 4 new tests:
- Runtime rejection of `src` on `a` tag
- Runtime rejection of `href` on `img` tag
- Valid `a` tag with proper attributes
- Valid `img` tag with proper attributes

All 270 tests pass (248 original + 18 type safety + 4 new).

## Tag-Specific Attributes Defined

| Tag | Specific Attributes |
|-----|-------------------|
| `a` | `href`, `target`, `rel` |
| `img` | `src`, `alt`, `width`, `height` |
| `table` | `summary` |
| `th`, `td` | `scope`, `colspan`, `rowspan` |
| `blockquote` | `cite` |

All tags also support:
- Global attributes: `id`, `class`, `style`, `title`, `role`
- Data attributes: `data-*`
- ARIA attributes: `aria-*`
- Special attributes: `$bind`, `$children` (for container tags only)

## Files Modified

1. **`nodejs/packages/treebark/src/common.ts`**
   - Removed repetitive `never` type declarations
   - Added per-tag attribute type definitions
   - Changed `TemplateObject` to explicit tag definitions

2. **`nodejs/packages/test/src/type-safety.test.ts`**
   - Added 4 new tests for tag-specific attribute validation

3. **`nodejs/packages/treebark/tsconfig.json`**
   - Excluded new test files from build

## Conclusion

The implementation now provides precise per-tag attribute type checking while being cleaner and more maintainable. TypeScript catches attribute mismatches at compile time, and runtime validation provides an additional safety net.
