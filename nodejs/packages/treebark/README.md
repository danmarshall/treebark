# Treebark for Node.js/Browser

Safe HTML tree structures for Markdown and content-driven apps.

## Installation

```bash
npm install treebark
```

## Quick Start

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