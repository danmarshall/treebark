import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const productCardTemplate = {
  div: {
    class: "product-card",
    $children: [
      { h2: "{{name}}" },
      { img: { src: "{{image}}", alt: "{{name}}" } },
      { p: "{{description}}" },
      { div: { class: "price", $children: ["{{price}}"] } },
      { a: { href: "{{link}}", class: "btn", $children: ["Learn More"] } }
    ]
  }
};

export const productCard: MarkdownExample = {
  templates: { productCard: productCardTemplate },
  markdown: `# Product Showcase

Here's a product card rendered with treebark:

${treebark(productCardTemplate)}

## Features

- Dynamic content with data binding
- Clean HTML output
- Safe rendering`,
  data: {
    name: 'Gaming Laptop',
    description: 'High-performance laptop for gaming and development',
    price: '$1,299',
    image: 'https://via.placeholder.com/300x200',
    link: '#product'
  }
};
