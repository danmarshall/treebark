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
            $children: [
              { h2: "❌ Old Way: Using $if tag" },
              {
                ul: {
                  $bind: "products",
                  $children: [
                    {
                      $if: {
                        $check: "inStock",
                        $then: {
                          li: "{{name}}"
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
            $children: [
              { h2: "✅ New Way: Using $filter" },
              {
                ul: {
                  $bind: "products",
                  $filter: {
                    $check: "inStock"
                  },
                  $children: [
                    {
                      li: "{{name}}"
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
      { name: "Laptop", inStock: true },
      { name: "Phone", inStock: false },
      { name: "Tablet", inStock: true }
    ]
  }
};
