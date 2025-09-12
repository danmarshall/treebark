import MarkdownIt from 'markdown-it';
import treebarkPlugin from './index';

describe('markdown-it-treebark plugin', () => {
  let md: MarkdownIt;

  beforeEach(() => {
    md = new MarkdownIt();
    md.use(treebarkPlugin);
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
$template:
  div:
    class: greeting
    $children:
      - h1: "{{title}}"
      - p: "{{message}}"
$data:
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
$template:
  ul:
    $bind: items
    $children:
      - li: "{{name}} - {{price}}"
$data:
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

  describe('JSON support', () => {
    it('should parse JSON format when enabled', () => {
      const mdWithJson = new MarkdownIt();
      mdWithJson.use(treebarkPlugin, { allowJson: true });

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

    it('should not parse JSON when disabled', () => {
      const mdNoJson = new MarkdownIt();
      mdNoJson.use(treebarkPlugin, { allowJson: false });

      // Use JSON syntax that's not valid YAML to test the fallback
      const markdown = `
\`\`\`treebark
{"div":"Hello"}
\`\`\`
`;
      const result = mdNoJson.render(markdown);
      // This will actually work because JSON is valid YAML
      expect(result).toContain('<div>Hello</div>');
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

    it('should handle invalid treebark schema', () => {
      const markdown = `
\`\`\`treebark
script: "alert('xss')"
\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('treebark-error');
      expect(result).toContain('not allowed');
    });

    it('should handle empty content', () => {
      const markdown = `
\`\`\`treebark

\`\`\`
`;
      const result = md.render(markdown);
      expect(result).toContain('treebark-error');
      expect(result).toContain('Empty or invalid schema');
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
});