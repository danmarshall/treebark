# markdown-it-treebark

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin for rendering [treebark](https://github.com/danmarshall/treebark) templates in fenced code blocks.

## Installation

```bash
npm install markdown-it-treebark
```

## Usage

```javascript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';

const md = new MarkdownIt();
md.use(treebarkPlugin);

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
  // Default data context for all templates
  data: {
    siteName: 'My Website',
    user: { name: 'Alice' }
  },
  
  // Whether to allow JSON in addition to YAML (default: true)
  allowJson: true
});
```

## Examples

### Basic Template

````markdown
```treebark
div:
  class: card
  $children:
    - h2: "Product Card"
    - p: "A simple card component"
```
````

Renders to:
```html
<div class="card">
  <h2>Product Card</h2>
  <p>A simple card component</p>
</div>
```

### Template with Data

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

### List Binding

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

### Shorthand Array Syntax

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