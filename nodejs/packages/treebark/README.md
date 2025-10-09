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

Treebark supports tree shaking for optimal bundle sizes. Import only what you need:

```javascript
// Only import the string renderer (smaller bundle for Node.js SSR)
import { renderToString } from 'treebark/string';

// Only import the DOM renderer (for browser-only apps)
import { renderToDOM } from 'treebark/dom';

// Or import both from the main entry
import { renderToString, renderToDOM } from 'treebark';
```

Modern bundlers like Vite, Webpack, and Rollup will automatically remove unused code from your bundle.

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