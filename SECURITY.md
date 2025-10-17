# Security Considerations

## Style Attribute Security

Treebark provides comprehensive security through its design:
- ✅ **Escapes HTML** in interpolated values (prevents `<script>` injection)
- ✅ **Validates tag names** (prevents `<script>` tags)
- ✅ **Validates attribute names** (prevents `onclick`, `onerror`, etc.)
- ✅ **Structured style objects** with format validation (prevents CSS injection)

### Style Attribute Implementation

Treebark requires the `style` attribute to be a **structured object** rather than a string. This provides security by design:

**Security Features:**
- Uses generic property validation (any kebab-case CSS property allowed)
- Blocks dangerous properties: `behavior`, `-moz-binding`
- Blocks dangerous value patterns: `url()` with external URIs, `javascript:`, `expression()`, `@import`
- Allows safe `url(data:...)` for inline resources
- Property names must be in kebab-case format (e.g., `"font-size"`, not `"fontSize"`)
- Future-proof: new CSS properties work automatically without code updates

**Example - Correct Usage:**
```json
{
  "div": {
    "style": {
      "color": "red",
      "font-size": "14px",
      "padding": "10px"
    },
    "$children": ["Styled content"]
  }
}
```

### Best Practices

When using Treebark with user-generated content or untrusted data:

1. **Use CSS Classes** - Prefer CSS classes over inline styles when possible
2. **Validate User Input** - If allowing users to control style values, validate them before passing to Treebark
3. **Content Security Policy (CSP)** - Consider using CSP headers for additional protection:
   - `style-src 'self'` to prevent inline styles entirely
   - `style-src 'unsafe-inline'` with nonces for controlled inline styles

### References

- [OWASP CSS Injection](https://owasp.org/www-community/attacks/CSS_Injection)
- [CSS Injection Attacks](https://x-c3ll.github.io/posts/CSS-Injection-Primitives/)
- [Scriptless Attacks](http://www.segmentationfault.fr/publications/mario_heiderich_-_scriptless_attacks_cutting_edge_xss.pdf)
