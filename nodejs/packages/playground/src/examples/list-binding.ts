import type { Example } from './types.js';

export const listBinding: Example = {
  template: {
    ul: {
      class: "product-list",
      $bind: "products",
      $children: [
        { li: "{{name}} - {{price}}" }
      ]
    }
  },
  data: {
    products: [
      { name: "Laptop", price: "$999" },
      { name: "Phone", price: "$499" },
      { name: "Tablet", price: "$299" }
    ]
  }
};
