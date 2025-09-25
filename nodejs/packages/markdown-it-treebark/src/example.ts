// Simple example demonstrating the markdown-it-treebark plugin
import MarkdownIt from 'markdown-it';
import treebarkPlugin from './index';
import yaml from 'js-yaml';

const md = new MarkdownIt();
md.use(treebarkPlugin, {
  yaml,
  data: {
    siteName: 'Treebark Demo',
    version: '1.0.0'
  }
});

const markdown = `
# {{siteName}} Documentation

Welcome to the treebark markdown-it plugin demonstration.

## Basic Example

\`\`\`treebark
div:
  class: welcome-card
  $children:
    - h2: "Hello {{siteName}}!"
    - p: "Version {{version}} is now available."
    - a:
        href: "#features"
        $children:
          - "Learn about features →"
\`\`\`

## Product Showcase

\`\`\`treebark
template:
  div:
    class: product-grid
    $children:
      - h3: "Featured Products"
      - div:
          class: products
          $bind: products
          $children:
            - div:
                class: product-card
                $children:
                  - img:
                      src: "{{image}}"
                      alt: "{{name}}"
                  - h4: "{{name}}"
                  - p: "{{description}}"
                  - div:
                      class: price
                      $children:
                        - "{{price}}"
data:
  products:
    - name: "Treebark Core"
      description: "Safe template rendering for Markdown"
      price: "Free"
      image: "/images/core.png"
    - name: "Treebark Pro"
      description: "Advanced features and support"
      price: "$29/month"
      image: "/images/pro.png"
\`\`\`

## Array Fragment Example

\`\`\`treebark
- div:
    class: header
    $children:
      - "Header Content"
- main:
    class: content
    $children:
      - "Main Content"
- footer:
    class: footer
    $children:
      - "Footer Content"
\`\`\`

Regular markdown continues to work normally:

- Bullet points
- **Bold text**
- *Italic text*
- \`inline code\`

\`\`\`javascript
// Regular code blocks are unaffected
console.log("This is JavaScript");
\`\`\`
`;

console.log('=== Markdown Input ===');
console.log(markdown);
console.log('\n=== HTML Output ===');
console.log(md.render(markdown));

export { md, markdown };