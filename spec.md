# 📜 Treebark Spec

## 1. API Format

Treebark accepts input in the `TreebarkInput` format:

```typescript
interface TreebarkInput {
  template: TemplateElement | TemplateElement[];
  data?: Data;
}
```

Rendering functions also accept optional `RenderOptions`:

```typescript
interface RenderOptions {
  indent?: string | number | boolean;  // Indentation for string renderer
  logger?: Logger;       // Custom logger for error/warning messages
}

interface Logger {
  error(message: string): void;
  warn(message: string): void;
  log(message: string): void;
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

**With custom logger:**
```javascript
renderToString(
  { template: { div: "Hello" } },
  { logger: customLogger }
)
```

---

## 2. Error Handling

Treebark follows a **no-throw policy**. Instead of throwing exceptions, errors and warnings are sent to a logger (defaults to `console`).

**Behavior when errors occur:**
- Invalid tags are skipped and an error is logged
- Invalid attributes are skipped and a warning is logged
- Nested comments are skipped and an error is logged
- Invalid conditional syntax is logged as an error and the element is skipped

Treebark renders as much valid content as possible, only skipping problematic elements.

---

## 3. Node Types  

- **Tag Node:** `{ "div": { ... } }`  
- **Array (fragment):** `[ node, node, ... ]` → renders siblings with no wrapper  
- **String (text leaf):** `"Hello world"`  

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
- Array element access: `{{items.0.name}}` → access array elements using numeric indices (no square brackets)
- Parent access: `{{..parentProp}}` → access parent binding context  
- Multi-level parent access: `{{../..grandparentProp}}` → access multiple levels up  
- Escaping:  
  - `{{…}}` → binding  
  - `{{{…}}}` → literal `{{…}}`  
  - `{{{{…}}}}` → literal `{{{…}}}`

**Array element access examples:**
- `{{items.0}}` → first item in array
- `{{data.1.name}}` → `name` property of second item
- `{{matrix.0.1.value}}` → nested array access (first array, second element, `value` property)

**Note:** Numeric indices work because JavaScript allows both `array[0]` and `array["0"]`. The implementation splits the path by `.` and uses each segment as a property key.  

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
  - Global: `id`, `class`, `style`, `title`, `role`, `tabindex`, `aria-*`, `data-*`  
  - `a`: `href`, `target`, `rel`  
  - `img`: `src`, `alt`, `width`, `height`  
  - `table`: `summary`  
  - `th`/`td`: `scope`, `colspan`, `rowspan`  
  - `blockquote`: `cite`  
- Blocked: event handlers (`on*` attributes like `onclick`, `onload`)
- See [Security](#14-security) section for comprehensive security details

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

---

## 10. Array Element Access

Individual array elements can be accessed using numeric indices in dot notation without square brackets:

**Basic syntax:**
```javascript
{{arrayName.0}}        // First element
{{arrayName.1}}        // Second element  
{{items.2.property}}   // Property of third element
```

**Example:**
```javascript
{
  template: {
    div: {
      $children: [
        { p: "First: {{items.0.name}}" },
        { p: "Second: {{items.1.name}}" }
      ]
    }
  },
  data: {
    items: [
      { name: "Laptop", price: "$999" },
      { name: "Mouse", price: "$25" }
    ]
  }
}
```

Output:
```html
<div>
  <p>First: Laptop</p>
  <p>Second: Mouse</p>
</div>
```

**Multi-level array access:**
```javascript
{
  template: { div: "{{matrix.0.1.value}}" },
  data: {
    matrix: [
      [{ value: "A1" }, { value: "A2" }],
      [{ value: "B1" }, { value: "B2" }]
    ]
  }
}
// Output: <div>A2</div>
```

**How it works:**  
JavaScript allows both `array[0]` and `array["0"]` syntax. Since the path is split by `.` and each segment is used as a property key, numeric string indices work seamlessly for array access.

**When to use:**
- Accessing specific array positions by index
- Extracting individual elements from small, fixed-size arrays
- Referencing array elements in templates where the index is known

**When to use $bind instead:**
- Iterating over all elements in an array
- Dynamic arrays where the length is unknown
- Building lists or repeated elements

---

## 11. Tag Whitelist  

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

## 11a. Custom Tags

Applications may register additional tags. Registration is scoped to a single render call/instance (via the `customTags` render option), never global, and unknown/unregistered tags remain rejected exactly as before. A custom tag definition supports two expansion modes, and must provide at least one:

**Tier 1 — `expand` (template expansion):** builds a template from the tag whitelist above; supported by the string, DOM, and React renderers.

```yaml
- person-pill:
    data-person-id: "person-123"
    $children:
      - "Alex"
```

```js
const customTags = {
  'person-pill': {
    attrs: ['data-person-id'], // additional allowed attribute names for this tag
    expand: (attrs, children) => ({
      span: { class: 'person-pill', ...attrs, $children: children }
    })
  }
};
```

**Tier 2 — `component` (React component override):** a React component rendered directly for the tag, receiving its validated/interpolated attributes as props and its rendered children — no intermediate template is produced. Only honored by the React renderer; the string/DOM renderers ignore `component` and require `expand` for that tag.

```js
const customTags = {
  'person-pill': {
    attrs: ['data-person-id'],
    component: PersonPill // (props) => ReactNode
  }
};
```

Rules:
- **Naming:** Custom tag names must contain a hyphen (e.g. `person-pill`), matching the web platform's custom-element naming rule. This guarantees no collision with any current or future built-in HTML tag.
- **No overrides:** A registration whose name matches a built-in tag is ignored (logged as an error); built-in tags can never be shadowed.
- **At least one expansion mode:** A definition with neither `expand` nor `component` is ignored (logged as an error).
- **Attribute allowlisting:** Before `expand`/`component` runs, attributes not in the tag's own `attrs` list or in the global attribute set (`id`, `class`, `style`, `data-*`, `aria-*`, etc.) are stripped with a logged warning — neither `expand` nor `component` ever sees unvalidated attribute names.
- **Renderer parity (Tier 1):** `expand` returns a plain template built from built-in tags/special keys (which may itself reference other custom tags). That template is rendered through the normal pipeline, so string, DOM, and React output stay in parity, and all existing interpolation/escaping/attribute-value validation applies to the expanded output.
- **React-only (Tier 2):** `component` is rendered directly by the React renderer with no expansion chain; the string/DOM renderers fall back to (and require) `expand` and log an error if it's missing.
- **Cycle/depth protection:** Applies to Tier 1 only. A custom tag that (directly or indirectly) expands into itself is detected and rejected with a logged error, as is an expansion chain exceeding the maximum depth.

---

## 12. Comments

HTML comments are generated using the `$comment` tag:

```yaml
$comment: "This is a comment"
```

→ `<!--This is a comment-->`

**Features:**
- Support interpolation: `$comment: "Generated on {{date}}"`
- Support mixed content with `$children`
- Cannot be nested (attempting to place a `$comment` inside another `$comment` logs an error and skips rendering the nested comment)

**Examples:**

Basic comment:
```yaml
$comment: "This is a comment"
```

Comment with interpolation:
```yaml
$comment: "User: {{name}}"
```

Comment with mixed content:
```yaml
$comment:
  $children:
    - "Start: "
    - span: "highlighted text"
    - " :End"
```  

---

## 13. Conditional Rendering with "$if" Tag

The `$if` tag provides advanced conditional rendering based on data properties. It acts as a transparent container that renders its children only when specified conditions are met.

**Key Features:**
- Uses `$check` to specify the property to check
- Supports comparison operators: `$<`, `$>`, `$<=`, `$>=`, `$=`, `$in`
- Operators can be stacked (multiple operators)
- Supports `$not` to invert the final result
- Uses AND logic by default, can switch to OR logic with `$join: "OR"`
- Supports `$thenChildren` and `$elseChildren` for explicit if/else branching
- Does not render itself as an HTML element
- Cannot have regular HTML attributes (only special operators and modifiers)

### If/Else Branching with $thenChildren and $elseChildren

The `$if` tag supports explicit if/else branching using `$thenChildren` and `$elseChildren`:

```javascript
{
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'isLoggedIn',
            $thenChildren: [
              { p: 'Welcome back!' }
            ],
            $elseChildren: [
              { p: 'Please log in' }
            ]
          }
        }
      ]
    }
  },
  data: { isLoggedIn: true }
}
```
→ `<div><p>Welcome back!</p></div>` when `isLoggedIn` is true
→ `<div><p>Please log in</p></div>` when `isLoggedIn` is false

**With operators:**
```javascript
{
  template: {
    $if: {
      $check: 'score',
      '$>': 90,
      $thenChildren: [
        { p: { class: 'excellent', $children: ['Excellent!'] } }
      ],
      $elseChildren: [
        { p: { class: 'good', $children: ['Good effort!'] } }
      ]
    }
  },
  data: { score: 95 }
}
```
→ `<p class="excellent">Excellent!</p>`

**Backward compatibility:** `$children` still works and is equivalent to `$thenChildren` (no else branch).

### Basic Truthiness Check

When no operators are provided, performs a standard JavaScript truthiness check:

```javascript
{
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'showMessage',
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

**Truthiness rules:**
- **Truthy values:** `true`, non-empty strings, non-zero numbers, objects, arrays
- **Falsy values:** `false`, `null`, `undefined`, `0`, `""` (empty string), `NaN`

### Comparison Operators

#### Less Than (`$<`)
```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$<': 18,
      $children: [
        { p: 'Minor' }
      ]
    }
  },
  data: { age: 15 }
}
```
→ `<p>Minor</p>`

#### Greater Than (`$>`)
```javascript
{
  template: {
    $if: {
      $check: 'score',
      '$>': 90,
      $children: [
        { p: 'Excellent!' }
      ]
    }
  },
  data: { score: 95 }
}
```
→ `<p>Excellent!</p>`

#### Strict Equality (`$=`)
```javascript
{
  template: {
    $if: {
      $check: 'status',
      '$=': 'active',
      $children: [
        { p: 'User is active' }
      ]
    }
  },
  data: { status: 'active' }
}
```
→ `<p>User is active</p>`

#### Array Membership (`$in`)
```javascript
{
  template: {
    $if: {
      $check: 'role',
      $in: ['admin', 'moderator', 'editor'],
      $children: [
        { p: 'Has special privileges' }
      ]
    }
  },
  data: { role: 'admin' }
}
```
→ `<p>Has special privileges</p>`

#### Less Than or Equal (`$<=`)
```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$<=': 18,
      $children: [
        { p: 'Youth (18 or under)' }
      ]
    }
  },
  data: { age: 18 }
}
```
→ `<p>Youth (18 or under)</p>`

#### Greater Than or Equal (`$>=`)
```javascript
{
  template: {
    $if: {
      $check: 'score',
      '$>=': 90,
      $children: [
        { p: 'Excellent performance!' }
      ]
    }
  },
  data: { score: 90 }
}
```
→ `<p>Excellent performance!</p>`

### Stacking Operators

Multiple operators can be used together. By default, they use AND logic (all must be true):

**Using exclusive bounds (`$>` and `$<`):**
```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$>': 18,
      '$<': 65,
      $children: [
        { p: 'Working age adult (19-64)' }
      ]
    }
  },
  data: { age: 30 }
}
```
→ `<p>Working age adult (19-64)</p>` (renders because age > 18 AND age < 65)

**Using inclusive bounds (`$>=` and `$<=`):**
```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$>=': 18,
      '$<=': 65,
      $children: [
        { p: 'Working age adult (18-65 inclusive)' }
      ]
    }
  },
  data: { age: 18 }
}
```
→ `<p>Working age adult (18-65 inclusive)</p>` (renders because age >= 18 AND age <= 65)

### OR Logic

Use `$join: "OR"` to change from AND to OR logic (at least one must be true):

```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$<': 18,
      '$>': 65,
      $join: 'OR',
      $children: [
        { p: 'Non-working age' }
      ]
    }
  },
  data: { age: 70 }
}
```
→ `<p>Non-working age</p>` (renders because age > 65, even though age is not < 18)

### Negation with `$not`

The `$not` modifier inverts the entire result after all operators are evaluated:

```javascript
{
  template: {
    $if: {
      $check: 'age',
      '$<': 18,
      $not: true,
      $children: [
        { p: 'Adult' }
      ]
    }
  },
  data: { age: 25 }
}
```
→ `<p>Adult</p>` (renders because NOT(age < 18) = true)

### Complex Example

```javascript
{
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'user.status',
            '$=': 'pending',
            $in: ['error', 'failed'],
            $join: 'OR',
            $not: true,
            $children: [
              { p: 'Valid user status' }
            ]
          }
        }
      ]
    }
  },
  data: { user: { status: 'active' } }
}
```
→ Renders because status is NOT ('pending' OR in ['error', 'failed'])

### Nested Property Access

```javascript
{
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'user.isAdmin',
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
    $if: {
      $check: 'showBanner',
      $children: [
        { div: 'Banner content' }
      ]
    }
  },
  data: { showBanner: false }
}
```
→ `` (empty string)

Nested $if tags for complex conditions:
```javascript
{
  template: {
    div: {
      $children: [
        {
          $if: {
            $check: 'hasPermissions',
            $children: [
              { h2: 'Protected content' },
              {
                $if: {
                  $check: 'isVerified',
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
          $if: {
            $check: 'count',
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
        },
        {
          $if: {
            $check: 'count',
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

### Conditional Attribute Values

Attribute values can be conditional objects that use the same operator system as `$if` tags. This allows dynamic attribute values based on data conditions.

**Basic conditional attribute:**
```javascript
{
  template: {
    div: {
      class: {
        $check: 'isActive',
        $then: 'active',
        $else: 'inactive'
      },
      $children: ['User status']
    }
  },
  data: { isActive: true }
}
```
→ `<div class="active">User status</div>` when `isActive` is true
→ `<div class="inactive">User status</div>` when `isActive` is false

**With operators:**
```javascript
{
  template: {
    div: {
      class: {
        $check: 'score',
        '$>': 90,
        $then: 'excellent',
        $else: 'good'
      },
      $children: ['Score display']
    }
  },
  data: { score: 95 }
}
```
→ `<div class="excellent">Score display</div>`

**With $in operator:**
```javascript
{
  template: {
    div: {
      class: {
        $check: 'role',
        $in: ['admin', 'moderator'],
        $then: 'privileged',
        $else: 'regular'
      },
      $children: ['User panel']
    }
  },
  data: { role: 'admin' }
}
```
→ `<div class="privileged">User panel</div>`

**Multiple conditional attributes:**
```javascript
{
  template: {
    div: {
      class: {
        $check: 'theme',
        '$=': 'dark',
        $then: 'dark-mode',
        $else: 'light-mode'
      },
      'data-theme': {
        $check: 'theme',
        $then: '{{theme}}',
        $else: 'default'
      },
      $children: ['Themed content']
    }
  },
  data: { theme: 'dark' }
}
```
→ `<div class="dark-mode" data-theme="dark">Themed content</div>`

**With modifiers:**
Conditional attributes support all the same modifiers and operators as `$if` tags:
- `$not`: Invert the condition
- `$join`: Combine multiple operators with "AND" or "OR"
- `$<`, `$>`, `$<=`, `$>=`, `$=`, `$in`: Comparison operators

```javascript
{
  template: {
    div: {
      class: {
        $check: 'isGuest',
        $not: true,
        $then: 'member',
        $else: 'guest'
      },
      $children: ['User']
    }
  },
  data: { isGuest: false }
}
```
→ `<div class="member">User</div>`

**Restrictions:**
- The `$if` tag **requires** a `$check` attribute
- The `$if` tag **cannot** have regular HTML attributes (like `class`, `id`, etc.)
- Only special operators (`$<`, `$>`, `$<=`, `$>=`, `$=`, `$in`) and modifiers (`$not`, `$join`) are allowed
- If you need a wrapper element with attributes, use a regular tag inside the `$if` tag's children

---

## 14. Security

Treebark implements multiple layers of security to prevent XSS attacks and other vulnerabilities.

### 14.1 Tag Allowlist

Only safe HTML tags are permitted. Dangerous tags are blocked and logged as errors:

**Blocked tags:**
- `script`, `iframe`, `object`, `embed`, `applet` - XSS vectors
- `form`, `input`, `button`, `select`, `textarea` - Form hijacking
- `style`, `link`, `meta`, `base` - Style/metadata injection
- `video`, `audio`, `canvas` - Media-based attacks
- `svg`, `math` - Vector-based attacks

**Case variations blocked:** Tag names are case-sensitive. `ScRiPt`, `IFRAME`, etc. are also blocked.

**Example:**
```javascript
{ script: 'alert("xss")' }
// Logs error: Tag "script" is not allowed
// Renders: (nothing)
```

### 14.2 Attribute Allowlist

Only safe attributes are permitted per tag. Event handlers are blocked:

**Blocked attributes:**
- `onclick`, `onload`, `onerror`, `onmouseover`, etc. - All `on*` event handlers
- Case variations: `onClick`, `ONCLICK`, etc. are also blocked

**Allowed attributes per tag:**
- Global: `id`, `class`, `style`, `title`, `role`, `tabindex`, `aria-*`, `data-*`
- `a`: `href`, `target`, `rel`
- `img`: `src`, `alt`, `width`, `height`
- `table`: `summary`
- `th`/`td`: `scope`, `colspan`, `rowspan`
- `blockquote`: `cite`

**Example:**
```javascript
{ div: { onclick: 'alert(1)', $children: ['text'] } }
// Logs warning: Attribute "onclick" is not allowed on tag "div"
// Renders: <div>text</div> (onclick omitted)
```

### 14.3 HTML Escaping

All content and attribute values are automatically HTML-escaped to prevent injection:

**Example:**
```javascript
{ div: '<script>alert(1)</script>' }
// Renders: <div>&lt;script&gt;alert(1)&lt;/script&gt;</div>
```

### 14.4 Style Attribute Protection

The `style` attribute uses a structured object format that blocks multiple attack vectors:

**Dangerous CSS patterns blocked:**
- `url()` with external URLs (data: URIs allowed for inline images)
- `expression()` - IE expression injection
- `javascript:` protocol in CSS values
- `@import` - CSS imports

**Dangerous CSS properties blocked:**
- `behavior` - IE behavior property (can execute code)
- `-moz-binding` - Firefox XBL binding (can execute code)

**Property name validation:**
- Must be kebab-case format (lowercase letters and hyphens)
- Invalid formats are skipped with a warning

**Semicolon injection prevention:**
Only the first CSS value before a semicolon is used:

```javascript
{
  div: {
    style: {
      color: 'red; position: absolute; z-index: 999'
    },
    $children: ['text']
  }
}
// Logs warning: CSS value contained semicolon - using only first part
// Renders: <div style="color: red">text</div>
```

### 14.5 URL Protocol Validation

The `href` and `src` attributes validate URL protocols to prevent XSS attacks:

**Safe protocols allowed:**
- `http:`, `https:` - Standard web protocols
- `mailto:`, `tel:`, `sms:` - Communication protocols
- `ftp:`, `ftps:` - File transfer protocols
- Relative URLs: `/path`, `#anchor`, `?query`, `page.html`

**Dangerous protocols blocked:**
- `javascript:` - JavaScript execution
- `data:` - Data URIs (can contain HTML/scripts)
- `vbscript:` - VBScript execution
- `file:` - Local file access
- Any other unlisted protocols

**Example:**
```javascript
{ a: { href: 'javascript:alert(1)', $children: ['Click'] } }
// Logs warning: Attribute "href" contains blocked protocol "javascript:"
// Renders: <a>Click</a> (href omitted)

{ a: { href: 'https://example.com', $children: ['Safe'] } }
// Renders: <a href="https://example.com">Safe</a>
```

### 14.6 Prototype Chain Protection

Access to JavaScript prototype chain properties is blocked in template interpolation:

**Blocked properties:**
- `constructor` - Object constructor access
- `__proto__` - Prototype chain access
- `prototype` - Prototype property access

**Example:**
```javascript
{ div: '{{constructor}}' }
// Logs warning: Access to property "constructor" is blocked for security reasons
// Renders: <div></div>

{ div: '{{name}}' }
// Renders: <div>Alice</div> (normal properties work fine)
```

### 14.7 Defense in Depth

Treebark implements multiple overlapping security layers:

1. **Tag allowlist** - Only safe HTML tags permitted
2. **Attribute allowlist** - Only safe attributes permitted per tag
3. **HTML escaping** - All content and attribute values escaped
4. **Structured style objects** - Prevents CSS string injection
5. **CSS pattern blocking** - Blocks dangerous CSS patterns and properties
6. **URL protocol validation** - Blocks dangerous protocols in href/src
7. **Prototype chain blocking** - Prevents access to internal object properties

This defense-in-depth approach ensures that even if one layer is bypassed, others remain to protect against attacks.

