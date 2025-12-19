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

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
  - [Key Insight](#key-insight)
  - [Allowed Tags](#allowed-tags)
  - [Allowed Attributes](#allowed-attributes)
  - [Special Keys](#special-keys)
- [Examples](#examples)
  - [Nested Elements](#nested-elements)
  - [Attributes](#attributes)
  - [Styling with Style Objects](#styling-with-style-objects)
  - [Mixed Content](#mixed-content)
  - [With Data Binding](#with-data-binding)
  - [Binding with $bind](#binding-with-bind)
  - [Parent Property Access](#parent-property-access)
  - [Working with Arrays](#working-with-arrays)
  - [Array Element Access](#array-element-access)
  - [Comments](#comments)
  - [Conditional Rendering](#conditional-rendering)
- [SVG Support](#svg-support)
  - [Basic SVG](#basic-svg)
  - [Multiple Shapes](#multiple-shapes)
  - [SVG Paths](#svg-paths)
  - [SVG Groups and Transform](#svg-groups-and-transform)
  - [SVG with Data Binding](#svg-with-data-binding)
  - [SVG Text](#svg-text)
  - [SVG with Gradients](#svg-with-gradients)
  - [Conditional SVG Elements](#conditional-svg-elements)
  - [Interactive SVG with Data](#interactive-svg-with-data)
  - [SVG Icons](#svg-icons)
  - [SVG Animations](#svg-animations)
- [Error Handling](#error-handling)
- [Format Notes](#format-notes)
- [Available Libraries](#available-libraries)
  - [Implementations](#implementations)
- [Name Origin](#name-origin)

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

**HTML tags:**  
`div`, `span`, `p`, `header`, `footer`, `main`, `section`, `article`,  
`h1`–`h6`, `strong`, `em`, `blockquote`, `code`, `pre`,  
`ul`, `ol`, `li`,  
`table`, `thead`, `tbody`, `tr`, `th`, `td`,  
`a`, `img`, `br`, `hr`

**SVG tags:**  
`svg`, `g`, `defs`, `symbol`, `use`,  
`circle`, `rect`, `ellipse`, `line`, `polyline`, `polygon`, `path`,  
`text`, `tspan`,  
`linearGradient`, `radialGradient`, `stop`,  
`clipPath`, `mask`, `pattern`,  
`animate`, `animateTransform`

**Special tags:**  
- `$comment` — Emits HTML comments. Cannot be nested inside another `$comment`.
- `$if` — Conditional rendering based on data properties with comparison operators. See [Conditional Rendering](#conditional-rendering) below.

### Allowed Attributes

| Tag(s)         | Allowed Attributes                          |
|----------------|---------------------------------------------|
| All HTML       | `id`, `class`, `style`, `title`, `aria-*`, `data-*`, `role` |
| `a`            | `href`, `target`, `rel`                     |
| `img`          | `src`, `alt`, `width`, `height`             |
| `table`        | `summary`                                   |
| `th`, `td`     | `scope`, `colspan`, `rowspan`               |
| `blockquote`   | `cite`                                      |
| All SVG        | `id`, `class`, `style`, `data-*`            |
| `svg`          | `width`, `height`, `viewBox`, `preserveAspectRatio`, `xmlns` |
| `circle`       | `cx`, `cy`, `r`, `fill`, `stroke`, `stroke-width`, `opacity`, `fill-opacity`, `stroke-opacity` |
| `rect`         | `x`, `y`, `width`, `height`, `rx`, `ry`, `fill`, `stroke`, `stroke-width`, `opacity`, `fill-opacity`, `stroke-opacity` |
| `ellipse`      | `cx`, `cy`, `rx`, `ry`, `fill`, `stroke`, `stroke-width`, `opacity`, `fill-opacity`, `stroke-opacity` |
| `line`         | `x1`, `y1`, `x2`, `y2`, `stroke`, `stroke-width`, `stroke-linecap`, `opacity`, `stroke-opacity` |
| `polyline`, `polygon` | `points`, `fill`, `stroke`, `stroke-width`, `stroke-linejoin`, `opacity`, `fill-opacity`, `stroke-opacity` |
| `path`         | `d`, `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin`, `fill-rule`, `opacity`, `fill-opacity`, `stroke-opacity` |
| `text`, `tspan` | `x`, `y`, `dx`, `dy`, `text-anchor`, `font-family`, `font-size`, `font-weight`, `fill`, `stroke`, `opacity` |
| `g`, `defs`, `symbol` | `transform`, `opacity` |
| `use`          | `href`, `xlink:href`, `x`, `y`, `width`, `height`, `transform` |
| `linearGradient`, `radialGradient` | `id`, `gradientUnits`, `gradientTransform` |
| `linearGradient` | `x1`, `y1`, `x2`, `y2` |
| `radialGradient` | `cx`, `cy`, `r`, `fx`, `fy` |
| `stop`         | `offset`, `stop-color`, `stop-opacity` |
| `clipPath`, `mask`, `pattern` | `id`, `clipPathUnits`, `maskUnits`, `patternUnits`, `patternContentUnits` |
| `pattern`      | `x`, `y`, `width`, `height`, `viewBox` |
| `animate`, `animateTransform` | `attributeName`, `from`, `to`, `dur`, `repeatCount`, `type`, `values` |

### Special Keys

**Data binding:**
- `$children`: Array or string. Defines child nodes or mixed content for an element.
- `$bind`: String. Binds the current node to a property or array in the data context. If it resolves to an array, the element's children are repeated for each item.

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
    { "p": "Using shorthand array syntax" },
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
      { "p": "Using $children syntax" },
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
<div><h2>Welcome</h2><p>Using $children syntax</p><ul><li>Item 1</li><li>Item 2</li></ul></div>
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

### Styling with Style Objects

For security, Treebark uses a **structured object format** for the `style` attribute. This prevents CSS injection attacks while maintaining flexibility.

**Basic styling:**
```json
{
  "div": {
    "style": {
      "color": "red",
      "font-size": "16px",
      "padding": "10px"
    },
    "$children": ["Styled content"]
  }
}
```

Output:
```html
<div style="color: red; font-size: 16px; padding: 10px">Styled content</div>
```

**Key features:**
- **Kebab-case property names**: Use standard CSS property names like `font-size`, `background-color`, etc.
- **Dangerous patterns blocked**: `url()` (except data: URIs), `expression()`, `javascript:`, `@import`
- **Blocked properties**: `behavior`, `-moz-binding` (known dangerous properties)
- **Type safety**: Values are strings

**Flexbox example:**
```json
{
  "div": {
    "style": {
      "display": "flex",
      "flex-direction": "column",
      "justify-content": "center",
      "align-items": "center",
      "gap": "20px"
    },
    "$children": ["Flexbox layout"]
  }
}
```

**Grid example:**
```json
{
  "div": {
    "style": {
      "display": "grid",
      "grid-template-columns": "repeat(3, 1fr)",
      "gap": "10px"
    },
    "$children": ["Grid layout"]
  }
}
```

**Conditional styles:**
```json
{
  "div": {
    "style": {
      "$check": "isActive",
      "$then": { "color": "green", "font-weight": "bold" },
      "$else": { "color": "gray" }
    },
    "$children": ["Status"]
  }
}
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
- `{{items.0.name}}` — Accesses array elements using numeric indices (no square brackets needed).
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

**Example with `$bind: "."`:**

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

Both examples produce the same output:
```html
<ul>
  <li>Laptop — $999</li>
  <li>Phone — $999</li>
</ul>
```

### Array Element Access

You can access individual array elements using numeric indices in dot notation, without needing square brackets:

```json
{
  "div": {
    "$children": [
      { "p": "First: {{items.0.name}}" },
      { "p": "Second: {{items.1.name}}" },
      { "p": "Third: {{items.2.name}}" }
    ]
  }
}
```

Data:
```json
{
  "items": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Mouse", "price": "$25" },
    { "name": "Keyboard", "price": "$75" }
  ]
}
```

Output:
```html
<div>
  <p>First: Laptop</p>
  <p>Second: Mouse</p>
  <p>Third: Keyboard</p>
</div>
```

**Multi-level array access:**

You can also access nested arrays using multiple numeric indices:

```json
{
  "div": "{{matrix.0.1.value}}"
}
```

Data:
```json
{
  "matrix": [
    [{ "value": "A1" }, { "value": "A2" }],
    [{ "value": "B1" }, { "value": "B2" }]
  ]
}
```

Output:
```html
<div>A2</div>
```

**Note:** Numeric indices work because JavaScript allows both `array[0]` and `array["0"]` syntax. The dot notation path is split and each segment (including numeric strings) is used as a property key.

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

**Note:** Comments cannot be nested - attempting to place a `$comment` tag inside another `$comment` logs an error and skips the nested comment.

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

## SVG Support

Treebark supports SVG (Scalable Vector Graphics) elements, allowing you to create data-driven visualizations, icons, and graphics within your templates.

### Basic SVG

Create simple SVG graphics using the `svg` tag and shape elements:

```json
{
  "svg": {
    "width": "100",
    "height": "100",
    "viewBox": "0 0 100 100",
    "$children": [
      {
        "circle": {
          "cx": "50",
          "cy": "50",
          "r": "40",
          "fill": "#3498db",
          "stroke": "#2c3e50",
          "stroke-width": "2"
        }
      }
    ]
  }
}
```

Output:
```html
<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#3498db" stroke="#2c3e50" stroke-width="2"></circle>
</svg>
```

### Multiple Shapes

Combine multiple SVG elements to create complex graphics:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "rect": {
          "x": "10",
          "y": "10",
          "width": "180",
          "height": "180",
          "fill": "#ecf0f1",
          "stroke": "#34495e",
          "stroke-width": "2"
        }
      },
      {
        "circle": {
          "cx": "100",
          "cy": "100",
          "r": "50",
          "fill": "#e74c3c"
        }
      },
      {
        "line": {
          "x1": "50",
          "y1": "50",
          "x2": "150",
          "y2": "150",
          "stroke": "#2c3e50",
          "stroke-width": "3"
        }
      }
    ]
  }
}
```

### SVG Paths

Use the `path` element for complex shapes:

```json
{
  "svg": {
    "width": "100",
    "height": "100",
    "viewBox": "0 0 100 100",
    "$children": [
      {
        "path": {
          "d": "M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z",
          "fill": "#e74c3c",
          "stroke": "#c0392b",
          "stroke-width": "2"
        }
      }
    ]
  }
}
```

### SVG Groups and Transform

Organize related elements using the `g` tag and apply transformations:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "g": {
          "transform": "translate(100, 100) rotate(45)",
          "$children": [
            {
              "rect": {
                "x": "-25",
                "y": "-25",
                "width": "50",
                "height": "50",
                "fill": "#9b59b6"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### SVG with Data Binding

Create dynamic, data-driven visualizations:

```json
{
  "svg": {
    "width": "400",
    "height": "200",
    "viewBox": "0 0 400 200",
    "$children": [
      {
        "g": {
          "$bind": "bars",
          "$children": [
            {
              "rect": {
                "x": "{{x}}",
                "y": "{{y}}",
                "width": "50",
                "height": "{{height}}",
                "fill": "{{color}}"
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
  "bars": [
    { "x": "10", "y": "50", "height": "150", "color": "#3498db" },
    { "x": "80", "y": "80", "height": "120", "color": "#2ecc71" },
    { "x": "150", "y": "30", "height": "170", "color": "#e74c3c" },
    { "x": "220", "y": "100", "height": "100", "color": "#f39c12" }
  ]
}
```

Output:
```html
<svg width="400" height="200" viewBox="0 0 400 200">
  <g>
    <rect x="10" y="50" width="50" height="150" fill="#3498db"></rect>
  </g>
  <g>
    <rect x="80" y="80" width="50" height="120" fill="#2ecc71"></rect>
  </g>
  <g>
    <rect x="150" y="30" width="50" height="170" fill="#e74c3c"></rect>
  </g>
  <g>
    <rect x="220" y="100" width="50" height="100" fill="#f39c12"></rect>
  </g>
</svg>
```

### SVG Text

Add text elements to your SVG:

```json
{
  "svg": {
    "width": "300",
    "height": "100",
    "viewBox": "0 0 300 100",
    "$children": [
      {
        "text": {
          "x": "150",
          "y": "50",
          "text-anchor": "middle",
          "font-family": "Arial, sans-serif",
          "font-size": "24",
          "fill": "#2c3e50",
          "$children": ["Hello SVG"]
        }
      }
    ]
  }
}
```

### SVG with Gradients

Create gradients for fills:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "defs": {
          "$children": [
            {
              "linearGradient": {
                "id": "grad1",
                "x1": "0%",
                "y1": "0%",
                "x2": "100%",
                "y2": "100%",
                "$children": [
                  {
                    "stop": {
                      "offset": "0%",
                      "stop-color": "#3498db",
                      "stop-opacity": "1"
                    }
                  },
                  {
                    "stop": {
                      "offset": "100%",
                      "stop-color": "#2ecc71",
                      "stop-opacity": "1"
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "rect": {
          "x": "10",
          "y": "10",
          "width": "180",
          "height": "180",
          "fill": "url(#grad1)"
        }
      }
    ]
  }
}
```

### Conditional SVG Elements

Use conditional rendering with SVG elements:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "$if": {
          "$check": "showCircle",
          "$then": {
            "circle": {
              "cx": "100",
              "cy": "100",
              "r": "50",
              "fill": "#3498db"
            }
          },
          "$else": {
            "rect": {
              "x": "50",
              "y": "50",
              "width": "100",
              "height": "100",
              "fill": "#e74c3c"
            }
          }
        }
      }
    ]
  }
}
```

### Interactive SVG with Data

Create interactive data visualizations:

```json
{
  "div": {
    "class": "chart-container",
    "$children": [
      { "h3": "Sales Data" },
      {
        "svg": {
          "width": "500",
          "height": "300",
          "viewBox": "0 0 500 300",
          "$children": [
            {
              "g": {
                "$bind": "dataPoints",
                "$children": [
                  {
                    "circle": {
                      "cx": "{{x}}",
                      "cy": "{{y}}",
                      "r": "{{radius}}",
                      "fill": "{{color}}",
                      "opacity": "0.7"
                    }
                  },
                  {
                    "text": {
                      "x": "{{x}}",
                      "y": "{{../..labelY}}",
                      "text-anchor": "middle",
                      "font-size": "12",
                      "fill": "#2c3e50",
                      "$children": ["{{label}}"]
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
  "labelY": "290",
  "dataPoints": [
    { "x": "50", "y": "100", "radius": "20", "color": "#3498db", "label": "Jan" },
    { "x": "150", "y": "80", "radius": "25", "color": "#2ecc71", "label": "Feb" },
    { "x": "250", "y": "120", "radius": "18", "color": "#e74c3c", "label": "Mar" },
    { "x": "350", "y": "60", "radius": "30", "color": "#f39c12", "label": "Apr" }
  ]
}
```

### SVG Icons

Create reusable icon components with the `symbol` and `use` tags:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "defs": {
          "$children": [
            {
              "symbol": {
                "id": "star",
                "viewBox": "0 0 24 24",
                "$children": [
                  {
                    "path": {
                      "d": "M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z",
                      "fill": "currentColor"
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "use": {
          "href": "#star",
          "x": "50",
          "y": "50",
          "width": "100",
          "height": "100",
          "fill": "#f39c12"
        }
      }
    ]
  }
}
```

### SVG Animations

Add basic animations to SVG elements:

```json
{
  "svg": {
    "width": "200",
    "height": "200",
    "viewBox": "0 0 200 200",
    "$children": [
      {
        "circle": {
          "cx": "100",
          "cy": "100",
          "r": "50",
          "fill": "#3498db",
          "$children": [
            {
              "animate": {
                "attributeName": "r",
                "from": "30",
                "to": "70",
                "dur": "2s",
                "repeatCount": "indefinite"
              }
            }
          ]
        }
      }
    ]
  }
}
```

**Note on SVG:**
- SVG elements follow the same security model as HTML elements
- All SVG attributes are sanitized to prevent XSS attacks
- Data binding and conditional rendering work seamlessly with SVG
- SVG elements can be mixed with HTML elements in the same template
- The `xmlns` attribute is automatically added to `<svg>` root elements when needed

## Error Handling

Treebark follows a **no-throw policy**: instead of throwing exceptions, errors and warnings are sent to a logger. This allows your application to continue rendering even when there are invalid tags, attributes, or other issues.

**Default behavior:** By default, errors and warnings are logged to `console`.

**Custom logger:** You can provide a custom logger by passing it in the `options` parameter.

**When errors occur:**
- **Invalid tags** (e.g., `script`): The element is skipped, and an error is logged
- **Invalid attributes**: (e.g., `onclick`) The attribute is skipped, and a warning is logged
- **Invalid conditional syntax**: The element is skipped, and an error is logged
- **Nested comments**: The nested comment is skipped, and an error is logged

Treebark will render as much valid content as possible, skipping only the problematic elements while logging issues for debugging.

## Format Notes

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

## Available Libraries

### Implementations

- [Node.js/Browser](nodejs/packages/treebark/)
  - [Core library](nodejs/packages/treebark) with `renderToString` and `renderToDOM` renderers
  - [markdown-it plugin](nodejs/packages/markdown-it-treebark/) - Render treebark templates in Markdown
- **Other Languages** - Not yet available. If you need treebark support for your language, please [file a feature request](https://github.com/danmarshall/treebark/issues/new)

## Name Origin

Why "Treebark"?  
It’s a blend of **trees** (for tree-structured data), **handlebars** (for templating), and **Markup/Markdown** (the content format).
