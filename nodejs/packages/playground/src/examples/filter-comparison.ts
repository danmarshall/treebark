import type { Example } from './types.js';

export const filterComparison: Example = {
  template: {
    div: {
      class: "comparison-demo",
      $children: [
        { h1: "Filter vs If: Comparison" },
        
        // Old way: Using $if tags to conditionally display status
        {
          div: {
            class: "method old-way",
            $children: [
              { h2: "❌ Old Way: Using $if tags" },
              { p: "Shows all products with conditional status messages" },
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
        
        { hr: {} },
        
        // New way: Using $filter to show only in-stock items
        {
          div: {
            class: "method new-way",
            $children: [
              { h2: "✅ New Way: Using $filter" },
              { p: "Shows only in-stock products (cleaner, simpler)" },
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
