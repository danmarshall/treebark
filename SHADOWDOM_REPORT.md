# Shadow DOM Analysis Report for Treebark

**Date:** February 8, 2026  
**Author:** GitHub Copilot  
**Issue:** Should shadow DOM be added to treebark, and if so, should it be the default?

## Executive Summary

After analyzing treebark's architecture, security model, and **critical user-generated template use case**, I recommend implementing **BOTH shadow DOM and block container options**, with **block container as the eventual default** for `renderToDOM`.

### Key Findings:

1. **Should shadow DOM be the default?** - No, **block container should be the default**
   - Block container provides stacking context isolation (prevents page overlays)
   - Maintains style inheritance (better for content rendering)
   - Simpler than shadow DOM (better developer experience)
   - Safe for both developer and user-generated templates

2. **Clickjacking attack surface** - **CRITICAL finding**: Three distinct scenarios:
   - **Scenario 1**: Template-internal overlays (education needed)
   - **Scenario 2**: Developer templates overlaying page elements (containment helps)
   - **Scenario 3**: **User-generated templates** overlaying page elements (containment MANDATORY)

3. **Alternative containment strategies** - **Block containers are the optimal solution**:
   - Provides stacking context isolation via CSS `isolation: isolate`
   - Prevents page overlay attacks
   - Maintains style inheritance
   - Better developer experience than shadow DOM
   - Should be the default in v3.0

### Critical Security Insight

**User-generated templates are a common use case** for treebark (blogs, forums, CMS, wikis). Users can store malicious templates in databases with hardcoded evil links and positioning to overlay page elements like sign-in links. **Containment is MANDATORY** for this use case - block containers or shadow DOM must be used to safely render untrusted templates.

---

## 1. Should Shadow DOM (or Block Container) Be the Default?

### Recommendation: **Block Container should be the eventual default (v3.0)**

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

**Example Attack Code (Developer-Controlled Template):**
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
```

**Attack Scenario 3: User-Generated Templates (Highest Risk - NEW CONSIDERATION)**

**Critical insight from @danmarshall:** Templates themselves can be stored in a database as user-generated content, not just developer-controlled.

**Example Attack Code (User-Controlled Template):**
```javascript
// User submits this template to database (e.g., blog post, forum comment, wiki page)
const maliciousTemplate = {
  a: { 
    href: "https://evil.com/phishing",  // Hardcoded evil link (no interpolation needed!)
    style: {
      "position": "fixed",
      "top": "0",
      "right": "0", 
      "width": "100px",
      "height": "40px",
      "z-index": "9999",
      "opacity": "0.01"
    },
    $children: ["Sign In"]
  }
};

// App retrieves and renders user's template
const userTemplate = database.getTemplate(userId);
document.getElementById('user-content').appendChild(
  renderToDOM({ template: userTemplate })
);
// Result: User's malicious template overlays the page's sign-in link
```

**Key Difference from Scenario 2:**
- **Scenario 2**: Developer writes template, user controls data values
- **Scenario 3**: **User controls the entire template structure**
  - No need for interpolation (`{{userLink}}`) - attacker hardcodes evil URL
  - Attacker has full control over positioning, z-index, opacity, dimensions
  - Can target any known page element (sign-in, buttons, forms)
  - **This is the highest risk scenario**

**Is this attack possible in treebark?**

**For Scenarios 1 & 2:**
**YES, IF the developer writes a vulnerable template** that:
1. Includes positioning styles (`position: fixed` or `position: absolute` with known coordinates)
2. Uses high `z-index` values in the template
3. Allows user-controlled link destinations via `href: "{{userLink}}"`
4. Uses dimensions/positions that target known page elements

**For Scenario 3 (User-Generated Templates):**
**YES, ALWAYS** if the application allows users to create arbitrary templates:
1. User has full control over template structure
2. Can include any positioning, z-index, opacity values
3. Can hardcode malicious links (no interpolation needed)
4. Can create invisible overlays over any known page element
5. **This completely bypasses the "template trust boundary" security model**

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

**For Scenario 2 (page overlay with developer template): YES.**

Shadow DOM **would help** prevent treebark content from overlaying host page elements because:

1. **Separate stacking context**: Shadow DOM creates a new stacking context
2. **z-index isolation**: `z-index` values inside shadow DOM are scoped to that shadow root
3. **Position containment**: Fixed/absolute positioning inside shadow DOM is relative to the shadow host

**For Scenario 3 (user-generated templates): YES - Critical Protection.**

Shadow DOM is **essential** when rendering user-generated templates:

1. **Prevents page overlay attacks** - user templates cannot position over page elements
2. **Creates containment boundary** - malicious templates confined to shadow root
3. **Mandatory for untrusted templates** - only way to safely render user-generated content

**Example comparison:**
```javascript
// User-generated malicious template
const userTemplate = {
  a: {
    href: "https://evil.com",  // Hardcoded evil link
    style: { "position": "fixed", "top": "0", "right": "0", "z-index": "9999" }
  }
};

// Without shadow DOM: Overlays page sign-in link (DANGEROUS)
document.body.appendChild(renderToDOM({ template: userTemplate }));
// Result: Evil link covers real sign-in link - ATTACK SUCCEEDS

// With shadow DOM: Confined to shadow boundary (SAFE)
document.body.appendChild(renderToDOM({ template: userTemplate }, { useShadowDOM: true }));
// Result: Evil link contained within shadow root - ATTACK PREVENTED
```

**Key Insight:** Shadow DOM provides **critical protection** for user-generated templates (Scenario 3) and meaningful protection for developer templates with user data (Scenario 2).

### Block Container Alternative (Half-Step to Shadow DOM)

**Block containers** provide a middle ground between no containment and full shadow DOM isolation:

**What is a block container?**
```javascript
// Render into a block container
const fragment = renderToDOM({ template }, { containerMode: 'block' });

// Result DOM:
// <div style="contain: content; isolation: isolate;" data-treebark-container>
//   <!-- template content here -->
// </div>
```

**CSS `contain: content` provides:**
- **Layout containment**: Element's layout doesn't affect external elements
- **Paint containment**: Rendering doesn't escape bounds
- **Style containment**: Counters and quotes are scoped

**CSS `isolation: isolate` provides:**
- **New stacking context**: Creates a stacking context boundary
- **z-index scoping**: z-index values are scoped to this container
- **Blend mode isolation**: Prevents certain blend mode effects from escaping

**Benefits of block containers:**
- ✅ **Prevents page overlay attacks** (via stacking context from `isolation: isolate`)
- ✅ **Style inheritance**: Content inherits page styles (fonts, colors, etc.)
- ✅ **Simpler than shadow DOM**: No shadow root complexity
- ✅ **Better developer experience**: Can inspect and style with normal CSS
- ✅ **Performance**: Less overhead than shadow DOM

**Limitations compared to shadow DOM:**
- ❌ **No style isolation**: Page styles can affect content (both good and bad)
- ❌ **No encapsulation**: CSS selectors from page can reach content
- ❌ **Weaker boundary**: Not as strong as shadow DOM's true isolation

**When to use each:**

| Scenario | Recommendation | Reason |
|----------|---------------|---------|
| Developer templates, trusted data | None or block container | Style inheritance useful |
| Developer templates, user data in links | Block container or shadow DOM | Prevent page overlays |
| **User-generated templates** | **Shadow DOM (mandatory)** | **Must prevent attacks** |
| Web components | Shadow DOM | Need full encapsulation |
| Content rendering | Block container | Balance of safety and usability |

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

**Revised Conclusion:** Shadow DOM's stacking context isolation **would help** prevent treebark content from overlaying host page elements. Block containers with `isolation: isolate` provide similar protection with better style inheritance.

### Threat Model Assessment (Revised)

**Low Risk Scenario (Developer Templates, No Positioning):**
- **Template**: Controlled by developer (trusted), no positioning styles
- **Data**: User-provided (untrusted)
- **Risk**: Low - users can only provide values, not structure
- **Mitigation**: None needed (safe by default)

**Medium Risk Scenario 1 (Template-Internal Overlay):**
- **Template**: Controlled by developer with positioning styles
- **Data**: User-provided (untrusted) including links and content
- **Attack**: User link overlays other template elements (Scenario 1)
- **Risk**: Medium - developer must avoid combining positioning with user-controlled links
- **Shadow DOM/Block Container**: Would NOT help (same stacking context)
- **Mitigation**: Developer education, linting rules, template review

**Medium Risk Scenario 2 (Page Element Overlay):**
- **Template**: Controlled by developer with fixed/absolute positioning
- **Data**: User-provided (untrusted) including links
- **Attack**: Template content overlays page elements like sign-in links (Scenario 2)
- **Risk**: Medium to High - can attack any known page element
- **Shadow DOM/Block Container**: **Would help** - contains positioning within boundary
- **Mitigation**: Shadow DOM or block container (recommended), or careful template design

**Critical Risk Scenario 3 (User-Generated Templates - NEW):**
- **Template**: User-provided (untrusted) - stored in database, blog posts, forums, wiki
- **Data**: User-provided (untrusted) or none
- **Attack**: User template with hardcoded evil links overlays page elements (Scenario 3)
- **Risk**: **CRITICAL** - attacker has full control over template structure
- **Examples**: Blog platforms, forums, CMS, wikis, user-generated content sites
- **Shadow DOM**: **MANDATORY** - only way to safely render untrusted templates
- **Block Container**: **MANDATORY** (minimum) - provides stacking context isolation
- **Mitigation**: Shadow DOM (strongly recommended) or block container (minimum acceptable)
- **Note**: This completely changes the security model - template trust boundary no longer exists

**Key Insight:** The user-generated template scenario (Scenario 3) is fundamentally different from the previous threat model. This is a **common use case** for treebark (blogs, forums, CMSs) and requires **mandatory containment**.

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
  // Recommended: Support both options
  useShadowDOM?: boolean;           // Default: false (backward compatible)
  useBlockContainer?: boolean;      // Default: false (backward compatible)
  // OR unified option:
  containmentMode?: 'none' | 'block' | 'shadow';  // Default: 'none'
}
```

### Recommended Approach (Completely Revised for User-Generated Templates)

**Critical Finding:** User-generated templates (Scenario 3) are a **common and expected use case** for treebark:
- Blog platforms (users write posts with treebark templates)
- Forums (users format their posts)
- CMS systems (content creators build pages)
- Wikis (users create formatted content)
- Any platform with user-generated content

**This fundamentally changes the recommendations:**

#### For User-Generated Templates (Scenario 3):

1. **Shadow DOM or Block Container is MANDATORY**
   - Cannot safely render untrusted templates without containment
   - Attacker has full control over template structure
   - No "template trust boundary" exists

2. **Recommendation Priority:**
   - **First choice**: Shadow DOM (strongest isolation)
   - **Acceptable**: Block container with `isolation: isolate` (good balance)
   - **Unacceptable**: No containment (vulnerable to page overlay attacks)

3. **Implementation Approach:**
   ```typescript
   // For user-generated content
   const userTemplate = database.getTemplate(userId);
   
   // REQUIRED: Use shadow DOM or block container
   const fragment = renderToDOM(
     { template: userTemplate },
     { useShadowDOM: true }  // or useBlockContainer: true
   );
   ```

4. **Documentation Requirements:**
   - **Prominent warning**: Never render user templates without containment
   - **Default recommendation**: Use shadow DOM for user-generated content
   - **Block container option**: Available for apps that need style inheritance
   - **Clear examples**: Show safe patterns for each scenario

#### For Developer-Controlled Templates (Scenarios 1 & 2):

1. **Shadow DOM or Block Container is RECOMMENDED** (not mandatory)
2. **Opt-in initially** to maintain backward compatibility
3. **Strongly recommend** for templates with user-controlled links
4. **Document safe patterns** for developers who choose not to use containment

#### Implementation Strategy:

**Phase 1: Add Both Options (Backward Compatible)**
```typescript
interface RenderOptions {
  useShadowDOM?: boolean;        // Default: false
  useBlockContainer?: boolean;   // Default: false
  // ... existing options
}
```

**Phase 2: Document Security Model**
- **Mandatory section**: "Rendering User-Generated Templates"
- **Warning**: Must use shadow DOM or block container for untrusted templates
- **Examples**: Show all three scenarios with appropriate mitigations

**Phase 3: Consider Making Block Container Default (v3.0)**
- Block container provides good balance of safety and usability
- Less breaking than shadow DOM (style inheritance maintained)
- Prevents most dangerous attacks (page overlays)
- Can still opt-out with `containmentMode: 'none'`

**Why Block Container as Default Makes Sense:**
- ✅ Prevents page overlay attacks (Scenarios 2 & 3)
- ✅ Maintains style inheritance (better UX for content rendering)
- ✅ Simpler than shadow DOM (easier to debug and style)
- ✅ Good default for both developer and user-generated templates
- ✅ Can opt-in to shadow DOM for stronger isolation
- ✅ Can opt-out for trusted developer-only scenarios

**Why documentation alone is insufficient:**
- User-generated templates are a common use case
- Page overlay attacks are hard to detect during template review
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

### Safe Patterns for User-Generated Templates

**❌ NEVER render user templates without containment:**
```javascript
const userTemplate = database.getTemplate(userId);
const fragment = renderToDOM({ template: userTemplate });  // DANGEROUS!
document.body.appendChild(fragment);
```

**✅ ALWAYS use shadow DOM or block container for user templates:**
```javascript
const userTemplate = database.getTemplate(userId);

// Option 1: Shadow DOM (recommended - strongest isolation)
const fragment = renderToDOM(
  { template: userTemplate },
  { useShadowDOM: true }
);

// Option 2: Block container (acceptable - good balance)
const fragment = renderToDOM(
  { template: userTemplate },
  { useBlockContainer: true }  // or containmentMode: 'block'
);
```

### Safe Data Binding Patterns (Developer Templates)

**User provides values only:**
```javascript
const template = { div: { style: { color: "{{userColor}}" } } };
const data = { userColor: "red" };  // User controlled, safe
```

```

### 4. Implement Both Shadow DOM and Block Container (Critical Recommendation)

**Reasons to implement BOTH options:**

1. **User-generated templates require containment** - common use case (blogs, forums, CMS)
2. **Block container is best default** - balances safety and usability
3. **Shadow DOM for maximum isolation** - available when needed
4. **Backward compatibility** - both start as opt-in

**Implementation approach:**

**Phase 1: Add Both Features (v2.x)**
```typescript
interface RenderOptions {
  useShadowDOM?: boolean;        // Default: false
  useBlockContainer?: boolean;   // Default: false
  // OR unified:
  containmentMode?: 'none' | 'block' | 'shadow';  // Default: 'none'
}
```

**Phase 2: Make Block Container Default (v3.0)**
```typescript
interface RenderOptions {
  containmentMode?: 'none' | 'block' | 'shadow';  // Default: 'block'
}
```

**Rationale for Block Container as Default:**
- Prevents page overlay attacks (Scenarios 2 & 3)
- Maintains style inheritance (better for content rendering)
- Simpler than shadow DOM (easier debugging, styling)
- Safe for both developer and user-generated templates
- Can opt-in to shadow DOM or opt-out to none

**Documentation Requirements:**

1. **Prominent security warning**:
   > ⚠️ **CRITICAL**: When rendering user-generated templates (from databases, user input, etc.), you **MUST** use `useShadowDOM: true` or `useBlockContainer: true`. Without containment, malicious templates can overlay page elements like sign-in links.

2. **Clear decision tree**:
   - User-generated templates? → Shadow DOM (recommended) or block container (minimum)
   - Developer templates with user data? → Block container (recommended) or shadow DOM
   - Trusted developer templates only? → No containment needed (but block container is safer)

3. **Examples for each scenario** with security implications explained

**Note on limitations:** Shadow DOM and block containers prevent page overlay attacks (Scenarios 2 & 3) but not template-internal overlays (Scenario 1). Documentation and safe template patterns still needed.

---

## Conclusion

**Completely Revised Recommendation:** Implement **BOTH shadow DOM and block container** options, with block container as eventual default.

### Key Findings (Completely Revised)

**Three Distinct Attack Scenarios:**

1. **Template-Internal Overlay (Lower Risk)**
   - User link overlays other elements within the same template
   - Requires developer to create vulnerable template pattern
   - Shadow DOM/block container doesn't help (same stacking context)
   - Mitigation: Developer education

2. **Page Element Overlay - Developer Template (Higher Risk)**
   - Developer template with user data overlays page elements (e.g., sign-in links)
   - More dangerous because attack target is outside template
   - Shadow DOM/block container helps by creating stacking context isolation

3. **Page Element Overlay - User-Generated Template (CRITICAL RISK - NEW)**
   - **User-generated templates** can overlay page elements with hardcoded evil links
   - **Common use case**: Blogs, forums, CMS, wikis, user-generated content platforms
   - Attacker has full control over template structure
   - **Shadow DOM or block container is MANDATORY** - only way to safely render
   - This completely changes the security model and recommendations

### Revised Recommendation

**Phase 1: Implement Both Options (v2.x - Backward Compatible)**

1. **Add both `useShadowDOM` and `useBlockContainer` options** (both default: false)
2. **Document CRITICAL security requirement** for user-generated templates
3. **Provide clear decision tree** for choosing containment mode
4. **Show examples** for all three scenarios

**Phase 2: Make Block Container Default (v3.0)**

1. **Change default** to `containmentMode: 'block'`
2. **Reason**: Safely handles most use cases including user-generated templates
3. **Allows opt-out** for trusted developer-only scenarios
4. **Allows opt-in** to shadow DOM for stronger isolation

**Why Block Container as Default:**
- ✅ Prevents page overlay attacks (Scenarios 2 & 3)
- ✅ Safe for user-generated templates
- ✅ Maintains style inheritance (better for content rendering)
- ✅ Simpler than shadow DOM (easier debugging, styling)
- ✅ Good balance of security and usability
- ✅ Can still opt-in to shadow DOM or opt-out to none

**Security Documentation Focus:**

1. **CRITICAL WARNING** for user-generated templates:
   > ⚠️ When rendering user-generated templates, you **MUST** use containment. Without it, malicious templates can overlay page elements like sign-in links.

2. **Clear decision tree**:
   - User-generated templates? → **Shadow DOM (best)** or block container (minimum acceptable)
   - Developer templates + user data? → Block container (recommended) or shadow DOM
   - Trusted developer templates? → No containment needed (but block container safer as default)

3. **Document all three scenarios** with examples and security implications

4. **Explain containment options**:
   - Shadow DOM: Strongest isolation, no style inheritance
   - Block container: Good isolation with style inheritance (recommended default)
   - None: Only for trusted developer templates

**Implementation Priority:**

1. ✅ **CRITICAL**: Implement block container option (minimum acceptable protection)
2. ✅ **HIGH**: Implement shadow DOM option (maximum protection)
3. ✅ **HIGH**: Add comprehensive security documentation with CRITICAL warnings
4. ✅ **MEDIUM**: Make block container default in v3.0
5. ⚠️ **LOW**: Consider CSS property blocking (too restrictive, not recommended)

**Key Insight:** The user-generated template scenario (Scenario 3) is a **common and expected use case** for treebark. This requires rethinking the security model from "templates are trusted" to "templates may be untrusted." Block containers provide an excellent balance of security and usability, making them the right default for v3.0.

**Block Container vs Shadow DOM Trade-offs:**

| Feature | Block Container | Shadow DOM |
|---------|----------------|------------|
| Prevents page overlays | ✅ Yes | ✅ Yes |
| Style inheritance | ✅ Yes | ❌ No |
| Developer experience | ✅ Easy | ⚠️ Complex |
| Debugging | ✅ Easy | ⚠️ Harder |
| Suitable for user templates | ✅ Yes | ✅ Yes |
| Suitable for content rendering | ✅ Yes | ⚠️ Limited |
| Recommended default | ✅ Yes | ❌ No |

The existing CSS security model is robust against injection attacks. Adding block containers as the default (with shadow DOM available) provides strong protection against positioning-based overlay attacks while maintaining usability for content rendering use cases.
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
