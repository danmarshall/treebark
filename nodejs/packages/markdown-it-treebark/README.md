# markdown-it-treebark

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering [treebark](https://github.com/danmarshall/treebark) templates in fenced code blocks.

**[Try it in the interactive playground!](https://danmarshall.github.io/treebark/markdown-playground.html)**

## Installation

```bash
npm install markdown-it-treebark
```

## Usage


For YAML and JSON support:
```javascript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';
import yaml from 'js-yaml';

const md = new MarkdownIt();
md.use(treebarkPlugin, { yaml }); // YAML and JSON both supported
```

For JSON-only (smaller bundle):
```javascript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';

const md = new MarkdownIt();
md.use(treebarkPlugin); // JSON only (no YAML lib needed)
```

### Basic Example

```javascript
const markdown = `
# Hello Treebark

\`\`\`treebark
div:
  class: greeting
  $children:
    - h1: "Welcome!"
    - p: "This is rendered safely from treebark."
\`\`\`
`;

console.log(md.render(markdown));
```

## Browser Usage

The plugin is available as a UMD browser bundle:

```html
<script src="https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js"></script>
<script src="path/to/markdown-it-treebark-browser.js"></script>
<script>
  const md = window.markdownit();
  md.use(window.MarkdownItTreebark, { 
    data: { name: 'World' },
    indent: true 
  });
  
  const html = md.render('# Hello\n\n```treebark\n{"div": "Hello {{name}}!"}\n```');
  console.log(html);
</script>
```

**Note:** The browser bundle only supports JSON format. For YAML support in the browser, you would need to include js-yaml and pass it as an option.

## Options


The plugin accepts an options object:

```javascript
md.use(treebarkPlugin, {
  // YAML library instance (if provided, enables YAML parsing)
  yaml: yaml,  // Pass js-yaml or compatible library

  // Default data context for all templates
  data: {
    siteName: 'My Website',
    user: { name: 'Alice' }
  },

  // HTML output indentation (optional)
  indent: true      // Enable indentation with 2 spaces (default)
  // indent: 4      // Use 4 spaces for indentation
  // indent: '\t'   // Use tabs for indentation
  // indent: false  // No indentation (default)
});
```

### Bundle Size Optimization


To reduce bundle size when you only need JSON support:

```javascript
// JSON only - no YAML dependency needed
md.use(treebarkPlugin); // No yaml option, only JSON supported

// YAML + JSON
md.use(treebarkPlugin, { yaml }); // Both supported
```

### Format Support


The plugin supports both YAML and JSON formats:

- **YAML**: Clean, readable syntax ideal for templates (enabled if you provide a `yaml` library)
- **JSON**: Structured format that's great for data-heavy templates (always enabled)

**Parsing Strategy**: If a `yaml` library is provided, the plugin tries YAML first, then falls back to JSON. If not, only JSON is supported.

### HTML Indentation

By default, treebark outputs HTML on a single line for compact output. You can enable indentation for more readable HTML:

```javascript
// Enable indentation with 2 spaces (default)
md.use(treebarkPlugin, { indent: true });

// Custom number of spaces
md.use(treebarkPlugin, { indent: 4 });

// Use tabs for indentation
md.use(treebarkPlugin, { indent: '\t' });

// No indentation (default)
md.use(treebarkPlugin, { indent: false });
```

**Without indentation** (default):
```html
<div class="card"><h2>Product Card</h2><p>A simple card component</p></div>
```

**With indentation** (indent: true):
```html
<div class="card">
  <h2>Product Card</h2>
  <p>A simple card component</p>
</div>
```

## Examples

### Basic Template (YAML)

````markdown
```treebark
div:
  class: card
  $children:
    - h2: "Product Card"
    - p: "A simple card component"
```
````

### Basic Template (JSON)

````markdown
```treebark
{
  "div": {
    "class": "card",
    "$children": [
      { "h2": "Product Card" },
      { "p": "A simple card component" }
    ]
  }
}
```
````

Both render to:
```html
<div class="card">
  <h2>Product Card</h2>
  <p>A simple card component</p>
</div>
```

### Template with Data (YAML)

````markdown
```treebark
template:
  div:
    class: user-profile
    $children:
      - img:
          src: "{{avatar}}"
          alt: "{{name}}'s avatar"
      - h3: "{{name}}"
      - p: "{{bio}}"
data:
  name: "Alice Johnson"
  avatar: "/avatars/alice.jpg"
  bio: "Software engineer and treebark enthusiast"
```
````

### Template with Data (JSON)

````markdown
```treebark
{
  "template": {
    "div": {
      "class": "user-profile",
      "$children": [
        {
          "img": {
            "src": "{{avatar}}",
            "alt": "{{name}}'s avatar"
          }
        },
        { "h3": "{{name}}" },
        { "p": "{{bio}}" }
      ]
    }
  },
  "data": {
    "name": "Alice Johnson",
    "avatar": "/avatars/alice.jpg",
    "bio": "Software engineer and treebark enthusiast"
  }
}
```
````

### List Binding (YAML)

````markdown
```treebark
template:
  ul:
    class: product-list
    $bind: products
    $children:
      - li: "{{name}} - {{price}}"
data:
  products:
    - name: "Laptop"
      price: "$999"
    - name: "Phone"
      price: "$499"
```
````

### List Binding (JSON)

````markdown
```treebark
{
  "template": {
    "ul": {
      "class": "product-list",
      "$bind": "products",
      "$children": [
        { "li": "{{name}} - {{price}}" }
      ]
    }
  },
  "data": {
    "products": [
      { "name": "Laptop", "price": "$999" },
      { "name": "Phone", "price": "$499" }
    ]
  }
}
```
````

### Shorthand Array Syntax (YAML)

````markdown
```treebark
div:
  - h1: "Quick Layout"
  - p: "Using shorthand syntax"
  - ul:
    - li: "Item 1"
    - li: "Item 2"
```
````

### Shorthand Array Syntax (JSON)

````markdown
```treebark
{
  "div": [
    { "h1": "Quick Layout" },
    { "p": "Using shorthand syntax" },
    {
      "ul": [
        { "li": "Item 1" },
        { "li": "Item 2" }
      ]
    }
  ]
}
```
````

## Security

Treebark is safe by default and only allows whitelisted HTML tags and attributes. Dangerous elements like `<script>`, `<iframe>`, and event handlers are blocked.

**URL Security:** Treebark also validates URL values in `href` and `src` attributes to prevent XSS attacks. The following URL protocols are blocked for security reasons:
- `javascript:` - Prevents JavaScript execution
- `data:` - Prevents data URI attacks
- `vbscript:` - Prevents VBScript execution
- `file:` - Prevents local file access
- `about:` - Prevents about: protocol exploits

Safe protocols like `http:`, `https:`, `mailto:`, `tel:`, and relative URLs are allowed.

## Error Handling


If a treebark block contains invalid YAML/JSON or violates safety rules, an error message will be displayed instead of the content:

````markdown
```treebark
script: "alert('xss attempt')"
```
````

Renders to:
```html
<div class="treebark-error">
  <strong>Treebark Error:</strong> Tag "script" is not allowed
</div>
```

## License

MIT
