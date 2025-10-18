import type { Example } from './types.js';

export const cardLayout: Example = {
  template: {
    div: {
      class: "product-card",
      $children: [
        { h2: "{{name}}" },
        { p: "{{description}}" },
        {
          div: {
            class: "price",
            $children: ["{{price}}"]
          }
        }
      ]
    }
  },
  data: {
    name: "Gaming Laptop",
    description: "High-performance laptop for gaming and development",
    price: "$1,299"
  }
};
