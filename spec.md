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
- Allowed HTML attributes:  
  - Global: `id`, `class`, `style`, `title`, `aria-*`, `data-*`, `role`  
  - `a`: `href`, `target`, `rel`  
  - `img`: `src`, `alt`, `width`, `height`  
  - `table`: `summary`  
  - `th`/`td`: `scope`, `colspan`, `rowspan`  
  - `blockquote`: `cite`  
- Allowed SVG attributes:
  - Global SVG: `id`, `class`, `style`, `data-*`
  - `svg`: `width`, `height`, `viewBox`, `preserveAspectRatio`, `xmlns`
  - Shape presentation: `fill`, `stroke`, `stroke-width`, `opacity`, `fill-opacity`, `stroke-opacity`
  - `circle`: `cx`, `cy`, `r`
  - `rect`: `x`, `y`, `width`, `height`, `rx`, `ry`
  - `ellipse`: `cx`, `cy`, `rx`, `ry`
  - `line`: `x1`, `y1`, `x2`, `y2`, `stroke-linecap`
  - `polyline`, `polygon`: `points`, `stroke-linejoin`
  - `path`: `d`, `stroke-linecap`, `stroke-linejoin`, `fill-rule`
  - `text`, `tspan`: `x`, `y`, `dx`, `dy`, `text-anchor`, `font-family`, `font-size`, `font-weight`
  - `g`, `defs`, `symbol`: `transform`
  - `use`: `href`, `xlink:href`, `x`, `y`, `width`, `height`, `transform`
  - Gradients: `gradientUnits`, `gradientTransform`
  - `linearGradient`: `x1`, `y1`, `x2`, `y2`
  - `radialGradient`: `cx`, `cy`, `r`, `fx`, `fy`
  - `stop`: `offset`, `stop-color`, `stop-opacity`
  - `clipPath`, `mask`, `pattern`: `clipPathUnits`, `maskUnits`, `patternUnits`, `patternContentUnits`
  - `pattern`: `x`, `y`, `width`, `height`, `viewBox`
  - `animate`, `animateTransform`: `attributeName`, `from`, `to`, `dur`, `repeatCount`, `type`, `values`
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

**SVG tags:**  
`svg`, `g`, `defs`, `symbol`, `use`,  
`circle`, `rect`, `ellipse`, `line`, `polyline`, `polygon`, `path`,  
`text`, `tspan`,  
`linearGradient`, `radialGradient`, `stop`,  
`clipPath`, `mask`, `pattern`,  
`animate`, `animateTransform`

**Special tags:**  
`comment`, `if`

Blocked tags:  
`script`, `iframe`, `embed`, `object`, `applet`,  
`form`, `input`, `button`, `select`,  
`video`, `audio`,  
`style`, `link`, `meta`, `base`

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

## 14. SVG Support

Treebark supports SVG (Scalable Vector Graphics) elements with the same security model and data binding capabilities as HTML elements.

### SVG Tags

SVG elements are organized into several categories:

**Container elements:**
- `svg` - Root SVG element
- `g` - Group element for organizing and transforming
- `defs` - Container for reusable elements
- `symbol` - Define reusable graphic templates
- `use` - Reference and reuse defined elements

**Shape elements:**
- `circle` - Circular shape
- `rect` - Rectangle shape
- `ellipse` - Elliptical shape
- `line` - Straight line
- `polyline` - Connected line segments
- `polygon` - Closed shape with straight sides
- `path` - Complex shapes using path commands

**Text elements:**
- `text` - Text content
- `tspan` - Styled text spans within text

**Gradient elements:**
- `linearGradient` - Linear color gradient
- `radialGradient` - Radial color gradient
- `stop` - Gradient color stops

**Effect elements:**
- `clipPath` - Clipping region
- `mask` - Masking effect
- `pattern` - Fill pattern

**Animation elements:**
- `animate` - Animate attribute values
- `animateTransform` - Animate transformations

### Basic SVG Example

```javascript
{
  template: {
    svg: {
      width: "100",
      height: "100",
      viewBox: "0 0 100 100",
      $children: [
        {
          circle: {
            cx: "50",
            cy: "50",
            r: "40",
            fill: "#3498db",
            stroke: "#2c3e50",
            "stroke-width": "2"
          }
        }
      ]
    }
  }
}
```
→ `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#3498db" stroke="#2c3e50" stroke-width="2"></circle></svg>`

### SVG Attributes

**Root SVG attributes:**
- `width`, `height` - Dimensions of the SVG viewport
- `viewBox` - Coordinate system and aspect ratio
- `preserveAspectRatio` - How to scale the content
- `xmlns` - XML namespace (automatically added when needed)

**Common presentation attributes** (most shape elements):
- `fill` - Fill color (hex, rgb, named colors, gradients)
- `stroke` - Stroke color
- `stroke-width` - Stroke thickness
- `opacity` - Overall opacity (0-1)
- `fill-opacity` - Fill opacity (0-1)
- `stroke-opacity` - Stroke opacity (0-1)

**Position and size** (varies by element):
- Circle: `cx`, `cy`, `r`
- Rectangle: `x`, `y`, `width`, `height`, `rx`, `ry`
- Ellipse: `cx`, `cy`, `rx`, `ry`
- Line: `x1`, `y1`, `x2`, `y2`
- Path: `d` (path data)
- Polyline/Polygon: `points`

**Transform attributes:**
- `transform` - Apply transformations (translate, rotate, scale, skew, matrix)

**Text attributes:**
- `x`, `y` - Text position
- `dx`, `dy` - Relative positioning offset
- `text-anchor` - Horizontal alignment (start, middle, end)
- `font-family`, `font-size`, `font-weight` - Typography

**Gradient attributes:**
- `gradientUnits` - Coordinate system for gradient
- `gradientTransform` - Gradient transformation
- Linear: `x1`, `y1`, `x2`, `y2` (start and end points)
- Radial: `cx`, `cy`, `r` (center and radius), `fx`, `fy` (focal point)

**Stop attributes:**
- `offset` - Position in gradient (0-100%)
- `stop-color` - Color at this stop
- `stop-opacity` - Opacity at this stop

**Use attributes:**
- `href` or `xlink:href` - Reference to element to reuse
- `x`, `y` - Position offset
- `width`, `height` - Size override

**Animation attributes:**
- `attributeName` - Attribute to animate
- `from` - Starting value
- `to` - Ending value
- `dur` - Duration (e.g., "2s", "500ms")
- `repeatCount` - Number of repetitions ("indefinite" for continuous)
- `type` - Type of transformation (for animateTransform)
- `values` - List of values for keyframe animation

### SVG with Data Binding

SVG elements support full data binding capabilities:

```javascript
{
  template: {
    svg: {
      width: "400",
      height: "200",
      viewBox: "0 0 400 200",
      $children: [
        {
          rect: {
            $bind: "bars",
            x: "{{x}}",
            y: "{{y}}",
            width: "50",
            height: "{{height}}",
            fill: "{{color}}"
          }
        }
      ]
    }
  },
  data: {
    bars: [
      { x: "10", y: "50", height: "150", color: "#3498db" },
      { x: "80", y: "80", height: "120", color: "#2ecc71" },
      { x: "150", y: "30", height: "170", color: "#e74c3c" }
    ]
  }
}
```

### SVG with Conditional Rendering

Conditional logic works seamlessly with SVG:

```javascript
{
  template: {
    svg: {
      width: "200",
      height: "200",
      viewBox: "0 0 200 200",
      $children: [
        {
          $if: {
            $check: "showCircle",
            $then: {
              circle: {
                cx: "100",
                cy: "100",
                r: "50",
                fill: "#3498db"
              }
            },
            $else: {
              rect: {
                x: "50",
                y: "50",
                width: "100",
                height: "100",
                fill: "#e74c3c"
              }
            }
          }
        }
      ]
    }
  },
  data: { showCircle: true }
}
```

### SVG Groups and Transforms

Group related elements and apply transformations:

```javascript
{
  template: {
    svg: {
      width: "200",
      height: "200",
      viewBox: "0 0 200 200",
      $children: [
        {
          g: {
            transform: "translate(100, 100) rotate(45)",
            $children: [
              {
                rect: {
                  x: "-25",
                  y: "-25",
                  width: "50",
                  height: "50",
                  fill: "#9b59b6"
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

### SVG Gradients

Define and use gradients:

```javascript
{
  template: {
    svg: {
      width: "200",
      height: "200",
      viewBox: "0 0 200 200",
      $children: [
        {
          defs: {
            $children: [
              {
                linearGradient: {
                  id: "grad1",
                  x1: "0%",
                  y1: "0%",
                  x2: "100%",
                  y2: "100%",
                  $children: [
                    {
                      stop: {
                        offset: "0%",
                        "stop-color": "#3498db",
                        "stop-opacity": "1"
                      }
                    },
                    {
                      stop: {
                        offset: "100%",
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
          rect: {
            x: "10",
            y: "10",
            width: "180",
            height: "180",
            fill: "url(#grad1)"
          }
        }
      ]
    }
  }
}
```

### SVG Symbol and Use

Define reusable symbols:

```javascript
{
  template: {
    svg: {
      width: "200",
      height: "200",
      viewBox: "0 0 200 200",
      $children: [
        {
          defs: {
            $children: [
              {
                symbol: {
                  id: "star",
                  viewBox: "0 0 24 24",
                  $children: [
                    {
                      path: {
                        d: "M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z",
                        fill: "currentColor"
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          use: {
            href: "#star",
            x: "50",
            y: "50",
            width: "100",
            height: "100",
            fill: "#f39c12"
          }
        }
      ]
    }
  }
}
```

### SVG Parent Context Access

Access parent data in nested SVG structures:

```javascript
{
  template: {
    svg: {
      width: "500",
      height: "300",
      viewBox: "0 0 500 300",
      $children: [
        {
          g: {
            $bind: "dataPoints",
            $children: [
              {
                circle: {
                  cx: "{{x}}",
                  cy: "{{y}}",
                  r: "{{radius}}",
                  fill: "{{color}}"
                }
              },
              {
                text: {
                  x: "{{x}}",
                  y: "{{../..labelY}}",
                  "text-anchor": "middle",
                  $children: ["{{label}}"]
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: {
    labelY: "290",
    dataPoints: [
      { x: "50", y: "100", radius: "20", color: "#3498db", label: "A" },
      { x: "150", y: "80", radius: "25", color: "#2ecc71", label: "B" }
    ]
  }
}
```

### Security Considerations

SVG follows the same security model as HTML:
- All attributes are sanitized to prevent XSS attacks
- Dangerous patterns in URLs are blocked (e.g., `javascript:`)
- Event handlers (`onclick`, etc.) are not allowed
- The renderer uses secure methods to create and populate SVG elements
- `xlink:href` is supported for backwards compatibility but sanitized

### Mixing HTML and SVG

SVG elements can be embedded within HTML structures:

```javascript
{
  template: {
    div: {
      class: "card",
      $children: [
        { h2: "Chart" },
        {
          svg: {
            width: "200",
            height: "100",
            viewBox: "0 0 200 100",
            $children: [
              {
                rect: {
                  x: "10",
                  y: "10",
                  width: "180",
                  height: "80",
                  fill: "#ecf0f1"
                }
              }
            ]
          }
        },
        { p: "Data visualization" }
      ]
    }
  }
}
```

### SVG Void Elements

Most SVG elements are container elements and can have children. The following SVG elements are treated as void elements (self-closing):
- Individual shapes without child content (`circle`, `rect`, `ellipse`, `line`, `polyline`, `polygon`)
- `use` (when not containing fallback content)

However, some SVG elements commonly have children:
- `svg`, `g`, `defs`, `symbol` - Always containers
- `text` - Contains text or `tspan` elements
- `path` - Can contain animation elements
- Gradient elements - Contain `stop` elements

The implementation determines whether to self-close based on the presence of `$children`.
