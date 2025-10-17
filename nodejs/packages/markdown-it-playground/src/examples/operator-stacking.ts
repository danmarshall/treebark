import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const operatorStacking: MarkdownExample = {
  templates: { ticketPricing: treebarkTemplates.ticketPricing },
  markdown: `# Pricing Logic with Multiple Conditions

Combine multiple operators with **AND** (default) or **OR** logic using \`$join\`.

## AND Logic (Default)

${treebark(treebarkTemplates.ticketPricing)}

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
