import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const productGalleryWithData = {
  div: {
    class: "product-grid",
    $children: [
      { h2: "Featured Products" },
      {
        div: {
          class: "products",
          $bind: "products",
          $children: [
            {
              div: {
                class: "product-card",
                $children: [
                  { img: { src: "{{image}}", alt: "{{name}}" } },
                  { h3: "{{name}}" },
                  { p: "{{description}}" },
                  { div: { class: "price", $children: ["{{price}}"] } }
                ]
              }
            }
          ]
        }
      }
    ]
  }
};

export const fullTemplateWithData: MarkdownExample = {
  templates: { productGalleryWithData },
  markdown: `# Product Gallery

Browse our amazing products below:

${treebark(productGalleryWithData)}

*Note: This example includes both template and data in the code block.*`,
  data: {}
};
