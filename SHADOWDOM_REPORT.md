# Shadow DOM Analysis Report for Treebark

**Date:** February 8, 2026  
**Author:** GitHub Copilot  
**Issue:** Should shadow DOM be added to treebark, and if so, should it be the default?

## Executive Summary

After analyzing treebark's architecture, security model, and positioning attack vectors, I recommend **implementing shadow DOM as an opt-in security feature** for `renderToDOM`. This report examines three key areas:

1. **Should shadow DOM be the default?** - No initially (backward compatibility), but strongly recommended for user-controlled content
2. **Clickjacking attack surface** - **Critical finding**: Treebark content can overlay page elements like sign-in links; shadow DOM provides meaningful protection
3. **Alternative containment strategies** - Block containers offer style inheritance but don't prevent page overlay attacks

**Key Security Insight:** Shadow DOM creates stacking context isolation that prevents treebark-rendered content from overlaying host page elements (e.g., sign-in links, buttons). This is a meaningful security benefit that wasn't fully appreciated in the initial analysis.

---

## 1. Should Shadow DOM Be the Default?

### Recommendation: **Opt-in initially, strongly recommended for security**

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

**Attack Scenario 1: Overlaying Elements Within Template**

A malicious hyperlink or text content is absolutely positioned to cover another element in the same template, causing users to click the malicious link when they think they're clicking the legitimate button.

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
```

**Attack Scenario 2: Overlaying Host Page Elements (More Serious)**

A treebark template with user-controlled content is positioned to overlay **existing page elements** like a well-known sign-in link at the top right of the page.

**Example Attack Code:**
```javascript
// Page has a sign-in link at top right
// <nav style="position: fixed; top: 0; right: 0;">
//   <a href="/signin">Sign In</a>
// </nav>

// Developer renders treebark template with user content
const template = {
  a: { 
    href: "{{userLink}}",  // User controls destination
    style: {
      "position": "fixed",      // Fixed positioning to overlay page elements
      "top": "0",
      "right": "0", 
      "width": "100px",
      "height": "40px",
      "z-index": "9999",        // High z-index to appear above page elements
      "opacity": "0.01"         // Nearly invisible
    },
    $children: ["Sign In"]      // Mimics legitimate link text
  }
};

// Attacker provides malicious link
const attackData = {
  userLink: "https://evil.com/phishing"
};

// Rendered content overlays the real sign-in link
document.getElementById('user-content').appendChild(
  renderToDOM({ template, data: attackData })
);
```

**Is this attack possible in treebark?**

**YES, IF the developer writes a vulnerable template** that:
1. Includes positioning styles (`position: fixed` or `position: absolute` with known coordinates)
2. Uses high `z-index` values in the template
3. Allows user-controlled link destinations via `href: "{{userLink}}"`
4. Uses dimensions/positions that target known page elements

**Critical Difference from Scenario 1:**

- **Scenario 1** (template-internal): Developer must explicitly create a vulnerable pattern within their template
- **Scenario 2** (page overlay): Developer's template can attack **any page element**, not just template content
  - More dangerous because the attack target is outside the template
  - Harder to detect during template review
  - Can target well-known UI patterns (sign-in links, buttons, etc.)

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

**For Scenario 1 (template-internal overlay): No.**

Shadow DOM provides style **isolation**, not **positioning constraints**. Elements inside shadow DOM can still use `position: absolute` and `z-index` to overlay other shadow DOM content.

**For Scenario 2 (page overlay): YES, partially.**

Shadow DOM **would help** prevent treebark content from overlaying host page elements because:

1. **Separate stacking context**: Shadow DOM creates a new stacking context
2. **z-index isolation**: `z-index` values inside shadow DOM are scoped to that shadow root
3. **Position containment**: Fixed/absolute positioning inside shadow DOM is relative to the shadow host

**Example with shadow DOM:**
```javascript
// Without shadow DOM: Can overlay page elements
document.body.appendChild(renderToDOM({
  template: {
    a: {
      style: { "position": "fixed", "top": "0", "right": "0", "z-index": "9999" },
      href: "{{userLink}}"
    }
  }
}));
// Result: Can overlay the page's sign-in link

// With shadow DOM: Cannot overlay page elements (confined to shadow root)
document.body.appendChild(renderToDOM({
  template: { /* same template */ }
}, { useShadowDOM: true }));
// Result: Positioning is scoped to shadow root container, cannot reach page elements
```

**Key Insight:** Shadow DOM would provide **meaningful protection** against the page overlay attack (Scenario 2) by containing positioned elements within the shadow boundary.

### Shadow DOM's Impact on Clickjacking

**Shadow DOM provides:**
- Style isolation (external styles don't affect shadow content)
- **Stacking context isolation** (z-index scoped to shadow root)
- **Position containment** (fixed/absolute positioning relative to shadow host)
- Protection against shadow content overlaying page elements

**Shadow DOM does NOT prevent:**
- Elements within the same shadow root from overlaying each other (Scenario 1)
- Malicious styles defined in the treebark template itself
- Template design vulnerabilities where developer combines positioning with user links

**Revised Conclusion:** Shadow DOM's stacking context isolation **would help** prevent treebark content from overlaying host page elements. This is a more compelling security benefit than previously assessed.

### Threat Model Assessment

**Low Risk Scenario (Current Model, No Positioning):**
- **Template**: Controlled by developer (trusted), no positioning styles
- **Data**: User-provided (untrusted)
- **Risk**: Low - users can only provide values, not structure

**Medium Risk Scenario 1 (Positioning Within Template):**
- **Template**: Controlled by developer with positioning styles
- **Data**: User-provided (untrusted) including links and content
- **Attack**: User link overlays other template elements (Scenario 1)
- **Risk**: Medium - developer must avoid combining positioning with user-controlled links
- **Shadow DOM**: Would NOT help (same stacking context)
- **Mitigation**: Developer education, linting rules, template review

**Medium Risk Scenario 2 (Positioning That Could Target Page):**
- **Template**: Controlled by developer with fixed/absolute positioning
- **Data**: User-provided (untrusted) including links
- **Attack**: Template content overlays page elements like sign-in links (Scenario 2)
- **Risk**: Medium to High - can attack any known page element
- **Shadow DOM**: **Would help** - contains positioning within shadow boundary
- **Mitigation**: Shadow DOM (recommended), or careful template design

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

**Option 3: Documentation Only**

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
    style: { "position": "fixed", "top": "0", "right": "0", "z-index": "999" },
    $children: ["{{userText}}"]
  }
}
```

The user could provide a malicious link that overlays legitimate page elements (like sign-in links).

✅ **SAFE ALTERNATIVES:**
- Use positioning only with hardcoded content
- Use user content only with safe styles (color, font-size, etc.)
- Use shadow DOM to contain positioning within shadow boundary
- Separate layers: position static container, user content inside without positioning
```

**Pros:** 
- No breaking changes
- Developers stay in control
- Aligns with treebark's security model

**Cons:**
- Relies on developer awareness
- No runtime enforcement
- Doesn't protect against page overlay attacks

**Option 4: Shadow DOM as Security Default (Recommended for User Content)**

Enable shadow DOM by default when rendering user-controlled content to prevent overlay attacks on host page.

**Pros:** 
- Provides strong protection against page overlay attacks (Scenario 2)
- Creates stacking context isolation
- Contains positioning within shadow boundary
- Still allows positioning for legitimate use cases

**Cons:**
- Changes default behavior (but could be opt-out)
- Adds wrapper element
- May affect existing apps if made default
- Doesn't prevent template-internal overlays (Scenario 1)

**Compromise Approach:**
```typescript
interface RenderOptions {
  useShadowDOM?: boolean;  // Default: false (backward compatible)
  // OR
  containmentMode?: 'none' | 'shadow';  // Default: 'none'
}
```

### Recommended Approach (Revised)

**Given the page overlay attack vector, shadow DOM becomes more attractive:**

1. **Make shadow DOM opt-in initially** to maintain backward compatibility
2. **Strongly recommend shadow DOM** in documentation for templates with user-controlled links
3. **Document both attack scenarios** clearly:
   - Scenario 1: Template-internal overlays (education needed)
   - Scenario 2: Page element overlays (shadow DOM solves this)
4. **Provide clear guidance** on when to use shadow DOM
5. **Consider making shadow DOM default** in a future major version

**Why shadow DOM is now more compelling:**
- Prevents the more dangerous attack (page overlay)
- Creates a security boundary between treebark content and host page
- Positioning remains usable within the shadow boundary
- Aligns with web components best practices

**Why documentation alone is insufficient:**
- Page overlay attacks are harder to detect during template review
- Attack targets (sign-in links, etc.) are outside the template
- Easy for developers to overlook the risk
- Runtime protection is more reliable than developer vigilance

### Revised Threat Model Assessment
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

// Safe: Use shadow DOM to contain positioning
const fragment = renderToDOM({
  template: {
    a: {
      href: "{{userLink}}",
      style: { "position": "fixed", "top": "0", "right": "0" },
      $children: ["{{userText}}"]
    }
  },
  data: userData
}, { useShadowDOM: true });  // Prevents overlay of page elements
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

### 4. Implement Shadow DOM as Opt-In Security Feature (Revised Recommendation)

**Reasons to implement:**
1. **Prevents page overlay attacks** - the most dangerous attack vector
2. Shadow DOM creates stacking context isolation
3. Contains positioning within shadow boundary
4. Enables safe use of positioning with user-controlled content
5. Aligns with web components security best practices

**Implementation approach:**
- **Opt-in initially** via `useShadowDOM: true` option (backward compatible)
- **Strongly recommend** in docs for templates with user-controlled links
- **Document both attack scenarios** clearly
- **Consider making default** in future major version

**Note on limitations:** Shadow DOM prevents page overlay attacks (Scenario 2) but not template-internal overlays (Scenario 1). Both documentation and shadow DOM are needed.

---

## Conclusion

**Revised Recommendation:** Implement shadow DOM as an **opt-in security feature** to protect against page overlay attacks.

### Key Findings (Revised)

**Two Distinct Attack Scenarios:**

1. **Template-Internal Overlay (Lower Risk)**
   - User link overlays other elements within the same template
   - Requires developer to create vulnerable template pattern
   - Shadow DOM doesn't help (same stacking context)
   - Mitigation: Developer education

2. **Page Element Overlay (Higher Risk)**
   - Treebark content overlays existing page elements (e.g., sign-in links)
   - More dangerous because attack target is outside template
   - Harder to detect during template review
   - **Shadow DOM DOES help** by creating stacking context isolation

### Revised Recommendation

**Implement shadow DOM as opt-in initially, with strong recommendation for user-controlled content:**

1. **Add `useShadowDOM` option** to RenderOptions (default: false)
2. **Document the page overlay attack** prominently in security section
3. **Strongly recommend shadow DOM** when rendering templates with user-controlled links
4. **Provide clear examples** of both attack scenarios
5. **Consider making default** in a future major version after gathering feedback

**Security Documentation Focus:**

- **Document both attack scenarios** clearly
- **Explain when shadow DOM helps** (page overlays) vs doesn't (template-internal)
- **Provide safe template patterns** with examples
- **Add "Security Best Practices" section** to main docs
- **Warning about positioning + user links** in prominent location

**Implementation Priority:**

1. ✅ **High Priority**: Implement opt-in shadow DOM feature
2. ✅ **High Priority**: Add comprehensive security documentation
3. ⚠️ **Medium Priority**: Consider making shadow DOM default in v3.0
4. ⚠️ **Low Priority**: Block container mode (less important given shadow DOM)

**Why Shadow DOM is Now Recommended:**

- **Prevents the more dangerous attack** (page element overlay)
- Creates security boundary between treebark content and host page
- Positioning remains usable within shadow boundary
- Aligns with web components security best practices
- Runtime protection more reliable than developer vigilance alone

**Key Insight:** The page overlay attack is more serious than initially assessed. Shadow DOM provides meaningful protection by isolating the stacking context, preventing treebark content from reaching page elements. While documentation is still important for template-internal overlays, shadow DOM should be available as a security feature.

The existing CSS security model is robust against injection attacks, and adding shadow DOM support strengthens protection against positioning-based overlay attacks on the host page.
