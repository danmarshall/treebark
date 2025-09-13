# 🌳 Treebark  

> Safe tree structures for Markdown and content-driven apps.

---

## 🚧 Problem  
You want to use HTML structures embedded in user-generated content, such as a blog post in Markdown.

Markdown was originally designed as a **superset of HTML** — you could drop raw `<div>`s, `<table>`s, or even `<script>`s straight into your content.  

But for **safety and consistency**, many Markdown parsers (especially in CMSs, wikis, and chat apps) **disallow raw HTML**. That means:  

- Authors can’t use existing site CSS components (headers, footers, grids).  
- Structured layouts like tables or cards are awkward or impossible.  
- Allowing raw HTML invites XSS and security issues.  

---

## 🌳 Solution  

**Treebark** brings back safe structured markup by replacing raw HTML with **tree schemas** (JSON or YAML).  

- Safe by default: only whitelisted tags/attrs are allowed.  
- Fits naturally into Markdown fenced code blocks.  
- Flexible enough for both **static content** and **data-bound apps**.  

#### 💡 Key Insight  

Templates don’t need a parser or compiler.  

By using **object keys as tag names**, the schema is both natural and trivial to implement:  

```json
{ "div": "Hello world" }
```  

That’s it — a `div` with text, expressed as pure data. No angle brackets, no parser, just a structural walk of the object tree.  

---

## ✨ Examples  

### Hello World  

```json treebark
{ "div": "Hello world" }
```  

→ `<div>Hello world</div>`  

---

### Bound to an Object  

```json treebark
{
  "div": {
    "class": "card",
    "$children": [
      { "h2": "{{title}}" },
      { "p": "{{description}}" }
    ]
  }
}
```  

**Data:**  
```json
{ "title": "Treebark Demo", "description": "CMS-driven and data-bound!" }
```  

→  
```html
<div class="card">
  <h2>Treebark Demo</h2>
  <p>CMS-driven and data-bound!</p>
</div>
```  

---

### Shorthand Array Syntax  

For nodes without attributes, you can use a shorthand array syntax instead of `$children`:

```json treebark
{
  "div": [
    { "h2": "Welcome" },
    { "p": "This is much cleaner!" },
    {
      "ul": [
        { "li": "Item 1" },
        { "li": "Item 2" }
      ]
    }
  ]
}
```  

→ `<div><h2>Welcome</h2><p>This is much cleaner!</p><ul><li>Item 1</li><li>Item 2</li></ul></div>`

This is equivalent to:

```json treebark
{
  "div": {
    "$children": [
      { "h2": "Welcome" }, 
      { "p": "This is much cleaner!" },
      {
        "ul": {
          "$children": [
            { "li": "Item 1" },
            { "li": "Item 2" }
          ]
        }
      }
    ]
  }
}
```

**Note:** Shorthand syntax only works when the node has no attributes. If you need attributes, use the explicit `$children` syntax.

---

### Bound to an Array  

```json treebark
{
  "ul": {
    "$bind": "products",
    "$children": [
      { "li": "{{name}} — {{price}}" }
    ]
  }
}
```  

**Data:**  
```json
{
  "products": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Phone",  "price": "$499" }
  ]
}
```  

→  
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```  

---

### Self-Contained Block  

```json treebark
{
  "$template": {
    "div": {
      "class": "product-card",
      "$children": [
        { "h2": "{{name}}" },
        { "p": "Only {{price}}!" }
      ]
    }
  },
  "$data": {
    "name": "Laptop",
    "price": "$999"
  }
}
```  

→
```html
<div class="product-card">
  <h2>Laptop</h2>
  <p>Only $999!</p>
</div>
```

---

### Mixed Content  

```json treebark
{
  "div": {
    "$children": [
      "Hello ",
      { "span": "World" },
      "!"
    ]
  }
}
```  

→ `<div>Hello <span>World</span>!</div>`  

---

## 🧩 Markdown-it Plugin  

Treebark works naturally inside fenced code blocks with the markdown-it plugin. The plugin supports both JSON and YAML formats when used with the js-yaml library.

### JSON Format

````markdown
# Product Catalog

```treebark
{
  "$template": {
    "ul": {
      "$bind": "products",
      "$children": [
        { "li": "{{name}} — {{price}}" }
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

### YAML Format (Much Cleaner!)

When using the js-yaml library, you can write much cleaner YAML syntax:

````markdown
# Product Catalog

```treebark
$template:
  ul:
    $bind: products
    $children:
      - li: "{{name}} — {{price}}"
$data:
  products:
    - name: "Laptop"
      price: "$999"
    - name: "Phone"  
      price: "$499"
```
````  

---

## 📦 Available Libraries

### Node.js

- **`treebark`** - Core library with string and DOM renderers
- **`markdown-it-treebark`** - Plugin for markdown-it parser
- **String renderer** - Convert treebark schemas to HTML strings
- **DOM renderer** - Generate DOM nodes for browser environments

### Other Languages

Other language implementations are not yet available. If you need treebark support for your language, please [file a feature request](https://github.com/danmarshall/treebark/issues/new).

---

## 🚀 Getting Started  

### Core Library

```bash
npm install treebark
```  

```js
import { renderToString } from "treebark";

const schema = {
  ul: {
    $bind: "products",
    $children: [
      { li: "{{name}} — {{price}}" }
    ]
  }
};

const data = {
  products: [
    { name: "Laptop", price: "$999" },
    { name: "Phone", price: "$499" }
  ]
};

const html = renderToString(schema, { data });
```

### Markdown-it Plugin

```bash
npm install markdown-it-treebark js-yaml
```  

```js
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';
import yaml from 'js-yaml';

const md = new MarkdownIt();
md.use(treebarkPlugin, { yaml });

const markdown = `
# Product Catalog

\`\`\`treebark
{
  "$template": {
    "ul": {
      "$bind": "products",
      "$children": [
        { "li": "{{name}} — {{price}}" }
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
\`\`\`
`;

const html = md.render(markdown);
```

**Note:** The `js-yaml` library is optional but highly recommended as it allows you to use much cleaner YAML syntax instead of verbose JSON. When provided, the plugin will automatically detect and parse YAML format.  

---

## 📦 Safe by Default  

Treebark ships with a strict whitelist:  

- **Allowed tags:**  
  `div`, `span`, `p`, `header`, `footer`, `main`, `section`, `article`,  
  `h1`–`h6`, `strong`, `em`, `blockquote`, `code`, `pre`,  
  `ul`, `ol`, `li`,  
  `table`, `thead`, `tbody`, `tr`, `th`, `td`,  
  `a`, `img`  

- **Allowed attributes:**  
  - Global: `id`, `class`, `style`, `title`, `aria-*`, `data-*`, `role`  
  - `a`: `href`, `target`, `rel`  
  - `img`: `src`, `alt`, `width`, `height`  
  - `table`: `summary`  
  - `th`/`td`: `scope`, `colspan`, `rowspan`  
  - `blockquote`: `cite`  

- **Blocked by default:**  
  `script`, `iframe`, `embed`, `object`, `applet`,  
  `form`, `input`, `button`, `select`,  
  `video`, `audio`,  
  `style`, `link`, `meta`, `base`  

---

## 📛 Name Origin

Why "Treebark"?  
It’s a blend of **trees** (for tree-structured data), **handlebars** (for templating), and **Markup/Markdown** (the content format).
