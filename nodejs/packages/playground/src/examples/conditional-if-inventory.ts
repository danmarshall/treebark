import type { Example } from './types.js';

export const conditionalIfInventory: Example = {
  template: {
    div: {
      class: "product-inventory",
      $children: [
        { h2: "Product Inventory" },
        {
          div: {
            $bind: "products",
            $children: [
              {
                div: {
                  class: "product-item",
                  $children: [
                    { h3: "{{name}}" },
                    { p: "Price: {{price}}" },
                    {
                      $if: {
                        $check: "inStock",
                        $then: {
                          p: {
                            style: { color: "green" },
                            $children: ["✓ In Stock ({{quantity}} available)"]
                          }
                        }
                      }
                    },
                    {
                      $if: {
                        $check: "inStock",
                        $not: true,
                        $then: {
                          p: {
                            style: { color: "red" },
                            $children: ["✗ Out of Stock"]
                          }
                        }
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
