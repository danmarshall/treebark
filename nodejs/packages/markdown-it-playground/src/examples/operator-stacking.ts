import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const ticketPricing: any = {
  div: {
    class: "pricing",
    $children: [
      { h3: "Standard Pricing" },
      { p: "Age: {{age}}, Member: {{isMember}}" },
      {
        $if: {
          $check: "age",
          "$>=": 18,
          "$<=": 65,
          $then: { p: { style: { color: "green" }, $children: ["✓ Standard adult rate: $50"] } },
          $else: { p: "Discounted rate available" }
        }
      },
      { hr: {} },
      { h3: "Discounted Pricing (OR Logic)" },
      {
        $if: {
          $check: "age",
          "$<": 18,
          "$>": 65,
          $join: "OR",
          $then: { p: { style: { color: "blue" }, $children: ["🎉 Special discount: $30"] } },
          $else: { p: "Standard rate: $50" }
        }
      },
      { hr: {} },
      { h3: "Negation Example" },
      {
        $if: {
          $check: "age",
          "$>=": 18,
          "$<=": 65,
          $not: true,
          $then: { p: { style: { color: "orange" }, $children: ["Outside working age range"] } },
          $else: { p: "Working age range (18-65)" }
        }
      }
    ]
  }
};

export const operatorStacking: MarkdownExample = {
  templates: { ticketPricing },
  markdown: `# Pricing Logic with Multiple Conditions

Combine multiple operators with **AND** (default) or **OR** logic using \`$join\`.

## AND Logic (Default)

${treebark(ticketPricing)}

## Key Features

- Multiple operators use **AND** logic by default
- Use \`$join: 'OR'\` to change to OR logic
- Use \`$not: true\` to invert the entire result
- Operators can be stacked for complex conditions`,
  data: {
    age: 70,
    isMember: false
  }
};
