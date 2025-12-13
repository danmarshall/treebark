import type { Example } from './types.js';

export const filterComparison: Example = {
  template: {
    div: {
      class: "comparison-demo",
      $children: [
        { h1: "Filter vs If: Comparison" },
        
        // Old way: Using $if tag to conditionally render each item
        {
          div: {
            class: "method old-way",
            $children: [
              { h2: "❌ Old Way: Using $if tag" },
              { p: "Shows only in-stock products using conditional rendering" },
              {
                div: {
                  $bind: "products",
                  $children: [
                    {
                      $if: {
                        $check: "inStock",
                        $then: {
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
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        
        { hr: {} },
        
        // New way: Using $filter to show only in-stock items
        {
          div: {
            class: "method new-way",
            $children: [
              { h2: "✅ New Way: Using $filter" },
              { p: "Shows only in-stock products (cleaner, more declarative)" },
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
