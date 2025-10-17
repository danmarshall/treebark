import type { Example } from './types.js';

export const arrayBindDot: Example = {
  template: {
    ul: {
      $bind: ".",
      $children: [
        { li: "{{name}} — {{price}}" }
      ]
    }
  },
  data: [
    { name: "Laptop", price: "$999" },
    { name: "Phone", price: "$499" }
  ]
};
