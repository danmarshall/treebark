# Tree Shaking Example

This directory demonstrates how tree shaking works with Treebark.

## Setup

```bash
npm install
```

## Build

```bash
npm run build
```

This will create two bundles:
- `dist/main.bundle.js` - Imports from main entry point
- `dist/string.bundle.js` - Imports from string subpath

Both bundles will be similar in size when using modern ESM bundlers because unused code is tree-shaken.

## Compare Bundle Sizes

```bash
ls -lh dist/*.bundle.js
```

## Test Runtime

```bash
# Test main entry point
node main.js

# Test string subpath import
node main-string.js
```

Both should produce the same output, but the string subpath import is more explicit and ensures optimal tree shaking.
