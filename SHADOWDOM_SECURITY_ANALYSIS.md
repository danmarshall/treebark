# Shadow DOM & Containment Strategy for Treebark

**Author:** GitHub Copilot  
**Date:** February 8, 2026

## Executive Summary

**Recommendation:** Implement both **shadow DOM** and **block container** options, with block container as the default in v3.0.

**Key Finding:** Treebark templates can be user-generated content (blogs, forums, CMS). Without containment, malicious templates can overlay page elements like sign-in links. Block containers provide the optimal balance of security and usability.

## Three Attack Scenarios

### Scenario 1: Template-Internal Overlay
**Risk:** Low  
**Example:** User link overlays another element within the same template  
**Mitigation:** Developer education  
**Containment helps?** No (same stacking context)

### Scenario 2: Page Overlay - Developer Template
**Risk:** Medium-High  
**Example:** Developer template with user data overlays page sign-in link  
**Mitigation:** Containment recommended  
**Containment helps?** Yes (stacking context isolation)

### Scenario 3: Page Overlay - User Template
**Risk:** Critical  
**Example:** User-generated template with hardcoded evil link overlays page elements  
**Attack:** `{ a: { href: "https://evil.com", style: { "position": "fixed", "top": "0", "right": "0", "z-index": "9999" } } }`  
**Use cases:** Blogs, forums, wikis, CMS platforms  
**Mitigation:** Containment **mandatory**  
**Containment helps?** Yes (essential for safe rendering)

## Solution Comparison

| Feature | None | Block Container | Shadow DOM |
|---------|------|----------------|------------|
| Prevents page overlays | ❌ | ✅ | ✅ |
| Style inheritance | ✅ | ✅ | ❌ |
| Developer experience | ✅ | ✅ | ⚠️ |
| Safe for user templates | ❌ | ✅ | ✅ |
| Best for content rendering | ✅ | ✅ | ❌ |

## Block Container Approach

**Implementation:**
```javascript
// Uses CSS: contain: content + isolation: isolate
renderToDOM({ template }, { useBlockContainer: true });
```

**Benefits:**
- Creates stacking context boundary (prevents page overlays)
- Maintains style inheritance (fonts, colors, etc.)
- Simpler than shadow DOM (normal CSS debugging)
- Safe for both developer and user-generated templates

**How it prevents attacks:**
CSS `isolation: isolate` creates a new stacking context. Positioned elements with `z-index` inside the container cannot escape to overlay page elements.

## Recommendation Timeline

### Phase 1: v2.x (Backward Compatible)
Add opt-in options:
```typescript
interface RenderOptions {
  useBlockContainer?: boolean;  // default: false
  useShadowDOM?: boolean;        // default: false
}
```

### Phase 2: v3.0 (Secure by Default)
Make block container the default:
```typescript
interface RenderOptions {
  containmentMode?: 'none' | 'block' | 'shadow';  // default: 'block'
}
```

## Usage Guidelines

**User-generated templates (Scenario 3):**
- **Required:** Shadow DOM or block container
- **Recommended:** Shadow DOM for maximum isolation
- **Minimum:** Block container

**Developer templates with user data (Scenario 2):**
- **Recommended:** Block container
- **Alternative:** Shadow DOM if style isolation needed

**Trusted developer templates (Scenario 1):**
- **Optional:** No containment needed
- **Safer:** Block container as default (prevents accidental vulnerabilities)

## Documentation Requirements

### Critical Warning
> ⚠️ **SECURITY**: When rendering user-generated templates, you **MUST** use containment. Without it, malicious templates can overlay page elements.

### Decision Tree
1. **Are templates user-generated?** (database, user input, CMS)
   - Yes → Use shadow DOM or block container (mandatory)
   - No → Proceed to 2

2. **Do templates include user-controlled links?**
   - Yes → Use block container (recommended)
   - No → No containment needed (but block container safer as default)

3. **Need complete style isolation?**
   - Yes → Use shadow DOM
   - No → Use block container

## Key Insight

The critical security issue isn't CSS injection (already well-protected) but **positioning-based overlay attacks** when templates are untrusted. User-generated templates are a common use case for treebark, requiring containment to be safe by default.

## Why Block Container Over Shadow DOM as Default?

1. **Usability:** Maintains style inheritance (essential for content rendering)
2. **Simplicity:** Standard CSS debugging tools work
3. **Security:** Prevents page overlay attacks
4. **Flexibility:** Can opt-in to shadow DOM or opt-out to none
5. **Common case:** Most treebark usage is content rendering, not web components

---

**Bottom Line:** Implement both options. Make block container the default. Document the security requirements clearly.
