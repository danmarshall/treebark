---
layout: default
title: Home
description: Safe HTML tree structures for Markdown and content-driven apps
---

# 🌳 Treebark  

> Safe HTML tree structures for Markdown and content-driven apps.

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

```json
{ "div": "Hello world" }
```  

```
output: <div>Hello world</div>
```  

---

### Bound to an Object  

```json
{
  "div": {
    "class": "card",
    "$children": [
      { "h2": "{% raw %}{{title}}{% endraw %}" },
      { "p": "{% raw %}{{description}}{% endraw %}" }
    ]
  }
}
```  

**Data:**  
```json
{ "title": "Treebark Demo", "description": "CMS-driven and data-bound!" }
```  

```html
output:  
<div class="card">
  <h2>Treebark Demo</h2>
  <p>CMS-driven and data-bound!</p>
</div>
```  

---

### Shorthand Array Syntax  

For nodes without attributes, you can use a shorthand array syntax instead of `$children`:

```json
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

```
output: <div><h2>Welcome</h2><p>This is much cleaner!</p><ul><li>Item 1</li><li>Item 2</li></ul></div>
```

This is equivalent to:

```json
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

```json
{
  "ul": {
    "$bind": "products",
    "$children": [
      { "li": "{% raw %}{{name}}{% endraw %} — {% raw %}{{price}}{% endraw %}" }
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

```html
output:  
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```  

---

### Self-Contained Block  

```json
{
  "$template": {
    "div": {
      "class": "product-card",
      "$children": [
        { "h2": "{% raw %}{{name}}{% endraw %}" },
        { "p": "Only {% raw %}{{price}}{% endraw %}!" }
      ]
    }
  },
  "$data": {
    "name": "Laptop",
    "price": "$999"
  }
}
```  

```html
output:
<div class="product-card">
  <h2>Laptop</h2>
  <p>Only $999!</p>
</div>
```

---

### Mixed Content  

```json
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

```
output: <div>Hello <span>World</span>!</div>
```  

---

### YAML Format (Much Cleaner!)

When using the js-yaml library, you can write much cleaner YAML syntax. Here's the "Bound to an Array" example in both formats for comparison:

**JSON Format:**
```json
{
  "ul": {
    "$bind": "products",
    "$children": [
      { "li": "{% raw %}{{name}}{% endraw %} — {% raw %}{{price}}{% endraw %}" }
    ]
  }
}
```

**YAML Format (Much Cleaner!):**
```yaml
ul:
  $bind: products
  $children:
    - li: "{% raw %}{{name}}{% endraw %} — {% raw %}{{price}}{% endraw %}"
```

---

## 📦 Available Libraries

### Node.js

- **`treebark`** - Core library with two renderers:
  - **String renderer** - Convert treebark schemas to HTML strings
  - **DOM renderer** - Generate DOM nodes (browser or jsdom environments)
- **[markdown-it-treebark](https://github.com/danmarshall/treebark/tree/main/nodejs/packages/markdown-it-treebark)** - Plugin for markdown-it parser

### Other Languages

Other language implementations are not yet available. If you need treebark support for your language, please [file a feature request](https://github.com/danmarshall/treebark/issues/new).

---

## 🚀 Getting Started  

### Node.js

```bash
npm install treebark
```  

```js
import { renderToString } from "treebark";

const schema = {
  ul: {
    $bind: "products",
    $children: [
      { li: "{% raw %}{{name}}{% endraw %} — {% raw %}{{price}}{% endraw %}" }
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

---

## 📛 Name Origin

Why "Treebark"?  
It’s a blend of **trees** (for tree-structured data), **handlebars** (for templating), and **Markup/Markdown** (the content format).
