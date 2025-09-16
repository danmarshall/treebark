# 📜 Treebark Spec

## 1. Node Types  

- **Tag Node:** `{ "div": { ... } }`  
- **Array (fragment):** `[ node, node, ... ]` → renders siblings with no wrapper  
- **String (text leaf):** `"Hello world"`  

---

## 2. Reserved Keys  

- **`$children`** → array of child nodes (strings, nodes, or arrays)  
- **`$bind`** → bind current node to an array or object property in data  
- **`$template`** → top-level template in a self-contained block  
- **`$data`** → top-level data in a self-contained block  

---

## 3. Shorthand Array Syntax

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

## 4. Interpolation  

- `{{prop}}` → resolves against current context  
- Dot access allowed: `{{price.sale}}`  
- Escaping:  
  - `{{…}}` → binding  
  - `{{{…}}}` → literal `{{…}}`  
  - `{{{{…}}}}` → literal `{{{…}}}`  

---

## 5. Mixed Content  

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

## 6. Attributes  

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

## 7. Self-Contained Blocks  

```yaml
$template:
  p: "Hello {{name}}"
$data:
  name: "Alice"
```

If both `$template` and `$data` exist at the root, render `$template` with `$data`. Otherwise, treat the root as the template and use separately supplied data.  

---

## 8. HTML Comments  

HTML comments are supported using the `comment` tag:

```yaml
comment: "This is a simple comment"
```

→ `<!-- This is a simple comment -->`

Comments can enclose other tags and content:

```yaml
comment:
  $children:
    - "Section: "
    - strong: "Important"
    - " content"
```

→ `<!-- Section: <strong>Important</strong> content -->`

Comments support data interpolation:

```yaml
comment: "Debug: {{user.id}} - {{user.name}}"
```

**Restrictions:**
- Nested comments are not allowed (HTML specification)
- Comments render their children as HTML strings within the comment syntax

---

## 9. Tag Whitelist  

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
