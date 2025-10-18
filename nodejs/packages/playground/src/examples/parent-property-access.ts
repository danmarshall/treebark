import type { Example } from './types.js';

export const parentPropertyAccess: Example = {
  template: {
    div: {
      $bind: "customers",
      $children: [
        { h2: "{{name}}" },
        { p: "Company: {{..companyName}}" },
        {
          ul: {
            $bind: "orders",
            $children: [
              {
                li: {
                  $children: [
                    "Order #{{orderId}} for {{..name}}: ",
                    {
                      ul: {
                        $bind: "products",
                        $children: [
                          {
                            li: {
                              $children: [
                                {
                                  a: {
                                    href: "/customer/{{../../..customerId}}/order/{{..orderId}}/product/{{productId}}",
                                    $children: ["{{name}} - {{price}}"]
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
        }
      ]
    }
  },
  data: {
    companyName: "ACME Corp",
    customerId: "cust123",
    customers: [
      {
        name: "Alice Johnson",
        orders: [
          {
            orderId: "ord456",
            products: [
              { productId: "prod789", name: "Laptop", price: "$999" },
              { productId: "prod101", name: "Mouse", price: "$25" }
            ]
          }
        ]
      }
    ]
  }
};
