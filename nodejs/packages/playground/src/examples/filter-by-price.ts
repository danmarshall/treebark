import type { Example } from './types.js';

export const filterByPrice: Example = {
  template: {
    div: {
      class: "product-showcase",
      $children: [
        { h2: "Products Under $500" },
        {
          ul: {
            class: "product-list",
            $bind: "products",
            $filter: {
              $check: "price",
              "$<": 500
            },
            $children: [
              { li: "{{name}} - ${{price}}" }
            ]
          }
        },
        { h2: "All Products" },
        {
          ul: {
            class: "product-list",
            $bind: "products",
            $children: [
              { li: "{{name}} - ${{price}}" }
            ]
          }
        }
      ]
    }
  },
  data: {
    products: [
      { name: "Laptop", price: 999 },
      { name: "Mouse", price: 25 },
      { name: "Keyboard", price: 75 },
      { name: "Monitor", price: 699 },
      { name: "Webcam", price: 89 },
      { name: "Headset", price: 149 }
    ]
  }
};
