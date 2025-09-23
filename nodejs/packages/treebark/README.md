# Treebark

> Safe HTML tree structures for Markdown and content-driven apps

[![npm version](https://badge.fury.io/js/treebark.svg)](https://www.npmjs.com/package/treebark)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Treebark is a lightweight library for safely generating HTML from declarative schemas. It cleanly separates schemas (structure definitions) from templates (schemas with variable placeholders) while maintaining security by restricting to safe HTML elements.

## Core Concepts

Treebark distinguishes between two fundamental concepts:

1. **Schema**: Direct HTML structure definition
2. **Template**: Schema with variable placeholders that can be filled with data

This separation eliminates confusion and provides a clean API where dollar-prefixed properties (`$bind`, `$children`) are only used inside templates for special directives, not for top-level structure organization.

## Features

- 🔒 **Safe by default** - Only allows safe HTML elements, prevents XSS
- 📝 **Template rendering** - Support for Handlebars-style `{{variable}}` substitution
- 🔄 **Array binding** - Render templates over arrays of data with `$bind`
- 🎯 **Multiple outputs** - Generate HTML strings or DOM elements
- 📦 **Lightweight** - Minimal dependencies, small bundle size
- 🌐 **Universal** - Works in Node.js and browsers
- ⚡ **Fast** - Efficient recursive rendering engine

## Installation

```bash
npm install treebark
```

## Quick Start

### Schemas (Direct Structure)

```javascript
import { renderToString } from 'treebark';

// Pure schema - direct HTML structure, no variables
const schema = {
  div: {
    class: "greeting",
    $children: [
      { h1: "Hello World!" },
      { p: "Welcome to Treebark" }
    ]
  }
};

const html = renderToString(schema);
console.log(html);
// Output: <div class="greeting"><h1>Hello World!</h1><p>Welcome to Treebark</p></div>
```

### Templates with Data

```javascript
import { renderToString } from 'treebark';

// Template with variable placeholders
const template = {
  div: {
    class: "product-card",
    $children: [
      { h2: "{{name}}" },
      { p: "Only {{price}}!" }
    ]
  }
};

// Separate data object
const data = {
  name: "Gaming Laptop",
  price: "$1299"
};

const html = renderToString(template, { data });
console.log(html);
// Output: <div class="product-card"><h2>Gaming Laptop</h2><p>Only $1299!</p></div>
```

### Array Binding

```javascript
import { renderToString } from 'treebark';

const schema = {
  ul: {
    $bind: "items",
    $children: [
      { li: "{{name}} - {{price}}" }
    ]
  }
};

const data = {
  items: [
    { name: "Laptop", price: "$1299" },
    { name: "Phone", price: "$799" },
    { name: "Tablet", price: "$399" }
  ]
};

const html = renderToString(schema, { data });
// Output: 
// <ul>
//   <li>Laptop - $1299</li>
//   <li>Phone - $799</li>
//   <li>Tablet - $399</li>
// </ul>
```

### Root Array Binding

When your data is directly an array, Treebark automatically applies the template to each item:

```javascript
import { renderToString } from 'treebark';

const template = {
  div: {
    class: "card",
    $children: [
      { h3: "{{name}}" },
      { p: "{{description}}" }
    ]
  }
};

const data = [
  { name: "Product 1", description: "First product" },
  { name: "Product 2", description: "Second product" }
];

const html = renderToString(template, { data });
// Generates multiple card divs, one for each array item
```

## DOM Rendering

For browser environments, you can render directly to DOM elements:

```javascript
import { renderToDOM } from 'treebark';

const schema = {
  div: {
    class: "dynamic-content",
    $children: [
      { h1: "{{title}}" },
      { p: "{{content}}" }
    ]
  }
};

const data = {
  title: "Dynamic Title",
  content: "This content was generated at runtime"
};

const fragment = renderToDOM(schema, { data });
document.body.appendChild(fragment);
```

## Self-Contained Templates

Use `$template` and `$data` for self-contained schemas:

```javascript
import { renderToString } from 'treebark';

const schema = {
  $template: {
    div: {
      class: "user-card",
      $children: [
        { h2: "{{name}}" },
        { p: "{{email}}" }
      ]
    }
  },
  $data: {
    name: "John Doe",
    email: "john@example.com"
  }
};

const html = renderToString(schema);
```

## API Reference

### `renderToString(schema, options?)`

Renders a schema to an HTML string.

**Parameters:**
- `schema`: The schema object defining the HTML structure
- `options`: Optional configuration object
  - `data`: Data object for template variable substitution
  - `indentType`: Indentation type ("none", "spaces", "tabs")
  - `indentSize`: Number of spaces/tabs for indentation

**Returns:** HTML string

### `renderToDOM(schema, options?)`

Renders a schema to a DOM DocumentFragment.

**Parameters:**
- `schema`: The schema object defining the HTML structure  
- `options`: Optional configuration object (same as renderToString)

**Returns:** DocumentFragment containing the rendered elements

### Schema Format

Schemas are plain JavaScript objects that define HTML structure:

```javascript
const schema = {
  // Element name as key
  div: {
    // Attributes as properties
    class: "my-class",
    id: "my-id",
    
    // Special properties
    $children: [/* child elements */],  // Child elements
    $bind: "arrayProperty"              // Bind to array data
  }
};
```

### Special Properties

- `$children`: Array of child elements or text content
- `$bind`: Property name to bind for array iteration
- `$template`: Template definition in self-contained schemas
- `$data`: Data definition in self-contained schemas

### Shorthand Syntax

For elements with only children, you can use shorthand:

```javascript
// Instead of:
{ div: { $children: ["Hello"] } }

// You can write:
{ div: "Hello" }

// Or for multiple children:
{ div: [
  { h1: "Title" },
  { p: "Content" }
]}
```

## Safety Features

Treebark includes built-in safety features:

- **Element whitelist**: Only safe HTML elements are allowed
- **Attribute filtering**: Dangerous attributes like `onclick` are blocked
- **XSS prevention**: All text content is properly escaped
- **No script execution**: Script tags and event handlers are not supported

## Browser Usage

Include the UMD bundle for browser use:

```html
<script src="node_modules/treebark/dist/treebark-browser.js"></script>
<script>
  const html = Treebark.renderToString({
    div: "Hello from browser!"
  });
  console.log(html);
</script>
```

## TypeScript Support

Treebark is written in TypeScript and includes full type definitions:

```typescript
import { Schema, Data, RenderOptions, renderToString } from 'treebark';

const schema: Schema = {
  div: {
    class: "typed-content",
    $children: [{ h1: "{{title}}" }]
  }
};

const data: Data = {
  title: "TypeScript Example"
};

const options: RenderOptions = {
  data,
  indentType: "spaces",
  indentSize: 2
};

const html: string = renderToString(schema, options);
```

## Examples

Check out the [interactive playground](https://danmarshall.github.io/treebark/playground) to experiment with Treebark schemas and see real-time results.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Dan Marshall](https://github.com/danmarshall)