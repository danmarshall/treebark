# Research: Converting Newlines to `<br>` Tags in Treebark

## Executive Summary

This document researches the feasibility, security implications, and desirability of automatically converting newline characters (`\n`) to HTML `<br>` tags in the Treebark templating system.

**Recommendation**: Implement as opt-in feature (disabled by default)

## 1. Current Behavior

### How Treebark Currently Handles Newlines

Currently, Treebark preserves newlines as-is in text content:

```javascript
// Input
{ template: { p: 'Line 1\nLine 2' } }

// Output
<p>Line 1
Line 2</p>
```

In HTML rendering, these newlines collapse to a single space per HTML spec, so the visual output is:
```
Line 1 Line 2
```

## 2. Is It Feasible?

### Technical Feasibility: YES

Converting newlines to `<br>` tags is technically straightforward:

```typescript
// Simple replacement
text.replace(/\r?\n|\r/g, '<br>')
```

**Note**: Must use `/\r?\n|\r/g` to handle all platform line endings (Unix, Windows, Old Mac).

### Implementation Points
1. The `br` tag is already whitelisted in Treebark
2. Would need to modify the text interpolation function
3. Should only apply to text content, not attributes
4. Can be implemented as an opt-in option

## 3. Is It a Security Issue?

### Security Analysis: NO (if implemented correctly)

**Key Security Considerations**:

1. **XSS Risk: NONE**
   - The `<br>` tag is already whitelisted
   - It's a void element (self-closing, no content)
   - Cannot contain JavaScript or dangerous attributes

2. **Injection Risk: NONE (with proper implementation)**
   - Must ensure newlines are converted AFTER escaping
   - Correct order: escape(text) → convert newlines to `<br>`
   
3. **CORRECT Implementation**:
```typescript
// SAFE: Escape first, then convert
export function interpolate(tpl, data, escapeHtml = true, convertNewlines = false) {
  // ... get value ...
  let result = String(val);
  
  if (escapeHtml) {
    result = escape(result); // Escape dangerous characters FIRST
  }
  
  if (convertNewlines) {
    result = result.replace(/\r?\n|\r/g, '<br>'); // Then convert newlines
  }
  
  return result;
}
```

4. **INCORRECT Implementation** (security risk):
```typescript
// UNSAFE: Converting before escaping would allow injection
result = result.replace(/\r?\n|\r/g, '<br>'); // If user input contains <script>\n tags
result = escape(result); // This would escape the <br> we just added
```

### Security Conclusion
✅ **SAFE** if implemented correctly (escape first, then convert newlines)
❌ **UNSAFE** if newlines are converted before HTML escaping

## 4. Is It Unwanted, Unneeded, or Unexpected?

### User Expectations Analysis

**Arguments that it IS unwanted/unexpected**:

1. **Markdown Compatibility**
   - In Markdown, a single newline doesn't create a line break
   - Requires two spaces + newline or two newlines for `<br>`
   - Auto-conversion breaks this expectation

2. **HTML Behavior**
   - Raw HTML collapses whitespace by default
   - Users expect standard HTML behavior
   - Treebark aims to be a "safe HTML" system

3. **Breaking Change**
   - Would change existing behavior
   - Could break existing templates
   - Not backward compatible

4. **Explicit is Better**
   - If users want line breaks, they can use `{ br: {} }`
   - Explicit `<br>` tags make intent clear
   - Auto-conversion is "magic" behavior

**Arguments that it IS wanted/needed**:

1. **Common Use Case**
   - Users often want to preserve line breaks from data
   - Addresses, poems, formatted text need line breaks
   - Currently requires manual `<br>` insertion

2. **User-Friendly**
   - Intuitive for non-technical users
   - Matches behavior of many CMS systems
   - "What you type is what you see"

3. **Data-Driven Content**
   - When binding data with `{{variable}}`, users expect visual preservation
   - Multi-line text from databases should render as multi-line

### Real-World Examples

**Example 1: Address Display**
```javascript
// Current behavior (broken)
{ 
  template: { div: '{{address}}' },
  data: { address: '123 Main St\nNew York, NY\n10001' }
}
// Output: <div>123 Main St New York, NY 10001</div>
// Visual: All on one line

// With newline conversion (desired)
// Output: <div>123 Main St<br>New York, NY<br>10001</div>
// Visual: Three lines as expected
```

## 5. Is It Desirable and Unsurprising?

### Context Matters

**For Template Authors (writing templates):** 
- **Unexpected** - They control the structure and can add `{ br: {} }` explicitly
- **Not desirable** - Adds implicit behavior

**For Data Providers (providing content):**
- **Expected** - Data with newlines should render with line breaks
- **Desirable** - Makes the system more intuitive

### Similar Systems Comparison

1. **Markdown** - Does NOT auto-convert single newlines
2. **Handlebars** - Does NOT auto-convert newlines
3. **React** - Does NOT auto-convert newlines (requires explicit `<br>`)
4. **WordPress** - DOES auto-convert (wpautop function)
5. **Textile/Redmine** - DOES auto-convert newlines

### Pattern: Content vs. Structure Systems

**Structure Systems** (Treebark, React, HTML): NO auto-conversion
- Focus on explicit structure
- Authors control presentation

**Content Systems** (WordPress, many CMSs): YES auto-conversion
- Focus on user-friendly content entry
- Automatic formatting

## 6. Recommendations

### Primary Recommendation: OPT-IN FEATURE

**Recommended Implementation**:

```typescript
interface RenderOptions {
  convertNewlinesToBr?: boolean; // default: false
}

// Usage
renderToString(
  { template: { p: '{{description}}' } },
  { convertNewlinesToBr: true }
)
```

### Why NOT Make It Default

1. **Breaking Change** - Would break existing templates
2. **Principle of Least Surprise** - HTML doesn't do this by default
3. **Treebark Philosophy** - Explicit structure, not magic formatting
4. **Markdown Context** - Often used in Markdown, where single newlines are ignored

## 7. Conclusion

### Answers to Research Questions

1. **Is it feasible?** ✅ YES - Technically straightforward to implement

2. **Is it a security issue?** ✅ NO - Safe if implemented correctly (escape before conversion)

3. **Is it unwanted, unneeded, unexpected?**
   - **Unwanted:** Somewhat - breaks explicit structure principle
   - **Unneeded:** Partially - workarounds exist
   - **Unexpected:** YES - deviates from HTML and similar systems

4. **Is it desirable and unsurprising?**
   - **Desirable:** For data-driven content, YES
   - **Unsurprising:** Only for content-focused users, NOT for structure-focused users

### Final Verdict

**IMPLEMENT AS OPT-IN FEATURE**

The feature should be:
- ✅ Available as an option
- ✅ Disabled by default
- ✅ Only applied to interpolated data ({{...}})
- ✅ Clearly documented
- ✅ Tested for security

This provides flexibility for users who need it while preserving the current behavior for existing users.

### Implementation Priority

**LOW-MEDIUM** - Nice to have, but not critical
- Workarounds exist (explicit `{ br: {} }` tags)
- Use case is real but not universal
- Should be opt-in to avoid breaking changes
