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

[Learn more at the **Homepage**](https://danmarshall.github.io/treebark/) | [Try it now in the **Playground**](https://danmarshall.github.io/treebark/playground)

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

### `getProperty(data, path, parents?, logger?, getOuterProperty?)`

Get a nested property from data using dot notation. This utility function is used internally by Treebark but is also exported for use in custom property resolution scenarios.

**Parameters:**
- `data: Data` - The data object to retrieve the property from
- `path: BindPath` - The property path using dot notation (e.g., `"user.name"` or `"items.0.value"`)
- `parents?: Data[]` - (Optional) Array of parent data contexts for parent property access
- `logger?: Logger` - (Optional) Logger instance for error messages
- `getOuterProperty?: OuterPropertyResolver` - (Optional) Fallback function called when property is not found

**Returns:** `unknown` - The value at the specified path, or `undefined` if not found

**Special path syntax:**
- `"propName"` - Access a simple property (e.g., `"name"`, `"age"`)
- `"user.name"` - Access nested properties with dot notation
- `"items.0"` - Access array elements by index
- `"."` - Returns the data object itself
- `"..parentProp"` - Access parent context (requires `parents` array)
- `"../../grandProp"` - Access grandparent context

For comprehensive examples, documentation, and advanced features, see the [main Treebark repository](https://github.com/danmarshall/treebark).

## License

MIT
