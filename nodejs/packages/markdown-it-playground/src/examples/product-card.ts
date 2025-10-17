import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const productCard: MarkdownExample = {
  templates: { productCard: treebarkTemplates.productCard },
  markdown: `# Product Showcase

Here's a product card rendered with treebark:

${treebark(treebarkTemplates.productCard)}

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
