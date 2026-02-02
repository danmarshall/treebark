# markdown-it-treebark

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering [treebark](https://github.com/danmarshall/treebark) templates in fenced code blocks.

**[Try it in the interactive playground!](https://treebark.js.org/markdown-playground.html)**

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

  // Custom logger for error/warning messages (optional)
  logger: {
    error: (msg) => console.error('Treebark Error:', msg),
    warn: (msg) => console.warn('Treebark Warning:', msg),
    log: (msg) => console.log('Treebark:', msg)
  }
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

### Custom Logger

By default, treebark logs errors and warnings to the console. You can provide a custom logger to handle these messages differently:

```javascript
// Custom logger that captures messages
const logger = {
  error: (message) => {
    // Handle error messages (e.g., invalid tags)
    myErrorHandler(message);
  },
  warn: (message) => {
    // Handle warning messages (e.g., invalid attributes)
    myWarningHandler(message);
  },
  log: (message) => {
    // Handle info messages
    myLogHandler(message);
  }
};

md.use(treebarkPlugin, { yaml, logger });
```

**Use cases for custom loggers:**
- Capture and display validation errors in a UI
- Log errors to an analytics service
- Silent mode (no-op logger) for production
- Collect all errors for batch processing

**No-throw policy:** Treebark follows a no-throw policy. Instead of throwing exceptions, it logs errors and continues rendering valid content. This means your markdown will always render, even if some treebark blocks have errors.

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

Treebark is safe by default and only allows whitelisted HTML tags and attributes. Dangerous elements like `<script>`, `<iframe>`, and event handlers are not allowed.

## Error Handling

Treebark follows a **no-throw policy**: errors are logged (not thrown) and rendering continues with valid content.

**Default behavior:** Invalid tags and attributes are logged to the console, but the markdown-it plugin catches any parsing errors and displays them in the rendered output.

### Parsing Errors

If a treebark block contains invalid YAML/JSON, an error message will be displayed:

````markdown
```treebark
{ invalid json
```
````

Renders to:
```html
<div class="treebark-error">
  <strong>Treebark Error:</strong> Failed to parse as JSON: Unexpected token...
</div>
```

### Validation Errors

If a treebark block violates safety rules, the invalid elements are skipped and errors are logged to the console (or your custom logger):

````markdown
```treebark
script: "alert('xss attempt')"
```
````

This renders as an empty string (`\n`) because the `script` tag is not allowed. The error "Tag 'script' is not allowed" is logged to the console.

**To capture validation errors**, provide a custom logger:

```javascript
const errors = [];
md.use(treebarkPlugin, {
  logger: {
    error: (msg) => errors.push(msg),
    warn: (msg) => console.warn(msg),
    log: (msg) => console.log(msg)
  }
});
```

## License

MIT
