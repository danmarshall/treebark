# Shadow DOM Analysis Report for Treebark

**Date:** February 8, 2026  
**Author:** GitHub Copilot  
**Issue:** Should shadow DOM be added to treebark, and if so, should it be the default?

## Executive Summary

After analyzing treebark's architecture, security model, and use cases, I recommend **NOT making shadow DOM the default** for `renderToDOM`. Instead, shadow DOM should be available as an **opt-in feature** for specific use cases. This report examines three key areas:

1. **Should shadow DOM be the default?** - No, due to backward compatibility and common use patterns
2. **Clickjacking attack surface** - Minimal risk increase; existing CSS security is robust
3. **Alternative containment strategies** - Block containers offer style inheritance with containment

---

## 1. Should Shadow DOM Be the Default?

### Recommendation: **No**

### Rationale

**Current Usage Patterns:**
- Treebark's primary use case is embedding safe HTML structures in Markdown content
- Users typically want their content to **inherit page styles** for consistency
- The `renderToDOM` function returns a `DocumentFragment` meant for direct insertion into the page
- Making shadow DOM default would break existing code and change expected behavior

**Shadow DOM Characteristics:**
- **Style Encapsulation**: External styles don't affect shadow DOM content (isolation)
- **No Style Inheritance**: Most global styles are blocked (fonts, colors, etc.)
- **Structural Overhead**: Adds a wrapper container element to the DOM
- **Debugging Complexity**: Shadow DOM content is harder to inspect and style

**Use Cases for Shadow DOM:**
- Web Components: Building reusable, encapsulated components
- Third-party widgets: Preventing style conflicts with host page
- Isolated subsystems: Parts of the app that need complete style isolation

**Use Cases Against Shadow DOM (more common for treebark):**
- Content rendering: Blog posts, documentation, CMS content
- Page layout: Headers, footers, main content areas
- Styled content blocks: Cards, alerts, callouts that should match page theme
- Dynamic content: Data-driven lists, tables that need page styling

### Backward Compatibility Impact

Making shadow DOM the default would be a **breaking change**:

```javascript
// Current behavior - inherits page styles
const fragment = renderToDOM({
  template: { div: { class: "card", $children: ["Content"] } }
});
document.body.appendChild(fragment);
// Result: <div class="card">Content</div> - can be styled by page CSS

// With shadow DOM default - isolated from page styles
const fragment = renderToDOM({
  template: { div: { class: "card", $children: ["Content"] } }
});
document.body.appendChild(fragment);
// Result: <div><#shadow-root><div class="card">Content</div></#shadow-root></div>
// Page CSS for .card won't apply - content appears unstyled
```

### Recommended Approach

**Opt-in via option parameter:**

```javascript
// Default behavior (no shadow DOM)
renderToDOM({ template: {...} })

// Opt-in for shadow DOM
renderToDOM({ template: {...} }, { useShadowDOM: true })
```

This preserves backward compatibility while enabling shadow DOM for users who need it.

---

## 2. Clickjacking and Security Analysis

### Does Style Capability Open Clickjacking Opportunities?

**Short Answer:** Treebark's existing style security is **robust against clickjacking**. Adding shadow DOM would provide **minimal additional security benefit** for clickjacking specifically.

### Current Security Model

Treebark already implements strong CSS security measures:

#### Blocked Dangerous CSS Properties
```typescript
const BLOCKED_CSS_PROPERTIES = new Set([
  'behavior',      // IE-specific XSS vector
  '-moz-binding'   // Firefox XBL binding attacks
]);
```

#### Blocked Dangerous CSS Patterns
```typescript
// From styleObjectToString() in common.ts
- url() with external URLs (data: URIs allowed)
- expression() - IE expression injection
- javascript: protocol in CSS values
- @import - prevents external stylesheet injection
```

#### Clickjacking-Relevant Controls
```typescript
// Semicolon injection prevention
if (cssValue.includes(';')) {
  cssValue = cssValue.split(';')[0].trim();
  logger.warn(`CSS value contained semicolon - using only first part`);
}
```

This prevents injection attacks like:
```javascript
// Attempted attack - blocked by semicolon sanitization
style: { "z-index": "9999; position: fixed; top: 0; opacity: 0.01" }
// Result: Only "z-index: 9999" is applied
```

### Clickjacking Attack Vectors

**Traditional Clickjacking:**
- Attacker overlays invisible iframe over legitimate content
- User clicks thinking they're interacting with legitimate content
- Click actually goes to hidden malicious iframe

**Key CSS Properties for Clickjacking:**
1. `position: fixed` or `position: absolute` - positioning overlay
2. `z-index` - stacking order to place on top
3. `opacity` - making overlay invisible/transparent
4. `pointer-events` - controlling click targets

### Treebark's Current Protection

**All these properties are ALLOWED in treebark** because:
1. They're legitimate CSS properties with valid uses
2. The structured object format prevents injection
3. Context matters: The attack requires **malicious data** controlling styles

**Example of potential concern:**
```javascript
// User-controlled data
const userData = {
  overlayStyle: {
    "position": "fixed",
    "top": "0",
    "left": "0",
    "width": "100%",
    "height": "100%",
    "z-index": "9999",
    "opacity": "0.01"
  }
};

renderToDOM({
  template: {
    div: {
      style: "{{overlayStyle}}",  // This wouldn't work - interpolation not supported for style
      $children: ["Invisible overlay"]
    }
  },
  data: userData
});
```

**Why this doesn't work:**
1. Style attribute must be an **object literal in the template**, not interpolated
2. Template authors (developers) control the structure
3. Data can only fill in **values**, not add new properties

**Actual safe pattern:**
```javascript
// Template is controlled by developer
const template = {
  div: {
    style: {
      "color": "{{userColor}}",        // User controls value
      "font-size": "{{userFontSize}}"  // User controls value
    },
    $children: ["{{userContent}}"]
  }
};

// User can only provide primitive values
const userData = {
  userColor: "red",
  userFontSize: "16px",
  userContent: "Hello world"
};
```

### Shadow DOM's Impact on Clickjacking

**Shadow DOM provides:**
- Style isolation (external styles don't affect shadow content)
- Limited protection against malicious styles **within** shadow DOM

**Shadow DOM does NOT prevent:**
- Malicious styles defined in the treebark template itself
- An attacker who controls the template can still create overlays
- Clickjacking attacks from the host page context

**Conclusion:** Shadow DOM's style isolation is orthogonal to clickjacking protection. The real security boundary is **who controls the template structure**.

### Threat Model Assessment

**Low Risk Scenario (Current Model):**
- **Template**: Controlled by developer (trusted)
- **Data**: User-provided (untrusted)
- **Risk**: Low - users can only provide values, not structure

**High Risk Scenario:**
- **Template**: User-provided (untrusted)
- **Data**: User-provided (untrusted)
- **Risk**: High - but this is explicitly **not** a supported use case

**Recommendation:** Document that treebark templates must be developer-controlled. User data should only populate values within a trusted template structure.

---

## 3. Block Container Rendering (Style Inheritance with Containment)

### Concept: Containment Without Isolation

Instead of shadow DOM (full isolation), consider a **block container** approach that:
- **Contains** rendering (prevents escape)
- **Inherits** styles from page
- Provides **semantic structure**

### Implementation Approach 1: CSS Containment

```javascript
// Add containerMode option
interface RenderOptions {
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  containerMode?: 'none' | 'block' | 'shadow';  // Default: 'none'
}

function renderToDOM(input: TreebarkInput, options: RenderOptions = {}): DocumentFragment {
  const containerMode = options.containerMode || 'none';
  
  if (containerMode === 'shadow') {
    // Shadow DOM with full isolation
    const container = document.createElement('div');
    const shadowRoot = container.attachShadow({ mode: 'open' });
    // ... render into shadowRoot
  } 
  else if (containerMode === 'block') {
    // Block container with CSS containment
    const container = document.createElement('div');
    container.style.cssText = 'contain: content; display: block;';
    container.setAttribute('data-treebark-container', 'true');
    // ... render into container
  }
  else {
    // Direct fragment (current behavior)
    // ... render into fragment
  }
}
```

### CSS Containment Benefits

**The `contain` property** provides performance and containment benefits:

```css
contain: content;  /* Combines layout, paint, and style containment */
```

**What it does:**
- **Layout Containment**: Element's layout doesn't affect external elements
- **Paint Containment**: Element's rendering doesn't escape its bounds
- **Style Containment**: Certain style features (counters, quotes) are scoped

**What it does NOT do:**
- Does NOT provide style isolation (inherits page styles)
- Does NOT create a new stacking context by itself
- Does NOT prevent z-index stacking

### Implementation Approach 2: Scoped Container with Attributes

```javascript
// Simpler approach - just wrap in a semantic container
if (containerMode === 'block') {
  const container = document.createElement('div');
  container.setAttribute('data-treebark', 'container');
  container.className = 'treebark-content';  // Allow user styling
  // ... render into container
  fragment.appendChild(container);
}
```

**Benefits:**
- Provides a **target for scoping styles** via CSS selectors
- Allows **semantic grouping** of rendered content
- Maintains **style inheritance** from page
- No shadow DOM complexity

**Example Usage:**

```javascript
const fragment = renderToDOM({
  template: {
    div: [
      { h1: "{{title}}" },
      { p: "{{content}}" }
    ]
  },
  data: { title: "Hello", content: "World" }
}, { containerMode: 'block' });

// Result DOM:
// <div data-treebark="container" class="treebark-content">
//   <div>
//     <h1>Hello</h1>
//     <p>World</p>
//   </div>
// </div>

// User can scope styles:
// .treebark-content h1 { color: blue; }
// .treebark-content p { margin: 1em 0; }
```

### Comparison: Shadow DOM vs Block Container vs Direct

| Feature | Direct (Current) | Block Container | Shadow DOM |
|---------|-----------------|-----------------|------------|
| Style inheritance | ✅ Full | ✅ Full | ❌ Limited |
| Style isolation | ❌ None | ❌ None | ✅ Complete |
| DOM structure | Flat fragment | Single container | Container + shadow root |
| Performance | ✅ Fast | ✅ Fast | ⚠️ Overhead |
| Debugging | ✅ Easy | ✅ Easy | ⚠️ Harder |
| Use case | General content | Scoped content | Web components |
| Backward compatible | N/A (current) | ⚠️ Changes default | ⚠️ Changes default |

---

## Recommendations

### 1. Implement Opt-In Shadow DOM

```typescript
interface RenderOptions {
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  useShadowDOM?: boolean;  // Default: false
}
```

**Pros:**
- Zero breaking changes
- Enables web component use cases
- Clear opt-in for users who need isolation

**Cons:**
- Users need to understand when to use it
- Requires documentation and examples

### 2. Consider Block Container as Alternative

```typescript
interface RenderOptions {
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  containerMode?: 'none' | 'block' | 'shadow';  // Default: 'none'
}
```

**Pros:**
- Provides semantic grouping without isolation
- Better for content rendering use cases
- Maintains style inheritance
- Easy to style from page CSS

**Cons:**
- Adds extra wrapper element
- May not be needed for all use cases

### 3. Document Security Model

**Add to documentation:**

```markdown
## Security Considerations for Templates

### Template Trust Boundary

Treebark templates must be **developer-controlled and trusted**. The library is designed
with the assumption that:

- ✅ **Template structure** is defined by developers (trusted)
- ✅ **Data values** can come from users (untrusted)
- ❌ **Templates from untrusted sources** are NOT supported

### Why This Matters

While treebark provides robust protection against common attacks (XSS, CSS injection),
certain attacks require control over the template structure. For example:

**Safe Pattern (User provides data):**
```javascript
const template = { div: { style: { color: "{{userColor}}" } } };
const data = { userColor: "red" };  // User controlled, safe
```

**Unsafe Pattern (User provides template - DO NOT DO THIS):**
```javascript
const template = userProvidedJSON;  // ❌ User controls structure
```

If you need to render user-provided templates, consider:
- Template validation and sandboxing
- Restricted template language subset
- Server-side rendering with strict CSP
```

### 4. Skip Shadow DOM Implementation for Now

**Reasons:**
1. No compelling security benefit for the threat model
2. Treebark's current security is already strong
3. Shadow DOM adds complexity (debugging, styling, learning curve)
4. Main use case (content rendering) doesn't benefit from isolation
5. Can always add later as opt-in if user demand emerges

---

## Conclusion

**Primary Recommendation:** Do not implement shadow DOM as default, and consider whether it's needed at all given treebark's use cases.

**If implementing:**
- Make it **opt-in only** via `useShadowDOM: true` option
- Provide clear documentation on when to use it
- Consider adding block container mode as a middle ground
- Document the security model and template trust boundary

**Alternative Path:**
- Focus on improving existing security documentation
- Add examples of safe data binding patterns
- Consider block container mode for semantic grouping
- Defer shadow DOM until clear user demand exists

The existing CSS security model is robust, and treebark's architecture (developer-controlled templates with user-provided data) provides appropriate separation of concerns for its primary use cases.
