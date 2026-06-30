# Treebark for Node.js/Browser

Safe HTML tree structures for Markdown and content-driven apps.

### Hello World

```json
{
  "div": [
    { "h1": "Hello world" },
    { "p": "Welcome to treebark templates" }
  ]
}
```

Output:
```html
<div>
  <h1>Hello world</h1>
  <p>Welcome to treebark templates</p>
</div>
```

[Learn more at the **Homepage**](https://treebark.js.org) | [Try it now in the **Playground**](https://treebark.js.org/playground)

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

## Browser via `<script>` (no build step)

Prebuilt UMD bundles are hosted on the project site, so you can drop Treebark into any
page without npm or a bundler. Pick the flavor you need:

```html
<!-- String flavor: exposes window.Treebark.renderToString -->
<script src="https://treebark.js.org/assets/treebark-browser.min.js"></script>
<script>
  const html = Treebark.renderToString({
    template: { div: { class: "greeting", $children: ["Hello {{name}}!"] } },
    data: { name: "World" }
  });
  document.body.insertAdjacentHTML("beforeend", html);
</script>
```

```html
<!-- DOM flavor: exposes window.Treebark.renderToDOM -->
<script src="https://treebark.js.org/assets/treebark-dom-browser.min.js"></script>
<script>
  const fragment = Treebark.renderToDOM({
    template: { div: { class: "greeting", $children: ["Hello {{name}}!"] } },
    data: { name: "World" }
  });
  document.body.appendChild(fragment);
</script>
```

Both bundles attach to the **same `Treebark` global** and are built with Rollup's
`output.extend`, so loading both on one page merges their exports (`renderToString`
**and** `renderToDOM`) instead of overwriting. Unminified builds
(`treebark-browser.js`, `treebark-dom-browser.js`) with source maps are available at
the same path for debugging.

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