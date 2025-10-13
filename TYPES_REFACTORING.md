# Refactoring to Tag-Specific Types and Separate types.ts

This document describes the refactoring of type definitions into a separate `types.ts` file with improved tag-specific types.

## Changes Made

### 1. Created `types.ts` File

Moved all type definitions from `common.ts` to a new `types.ts` file. This file contains only type definitions with no executable code.

**Benefits:**
- Clear separation of concerns: types vs. runtime code
- Easier to maintain and understand
- Faster TypeScript compilation (types-only files)

### 2. Introduced Tag-Specific Types

Created individual tag types like `DivTag`, `ImgTag`, `ATag`, etc.:

```typescript
export type DivTag = { div?: TagContent<BaseContainerAttrs> };
export type ImgTag = { img?: TagContent<BaseVoidAttrs & { src?: string; alt?: string; width?: string; height?: string }> };
export type ATag = { a?: TagContent<BaseContainerAttrs & { href?: string; target?: string; rel?: string }> };
```

**Benefits:**
- Each tag type is self-contained with its attributes
- Easier to understand what attributes each tag supports
- Better IntelliSense support
- More maintainable

### 3. Consolidated Repetitive Code

Created a `TagContent` helper type to avoid repeating `string | (string | TemplateObject)[]`:

```typescript
type TagContent<Attrs> = string | (string | TemplateObject)[] | Attrs;
```

**Before:**
```typescript
div?: string | (string | TemplateObject)[] | DivAttrs;
span?: string | (string | TemplateObject)[] | SpanAttrs;
p?: string | (string | TemplateObject)[] | PAttrs;
// ... repeated for every tag
```

**After:**
```typescript
export type DivTag = { div?: TagContent<BaseContainerAttrs> };
export type SpanTag = { span?: TagContent<BaseContainerAttrs> };
export type PTag = { p?: TagContent<BaseContainerAttrs> };
// ... much cleaner
```

### 4. Updated `TemplateObject` Type

Changed from an object with many properties to a union of tag types:

```typescript
export type TemplateObject = IfTag | RegularTags;

export type RegularTags = 
  | DivTag | SpanTag | PTag | HeaderTag | FooterTag | MainTag
  | H1Tag | H2Tag | H3Tag | H4Tag | H5Tag | H6Tag
  // ... etc
```

**Benefits:**
- More modular and composable
- Each tag type can be used independently
- Better type checking and error messages

## File Structure

### `types.ts` (NEW)
- Contains all type definitions
- No executable code
- Exports all tag types and helper types

### `common.ts` (UPDATED)
- Imports types from `types.ts`
- Re-exports types for backwards compatibility
- Contains only runtime utility functions and constants

### `index.ts` (UPDATED)
- Exports individual tag types for public API
- Exports main render functions

## Type Safety Features

All previous type safety features are preserved:

1. ✅ **Tag name restrictions** - Only whitelisted tags allowed
2. ✅ **$if separation** - Conditional properties can't mix with regular tags
3. ✅ **Void tag enforcement** - `$children` not allowed in void tags
4. ✅ **Required $then** - `$then` is mandatory in `$if` tags
5. ✅ **Per-tag attributes** - Each tag only accepts its specific attributes

## Examples

### Using Individual Tag Types

```typescript
import type { DivTag, ImgTag, ATag } from 'treebark';

const myDiv: DivTag = { div: 'content' };
const myImg: ImgTag = { img: { src: 'pic.jpg', alt: 'Picture' } };
const myLink: ATag = { a: { href: 'http://example.com', $children: ['Click'] } };
```

### Using TemplateObject (accepts any tag)

```typescript
import type { TemplateObject } from 'treebark';

const template: TemplateObject = {
  div: {
    class: 'container',
    $children: [
      { h1: 'Title' },
      { img: { src: 'pic.jpg' } }
    ]
  }
};
```

## Verification

All tests pass:
```bash
Test Suites: 3 passed, 3 total
Tests:       270 passed, 270 total
```

TypeScript compilation successful with proper type checking:
```bash
$ npx tsc --noEmit
# No errors
```

Type safety still enforced:
```bash
$ npx tsc --noEmit test-attribute-validation.ts
error: 'src' does not exist in type '...ATag...'
error: 'href' does not exist in type '...ImgTag...'
```

## Files Modified

1. **`src/types.ts`** (NEW) - All type definitions
2. **`src/common.ts`** - Imports from types.ts, re-exports types, contains runtime code
3. **`src/index.ts`** - Exports tag types in public API
4. **`tsconfig.json`** - Exclude test files

## Migration Guide

For most users, this is a non-breaking change. All existing code continues to work:

```typescript
// Still works
import { TemplateObject, renderToString } from 'treebark';

const template: TemplateObject = { div: 'content' };
renderToString({ template });
```

**New capability:** Can now import individual tag types:

```typescript
// NEW: Can import specific tag types
import type { DivTag, ImgTag } from 'treebark';

const div: DivTag = { div: 'content' };
const img: ImgTag = { img: { src: 'pic.jpg' } };
```

## Conclusion

This refactoring improves code organization, maintainability, and type clarity while preserving all existing functionality and type safety features. The new structure makes it easier to understand and work with tag-specific types.
