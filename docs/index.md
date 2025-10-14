---
layout: default
title: Home
description: Safe HTML tree structures for Markdown and content-driven apps
---

# Treebark  

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

## Problem  
You want to use HTML structures embedded in user-generated content, such as a blog post in Markdown.

Markdown was originally designed as a **superset of HTML** — you could drop raw `<div>`s, `<table>`s, or even `<script>`s straight into your content.  

But for **safety and consistency**, many Markdown parsers (especially in CMSs, wikis, and chat apps) **disallow raw HTML**. That means:  

- Authors can’t use existing site CSS components (headers, footers, grids).  
- Structured layouts like tables or cards are awkward or impossible.  
- Allowing raw HTML invites XSS and security issues.  

## Solution  

**Treebark** brings back safe structured markup by replacing raw HTML with **tree schemas** (JSON or YAML).  

- Safe by default: only whitelisted tags/attributes are allowed.  
- Fits naturally into Markdown fenced code blocks.  
- Flexible enough for both **static content** and **data-bound apps**.  

#### Key Insight  

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
`a`, `img`, `br`, `hr`

**Special tags:**  
- `$comment` — Emits HTML comments. Cannot be nested inside another `$comment`.
- `$if` — Conditional rendering based on data properties with comparison operators. See [Conditional Rendering](#conditional-rendering) below.

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

**Data binding:**
- `$children`: Array or string. Defines child nodes or mixed content for an element.
- `$bind`: String. Binds the current node to a property or array in the data context. If it resolves to an array, the element's children are repeated for each item (the element itself is not duplicated unless the bound node is the root template).

**Conditional keys (used in `$if` tag and conditional attribute values):**
- `$check`: String. Property path to check.
- `$then`: Single template object or string. Content/value when condition is true.
- `$else`: Single template object or string. Content/value when condition is false.
- `$<`: Less than comparison.
- `$>`: Greater than comparison.
- `$<=`: Less than or equal comparison.
- `$>=`: Greater than or equal comparison.
- `$=`: Strict equality comparison (===).
- `$in`: Array membership check.
- `$not`: Boolean. Inverts the entire condition result.
- `$join`: "AND" | "OR". Combines multiple operators (default: "AND").

## Examples  

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

#### Tags without attributes
For `br` & `hr` tags, use an empty object:

```json
{
  "div": {
    "$children": [
      "Line one",
      { "br": {} },
      "Line two",
      { "hr": {} },
      "Footer text"
    ]
  }
}
```

Output:
```html
<div>
  Line one
  <br>
  Line two
  <hr>
  Footer text
</div>
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
      { "h2": "{% raw %}{{title}}{% endraw %}" },
      { "p": "{% raw %}{{description}}{% endraw %}" }
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
- `{% raw %}{{value}}{% endraw %}` — Accesses the current item's property `value`.
- `{% raw %}{{product.price}}{% endraw %}` — Accesses the nested property `price` inside `product` of the current item.
- `{% raw %}{{..parentProp}}{% endraw %}` — Accesses the property `parentProp` from the parent data context.
- `{% raw %}{{../..grandparentProp}}{% endraw %}` — Accesses the property `grandparentProp` from the grandparent data context.

The parent data context is the previous `$bind`, not to be confused with the object parent itself.

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
                  { "h3": "{% raw %}{{name}}{% endraw %}" },
                  {
                    "div": {
                      "class": "items",
                      "$bind": "items",
                      "$children": [
                        {
                          "div": {
                            "class": "product-card",
                            "$children": [
                              { "h4": "{% raw %}{{title}}{% endraw %}" },
                              { "p": "{% raw %}{{description}}{% endraw %}" },
                              { "span": { "class": "price", "$children": ["{% raw %}{{price}}{% endraw %}"] } }
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
      { "h2": "{% raw %}{{name}}{% endraw %}" },
      { "p": "Company: {% raw %}{{..companyName}}{% endraw %}" },
      {
        "ul": {
          "$bind": "orders",
          "$children": [
            {
              "li": {
                "$children": [
                  "Order #{% raw %}{{orderId}}{% endraw %} for {% raw %}{{..name}}{% endraw %}: ",
                  {
                    "ul": {
                      "$bind": "products", 
                      "$children": [
                        {
                          "li": {
                            "$children": [
                              {
                                "a": {
                                  "href": "/customer/{% raw %}{{../../..customerId}}{% endraw %}/order/{% raw %}{{..orderId}}{% endraw %}/product/{% raw %}{{productId}}{% endraw %}",
                                  "$children": ["{% raw %}{{name}}{% endraw %} - {% raw %}{{price}}{% endraw %}"]
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

### Working with Arrays

To render arrays, use `$bind` to target the array and `$children` to define what to repeat for each item. This gives you a wrapper element (like `<ul>`) around the repeated children.

The `$bind` value specifies the path to the array:
- Use a **property name** (e.g., `"products"`) when your data is an object containing an array
- Use **`"."`** when your data is the array itself

**Example with property path:**

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

Data:
```json
{
  "products": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Phone", "price": "$499" }
  ]
}
```

**Example with `$bind: "."`:**

```json
{
  "ul": {
    "$bind": ".",
    "$children": [
      { "li": "{% raw %}{{name}}{% endraw %} — {% raw %}{{price}}{% endraw %}" }
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

Both examples produce the same output:
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $499</li>
</ul>
```

### Comments

HTML comments can be created using the `comment` tag:

```json
{ "$comment": "This is a comment" }
```

Output:
```html
<!--This is a comment-->
```

Comments support interpolation and mixed content like other tags:

```json
{
  "$comment": {
    "$children": [
      "Generated by {% raw %}{{generator}}{% endraw %} on ",
      { "span": "{% raw %}{{date}}{% endraw %}" }
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

The `$if` tag provides powerful conditional rendering with comparison operators and if/else branching. It doesn't render itself as an HTML element—it conditionally outputs a single element based on the condition.

**Basic truthiness check:**
```json
{
  "div": {
    "$children": [
      { "p": "This is always visible" },
      {
        "$if": {
          "$check": "showMessage",
          "$then": { "p": "This is conditionally visible" }
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

**If/Else branching with `$then` and `$else`:**

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "isLoggedIn",
          "$then": { "p": "Welcome back!" },
          "$else": { "p": "Please log in" }
        }
      }
    ]
  }
}
```

With `data: { isLoggedIn: true }`:
```html
<div><p>Welcome back!</p></div>
```

With `data: { isLoggedIn: false }`:
```html
<div><p>Please log in</p></div>
```

**Comparison operators:**

The `$if` tag supports powerful comparison operators that can be stacked:

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "age",
          "$>": 18,
          "$<": 65,
          "$then": { "p": "Working age adult" },
          "$else": { "p": "Outside working age range" }
        }
      }
    ]
  }
}
```

Available operators:
- `$<`: Less than
- `$>`: Greater than
- `$<=`: Less than or equal
- `$>=`: Greater than or equal
- `$=`: Strict equality (===)
- `$in`: Array membership

**Using `$>=` and `$<=` for inclusive ranges:**

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "age",
          "$>=": 18,
          "$<=": 65,
          "$then": { "p": "Working age adult (18-65 inclusive)" }
        }
      }
    ]
  }
}
```

With `data: { age: 18 }` or `{ age: 65 }`, the condition is true (inclusive bounds).

**Array membership example:**

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "role",
          "$in": ["admin", "moderator", "editor"],
          "$then": { "p": "Has special privileges" },
          "$else": { "p": "Regular user" }
        }
      }
    ]
  }
}
```

**Combining operators with OR logic:**

By default, multiple operators use AND logic. Use `$join: "OR"` for OR logic:

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "age",
          "$<": 18,
          "$>": 65,
          "$join": "OR",
          "$then": { "p": "Discounted rate applies" }
        }
      }
    ]
  }
}
```

**Negation with `$not`:**

Use `$not: true` to invert the entire condition result. This is useful when you want to negate a complex condition:

```json
{
  "div": {
    "$children": [
      {
        "$if": {
          "$check": "age",
          "$>": 18,
          "$<": 65,
          "$not": true,
          "$then": { "p": "Outside working age range" }
        }
      }
    ]
  }
}
```

With `data: { age: 15 }`, outputs:
```html
<div>
  <p>Outside working age range</p>
</div>
```

With `data: { age: 25 }`, outputs:
```html
<div>
</div>
```

**Conditional attribute values:**

Attributes can also use conditional values with the same operator system:

```json
{
  "div": {
    "class": {
      "$check": "isActive",
      "$then": "active",
      "$else": "inactive"
    },
    "$children": ["User status"]
  }
}
```

With operators:

```json
{
  "div": {
    "class": {
      "$check": "score",
      "$>": 90,
      "$then": "excellent",
      "$else": "good"
    },
    "$children": ["Score display"]
  }
}
```

**Multiple elements (wrap in container):**

Since `$then` and `$else` output single elements, wrap multiple elements in a container:

```json
{
  "$if": {
    "$check": "showDetails",
    "$then": {
      "div": {
        "$children": [
          { "h2": "Details" },
          { "p": "Description here" },
          { "p": "More info" }
        ]
      }
    },
    "$else": { "p": "Click to see details" }
  }
}
```

**Truthiness rules:**
The `$if` tag follows JavaScript truthiness when no operators are provided:
- **Truthy:** `true`, non-empty strings, non-zero numbers, objects, arrays
- **Falsy:** `false`, `null`, `undefined`, `0`, `""`, `NaN`

## Format Notes

Notice in some JSON examples above there can be a "long tail" of closing braces for deep trees. You can write much cleaner syntax if you use YAML, then convert to JSON. Here's the *Parent Property Access* example template (above) as YAML for comparison:

**YAML Format:**
```yaml
div:
  $bind: customers
  $children:
    - h2: "{% raw %}{{name}}{% endraw %}"
    - p: "Company: {% raw %}{{..companyName}}{% endraw %}"
    - ul:
        $bind: orders
        $children:
          - li:
              $children:
                - "Order #{% raw %}{{orderId}}{% endraw %} for {% raw %}{{..name}}{% endraw %}: "
                - ul:
                    $bind: products
                    $children:
                      - li:
                          $children:
                            - a:
                                href: /customer/{% raw %}{{../../..customerId}}{% endraw %}/order/{% raw %}{{..orderId}}{% endraw %}/product/{% raw %}{{productId}}{% endraw %}
                                $children:
                                  - "{% raw %}{{name}}{% endraw %} - {% raw %}{{price}}{% endraw %}"
```

## Available Libraries

### Implementations

- [Node.js/Browser](https://github.com/danmarshall/treebark/tree/main/nodejs/packages/treebark/)
  - [Core library](https://github.com/danmarshall/treebark/tree/main/nodejs/packages/treebark) with `renderToString` and `renderToDOM` renderers
  - [markdown-it plugin](https://github.com/danmarshall/treebark/tree/main/nodejs/packages/markdown-it-treebark/) - Render treebark templates in Markdown
- **Other Languages** - Not yet available. If you need treebark support for your language, please [file a feature request](https://github.com/danmarshall/treebark/issues/new)

## Name Origin

Why "Treebark"?  
It’s a blend of **trees** (for tree-structured data), **handlebars** (for templating), and **Markup/Markdown** (the content format).
