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

// Create DOM elements (wrapped in block container by default for security)
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

### Block Container Security (Default Behavior)

**Block container is now enabled by default** to prevent positioning attacks. Content is automatically wrapped in a secure container.

**Default behavior:**
```javascript
// Block container is enabled by default (secure)
const fragment = renderToDOM({
  template: userGeneratedTemplate
});
// Result: <div style="contain: content; isolation: isolate;" data-treebark-container="true">
//   <!-- your content here -->
// </div>
```

**Opt-out for trusted templates only:**
```javascript
// Disable block container (only for trusted developer templates)
const fragment = renderToDOM({
  template: trustedTemplate
}, { useBlockContainer: false });
```

**What block container provides:**
- ✅ Prevents positioned elements from overlaying page elements (e.g., sign-in links)
- ✅ Creates stacking context boundary via CSS `isolation: isolate`
- ✅ Maintains style inheritance (page styles still apply)
- ✅ Safe for user-generated templates (blogs, forums, CMS, wikis)
- ✅ Minimal performance impact

**When to opt-out (`useBlockContainer: false`):**
- Only for trusted, developer-controlled templates
- When you understand and accept the security risk
- Not recommended for user-generated content

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
- `options?: RenderOptions` - Optional rendering options
  - `indent?: string | number | boolean` - Indentation for formatted output
  - `logger?: Logger` - Custom logger for errors/warnings (default: `console`)
  - `propertyFallback?: OuterPropertyResolver` - Custom property resolver
  - `useBlockContainer?: boolean` - Wrap content in block container (default: `true`)

**Returns:** `string` - Generated HTML (wrapped in security container by default)

**Block Container (Default):**
By default, output is wrapped in `<div style="contain: content; isolation: isolate;" data-treebark-container="true">` for security. Set `useBlockContainer: false` to opt-out (only for trusted templates).

### `renderToDOM(input, options?)`

Renders a template to DOM nodes (browser only).

**Parameters:**
- `input: TreebarkInput` - Object with `template` and optional `data`  
- `options?: RenderOptions` - Optional rendering options
  - `logger?: Logger` - Custom logger for errors/warnings (default: `console`)
  - `propertyFallback?: OuterPropertyResolver` - Custom property resolver
  - `useBlockContainer?: boolean` - Wrap content in block container (default: `true`)

**Returns:** `DocumentFragment` - DOM fragment containing rendered nodes (wrapped in security container by default)

**Block Container (Default):**
By default, content is wrapped in a container div with:
- CSS `contain: content` for layout/paint containment
- CSS `isolation: isolate` for stacking context isolation
- Prevents positioned elements from overlaying page elements
- **Essential for user-generated templates** (blogs, forums, CMS)
- Maintains style inheritance (unlike shadow DOM)
- Set `useBlockContainer: false` to opt-out (only for trusted templates)

## Examples

For comprehensive examples, documentation, and advanced features, see the [main Treebark repository](https://github.com/danmarshall/treebark).

## License

MIT