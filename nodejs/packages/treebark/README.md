# Treebark for Node.js/Browser

Safe HTML tree structures for Markdown and content-driven apps.

## Installation

```bash
npm install treebark
```

## Quick Start

### String Rendering (Node.js/Browser)

```javascript
import { renderToString } from 'treebark';

// Simple example
const html = renderToString({
  template: {
    div: {
      class: "greeting",
      $children: ["Hello {{name}}!"]
    }
  },
  data: { name: "World" }
});

console.log(html);
// Output: <div class="greeting">Hello World!</div>
```

### DOM Rendering (Browser Only)

```javascript
import { renderToDOM } from 'treebark';

// Create DOM elements directly
const fragment = renderToDOM({
  template: {
    div: {
      class: "greeting",
      $children: ["Hello {{name}}!"]
    }
  },
  data: { name: "World" }
});

// Append to document
document.body.appendChild(fragment);
```

## Tree Shaking

Treebark supports tree shaking for optimal bundle sizes. When using modern bundlers like Vite, Webpack, or Rollup with ESM, unused code will be automatically removed from your bundle.

### Importing Specific Renderers

For the best tree-shaking results, import directly from subpaths:

```javascript
// Only import the string renderer (smaller bundle)
import { renderToString } from 'treebark/string';

// Only import the DOM renderer (for browser-only apps)
import { renderToDOM } from 'treebark/dom';
```

This ensures that if you only need the string renderer (e.g., for Node.js server-side rendering), the DOM renderer code won't be included in your bundle.

### Default Import

You can still import from the main entry point for convenience:

```javascript
// Both renderers available (but tree-shaking still works with ESM)
import { renderToString, renderToDOM } from 'treebark';
```

With ESM builds and modern bundlers, unused exports will be tree-shaken automatically.

## API

### `renderToString(input, options?)`

Renders a template to an HTML string.

**Parameters:**
- `input: TreebarkInput` - Object with `template` and optional `data`
- `options?: RenderOptions` - Optional rendering options (indentation, etc.)

**Returns:** `string` - Generated HTML

### `renderToDOM(input, options?)`

Renders a template to DOM nodes (browser only).

**Parameters:**
- `input: TreebarkInput` - Object with `template` and optional `data`  
- `options?: RenderOptions` - Optional rendering options

**Returns:** `DocumentFragment` - DOM fragment containing rendered nodes

## Examples

For comprehensive examples, documentation, and advanced features, see the [main Treebark repository](https://github.com/danmarshall/treebark).

## License

MIT