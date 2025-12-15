import type { Example } from './types.js';

export const filterInStock: Example = {
  template: {
    div: {
      class: "product-inventory",
      $children: [
        { h2: "Available Products (In Stock Only)" },
        {
          div: {
            $bind: "products",
            $filter: {
              $check: "inStock"
            },
            $children: [
              {
                div: {
                  class: "product-item",
                  $children: [
                    { h3: "{{name}}" },
                    { p: "Price: {{price}}" },
                    {
                      p: {
                        style: { color: "green" },
                        $children: ["✓ In Stock ({{quantity}} available)"]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: {
    products: [
      { name: "Laptop", price: "$999", inStock: true, quantity: 15 },
      { name: "Phone", price: "$499", inStock: false, quantity: 0 },
      { name: "Tablet", price: "$299", inStock: true, quantity: 8 }
    ]
  }
};
