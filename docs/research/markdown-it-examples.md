# Markdown-it Integration Examples

## How to Pass markdown-it as an Option in Different Contexts

This document shows concrete code examples for using markdown-it with Treebark in three different contexts:
1. Node String Rendering
2. Node DOM Rendering  
3. markdown-it-treebark Plugin

---

## 1. Node String Rendering (`renderToString`)

### Basic Example

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';

// Create and configure markdown-it instance
const md = new MarkdownIt({
  breaks: true,    // Convert \n to <br>
  linkify: true,   // Auto-link URLs
  html: false      // Escape raw HTML (security)
});

// Use with renderToString
const result = renderToString({
  template: {
    div: {
      class: 'user-comment',
      $children: [
        { h3: '{{title}}' },
        { div: '{{content}}' }  // This will be processed by markdown-it
      ]
    }
  },
  data: {
    title: 'Great Product!',
    content: 'I love this product.\n\nCheck out https://example.com for more info.'
  }
}, {
  markdown: md  // Pass markdown-it instance
});

// Output:
// <div class="user-comment">
//   <h3>Great Product!</h3>
//   <div><p>I love this product.</p><p>Check out <a href="https://example.com">https://example.com</a> for more info.</p></div>
// </div>
```

### Example with Advanced Configuration

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';

// Create markdown-it with plugins
const md = new MarkdownIt({
  html: false,        // Security: disable raw HTML
  breaks: true,       // \n → <br>
  linkify: true,      // Auto-link URLs
  typographer: true   // Smart quotes, dashes
})
  .use(emoji)
  .use(footnote);

// Address display (simple case - might not want markdown)
const address = renderToString({
  template: { div: '{{address}}' },
  data: { address: '123 Main St\nNew York, NY\n10001' }
}, {
  markdown: md
});
// Output: <div><p>123 Main St<br>New York, NY<br>10001</p></div>
// Note: Wraps in <p> tag - may not be desired for addresses

// Rich user comment (perfect for markdown)
const comment = renderToString({
  template: { div: '{{comment}}' },
  data: { 
    comment: 'Great product! :smile:\n\nVisit https://example.com\n\n**Highly recommended**' 
  }
}, {
  markdown: md
});
// Output: <div>
//   <p>Great product! 😄</p>
//   <p>Visit <a href="https://example.com">https://example.com</a></p>
//   <p><strong>Highly recommended</strong></p>
// </div>
```

### Example with Hybrid Approach (Both Options)

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ breaks: true, linkify: true });

// User can provide BOTH options - markdown takes precedence
const result = renderToString({
  template: { div: '{{text}}' },
  data: { text: 'Line 1\nLine 2\nVisit https://example.com' }
}, {
  convertNewlinesToBr: true,  // Ignored if markdown is provided
  markdown: md                 // This takes precedence
});
// Uses markdown engine, not simple br conversion
```

### Example with Selective Processing

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ breaks: true });

// Some data might benefit from markdown, some might not
const result = renderToString({
  template: {
    div: {
      $children: [
        { div: { class: 'address', $children: ['{{address}}'] } },
        { div: { class: 'comment', $children: ['{{comment}}'] } }
      ]
    }
  },
  data: {
    address: '123 Main St\nNew York, NY',  // Simple text
    comment: 'Great! Visit https://example.com'  // Rich text
  }
}, {
  markdown: md  // Applied to ALL interpolated text
});

// Challenge: Both get markdown processing
// Solution: Pre-process or use different approach for different fields
```

---

## 2. Node DOM Rendering (`renderToDOM`)

### Basic Example

```typescript
import { renderToDOM } from 'treebark';
import MarkdownIt from 'markdown-it';

// Create markdown-it instance
const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  html: false
});

// Render to DOM (browser context)
const container = document.getElementById('app');

renderToDOM({
  template: {
    div: {
      class: 'content',
      $children: [
        { h2: '{{title}}' },
        { div: '{{body}}' }
      ]
    }
  },
  data: {
    title: 'Blog Post',
    body: 'First paragraph.\n\nSecond paragraph with link: https://example.com'
  }
}, container, {
  markdown: md  // Pass markdown-it instance
});

// Result: DOM elements created with markdown-processed content
```

### Example with Event Handlers (DOM-specific)

```typescript
import { renderToDOM } from 'treebark';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ linkify: true });

// Render user-generated content with markdown
renderToDOM({
  template: {
    div: {
      class: 'user-content',
      $children: [
        { div: '{{content}}' },
        { button: { 
          id: 'submit-btn',
          $children: ['Submit']
        }}
      ]
    }
  },
  data: {
    content: 'Check out https://example.com\n\nGreat site!'
  }
}, document.getElementById('container'), {
  markdown: md
});

// Links are automatically created and clickable in the DOM
document.getElementById('submit-btn')?.addEventListener('click', () => {
  console.log('Button clicked');
});
```

### Example with Dynamic Updates

```typescript
import { renderToDOM } from 'treebark';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ breaks: true, linkify: true });

let currentComment = 'Initial comment';

function updateContent(newComment: string) {
  currentComment = newComment;
  
  renderToDOM({
    template: { div: '{{comment}}' },
    data: { comment: currentComment }
  }, document.getElementById('comment-container'), {
    markdown: md
  });
}

// Initial render
updateContent('First comment\n\nWith link: https://example.com');

// Update later
setTimeout(() => {
  updateContent('Updated comment\n\nNew link: https://another.com');
}, 2000);
```

---

## 3. markdown-it-treebark Plugin

This is where it gets interesting - using markdown-it WITH Treebark templates that themselves use markdown-it!

### Example 1: Nested Markdown Processing

```typescript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';
import { renderToString } from 'treebark';

// Create TWO markdown-it instances:
// 1. For the outer Markdown document
const outerMd = new MarkdownIt();
outerMd.use(treebarkPlugin, {
  data: { /* default data */ }
});

// 2. For inner Treebark template content
const innerMd = new MarkdownIt({
  breaks: true,
  linkify: true
});

// The Markdown document
const markdownDoc = `
# My Blog Post

This is regular markdown content.

\`\`\`treebark
{
  "template": {
    "div": {
      "class": "comment-section",
      "$children": [
        { "h3": "User Comments" },
        { "div": "{{userComment}}" }
      ]
    }
  },
  "data": {
    "userComment": "Great post!\\n\\nVisit https://example.com for more."
  }
}
\`\`\`

More markdown content here.
`;

// Render the outer markdown
const html = outerMd.render(markdownDoc);

// Problem: The userComment inside the treebark block doesn't get markdown processing!
// The outer markdown-it processes the document, treebark renders the template,
// but the userComment data is just escaped text with \n preserved.
```

### Example 2: Passing markdown-it to Treebark Plugin

```typescript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';

// Create markdown-it for text formatting
const textMd = new MarkdownIt({
  breaks: true,
  linkify: true,
  html: false
});

// Create the main markdown-it instance with treebark plugin
const md = new MarkdownIt();
md.use(treebarkPlugin, {
  // Extended plugin options to support markdown processing
  markdown: textMd,  // NEW: Pass markdown-it for text content
  data: {
    userComment: 'Great post!\n\nVisit https://example.com'
  }
});

// The Markdown document
const markdownDoc = `
# Blog Post

\`\`\`treebark
{
  "div": {
    "class": "comments",
    "$children": [
      { "div": "{{userComment}}" }
    ]
  }
}
\`\`\`
`;

const html = md.render(markdownDoc);
// Now userComment gets markdown processing (line breaks, auto-linking)
```

### Example 3: Full Stack Example

```typescript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';
import yaml from 'js-yaml';

// Create markdown-it for rich text formatting
const richTextMd = new MarkdownIt({
  html: false,      // Security
  breaks: true,     // Line breaks
  linkify: true,    // Auto-link
  typographer: true // Smart quotes
});

// Create main markdown-it with treebark plugin
const md = new MarkdownIt();
md.use(treebarkPlugin, {
  yaml: yaml,           // Enable YAML parsing
  markdown: richTextMd, // Enable markdown in data
  indent: 2,            // Pretty HTML
  data: {
    // Global data available to all treebark blocks
    siteName: 'My Blog',
    author: 'John Doe'
  }
});

// Markdown document with inline treebark templates
const document = `
---
title: My Blog Post
date: 2025-01-01
---

# {{title}}

Written by {{author}}

\`\`\`treebark
template:
  article:
    class: blog-post
    $children:
      - h2: "{{title}}"
      - div:
          class: metadata
          $children:
            - span: "By {{author}}"
            - span: "{{date}}"
      - div:
          class: content
          $children:
            - "{{content}}"
data:
  title: "Introduction to Treebark"
  author: "Jane Smith"
  date: "2025-01-01"
  content: |
    Treebark is great!
    
    Visit https://github.com/danmarshall/treebark for more.
    
    **Highly recommended** for safe HTML templating.
\`\`\`

More markdown content here.
`;

const html = md.render(document);
// The 'content' field gets:
// 1. Line breaks converted
// 2. URLs auto-linked
// 3. **bold** rendered as <strong>
```

### Example 4: Security-Focused Configuration

```typescript
import MarkdownIt from 'markdown-it';
import treebarkPlugin from 'markdown-it-treebark';
import DOMPurify from 'isomorphic-dompurify';

// Create markdown-it with strict security
const secureMd = new MarkdownIt({
  html: false,        // Don't allow raw HTML
  xhtmlOut: false,    // HTML5 mode
  breaks: true,
  linkify: true,
  typographer: true
});

// Configure link validation
secureMd.validateLink = (url: string) => {
  // Only allow http(s) URLs
  const allowedProtocols = /^(https?:)?\/\//i;
  return allowedProtocols.test(url);
};

// Main markdown-it with treebark
const md = new MarkdownIt();
md.use(treebarkPlugin, {
  markdown: secureMd,
  data: {
    // User-generated content
    userBio: 'Check out my site: https://example.com\n\nThanks!'
  },
  logger: {
    error: (msg) => console.error('[Treebark Error]', msg),
    warn: (msg) => console.warn('[Treebark Warning]', msg),
    log: (msg) => console.log('[Treebark]', msg)
  }
});

// Process user content
const userContent = `
\`\`\`treebark
{
  "div": {
    "class": "user-bio",
    "$children": ["{{userBio}}"]
  }
}
\`\`\`
`;

let html = md.render(userContent);

// Optional: Additional sanitization with DOMPurify
html = DOMPurify.sanitize(html);
```

---

## API Design Considerations

### Updated RenderOptions Type

```typescript
interface RenderOptions {
  indent?: string | number | boolean;
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
  
  // Simple line break conversion (Phase 1)
  convertNewlinesToBr?: boolean;
  
  // Markdown engine integration (Phase 2)
  markdown?: MarkdownIt | {
    engine: MarkdownIt;
    applyTo?: 'interpolations' | 'attributes' | 'none';
    unwrapParagraphs?: boolean;  // Remove <p> wrapper for inline content
  };
}
```

### Updated TreebarkPluginOptions Type

```typescript
interface TreebarkPluginOptions {
  data?: Record<string, any>;
  yaml?: { load: (content: string) => any };
  indent?: string | number | boolean;
  logger?: Logger;
  
  // NEW: Markdown processing for data
  markdown?: MarkdownIt | {
    engine: MarkdownIt;
    applyTo?: 'interpolations' | 'none';
    unwrapParagraphs?: boolean;
  };
}
```

---

## Use Case Decision Tree

### When to use each approach?

```
User needs text formatting?
│
├─ NO → Use explicit Treebark structure
│        { div: [{ br: {} }] }
│
└─ YES → What kind of content?
    │
    ├─ Simple (just line breaks)
    │   └─ Use convertNewlinesToBr: true
    │      Best for: addresses, poems, simple text
    │      No dependencies
    │
    └─ Rich (links, emphasis, lists)
        └─ Use markdown option
           Best for: user comments, blog posts, rich content
           Requires: markdown-it peer dependency
```

### Example: Choosing the Right Approach

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ breaks: true, linkify: true });

// Use Case 1: Address (simple - use convertNewlinesToBr)
renderToString({
  template: { div: '{{address}}' },
  data: { address: '123 Main St\nNew York, NY' }
}, {
  convertNewlinesToBr: true  // Simple approach, no extra <p> wrapper
});
// → <div>123 Main St<br>New York, NY</div>

// Use Case 2: User Comment (rich - use markdown)
renderToString({
  template: { div: '{{comment}}' },
  data: { comment: 'Great! See https://example.com\n\n**Amazing**' }
}, {
  markdown: md  // Full markdown processing
});
// → <div><p>Great! See <a href="...">https://example.com</a></p><p><strong>Amazing</strong></p></div>

// Use Case 3: Mixed Content (use both, markdown takes precedence)
renderToString({
  template: {
    div: [
      { div: { class: 'address', $children: ['{{address}}'] } },
      { div: { class: 'comment', $children: ['{{comment}}'] } }
    ]
  },
  data: {
    address: '123 Main St\nNew York, NY',
    comment: 'Great! https://example.com'
  }
}, {
  // Both get markdown processing (markdown takes precedence)
  // Might want per-field control in future
  markdown: md
});
```

---

## Implementation Notes

### For Node String Rendering

```typescript
// In string.ts
export function renderToString(
  input: TreebarkInput,
  options: RenderOptions = {}
): string {
  const data = input.data;
  const logger = options.logger || console;
  
  // NEW: Extract markdown engine if provided
  const markdown = options.markdown;
  
  // Pass markdown to interpolate function
  const context = {
    logger,
    markdown,
    // ... other context
  };
  
  return render(input.template, data, context);
}
```

### For Node DOM Rendering

```typescript
// In dom.ts  
export function renderToDOM(
  input: TreebarkInput,
  container: HTMLElement | DocumentFragment,
  options: RenderOptions = {}
): void {
  const logger = options.logger || console;
  const markdown = options.markdown;
  
  const context = {
    logger,
    markdown,
    // ... other context
  };
  
  const result = render(input.template, input.data, context);
  // ... append to container
}
```

### For markdown-it Plugin

```typescript
// In markdown-it-treebark/src/index.ts
export default function treebarkPlugin(md: MarkdownIt, options: TreebarkPluginOptions = {}) {
  const { data = {}, yaml, indent, logger, markdown } = options;
  
  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    
    if (info === 'treebark' || info.startsWith('treebark ')) {
      try {
        return renderTreebarkBlock(
          token.content, 
          data, 
          yaml, 
          indent, 
          logger,
          markdown  // NEW: Pass markdown engine
        ) + '\n';
      } catch (error) {
        // ... error handling
      }
    }
    
    return originalFence ? originalFence(tokens, idx, options, env, renderer) : '';
  };
}

function renderTreebarkBlock(
  content: string,
  defaultData: Record<string, any>,
  yaml?: { load: (content: string) => any },
  indent?: string | number | boolean,
  logger?: Logger,
  markdown?: MarkdownIt  // NEW parameter
): string {
  // ... parse template
  
  return renderToString(
    { template, data: finalData },
    { indent, logger, markdown }  // Pass markdown to renderToString
  );
}
```

---

## Testing Examples

### Test for String Rendering with Markdown

```typescript
import { renderToString } from 'treebark';
import MarkdownIt from 'markdown-it';

describe('renderToString with markdown', () => {
  const md = new MarkdownIt({ breaks: true, linkify: true });
  
  test('converts line breaks', () => {
    const result = renderToString({
      template: { p: '{{text}}' },
      data: { text: 'Line 1\nLine 2' }
    }, { markdown: md });
    
    expect(result).toContain('<br>');
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });
  
  test('auto-links URLs', () => {
    const result = renderToString({
      template: { div: '{{text}}' },
      data: { text: 'Visit https://example.com' }
    }, { markdown: md });
    
    expect(result).toContain('<a href="https://example.com">');
  });
});
```

---

## Migration Path

### Current (Phase 1): No markdown support
```typescript
renderToString(input);  // Plain text, no processing
```

### Phase 1: Add convertNewlinesToBr
```typescript
renderToString(input, { convertNewlinesToBr: true });
```

### Phase 2: Add markdown support
```typescript
const md = new MarkdownIt();
renderToString(input, { markdown: md });
```

### Phase 2+: Both options available
```typescript
// User chooses based on needs
renderToString(input, { convertNewlinesToBr: true });  // Simple
// OR
renderToString(input, { markdown: md });  // Rich
```

---

## Summary

The markdown-it integration can be implemented consistently across all three contexts:

1. **Node String**: Pass `markdown` in `RenderOptions` to `renderToString()`
2. **Node DOM**: Pass `markdown` in `RenderOptions` to `renderToDOM()`
3. **markdown-it Plugin**: Pass `markdown` in `TreebarkPluginOptions` to `treebarkPlugin()`

All three use the same underlying mechanism: the markdown-it instance is passed through the options and used during interpolation to process text content.
