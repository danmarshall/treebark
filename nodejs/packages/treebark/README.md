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

### Block Container for Security (Browser Only)

When rendering user-generated templates, use block container to prevent positioning attacks:

```javascript
import { renderToDOM } from 'treebark';

// Render with block container enabled
const fragment = renderToDOM({
  template: userGeneratedTemplate,  // From database, user input, CMS, etc.
  data: { /* ... */ }
}, { useBlockContainer: true });

document.body.appendChild(fragment);
```

**What block container does:**
- Wraps content in a `<div>` with CSS `contain: content` and `isolation: isolate`
- Creates stacking context boundary (prevents overlaying page elements)
- Maintains style inheritance (unlike shadow DOM)
- Essential for safely rendering user-generated templates

**When to use:**
- ✅ **Required** for user-generated templates (blogs, forums, CMS, wikis)
- ✅ **Recommended** for templates with user-controlled links
- ⚠️ **Optional** for trusted developer-only templates

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
  - `logger?: Logger` - Custom logger for errors/warnings (default: `console`)
  - `propertyFallback?: OuterPropertyResolver` - Custom property resolver
  - `useBlockContainer?: boolean` - Wrap content in block container with CSS containment (default: `false`)

**Returns:** `DocumentFragment` - DOM fragment containing rendered nodes

**Block Container Mode:**
When `useBlockContainer: true`, wraps content in a container with:
- CSS `contain: content` for layout/paint containment
- CSS `isolation: isolate` for stacking context isolation
- Prevents positioned elements from overlaying page elements
- **Essential for user-generated templates** (blogs, forums, CMS)
- Maintains style inheritance (unlike shadow DOM)

## Examples

For comprehensive examples, documentation, and advanced features, see the [main Treebark repository](https://github.com/danmarshall/treebark).

## License

MIT