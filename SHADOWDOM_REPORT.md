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

### Specific Attack: Malicious Link Overlay

**Attack Scenario (raised by @danmarshall):**
A malicious hyperlink or text content is absolutely positioned to cover an existing button, causing users to click the malicious link when they think they're clicking the legitimate button.

**Example Attack Code:**
```javascript
// Developer template (trusted)
const template = {
  div: [
    { button: { id: "pay-button", $children: ["Pay $100"] } },
    { 
      a: { 
        href: "{{userLink}}",  // User controls link destination
        style: {
          "position": "absolute",
          "top": "0",
          "left": "0", 
          "width": "100%",
          "height": "100%",
          "z-index": "9999",
          "opacity": "0.01"
        },
        $children: ["{{userText}}"]  // User controls text
      }
    }
  ]
};

// Attacker provides data
const attackData = {
  userLink: "https://evil.com/steal-money",
  userText: "Innocent text"
};
```

**Is this attack possible in treebark?**

**YES, IF the developer writes a vulnerable template** that:
1. Includes positioning styles (`position: absolute`, `z-index`) in the template
2. Allows user-controlled link destinations via `href: "{{userLink}}"`
3. Allows user-controlled content via `$children: ["{{userText}}"]`

**Key Point:** This is a **template design vulnerability**, not a treebark security vulnerability. The developer has explicitly chosen to:
- Put absolute positioning in the template structure
- Allow user data in both the link and content

### Why Treebark Can't Prevent This

Treebark's security model is:
- **Template structure** = Developer-controlled (trusted)
- **Data values** = User-controlled (untrusted)

If the developer writes a template that positions elements absolutely with high z-index, that's a developer choice. Treebark correctly allows all legitimate CSS properties because:

1. **Positioning is legitimate**: Many valid use cases require `position: absolute` (tooltips, dropdowns, modals)
2. **Injection is prevented**: The structured format prevents users from injecting new CSS properties
3. **Template control**: Developers are responsible for not creating vulnerable positioning patterns

**Developer Responsibility:**
```javascript
// ❌ VULNERABLE pattern - don't do this
{
  a: {
    href: "{{userLink}}",  // User controls destination
    style: { "position": "absolute", "z-index": "9999" },  // Dangerous positioning
    $children: ["{{userText}}"]
  }
}

// ✅ SAFE pattern - user content without dangerous positioning
{
  a: {
    href: "{{userLink}}",
    style: { "color": "blue", "text-decoration": "underline" },  // Safe styles
    $children: ["{{userText}}"]
  }
}

// ✅ SAFE pattern - positioned elements without user control
{
  div: {
    style: { "position": "absolute", "top": "10px", "right": "10px" },
    $children: ["Close"]  // Hardcoded content
  }
}
```

### Could Shadow DOM Help?

**No.** Shadow DOM provides style **isolation**, not **positioning constraints**. Elements inside shadow DOM can still use `position: absolute` and `z-index` to overlay other shadow DOM content.

Shadow DOM would only help if:
- The malicious content was in one shadow root
- The button was in a different shadow root or outside shadow DOM
- They had different stacking contexts

But this doesn't match typical usage patterns where all user content is rendered together.

### Shadow DOM's Impact on Clickjacking

**Shadow DOM provides:**
- Style isolation (external styles don't affect shadow content)
- Limited protection against malicious styles **within** shadow DOM

**Shadow DOM does NOT prevent:**
- Malicious styles defined in the treebark template itself
- An attacker who controls the template can still create overlays
- Elements within the same shadow root from overlaying each other
- Clickjacking attacks from the host page context

**Conclusion:** Shadow DOM's style isolation is orthogonal to clickjacking protection. The real security boundary is **who controls the template structure**.

### Threat Model Assessment

**Low Risk Scenario (Current Model):**
- **Template**: Controlled by developer (trusted)
- **Data**: User-provided (untrusted)
- **Risk**: Low - users can only provide values, not structure

**Medium Risk Scenario (Positioning in Template):**
- **Template**: Controlled by developer but includes positioning styles
- **Data**: User-provided (untrusted) including links and content
- **Risk**: Medium - developer must be careful not to combine positioning with user-controlled links/content
- **Mitigation**: Developer education, linting rules, template review

**High Risk Scenario:**
- **Template**: User-provided (untrusted)
- **Data**: User-provided (untrusted)
- **Risk**: High - but this is explicitly **not** a supported use case

### Potential Mitigations for Positioning Attacks

If treebark wanted to provide additional protection against the positioning attack vector, here are options:

**Option 1: Block Positioning Properties (Breaking Change)**
```typescript
const BLOCKED_CSS_PROPERTIES = new Set([
  'behavior',
  '-moz-binding',
  'position',      // NEW: Block all positioning
  'z-index',       // NEW: Block z-index
  'top', 'left', 'right', 'bottom'  // NEW: Block position offsets
]);
```

**Pros:** Prevents overlay attacks entirely  
**Cons:** 
- Breaks many legitimate use cases (modals, tooltips, dropdowns, sticky headers)
- Major breaking change for existing users
- Over-constrains the library

**Option 2: Warning Mode (Non-Breaking)**
```typescript
// Warn when positioning is used with interpolated content
if (hasPositioning(style) && hasInterpolation(children)) {
  logger.warn('Positioning styles with user-controlled content may create overlay attacks');
}
```

**Pros:** Educates developers without breaking functionality  
**Cons:** 
- Doesn't prevent the attack
- May create warning fatigue
- Hard to determine "user-controlled" at template level

**Option 3: Documentation Only (Recommended)**

Add prominent security documentation:

```markdown
## Security Best Practices

### Avoid Positioning User-Controlled Content

Do not combine positioning styles with user-controlled links or content:

❌ **DANGEROUS PATTERN:**
```javascript
{
  a: {
    href: "{{userLink}}",
    style: { "position": "absolute", "z-index": "999" },
    $children: ["{{userText}}"]
  }
}
```

The user could provide a malicious link that overlays legitimate UI elements.

✅ **SAFE ALTERNATIVES:**
- Use positioning only with hardcoded content
- Use user content only with safe styles (color, font-size, etc.)
- Separate layers: position static container, user content inside without positioning
```

**Pros:** 
- No breaking changes
- Developers stay in control
- Aligns with treebark's security model

**Cons:**
- Relies on developer awareness
- No runtime enforcement

**Option 4: Separate Rendering Contexts (Complex)**

Render user-controlled content and sensitive UI elements in separate stacking contexts (separate containers or shadow roots) so they can't overlay each other.

**Pros:** Provides strong separation  
**Cons:**
- Complex to implement correctly
- Doesn't fit treebark's model (single template renders together)
- Requires developers to split their templates

### Recommended Approach

**Document the security model clearly** with emphasis on template design responsibility:

1. **Templates must be developer-controlled** - this is already the model
2. **Positioning + user-controlled links = dangerous pattern** - document this explicitly
3. **Provide safe pattern examples** - show how to use positioning safely
4. **Consider adding to docs**: A "Security Best Practices" section with common pitfalls

**Why not block positioning CSS?**
- Treebark's philosophy is to allow legitimate CSS while preventing injection
- Positioning is legitimate for many use cases (tooltips, modals, dropdowns)
- The vulnerability requires specific template patterns (positioning + user links)
- Better to educate developers than over-constrain the library

### Threat Model Assessment
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
certain attacks require control over the template structure.

### Dangerous Pattern: Positioning + User Links

**❌ DO NOT combine positioning styles with user-controlled links:**

```javascript
// VULNERABLE: User controls link destination over positioned element
const template = {
  a: {
    href: "{{userLink}}",  // User controlled
    style: {
      "position": "absolute",
      "z-index": "9999"  // Dangerous positioning
    },
    $children: ["{{userText}}"]  // User controlled
  }
};
```

This allows a malicious user to overlay their link on top of legitimate UI elements,
causing users to click the attacker's link when they think they're clicking a button.

**✅ Safe Patterns:**

```javascript
// Safe: User content without positioning
const template = {
  a: {
    href: "{{userLink}}",
    style: { "color": "blue" },  // Safe styles only
    $children: ["{{userText}}"]
  }
};

// Safe: Positioning without user-controlled links
const template = {
  div: {
    style: { "position": "absolute", "top": "10px" },
    $children: ["Close"]  // Hardcoded content
  }
};

// Safe: User content inside static container
const template = {
  div: {
    style: { "position": "relative" },  // Container positioning
    $children: [
      { a: { href: "{{userLink}}", $children: ["{{userText}}"] } }  // No positioning on user element
    ]
  }
};
```

### Safe Data Binding Patterns

**User provides values only:**
```javascript
const template = { div: { style: { color: "{{userColor}}" } } };
const data = { userColor: "red" };  // User controlled, safe
```

**Never allow user-provided templates:**
```javascript
const template = userProvidedJSON;  // ❌ NEVER DO THIS
```

If you need to render user-provided templates, consider:
- Template validation and sandboxing
- Restricted template language subset
- Server-side rendering with strict CSP
- Separate rendering contexts for sensitive UI
```

### 4. Skip Shadow DOM Implementation for Now

**Reasons:**
1. No compelling security benefit for the threat model
2. Shadow DOM doesn't prevent positioning attacks within the same shadow root
3. Treebark's current security is already strong
4. Shadow DOM adds complexity (debugging, styling, learning curve)
5. Main use case (content rendering) doesn't benefit from isolation
6. Can always add later as opt-in if user demand emerges

**Note on positioning attacks:** Shadow DOM would only help if sensitive UI and user content were in separate shadow roots, which doesn't match typical usage patterns.

---

## Conclusion

**Primary Recommendation:** Do not implement shadow DOM as default, and consider whether it's needed at all given treebark's use cases.

**Security Focus:** The key security concern is the **positioning attack vector** where user-controlled links with positioning styles can overlay legitimate UI. The solution is **developer education and documentation**, not shadow DOM.

**If implementing:**
- Make it **opt-in only** via `useShadowDOM: true` option
- Provide clear documentation on when to use it
- Consider adding block container mode as a middle ground
- **Emphasize documentation** about positioning + user-controlled links

**Recommended Path:**
- **Focus on security documentation** - especially the positioning attack vector
- Add prominent warnings about combining positioning with user-controlled links
- Provide safe pattern examples
- Consider adding a "Security Best Practices" section to docs
- Consider block container mode for semantic grouping
- Defer shadow DOM until clear user demand exists

**Key Insight:** The positioning attack is a **template design vulnerability**, not a library vulnerability. Treebark correctly allows legitimate CSS properties. The solution is educating developers about dangerous patterns, not restricting the CSS model.

The existing CSS security model is robust against injection attacks, and treebark's architecture (developer-controlled templates with user-provided data) provides appropriate separation of concerns for its primary use cases.
