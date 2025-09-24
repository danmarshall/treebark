# markdown-it-treebark

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering [treebark](https://github.com/danmarshall/treebark) templates in fenced code blocks.

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
md.use(treebarkPlugin, { yaml });
```

For JSON-only (smaller bundle):
```javascript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';

const md = new MarkdownIt();
md.use(treebarkPlugin, { allowYaml: false, allowJson: true });
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

## Options

The plugin accepts an options object:

```javascript
md.use(treebarkPlugin, {
  // YAML library instance (required when allowYaml is true)
  yaml: yaml,  // Pass js-yaml or compatible library
  
  // Default data context for all templates
  data: {
    siteName: 'My Website',
    user: { name: 'Alice' }
  },
  
  // Format support (both default to true)
  allowYaml: true,  // Enable YAML parsing
  allowJson: true,  // Enable JSON parsing
  
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
md.use(treebarkPlugin, { 
  allowYaml: false, 
  allowJson: true 
});

// YAML only
md.use(treebarkPlugin, { 
  yaml: yaml,
  allowYaml: true, 
  allowJson: false 
});
```

### Format Support

The plugin supports both YAML and JSON formats with flexible configuration:

- **YAML**: Clean, readable syntax ideal for templates
- **JSON**: Structured format that's great for data-heavy templates  

You can configure format support independently:

```javascript
// Support both YAML and JSON (default)
md.use(treebarkPlugin, { allowYaml: true, allowJson: true });

// YAML only
md.use(treebarkPlugin, { allowYaml: true, allowJson: false });

// JSON only 
md.use(treebarkPlugin, { allowYaml: false, allowJson: true });

// Alternative option format
md.use(treebarkPlugin, { allowJson: true });
```

**Parsing Strategy**: When both formats are enabled, the plugin tries YAML first, then falls back to JSON. This provides maximum compatibility while maintaining performance.

**Future Considerations**: In future versions, YAML dependency could be made optional for JSON-only workflows, reducing bundle size for applications that only need JSON support.

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
$template:
  div:
    class: user-profile
    $children:
      - img:
          src: "{{avatar}}"
          alt: "{{name}}'s avatar"
      - h3: "{{name}}"
      - p: "{{bio}}"
$data:
  name: "Alice Johnson"
  avatar: "/avatars/alice.jpg"
  bio: "Software engineer and treebark enthusiast"
```
````

### Template with Data (JSON)

````markdown
```treebark
{
  "$template": {
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
  "$data": {
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
$template:
  ul:
    class: product-list
    $bind: products
    $children:
      - li: "{{name}} - {{price}}"
$data:
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
  "$template": {
    "ul": {
      "class": "product-list",
      "$bind": "products",
      "$children": [
        { "li": "{{name}} - {{price}}" }
      ]
    }
  },
  "$data": {
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
