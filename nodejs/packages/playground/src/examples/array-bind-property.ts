import type { Example } from './types.js';

export const arrayBindProperty: Example = {
  template: {
    ul: {
      $bind: "products",
      $children: [
        { li: "{{name}} — {{price}}" }
      ]
    }
  },
  data: {
    products: [
      { name: "Laptop", price: "$999" },
      { name: "Phone", price: "$499" }
    ]
  }
};
