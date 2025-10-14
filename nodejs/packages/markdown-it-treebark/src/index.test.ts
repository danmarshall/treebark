import MarkdownIt from 'markdown-it';
import treebarkPlugin from './index';
import yaml from 'js-yaml';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('markdown-it-treebark plugin', () => {
  let md: MarkdownIt;

  beforeEach(() => {
    md = new MarkdownIt();
    md.use(treebarkPlugin, { yaml });
  });

  describe('Basic functionality', () => {
    it('should render simple treebark block', () => {
      const markdown = `
\`\`\`treebark
div: "Hello world"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div>Hello world</div>');
    });

    it('should render treebark block with attributes', () => {
      const markdown = `
\`\`\`treebark
div:
  class: greeting
  id: hello
  $children:
    - "Hello world"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div class="greeting" id="hello">Hello world</div>');
    });

    it('should render nested elements', () => {
      const markdown = `
\`\`\`treebark
div:
  $children:
    - h1: "Title"
    - p: "Content"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div><h1>Title</h1><p>Content</p></div>');
    });

    it('should render shorthand array syntax', () => {
      const markdown = `
\`\`\`treebark
div:
  - h1: "Title"
  - p: "Content"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div><h1>Title</h1><p>Content</p></div>');
    });
  });

  describe('Template with data', () => {
    it('should render self-contained template with data', () => {
      const markdown = `
\`\`\`treebark
template:
  div:
    class: greeting
    $children:
      - h1: "{{title}}"
      - p: "{{message}}"
data:
  title: "Welcome"
  message: "Hello treebark!"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div class="greeting"><h1>Welcome</h1><p>Hello treebark!</p></div>');
    });

    it('should render with default data context', () => {
      const mdWithData = new MarkdownIt();
      mdWithData.use(treebarkPlugin, {
        yaml,
        data: { name: 'Alice', greeting: 'Hello' }
      });

      const markdown = `
\`\`\`treebark
div: "{{greeting}} {{name}}!"
\`\`\`
`;
      const result = mdWithData.render(markdown);
      expect(result).toContain('<div>Hello Alice!</div>');
    });
  });

  describe('Binding', () => {
    it('should render list binding', () => {
      const markdown = `
\`\`\`treebark
template:
  ul:
    $bind: items
    $children:
      - li: "{{name}} - {{price}}"
data:
  items:
    - name: "Laptop"
      price: "$999"
    - name: "Phone"
      price: "$499"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<ul><li>Laptop - $999</li><li>Phone - $499</li></ul>');
    });
  });

  describe('Format configuration', () => {
    it('should support both YAML and JSON when yaml lib is provided', () => {
  const markdown = `
\`\`\`treebark
div: "Hello YAML"
\`\`\`
`;
  const result = md.render(markdown);
  expect(result).toContain('<div>Hello YAML</div>');

  const jsonMarkdown = `
\`\`\`treebark
{"div": "Hello JSON"}
\`\`\`
`;
  const jsonResult = md.render(jsonMarkdown);
  expect(jsonResult).toContain('<div>Hello JSON</div>');
    });

    it('should support JSON-only mode (no yaml lib)', () => {
  const mdJsonOnly = new MarkdownIt();
  mdJsonOnly.use(treebarkPlugin); // no yaml

  const jsonMarkdown = `
\`\`\`treebark
{"div": "Hello JSON"}
\`\`\`
`;
  const result = mdJsonOnly.render(jsonMarkdown);
  expect(result).toContain('<div>Hello JSON</div>');
    });

    it('should error on YAML input if no yaml lib', () => {
  const mdNoYaml = new MarkdownIt();
  mdNoYaml.use(treebarkPlugin); // no yaml

  const yamlMarkdown = `
\`\`\`treebark
div: "Hello YAML"
\`\`\`
`;
  const result = mdNoYaml.render(yamlMarkdown);
  expect(result).toContain('treebark-error');
  expect(result).toContain('Failed to parse as JSON');
    });
  });

  describe('JSON support', () => {
    it('should parse JSON format (always enabled)', () => {
      const mdWithJson = new MarkdownIt();
      mdWithJson.use(treebarkPlugin); // no yaml

      const markdown = `
\`\`\`treebark
{
  "div": {
    "class": "json-block",
    "$children": ["Hello from JSON"]
  }
}
\`\`\`
`;
      const result = mdWithJson.render(markdown);
      expect(result).toContain('<div class="json-block">Hello from JSON</div>');
    });

    it('should parse complex JSON template with data', () => {
      const mdWithJson = new MarkdownIt();
      mdWithJson.use(treebarkPlugin); // no yaml

      const markdown = `
\`\`\`treebark
{
  "template": {
    "ul": {
      "class": "product-list",
      "$bind": "products",
      "$children": [
        { "li": "{{name}} - {{price}}" }
      ]
    }
  },
  "data": {
    "products": [
      { "name": "Laptop", "price": "$999" },
      { "name": "Phone", "price": "$499" }
    ]
  }
}
\`\`\`
`;
      const result = mdWithJson.render(markdown);
      expect(result).toContain('<ul class="product-list"><li>Laptop - $999</li><li>Phone - $499</li></ul>');
    });

    it('should parse JSON shorthand array syntax', () => {
      const mdWithJson = new MarkdownIt();
      mdWithJson.use(treebarkPlugin); // no yaml

      const markdown = `
\`\`\`treebark
{
  "div": [
    { "h1": "Quick Layout" },
    { "p": "Using JSON shorthand syntax" }
  ]
}
\`\`\`
`;
      const result = mdWithJson.render(markdown);
      expect(result).toContain('<div><h1>Quick Layout</h1><p>Using JSON shorthand syntax</p></div>');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid YAML gracefully', () => {
      const markdown = `
\`\`\`treebark
div: [
  invalid: yaml: content
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('treebark-error');
      expect(result).toContain('Treebark Error:');
    });

    it('should handle invalid treebark template', () => {
      const markdown = `
\`\`\`treebark
script: "alert('xss')"
\`\`\`
`;
      // With no-throw policy, invalid tags are logged to console and render as empty
      // The error is not thrown, so no error div is shown
      const result = md.render(markdown);
      expect(result).toBe('\n');
    });

    it('should handle empty content', () => {
      const markdown = `
\`\`\`treebark

\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('treebark-error');
      expect(result).toContain('Empty or invalid template');
    });

    it('should error on YAML input if no yaml lib', () => {
      const mdNoYaml = new MarkdownIt();
      mdNoYaml.use(treebarkPlugin); // no yaml

      const yamlMarkdown = `
\`\`\`treebark
div: "Hello YAML"
\`\`\`
`;
      const result = mdNoYaml.render(yamlMarkdown);
      expect(result).toContain('treebark-error');
      expect(result).toContain('Failed to parse as JSON');
    });
  });

  describe('Non-treebark blocks', () => {
    it('should not affect regular code blocks', () => {
      const markdown = `
\`\`\`javascript
console.log("Hello world");
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<code');
      expect(result).toContain('console.log(&quot;Hello world&quot;);');
      expect(result).not.toContain('treebark-error');
    });

    it('should not affect unspecified language blocks', () => {
      const markdown = `
\`\`\`
plain code block
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<code');
      expect(result).toContain('plain code block');
      expect(result).not.toContain('treebark-error');
    });
  });

  describe('Indent functionality', () => {
    it('should render with indentation when indent option is provided', () => {
      const mdWithIndent = new MarkdownIt();
      mdWithIndent.use(treebarkPlugin, { yaml, indent: true });

      const markdown = `
\`\`\`treebark
div:
  class: card
  $children:
    - h2: "Product Card"
    - p: "A simple card component"
\`\`\`
`;
      const result = mdWithIndent.render(markdown);
      expect(result).toContain('<div class="card">\n  <h2>Product Card</h2>\n  <p>A simple card component</p>\n</div>');
    });

    it('should render with custom indentation', () => {
      const mdWithCustomIndent = new MarkdownIt();
      mdWithCustomIndent.use(treebarkPlugin, { yaml, indent: 4 });

      const markdown = `
\`\`\`treebark
div:
  $children:
    - h1: "Header"
\`\`\`
`;
      const result = mdWithCustomIndent.render(markdown);
      expect(result).toContain('<div>\n    <h1>Header</h1>\n</div>');
    });

    it('should render without indentation by default', () => {
      const markdown = `
\`\`\`treebark
div:
  class: card
  $children:
    - h2: "Product Card"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('<div class="card"><h2>Product Card</h2></div>');
    });
  });
});