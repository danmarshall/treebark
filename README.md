# 🌳 Treebark  

> Safe HTML tree structures for Markdown and content-driven apps.

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

## 🚧 Problem  
You want to use HTML structures embedded in user-generated content, such as a blog post in Markdown.

Markdown was originally designed as a **superset of HTML** — you could drop raw `<div>`s, `<table>`s, or even `<script>`s straight into your content.  

But for **safety and consistency**, many Markdown parsers (especially in CMSs, wikis, and chat apps) **disallow raw HTML**. That means:  

- Authors can’t use existing site CSS components (headers, footers, grids).  
- Structured layouts like tables or cards are awkward or impossible.  
- Allowing raw HTML invites XSS and security issues.  

## 🌳 Solution  

**Treebark** brings back safe structured markup by replacing raw HTML with **tree schemas** (JSON or YAML).  

- Safe by default: only whitelisted tags/attributes are allowed.  
- Fits naturally into Markdown fenced code blocks.  
- Flexible enough for both **static content** and **data-bound apps**.  

#### 💡 Key Insight  

Templates don’t need a parser or compiler.  

By using **object keys as tag names**, the schema is both natural and trivial to implement:  

```json
{ "div": "Hello world" }
```

That’s it — a `div` with text (or more nodes), expressed as a plain object. No angle brackets, no parser, just a structural walk of the object tree.

This means the implementation is featherweight.

### Allowed Tags

`div`, `span`, `p`, `header`, `footer`, `main`, `section`, `article`,  
`h1`–`h6`, `strong`, `em`, `blockquote`, `code`, `pre`,  
`ul`, `ol`, `li`,  
`table`, `thead`, `tbody`, `tr`, `th`, `td`,  
`a`, `img`, `comment`, `if`

**Special tags:**  
- `comment` — Emits HTML comments. Cannot be nested inside another `comment`.
- `if` — Conditional rendering based on data properties. See [Conditional Rendering](#conditional-rendering) below.

### Allowed Attributes

| Tag(s)         | Allowed Attributes                          |
|----------------|---------------------------------------------|
| All            | `id`, `class`, `style`, `title`, `aria-*`, `data-*`, `role` |
| `a`            | `href`, `target`, `rel`                     |
| `img`          | `src`, `alt`, `width`, `height`             |
| `table`        | `summary`                                   |
| `th`, `td`     | `scope`, `colspan`, `rowspan`               |
| `blockquote`   | `cite`                                      |

### Special Keys

- `$children`: Array or string. Defines child nodes or mixed content for an element.
- `$bind`: String. Binds the current node to a property or array in the data context. If it resolves to an array, the element’s children are repeated for each item (the element itself is not duplicated unless the bound node is the root template).
- `$not`: Boolean (used with `if` tag only). Inverts the condition check.

## ✨ Examples  

### Nested Elements

For nodes without attributes, you can use a shorthand array syntax:

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

You can also use a `$children` element to define child elements:

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

Output:
```html
<div><h2>Welcome</h2><p>This is much cleaner!</p><ul><li>Item 1</li><li>Item 2</li></ul></div>
```

### Attributes

You can add attributes to any element. When an element has attributes, you'll use the `$children` property (as shown above) to define its content:

```json
{
  "div": {
    "class": "greeting",
    "id": "hello",
    "$children": ["Hello world"]
  }
}
```

Output:
```html
<div class="greeting" id="hello">Hello world</div>
```

For elements with both attributes and simple text content, you can also use this format:

```json
{
  "a": {
    "href": "https://example.com",
    "target": "_blank",
    "$children": ["Visit our site"]
  }
}
```

Output:
```html
<a href="https://example.com" target="_blank">Visit our site</a>
```

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

Output:
```html
<div>Hello <span>World</span>!</div>
```

### With Data Binding

```json
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

Data:
```json
{ "title": "Treebark Demo", "description": "CMS-driven and data-bound!" }
```

Output:
```html
<div class="card">
  <h2>Treebark Demo</h2>
  <p>CMS-driven and data-bound!</p>
</div>
```

### Binding with $bind

Use the `$bind` syntax to bind a property within an object:

**$bind Property Access Patterns:**
- `$bind: "."` - root data value
- `$bind: "users"` - literal property access
- `$bind: "config.userList"` - nested property with single dots

For values within strings:

**Value Access Patterns:**
- `{{value}}` — Accesses the current item's property `value`.
- `{{product.price}}` — Accesses the nested property `price` inside `product` of the current item.
- `{{..parentProp}}` — Accesses the property `parentProp` from the parent data context.
- `{{../..grandparentProp}}` — Accesses the property `grandparentProp` from the grandparent data context.

The parent data context is the previous `$bind`, not to be confused with the object parent itself.

```json
{
  "ul": {
    "$bind": "products",
    "$children": [
      { "li": "{{name}} — {{price}}" }
    ]
  }
}
```

Data:
```json
{
  "products": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Phone", "price": "$499" }
  ]
}
```

Output:
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```

For more complex scenarios with nested data and wrapper elements:

```json
{
  "div": {
    "class": "product-showcase",
    "$children": [
      { "h2": "Featured Products" },
      {
        "div": {
          "class": "product-grid",
          "$bind": "categories",
          "$children": [
            {
              "section": {
                "class": "category",
                "$children": [
                  { "h3": "{{name}}" },
                  {
                    "div": {
                      "class": "items",
                      "$bind": "items",
                      "$children": [
                        {
                          "div": {
                            "class": "product-card",
                            "$children": [
                              { "h4": "{{title}}" },
                              { "p": "{{description}}" },
                              { "span": { "class": "price", "$children": ["{{price}}"] } }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

Data:
```json
{
  "categories": [
    {
      "name": "Electronics",
      "items": [
        { "title": "Laptop", "description": "High-performance laptop", "price": "$999" },
        { "title": "Phone", "description": "Latest smartphone", "price": "$499" }
      ]
    },
    {
      "name": "Accessories",
      "items": [
        { "title": "Mouse", "description": "Wireless mouse", "price": "$25" }
      ]
    }
  ]
}
```

Output:
```html
<div class="product-showcase">
  <h2>Featured Products</h2>
  <div class="product-grid">
    <section class="category">
      <h3>Electronics</h3>
      <div class="items">
        <div class="product-card">
          <h4>Laptop</h4>
          <p>High-performance laptop</p>
          <span class="price">$999</span>
        </div>
        <div class="product-card">
          <h4>Phone</h4>
          <p>Latest smartphone</p>
          <span class="price">$499</span>
        </div>
      </div>
    </section>
    <section class="category">
      <h3>Accessories</h3>
      <div class="items">
        <div class="product-card">
          <h4>Mouse</h4>
          <p>Wireless mouse</p>
          <span class="price">$25</span>
        </div>
      </div>
    </section>
  </div>
</div>
```

### Parent Property Access

Access data from parent binding contexts using double dots (`..`) in interpolation expressions:

```json
{
  "div": {
    "$bind": "customers",
    "$children": [
      { "h2": "{{name}}" },
      { "p": "Company: {{..companyName}}" },
      {
        "ul": {
          "$bind": "orders",
          "$children": [
            {
              "li": {
                "$children": [
                  "Order #{{orderId}} for {{..name}}: ",
                  {
                    "ul": {
                      "$bind": "products", 
                      "$children": [
                        {
                          "li": {
                            "$children": [
                              {
                                "a": {
                                  "href": "/customer/{{../../..customerId}}/order/{{..orderId}}/product/{{productId}}",
                                  "$children": ["{{name}} - {{price}}"]
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

Data:
```json
{
  "companyName": "ACME Corp",
  "customerId": "cust123",
  "customers": [
    {
      "name": "Alice Johnson",
      "orders": [
        {
          "orderId": "ord456",
          "products": [
            { "productId": "prod789", "name": "Laptop", "price": "$999" },
            { "productId": "prod101", "name": "Mouse", "price": "$25" }
          ]
        }
      ]
    }
  ]
}
```

Output:
```html
<div>
  <h2>Alice Johnson</h2>
  <p>Company: ACME Corp</p>
  <ul>
    <li>
      Order #ord456 for Alice Johnson: 
      <ul>
        <li><a href="/customer/cust123/order/ord456/product/prod789">Laptop - $999</a></li>
        <li><a href="/customer/cust123/order/ord456/product/prod101">Mouse - $25</a></li>
      </ul>
    </li>
  </ul>
</div>
```

### Working with Arrays: Three Patterns

Treebark offers three patterns for rendering arrays, each suited to different template/data structures. Understanding these patterns helps you choose the right approach for your use case.

#### Pattern 1: Stack of Cards (Template + Array Data, No $bind on root)

When you provide a single root element template and pass an array as the data value, Treebark renders the template once per array item, changing the data context each time. You do not set `$bind` on the root; normal `$children` inside the template are still used.

**Use when:** You want repeated instances of the same root component (e.g., cards) directly, without an extra wrapper element.

```json
{
  "div": {
    "class": "product-card",
    "$children": [
      { "h2": "{{name}}" },
      { "p": "Only {{price}}!" }
    ]
  }
}
```

Data:
```json
[
  { "name": "Laptop", "price": "$999" },
  { "name": "Mouse", "price": "$25" }
]
```

Output:
```html
<div class="product-card">
  <h2>Laptop</h2>
  <p>Only $999!</p>
</div>
<div class="product-card">
  <h2>Mouse</h2>
  <p>Only $25!</p>
</div>
```

#### Pattern 2: $bind to Property in Object (Uses Both $bind and $children)

When your data is an **object containing an array**, use `$bind` to target that property and `$children` to define what to repeat. This gives you a wrapper element (like `<ul>`) around the repeated children.

**Use when:** You want a container element around your array items, like a `<ul>` around `<li>` elements, and your data is structured as an object with properties.

```json
{
  "ul": {
    "$bind": "products",
    "$children": [
      { "li": "{{name}} — {{price}}" }
    ]
  }
}
```

Data:
```json
{
  "products": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Phone", "price": "$499" }
  ]
}
```

Output:
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```

#### Pattern 3: $bind: "." to Current Array (Uses Both $bind and $children)

When your data **is the array itself** (not wrapped in an object), use `$bind: "."` to bind directly to the current data and `$children` to define what to repeat. This gives you a wrapper element around array items without needing an object wrapper in your data.

**Use when:** You have a plain array as your data and want a container element around the repeated items.

```json
{
  "ul": {
    "$bind": ".",
    "$children": [
      { "li": "{{name}} — {{price}}" }
    ]
  }
}
```

Data:
```json
[
  { "name": "Laptop", "price": "$999" },
  { "name": "Phone", "price": "$499" }
]
```

Output:
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```

### Comments

HTML comments can be created using the `comment` tag:

```json
{ "comment": "This is a comment" }
```

Output:
```html
<!--This is a comment-->
```

Comments support interpolation and mixed content like other tags:

```json
{
  "comment": {
    "$children": [
      "Generated by {{generator}} on ",
      { "span": "{{date}}" }
    ]
  }
}
```

Data:
```json
{ "generator": "Treebark", "date": "2024-01-01" }
```

Output:
```html
<!--Generated by Treebark on <span>2024-01-01</span>-->
```

**Note:** Comments cannot be nested - attempting to place a `comment` tag inside another `comment` will result in an error.

### Conditional Rendering

The `if` tag provides conditional rendering based on data properties. It doesn't render itself as an HTML element—it only renders its children when the condition is truthy.

**Basic example:**
```json
{
  "div": {
    "$children": [
      { "p": "This is always visible" },
      {
        "if": {
          "$bind": "showMessage",
          "$children": [
            { "p": "This is conditionally visible" }
          ]
        }
      }
    ]
  }
}
```

With `data: { showMessage: true }`, outputs:
```html
<div>
  <p>This is always visible</p>
  <p>This is conditionally visible</p>
</div>
```

With `data: { showMessage: false }`, outputs:
```html
<div>
  <p>This is always visible</p>
</div>
```

**Negation with `$not`:**

Use `$not: true` to invert the condition (render when falsy):

```json
{
  "div": {
    "$children": [
      {
        "if": {
          "$bind": "count",
          "$not": true,
          "$children": [
            { "p": "No items available" }
          ]
        }
      },
      {
        "if": {
          "$bind": "count",
          "$children": [
            { "p": "Items found: {{count}}" }
          ]
        }
      }
    ]
  }
}
```

With `data: { count: 0 }`, outputs:
```html
<div>
  <p>No items available</p>
</div>
```

With `data: { count: 5 }`, outputs:
```html
<div>
  <p>Items found: 5</p>
</div>
```

**Truthiness rules:**
The `if` tag follows JavaScript truthiness: 
- **Truthy:** `true`, non-empty strings, non-zero numbers, objects, arrays
- **Falsy:** `false`, `null`, `undefined`, `0`, `""`, `NaN`

## 📝 Format Notes

Notice in some JSON examples above there can be a "long tail" of closing braces for deep trees. You can write much cleaner syntax if you use YAML, then convert to JSON. Here's the *Parent Property Access* example template (above) as YAML for comparison:

**YAML Format:**
```yaml
div:
  $bind: customers
  $children:
    - h2: "{{name}}"
    - p: "Company: {{..companyName}}"
    - ul:
        $bind: orders
        $children:
          - li:
              $children:
                - "Order #{{orderId}} for {{..name}}: "
                - ul:
                    $bind: products
                    $children:
                      - li:
                          $children:
                            - a:
                                href: /customer/{{../../..customerId}}/order/{{..orderId}}/product/{{productId}}
                                $children:
                                  - "{{name}} - {{price}}"
```

## 📦 Available Libraries

### Implementations

- [Node.js/Browser](nodejs/packages/treebark/)
  - [Core library](nodejs/packages/treebark) with `renderToString` and `renderToDOM` renderers
  - [markdown-it plugin](nodejs/packages/markdown-it-treebark/) - Render treebark templates in Markdown
- **Other Languages** - Not yet available. If you need treebark support for your language, please [file a feature request](https://github.com/danmarshall/treebark/issues/new)

## 📛 Name Origin

Why "Treebark"?  
It’s a blend of **trees** (for tree-structured data), **handlebars** (for templating), and **Markup/Markdown** (the content format).
