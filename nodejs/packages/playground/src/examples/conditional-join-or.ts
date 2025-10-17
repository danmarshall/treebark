import type { Example } from './types.js';

export const conditionalJoinOr: Example = {
  template: {
    div: {
      class: "pricing",
      $children: [
        { h2: "Ticket Pricing" },
        { p: "Age: {{age}}" },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            "$<=": 65,
            $then: {
              p: {
                style: { color: "green" },
                $children: ["✓ Standard adult rate: $50"]
              }
            },
            $else: { p: "Discounted rate available" }
          }
        },
        { hr: {} },
        { h3: "Discount Eligibility (OR Logic)" },
        {
          $if: {
            $check: "age",
            "$<": 18,
            "$>": 65,
            $join: "OR",
            $then: {
              p: {
                style: { color: "blue" },
                $children: ["🎉 Special discount: $30 (child or senior)"]
              }
            },
            $else: { p: "Standard rate: $50" }
          }
        }
      ]
    }
  },
  data: {
    age: 70
  }
};
