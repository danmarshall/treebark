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

## Security

Treebark is designed with security as a priority:

- **Tag Whitelisting:** Only safe HTML tags are allowed (e.g., `div`, `span`, `p`, `a`, `img`). Dangerous tags like `<script>`, `<iframe>`, `<object>` are blocked.
- **Attribute Whitelisting:** Only safe attributes are allowed. Event handlers like `onclick` are blocked.
- **URL Validation:** URLs in `href` and `src` attributes are validated to prevent XSS attacks. Dangerous protocols like `javascript:`, `data:`, `vbscript:`, `file:`, and `about:` are blocked.
- **HTML Escaping:** Template interpolations are HTML-escaped by default to prevent injection attacks.

For more details, see the [specification](https://github.com/danmarshall/treebark/blob/main/spec.md).

## Examples

For comprehensive examples, documentation, and advanced features, see the [main Treebark repository](https://github.com/danmarshall/treebark).

## License

MIT