# Research: Converting Newlines to `<br>` Tags

This directory contains comprehensive research on the feasibility, security, and desirability of automatically converting newline characters to `<br>` tags in Treebark templates.

## Research Questions

1. **Is it feasible?** → ✅ YES
2. **Is it a security issue?** → ✅ NO (with correct implementation)
3. **Is it unwanted/unexpected?** → ⚠️ MIXED (context-dependent)
4. **Is it desirable?** → ⚙️ CONDITIONAL (depends on use case)

## Executive Summary

**Recommendation**: Implement as **opt-in feature** (disabled by default)

**Proposed API**:
```typescript
interface RenderOptions {
  convertNewlinesToBr?: boolean;  // default: false
}
```

**Critical Implementation Detail**: Must use `/\r?\n|\r/g` to handle all platform line endings (Unix, Windows, Old Mac), not just `/\n/g`.

## Documents

### Core Research (Newline Conversion)

1. **[newline-br-research.md](./newline-br-research.md)** (Main Research)
   - Current behavior analysis
   - Technical feasibility study
   - Security analysis (XSS prevention)
   - User expectations and use cases
   - Implementation recommendations
   - **Conclusion**: Feasible and safe as opt-in feature

2. **[markdown-engine-integration.md](./markdown-engine-integration.md)** ⭐ **NEW: Alternative Approach**
   - Analysis of accepting markdown-it instance in RenderOptions
   - Comparison: Direct implementation vs markdown engine delegation
   - Pros/cons of leveraging existing markdown ecosystem
   - Use case analysis (when to use which approach)
   - **Conclusion**: Implement BOTH - simple `convertNewlinesToBr` for basic cases, markdown engine for rich content

3. **[comparison-systems.md](./comparison-systems.md)** (Cross-System Analysis)
   - 10+ systems compared (HTML, React, WordPress, Markdown, etc.)
   - Structure-focused vs Content-focused philosophies
   - Design pattern analysis
   - When auto-conversion is appropriate
   - **Conclusion**: Treebark aligns with structure-focused systems (opt-in)

4. **[proof-of-concept.md](./proof-of-concept.md)** (Implementation PoC)
   - Three implementation approaches
   - Security examples (correct vs incorrect order)
   - Real-world usage scenarios
   - Files that need modification
   - **Conclusion**: Simple implementation, ~5-8 hours effort

4. **[test-suite.md](./test-suite.md)** (Comprehensive Tests)
   - 30+ test cases across 9 categories
   - Security/XSS prevention (critical)
   - Backward compatibility tests
   - Edge case coverage
   - **Conclusion**: Thoroughly testable

### Extended Research (Line Ending Types)

5. **[whitespace-entities-analysis.md](./whitespace-entities-analysis.md)**
   - Analysis of all whitespace/special characters
   - Line breaks: LF, CRLF, CR, Unicode separators
   - Horizontal whitespace: tabs, spaces, NBSP
   - Security: control character injection
   - **Conclusion**: Must handle Windows CRLF to avoid double `<br>`

6. **[line-ending-implementation.md](./line-ending-implementation.md)**
   - Correct regex pattern: `/\r?\n|\r/g`
   - Platform-specific handling (Windows, Unix, Mac)
   - Additional test cases
   - Real-world examples with Windows data
   - **Conclusion**: Cross-platform compatibility critical

### Extended Research (Other HTML Tags)

7. **[html-tags-analysis.md](./html-tags-analysis.md)**
   - Should we consider tags beyond `<br>`?
   - Analysis of `<a>` (auto-linking), `<p>` (paragraphs), etc.
   - Why Markdown-like syntax is out of scope
   - Security considerations for each tag type
   - Future feature roadmap
   - **Conclusion**: Focus on `<br>` for this PR, consider others as separate features

### Demonstrations (Executable)

8. **[visual-demonstration.md](./visual-demonstration.md)**
   - Before/after examples
   - Address display, poems, product specs
   - Security demonstrations
   - Comparison: simple vs correct implementation

9. **[line-ending-demo.js](./line-ending-demo.js)** ✅ Executed
   - Shows Unix, Windows, Old Mac line endings
   - Demonstrates WRONG vs CORRECT implementations
   - Hex byte inspection
   - Security tests with different line endings

10. **[tag-options-demo.js](./tag-options-demo.js)** ✅ Executed
    - Visual comparison of different tag options
    - Real-world examples (comments, addresses, poems)
    - Feature comparison table
    - Implementation phases

### Summary

11. **[EXECUTIVE-SUMMARY.md](./EXECUTIVE-SUMMARY.md)**
    - Quick reference guide
    - Decision matrix (scored 4.3/5)
    - Risk analysis with mitigations
    - Complete implementation plan
    - Next steps

## Key Findings

### 1. Line Ending Types (Critical)

**Must handle all three types**:
- Unix/Linux/Mac: `\n` (LF)
- Windows: `\r\n` (CRLF) - must produce **single** `<br>`, not double!
- Old Mac: `\r` (CR)

**Correct pattern**: `/\r?\n|\r/g`

Using only `/\n/g` breaks on Windows systems (leaves `\r` in output).

### 2. Security (Safe with Correct Order)

**CORRECT implementation**:
```typescript
// 1. Escape HTML first
result = escape(userInput);
// 2. Then convert line breaks
result = result.replace(/\r?\n|\r/g, '<br>');
```

**WRONG implementation** (would escape the `<br>` we add):
```typescript
// DON'T DO THIS
result = userInput.replace(/\r?\n|\r/g, '<br>');
result = escape(result);  // Breaks the <br> tags!
```

### 3. Scope (Just `<br>` for Now)

**This PR**: Line breaks only (`<br>`)

**Future consideration** (as separate features):
- Auto-linking URLs (`<a>`) - High user value, needs security validation
- Smart paragraphs (`<p>`) - Better semantics, potential conflicts
- Smart typography - Polish, low priority

**Out of scope**:
- Markdown-like syntax (`*emphasis*`, `- lists`) - Conflicts with markdown-it-treebark
- Other formatting - Use explicit structure instead

### 4. Alternative Approach: Markdown Engine Integration (NEW)

**Instead of implementing features directly, accept markdown-it instance**:

```typescript
interface RenderOptions {
  markdown?: MarkdownIt;  // Delegate to markdown engine
}
```

**Benefits**:
- Leverages mature, well-tested library (markdown-it)
- Gets auto-linking, paragraphs, typography, etc. for free
- Users control configuration and plugins
- No feature duplication

**Trade-offs**:
- Adds dependency (markdown-it as peer dependency)
- More complex setup for users
- May be overkill for simple cases

**Recommendation**: Implement BOTH approaches
- `convertNewlinesToBr` - Simple, no dependencies, covers 80% of cases
- `markdown` option - Power users, rich content, full markdown ecosystem

See [markdown-engine-integration.md](./markdown-engine-integration.md) for full analysis.

### 4. Use Cases

**Good for**:
- User-generated content (comments, reviews)
- Formatted data (addresses, contact info)
- Literary content (poems, verses)
- Data import/migration

**Not good for**:
- Developer-written templates (can use explicit `{ br: {} }`)
- Code examples (need literal newlines)
- Markdown integration (conflicts with Markdown rules)
- Precise layout control

## Implementation Roadmap

### Phase 1: Line Breaks (This PR)
- ✅ Research complete
- ⏳ Implementation pending
- Convert `\n`, `\r\n`, `\r` → `<br>`
- Opt-in: `convertNewlinesToBr: boolean`
- Effort: 5-8 hours
- Risk: Low

### Phase 2: Auto-Linking (Future)
- Convert URLs → `<a href="...">`
- Requires security validation
- Effort: 10-15 hours
- Risk: Medium

### Phase 3: Smart Paragraphs (Future)
- Convert `\n\n` → `</p><p>`
- Context-aware logic needed
- Effort: 8-12 hours
- Risk: Medium

### Phase 4: Typography (Future)
- Smart quotes, em dashes, ellipsis
- Effort: 5-8 hours
- Risk: Low

## Total Research Output

- **Documents**: 11 files
- **Size**: ~108 KB
- **Test Cases**: 30+ comprehensive tests
- **Demonstrations**: 2 executable scripts (both successfully run)
- **Systems Analyzed**: 10+ (HTML, React, WordPress, Markdown, etc.)
- **Security Analysis**: Complete (XSS prevention, validation requirements)

## Decision Factors

| Factor | Score (1-5) |
|--------|-------------|
| Technical Feasibility | ⭐⭐⭐⭐⭐ |
| Security Safety | ⭐⭐⭐⭐⭐ |
| User Demand | ⭐⭐⭐ |
| Philosophy Alignment | ⭐⭐⭐⭐ |
| Implementation Cost | ⭐⭐⭐⭐ |
| **Overall Score** | **4.3/5** |

**Verdict**: APPROVE as opt-in feature

## References

- WordPress wpautop function (auto-paragraph)
- React JSX (no auto-conversion, explicit structure)
- Markdown specification (two spaces + newline = `<br>`)
- HTML whitespace collapse behavior
- Unicode line separator characters (U+2028, U+2029)
- XSS prevention best practices
- OWASP security guidelines for text formatting

## Authors

Research conducted by GitHub Copilot Agent  
Date: November 2025
