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
- [Error Handling](#error-handling)
- [Security](#security)
  - [XSS Prevention](#xss-prevention)
  - [Style Attribute Protection](#style-attribute-protection)
  - [URL Protocol Validation](#url-protocol-validation)
  - [Prototype Chain Protection](#prototype-chain-protection)
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
- **Safe patterns recognized**: Standard CSS properties in kebab-case format
- **Examples not recognized**: `url()` with external URLs, `expression()`, `javascript:` protocol in CSS values, `@import`
- **Type safety**: Values are strings
- **Semicolon sanitization**: Prevents multi-property injection by accepting only the first value

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

## Security

Treebark is designed with **security as a priority**. Multiple layers of protection defend against XSS attacks and other security vulnerabilities.

### XSS Prevention

**Tag Allowlist:**
Only a curated set of safe HTML tags are recognized. Examples of tags not on the allowlist like `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, and `<form>` are logged as errors:

```javascript
// ❌ Not on allowlist - logs error and renders nothing
{ script: 'alert("xss")' }
{ iframe: { src: 'evil.com' } }
```

**Attribute Allowlist:**
Only safe attributes are recognized per tag. Event handlers like `onclick`, `onload`, `onerror` are not on the allowlist:

```javascript
// ❌ Not on allowlist - logs warning and attribute is omitted
{ div: { onclick: 'alert(1)', $children: ['text'] } }
// Renders: <div>text</div>
```

**HTML Escaping:**
All content and attribute values are automatically HTML-escaped to prevent injection:

```javascript
{ div: '<script>alert(1)</script>' }
// Renders: <div>&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

### Style Attribute Protection

The `style` attribute uses a **structured object format** that only recognizes safe patterns:

**Examples of patterns not recognized:**
- `url()` - External URLs not recognized (data: URIs allowed)
- `expression()` - IE expression injection not recognized
- `javascript:` - JavaScript protocol not recognized
- `@import` - CSS imports not recognized

**Examples of properties not recognized:**
- `behavior` - IE behavior property not recognized
- `-moz-binding` - Firefox XBL binding not recognized

**Semicolon injection prevented:**
Only the first CSS value before a semicolon is used, preventing multi-property injection:

```javascript
// ❌ Pattern not recognized
{
  div: {
    style: {
      color: 'red; position: absolute; z-index: 999'
    },
    $children: ['text']
  }
}
// Renders: <div style="color: red">text</div>
// Warning logged: CSS value contained semicolon - using only first part
```

### URL Protocol Validation

The `href` and `src` attributes validate URL protocols to prevent XSS attacks:

**Safe protocols recognized:**
- `http:`, `https:` - Standard web protocols
- `mailto:`, `tel:`, `sms:` - Communication protocols
- `ftp:`, `ftps:` - File transfer protocols
- Relative URLs (e.g., `/path`, `#anchor`, `?query`, `page.html`)

**Examples of protocols not recognized:**
- `javascript:` - JavaScript execution not recognized
- `data:` - Data URIs not recognized (can contain HTML/scripts)
- `vbscript:` - VBScript execution not recognized
- `file:` - Local file access not recognized

```javascript
// ❌ Not on allowlist - logs warning and attribute is omitted
{ a: { href: 'javascript:alert(1)', $children: ['Click'] } }
// Renders: <a>Click</a>

// ✅ Allowed
{ a: { href: 'https://example.com', $children: ['Safe'] } }
{ a: { href: '/page', $children: ['Relative'] } }
{ a: { href: 'mailto:user@example.com', $children: ['Email'] } }
```

### Prototype Chain Protection

Access to JavaScript prototype chain properties is actively blocked in template interpolation to prevent information leakage:

**Blocked properties:**
- `constructor` - Prevents access to object constructor
- `__proto__` - Prevents prototype chain access
- `prototype` - Prevents prototype property access

```javascript
// ❌ Blocked - logs warning and renders empty
{ div: '{{constructor}}' }
{ div: '{{__proto__}}' }
// Renders: <div></div>
// Warning logged: Access to property "constructor" is blocked for security reasons
```

**Security principle:** Curated output through defense in depth with multiple layers:
1. Curated tags and attributes
2. HTML escaping for all content
3. Curated style patterns
4. Curated URL protocols
5. Prototype chain blocking

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
