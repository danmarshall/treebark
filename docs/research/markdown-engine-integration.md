# Markdown Engine Integration Analysis

## Question: Should Treebark Accept a Markdown Engine Instance?

**Context**: Instead of implementing text formatting features (like newline-to-`<br>` conversion) directly in Treebark, consider accepting a markdown-it instance in RenderOptions to delegate markdown processing.

---

## Proposed API

```typescript
import MarkdownIt from 'markdown-it';

interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  
  // NEW: Accept markdown engine
  markdown?: MarkdownIt | {
    render: (text: string) => string;
  };
}

// Usage
const md = new MarkdownIt();
renderToString(
  { template: { div: '{{content}}' } },
  { markdown: md }
);
```

---

## Analysis: Pros and Cons

### ✅ Advantages

#### 1. **Separation of Concerns**
- Treebark focuses on structure (JSON/YAML → HTML tree)
- Markdown engine focuses on text formatting
- Clean architectural boundary

#### 2. **User Control**
- Users configure markdown-it with their preferred plugins
- Choose markdown flavor (GFM, CommonMark, etc.)
- Full control over markdown features

#### 3. **No Feature Duplication**
- Don't reimplement what markdown-it already does well
- Line breaks: markdown-it handles `<br>` with breaks plugin
- Links: markdown-it auto-links URLs
- Typography: markdown-it has smartquotes plugin
- Lists, emphasis, etc.: all built-in

#### 4. **Consistency with Existing Ecosystem**
- Treebark already has markdown-it-treebark plugin
- Users already familiar with markdown-it
- Leverages mature, well-tested library

#### 5. **Extensibility**
- Users can add any markdown-it plugins
- Custom renderers
- Syntax extensions (emoji, footnotes, etc.)

#### 6. **No Breaking Changes**
- Optional feature (if not provided, no markdown processing)
- Existing behavior unchanged
- Backward compatible

---

### ❌ Disadvantages

#### 1. **Added Dependency**
- Makes markdown-it a peer dependency
- Increases bundle size (if included)
- May not be needed for simple use cases

#### 2. **API Complexity**
- Users need to configure markdown-it separately
- Learning curve for markdown-it configuration
- More setup required

#### 3. **Potential Confusion**
- When should users use markdown vs explicit structure?
- What happens if template already has HTML?
- Mixing paradigms might be unclear

#### 4. **Performance**
- Markdown parsing adds overhead
- May be unnecessary for simple text

#### 5. **Double-Processing Risk**
- Template: `{ div: '{{content}}' }`
- Data: `{ content: '**bold**' }`
- If already in markdown context via markdown-it-treebark...
- Could get double-processed

---

## Use Case Analysis

### Use Case 1: User-Generated Content (Comments, Reviews)

**Current Proposal**: `convertNewlinesToBr: true`
```typescript
renderToString({
  template: { div: '{{comment}}' },
  data: { comment: 'Great product!\n\nWorks well.' }
}, { convertNewlinesToBr: true });

// Output: <div>Great product!<br><br>Works well.</div>
```

**Markdown Engine Approach**:
```typescript
const md = new MarkdownIt();
renderToString({
  template: { div: '{{comment}}' },
  data: { comment: 'Great product!\n\nWorks well.' }
}, { markdown: md });

// Output: <div><p>Great product!</p><p>Works well.</p></div>
```

**Comparison**:
- ✅ Markdown gives better semantics (`<p>` tags)
- ✅ Markdown handles all formatting (links, emphasis, etc.)
- ❌ More overhead for simple case
- ❌ Requires markdown-it configuration

---

### Use Case 2: Address Display

**Current Proposal**: `convertNewlinesToBr: true`
```typescript
renderToString({
  template: { div: '{{address}}' },
  data: { address: '123 Main St\nNew York, NY\n10001' }
}, { convertNewlinesToBr: true });

// Output: <div>123 Main St<br>New York, NY<br>10001</div>
```

**Markdown Engine Approach**:
```typescript
const md = new MarkdownIt({ breaks: true });
renderToString({
  template: { div: '{{address}}' },
  data: { address: '123 Main St\nNew York, NY\n10001' }
}, { markdown: md });

// Output: <div><p>123 Main St<br>New York, NY<br>10001</p></div>
```

**Comparison**:
- ⚠️ Markdown wraps in `<p>` (may not be desired for addresses)
- ✅ Handles line breaks correctly with `breaks: true`
- ❌ Extra `<p>` wrapper adds complexity

**Better for this case**: Simple `convertNewlinesToBr` without markdown

---

### Use Case 3: Rich User Content (Blog Comment with Links)

**Current Proposal**: Not supported (would need future auto-linking feature)
```typescript
renderToString({
  template: { div: '{{comment}}' },
  data: { comment: 'Check out https://example.com for more info.' }
}, { convertNewlinesToBr: true });

// Output: <div>Check out https://example.com for more info.</div>
// URL not clickable
```

**Markdown Engine Approach**:
```typescript
const md = new MarkdownIt({ linkify: true });
renderToString({
  template: { div: '{{comment}}' },
  data: { comment: 'Check out https://example.com for more info.' }
}, { markdown: md });

// Output: <div><p>Check out <a href="https://example.com">https://example.com</a> for more info.</p></div>
```

**Comparison**:
- ✅✅ Markdown handles auto-linking out of the box
- ✅ Security validated by markdown-it
- ✅ No need to implement ourselves
- ⚠️ Wraps in `<p>` tag

**Better for this case**: Markdown engine

---

### Use Case 4: Poetry/Formatted Text

**Current Proposal**: `convertNewlinesToBr: true`
```typescript
renderToString({
  template: { blockquote: '{{poem}}' },
  data: { poem: 'Roses are red\nViolets are blue' }
}, { convertNewlinesToBr: true });

// Output: <blockquote>Roses are red<br>Violets are blue</blockquote>
```

**Markdown Engine Approach**:
```typescript
const md = new MarkdownIt({ breaks: true });
renderToString({
  template: { blockquote: '{{poem}}' },
  data: { poem: 'Roses are red\nViolets are blue' }
}, { markdown: md });

// Output: <blockquote><p>Roses are red<br>Violets are blue</p></blockquote>
```

**Comparison**:
- ⚠️ Extra `<p>` wrapper may not be desired
- ✅ Handles line breaks
- ❌ More complexity than needed

**Better for this case**: Simple `convertNewlinesToBr` without markdown

---

## Markdown-it Configuration Examples

### Basic Setup
```typescript
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

renderToString(input, { markdown: md });
```

### With Line Breaks (like convertNewlinesToBr)
```typescript
const md = new MarkdownIt({ breaks: true });
// Converts \n → <br> inside paragraphs
```

### With Auto-Linking
```typescript
const md = new MarkdownIt({ linkify: true });
// Auto-converts URLs to <a> tags
```

### With Smart Typography
```typescript
const md = new MarkdownIt({ typographer: true });
// Smart quotes, dashes, ellipses
```

### Full-Featured
```typescript
const md = new MarkdownIt({
  html: false,        // Escape HTML (security)
  breaks: true,       // Convert \n to <br>
  linkify: true,      // Auto-link URLs
  typographer: true   // Smart typography
});
```

### With Plugins
```typescript
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';

const md = new MarkdownIt()
  .use(emoji)
  .use(footnote);

renderToString(input, { markdown: md });
```

---

## Implementation Approach

### Option 1: Apply Markdown to Interpolated Values Only

```typescript
export function interpolate(
  tpl: string, 
  data: Data, 
  escapeHtml = true,
  markdown?: MarkdownIt,
  parents: Data[] = [], 
  logger?: Logger
): string {
  return tpl.replace(/\{\{([^{]*?)\}\}/g, (match, expr) => {
    const val = getProperty(data, expr.trim(), parents, logger);
    if (val == null) return "";
    
    let result = String(val);
    
    // If markdown engine provided, use it
    if (markdown) {
      result = markdown.render(result);
      // markdown-it returns <p>wrapped</p> - may need to unwrap
      result = result.replace(/^<p>(.*)<\/p>\s*$/s, '$1');
    } else if (escapeHtml) {
      // Otherwise escape as before
      result = escape(result);
    }
    
    return result;
  });
}
```

**Issues**:
- Markdown wraps in `<p>` tags - need to unwrap?
- Escaping behavior changes (markdown does its own)
- May not be what users expect

---

### Option 2: Separate Markdown Processing Step

```typescript
interface RenderOptions {
  markdown?: MarkdownIt;
  markdownKeys?: string[];  // Only process these data keys
}

// Before rendering, process markdown-enabled data
function processMarkdownData(data: Data, options: RenderOptions): Data {
  if (!options.markdown || !options.markdownKeys) {
    return data;
  }
  
  const processed = { ...data };
  for (const key of options.markdownKeys) {
    if (key in processed) {
      processed[key] = options.markdown.render(String(processed[key]));
    }
  }
  return processed;
}
```

**Usage**:
```typescript
renderToString({
  template: { div: '{{content}}' },
  data: { content: 'Text with **bold**' }
}, {
  markdown: md,
  markdownKeys: ['content']
});
```

**Pros**:
- Explicit control over what gets markdown processing
- No surprises
- Clean separation

**Cons**:
- More configuration
- Users need to specify keys

---

### Option 3: Markdown as a Filter/Helper

```typescript
interface RenderOptions {
  helpers?: {
    markdown: (text: string) => string;
  };
}

// Usage in template
{
  template: {
    div: {
      $children: [
        { $helpers: { markdown: '{{content}}' } }
      ]
    }
  }
}
```

**Cons**:
- Requires new template syntax
- More complex

---

## Interaction with markdown-it-treebark Plugin

**Current**: markdown-it-treebark lets you use Treebark templates INSIDE Markdown

```markdown
# My Blog Post

Here's some markdown content.

```treebark
{
  "div": {
    "class": "card",
    "$children": [
      { "h2": "{{title}}" },
      { "p": "{{description}}" }
    ]
  }
}
```

More markdown content.
```

**Proposed**: RenderOptions with markdown engine lets you use Markdown INSIDE Treebark

```typescript
renderToString({
  template: {
    div: {
      class: 'card',
      $children: [
        { h2: '{{title}}' },
        { div: '{{markdownContent}}' }  // This gets markdown processing
      ]
    }
  }
}, { markdown: md });
```

**Relationship**:
- These are complementary, not competing
- markdown-it-treebark: Markdown → HTML with Treebark for structure
- Proposed feature: Treebark → HTML with Markdown for text content
- Different use cases, different directions

**Potential Confusion**:
- Users might not understand when to use which
- Documentation needs to be very clear
- May lead to double-processing if not careful

---

## Recommendation: Hybrid Approach

### Phase 1: Simple Line Break Conversion (Original Proposal)
```typescript
interface RenderOptions {
  convertNewlinesToBr?: boolean;  // Simple, focused feature
}
```

**Use when**:
- Simple line break preservation needed
- Addresses, poems, simple formatted text
- No markdown complexity required

### Phase 2: Markdown Engine Support (New Proposal)
```typescript
interface RenderOptions {
  convertNewlinesToBr?: boolean;
  markdown?: {
    engine: MarkdownIt;
    applyTo?: 'interpolations' | 'none';  // Default: 'interpolations'
  };
}
```

**Use when**:
- Rich text content needs formatting
- Want auto-linking, emphasis, lists, etc.
- User-generated content with markdown

### Rules:
1. If `markdown` provided, it takes precedence over `convertNewlinesToBr`
2. If neither provided, no processing (current behavior)
3. Clear documentation on when to use each

---

## Security Considerations

### Markdown-it Security
**Pros**:
- Mature library with security focus
- `html: false` option prevents raw HTML
- Sanitizes dangerous content
- Well-tested against XSS

**Cons**:
- Another dependency to keep updated
- Security is only as good as markdown-it's configuration
- Users must configure correctly

### Recommended Config for Security
```typescript
const md = new MarkdownIt({
  html: false,      // Disable raw HTML (security)
  xhtmlOut: false,  // Use HTML5
  breaks: true,     // Line breaks
  linkify: true,    // Auto-link (safe)
  typographer: true // Typography (safe)
});

// Additional security: validate and sanitize markdown-it output
```

---

## Documentation Needed

### 1. When to Use What

**Use explicit structure**:
```typescript
{ div: [
  { h1: 'Title' },
  { p: 'Content' }
]}
```
- When you control the structure
- Developer-written templates
- Precise layout needed

**Use convertNewlinesToBr**:
```typescript
{ div: '{{address}}' }
// Options: { convertNewlinesToBr: true }
```
- Simple line break preservation
- Addresses, short formatted text
- No rich formatting needed

**Use markdown engine**:
```typescript
{ div: '{{userComment}}' }
// Options: { markdown: md }
```
- Rich user-generated content
- Need links, emphasis, lists
- Want full markdown features

### 2. Markdown-it Configuration Guide

Provide examples for common scenarios:
- Basic setup
- Security-focused config
- Feature-rich config
- Plugin usage

### 3. Relationship with markdown-it-treebark

Clear explanation:
- markdown-it-treebark: Use Treebark IN Markdown
- RenderOptions.markdown: Use Markdown IN Treebark
- When to use each
- How they complement each other

---

## Comparison: Direct Implementation vs Markdown Engine

| Feature | Direct Implementation | Markdown Engine |
|---------|---------------------|-----------------|
| **Line breaks** | ✅ Simple regex | ✅ Built-in with `breaks` |
| **Auto-linking** | ⏳ Need to implement | ✅ Built-in with `linkify` |
| **Paragraphs** | ⏳ Need to implement | ✅ Built-in |
| **Emphasis** | ❌ Out of scope | ✅ Built-in |
| **Lists** | ❌ Out of scope | ✅ Built-in |
| **Smart typography** | ⏳ Could implement | ✅ Built-in with `typographer` |
| **Security** | ✅ Our responsibility | ✅ markdown-it's responsibility |
| **Bundle size** | ✅ Minimal | ❌ Adds dependency |
| **Configuration** | ✅ Simple boolean | ❌ Requires markdown-it setup |
| **Flexibility** | ❌ Limited to what we implement | ✅ Full markdown ecosystem |
| **Learning curve** | ✅ Low | ❌ Need to learn markdown-it |

---

## Final Recommendation

### Implement BOTH

1. **Simple feature for simple cases**: `convertNewlinesToBr`
   - Low barrier to entry
   - Solves 80% of cases
   - No dependencies
   - Phase 1

2. **Markdown engine for complex cases**: `markdown` option
   - Power users who need it
   - Leverages existing ecosystem
   - Full feature set
   - Phase 2

### API Design

```typescript
interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  
  // Phase 1: Simple line break conversion
  convertNewlinesToBr?: boolean;
  
  // Phase 2: Full markdown support (takes precedence if provided)
  markdown?: MarkdownIt | {
    engine: MarkdownIt;
    applyTo?: 'interpolations' | 'none';
    unwrapParagraphs?: boolean;  // Remove <p> wrapper
  };
}
```

### Priority Rules
1. If `markdown` provided → use markdown engine
2. Else if `convertNewlinesToBr` → simple conversion
3. Else → no processing (current behavior)

### Why Both?
- **Simplicity**: Most users don't need full markdown
- **Power**: Users who need it get full markdown ecosystem
- **No forced dependency**: Can use Treebark without markdown-it
- **Clear upgrade path**: Start simple, add markdown if needed

---

## Conclusion

**Yes, accepting a markdown-it instance is a good idea** - BUT:

1. **Don't replace simple line break conversion** - keep it as lightweight option
2. **Make markdown optional** - don't force dependency
3. **Clear documentation** - explain when to use which approach
4. **Phase approach** - implement simple feature first, add markdown support later
5. **Complementary to markdown-it-treebark** - different use cases, both valid

The markdown engine approach is **better for rich content** but **overkill for simple cases**. Supporting both gives users the right tool for their needs.
