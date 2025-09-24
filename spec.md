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

**When to use $bind vs automatic array iteration:**
- **Automatic iteration:** Simple case where you want multiple instances of the same template
- **$bind:** When you need a wrapper element, complex nesting, or binding to nested data properties

---

## 10. Tag Whitelist  

Allowed tags:  
`div`, `span`, `p`, `header`, `footer`, `main`, `section`, `article`,  
`h1`–`h6`, `strong`, `em`, `blockquote`, `code`, `pre`,  
`ul`, `ol`, `li`,  
`table`, `thead`, `tbody`, `tr`, `th`, `td`,  
`a`, `img`, `comment`  

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
