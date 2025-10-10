# 📜 Treebark Spec

## 1. API Format

Treebark accepts input in the `TreebarkInput` format:

```typescript
interface TreebarkInput {
  template: TemplateElement | TemplateElement[];
  data?: Data;
}
```

### Examples:

**Simple template:**
```javascript
{
  template: { div: "Hello world" }
}
```

**Template with data:**
```javascript
{
  template: { div: "Hello {{name}}" },
  data: { name: "Alice" }
}
```

---

## 2. Node Types  

- **Tag Node:** `{ "div": { ... } }`  
- **Array (fragment):** `[ node, node, ... ]` → renders siblings with no wrapper  
- **String (text leaf):** `"Hello world"`  

---

## 3. Automatic Array Iteration

**New Feature:** When you provide a single template (not an array) with array data, Treebark automatically renders the template once for each data item:

```javascript
{
  template: {
    div: {
      class: "card",
      $children: [{ h2: "{{name}}" }]
    }
  },
  data: [
    { name: "Card 1" },
    { name: "Card 2" }
  ]
}
```

**Result:** Two `<div class="card">` elements, one for each data item.

**Rules:**
- Only triggers when `template` is a single element (not array) AND `data` is an array
- Each array item becomes the data context for one template instance
- Empty arrays produce no output
- For more complex scenarios, use `$bind` syntax instead

---

## 4. Reserved Keys  

- **`$children`** → array of child nodes (strings, nodes, or arrays)  
- **`$bind`** → bind current node to an array or object property in data  

---

## 5. Shorthand Array Syntax

For nodes without attributes, you can use a shorthand array syntax instead of `$children`:

```yaml
div:
  - h2: "Title"
  - p: "Content"
```

This is equivalent to:

```yaml  
div:
  $children:
    - h2: "Title"
    - p: "Content"
```

**Rules:**
- Only works when the node has no attributes
- If you need attributes (class, id, etc.), use explicit `$children` syntax
- Mixing shorthand and attributes is not allowed

---

## 6. Interpolation  

- `{{prop}}` → resolves against current context  
- Dot access allowed: `{{price.sale}}`  
- Parent access: `{{..parentProp}}` → access parent binding context  
- Multi-level parent access: `{{../..grandparentProp}}` → access multiple levels up  
- Escaping:  
  - `{{…}}` → binding  
  - `{{{…}}}` → literal `{{…}}`  
  - `{{{{…}}}}` → literal `{{{…}}}`  

---

## 7. Mixed Content  

- `$children` can contain strings + nodes:  
  ```yaml
  div:
    $children:
      - "Hello "
      - span: "World"
      - "!"
  ```
  → `<div>Hello <span>World</span>!</div>`

- Shorthand array syntax also supports mixed content:
  ```yaml
  div:
    - "Hello "
    - span: "World"  
    - "!"
  ```
  → `<div>Hello <span>World</span>!</div>`

- Arrays act as fragments:  
  ```yaml
  - h1: "Hello"
  - p: "World"
  ```
  → `<h1>Hello</h1><p>World</p>`

---

## 8. Attributes  

- Attributes are plain key/value pairs.  
- Values may contain interpolations.  
- Allowed:  
  - Global: `id`, `class`, `style`, `title`, `aria-*`, `data-*`, `role`  
  - `a`: `href`, `target`, `rel`  
  - `img`: `src`, `alt`, `width`, `height`  
  - `table`: `summary`  
  - `th`/`td`: `scope`, `colspan`, `rowspan`  
  - `blockquote`: `cite`  
- Blocked: event handlers (`on*`), dangerous protocols (`javascript:`).  

---

## 9. Advanced Array Binding with $bind

For complex array scenarios where you need a wrapper element or nested structure, use `$bind`:

```javascript
{
  template: {
    ul: {
      class: "product-list",
      $bind: "products",
      $children: [
        { li: "{{name}} — {{price}}" }
      ]
    }
  },
  data: {
    products: [
      { name: "Laptop", price: "$999" },
      { name: "Phone", price: "$499" }
    ]
  }
}
```

**$bind supports property access patterns:**
- **Literal property:** `$bind: "products"`
- **Nested property:** `$bind: "catalog.products"` (single dots for nested object access)

**Note:** `$bind` uses literal property paths only - no interpolation or parent context access. For parent property access, use interpolation `{{..prop}}` in content/attributes instead.

**Common use cases for parent property access:**
- **Cross-referencing data:** Access IDs or metadata from outer scopes
- **Shared resources:** Use common lookup tables or configuration from parent contexts
- **Hierarchical navigation:** Build breadcrumbs or nested navigation with parent context
- **Conditional rendering:** Access parent flags or settings to control child rendering

**Example - Customer orders with product links:**
```javascript
{
  template: {
    div: {
      $bind: "customers",
      $children: [
        { h2: "{{name}}" },
        {
          ul: {
            $bind: "orders", 
            $children: [
              {
                li: {
                  $children: [
                    "Order #{{orderId}}: ",
                    {
                      ul: {
                        $bind: "products",
                        $children: [
                          {
                            li: {
                              $children: [
                                {
                                  a: {
                                    href: "/customer/{{../../..customerId}}/order/{{..orderId}}/product/{{productId}}",
                                    $children: ["{{name}}"]
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
}
```

**When to use $bind vs automatic array iteration:**
- **Automatic iteration:** Simple case where you want multiple instances of the same template
- **$bind:** When you need a wrapper element, complex nesting, or binding to nested data properties

---

## 10. Tag Whitelist  

**Standard HTML tags:**  
`div`, `span`, `p`, `header`, `footer`, `main`, `section`, `article`,  
`h1`–`h6`, `strong`, `em`, `blockquote`, `code`, `pre`,  
`ul`, `ol`, `li`,  
`table`, `thead`, `tbody`, `tr`, `th`, `td`,  
`a`, `img`

**Special tags:**  
`comment`, `if`

Blocked tags:  
`script`, `iframe`, `embed`, `object`, `applet`,  
`form`, `input`, `button`, `select`,  
`video`, `audio`,  
`style`, `link`, `meta`, `base`

---

## 11. Comments

HTML comments are generated using the `comment` tag:

```yaml
comment: "This is a comment"
```

→ `<!--This is a comment-->`

**Features:**
- Support interpolation: `comment: "Generated on {{date}}"`
- Support mixed content with `$children`
- Cannot be nested (attempting to place a `comment` inside another `comment` throws an error)

**Examples:**

Basic comment:
```yaml
comment: "This is a comment"
```

Comment with interpolation:
```yaml
comment: "User: {{name}}"
```

Comment with mixed content:
```yaml
comment:
  $children:
    - "Start: "
    - span: "highlighted text"
    - " :End"
```  

---

## 12. Conditional Rendering with "if" Tag

The `if` tag provides conditional rendering based on the truthiness of a data property. It acts as a transparent container that renders its children only when a specified condition is truthy.

**Key Features:**
- Uses `$bind` to specify the condition to check
- Supports `$not` to invert the condition (render when falsy)
- Does not render itself as an HTML element
- Only renders children when the condition is truthy (or falsy with `$not`)
- Follows JavaScript truthiness rules
- Cannot have attributes (only `$bind`, `$not`, and `$children`)

**Basic usage:**
```javascript
{
  template: {
    div: {
      $children: [
        {
          if: {
            $bind: 'showMessage',
            $children: [
              { p: 'This message is conditionally shown' }
            ]
          }
        }
      ]
    }
  },
  data: { showMessage: true }
}
```

**Negation with `$not`:**
```javascript
{
  template: {
    div: {
      $children: [
        {
          if: {
            $bind: 'isGuest',
            $not: true,
            $children: [
              { p: 'Welcome back, member!' }
            ]
          }
        }
      ]
    }
  },
  data: { isGuest: false }
}
```
→ Renders the paragraph because `isGuest` is false and `$not` inverts the check

**Truthiness rules:**
The `if` tag follows standard JavaScript truthiness:
- **Truthy values:** `true`, non-empty strings, non-zero numbers, objects, arrays
- **Falsy values:** `false`, `null`, `undefined`, `0`, `""` (empty string), `NaN`

**Examples:**

Conditional rendering with boolean:
```javascript
{
  template: {
    if: {
      $bind: 'isLoggedIn',
      $children: [
        { div: 'Welcome back!' }
      ]
    }
  },
  data: { isLoggedIn: true }
}
```
→ `<div>Welcome back!</div>`

Conditional rendering with nested property:
```javascript
{
  template: {
    div: {
      $children: [
        {
          if: {
            $bind: 'user.isAdmin',
            $children: [
              { p: 'Admin panel access' }
            ]
          }
        }
      ]
    }
  },
  data: { user: { isAdmin: true } }
}
```
→ `<div><p>Admin panel access</p></div>`

When condition is falsy, nothing is rendered:
```javascript
{
  template: {
    if: {
      $bind: 'showBanner',
      $children: [
        { div: 'Banner content' }
      ]
    }
  },
  data: { showBanner: false }
}
```
→ `` (empty string)

Nested if tags for complex conditions:
```javascript
{
  template: {
    div: {
      $children: [
        {
          if: {
            $bind: 'hasPermissions',
            $children: [
              { h2: 'Protected content' },
              {
                if: {
                  $bind: 'isVerified',
                  $children: [
                    { p: 'Verified user content' }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: { hasPermissions: true, isVerified: true }
}
```
→ `<div><h2>Protected content</h2><p>Verified user content</p></div>`

**Using `$not` for "unless" behavior:**
```javascript
{
  template: {
    div: {
      class: 'status',
      $children: [
        {
          if: {
            $bind: 'count',
            $not: true,
            $children: [
              { p: 'No items available' }
            ]
          }
        },
        {
          if: {
            $bind: 'count',
            $children: [
              { p: 'Items found: {{count}}' }
            ]
          }
        }
      ]
    }
  },
  data: { count: 0 }
}
```
→ `<div class="status"><p>No items available</p></div>`

**Restrictions:**
- The `if` tag **requires** a `$bind` attribute
- The `if` tag **cannot** have any other attributes (like `class`, `id`, etc.)
- The optional `$not` attribute must be a boolean (`true` or `false`)
- If you need a wrapper element with attributes, use a regular tag inside the `if` tag's children  
