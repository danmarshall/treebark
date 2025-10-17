import type { Example } from './types.js';

export const conditionalComparisonOperators: Example = {
  template: {
    div: {
      class: "access-control",
      $children: [
        { h2: "Age-Based Access (Age: {{age}})" },
        {
          $if: {
            $check: "age",
            "$<": 13,
            $then: {
              p: {
                style: { color: "red" },
                $children: ["❌ Child account - Restricted access"]
              }
            }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 13,
            "$<": 18,
            $then: {
              p: {
                style: { color: "orange" },
                $children: ["⚠️ Teen account - Limited access"]
              }
            }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            $then: {
              p: {
                style: { color: "green" },
                $children: ["✓ Full access granted"]
              }
            }
          }
        },
        { hr: {} },
        { h3: "Role-Based Access" },
        {
          $if: {
            $check: "role",
            $in: ["admin", "moderator", "editor"],
            $then: {
              p: {
                style: { color: "blue" },
                $children: ["⭐ Special privileges granted"]
              }
            },
            $else: { p: "Standard user privileges" }
          }
        }
      ]
    }
  },
  data: {
    age: 25,
    role: "admin"
  }
};
