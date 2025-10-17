import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const conditionalAttributeValues: MarkdownExample = {
  templates: { statusDashboard: treebarkTemplates.statusDashboard },
  markdown: `# Dynamic Styling with Conditional Attributes

Apply conditional values to **any attribute** using the same conditional syntax.

## Conditional Attributes Example

${treebark(treebarkTemplates.statusDashboard)}

## Key Features

- Conditional values work on **any attribute** (class, style, href, etc.)
- Uses the same operators as $if tag ($<, $>, $=, $in, etc.)
- Supports $not, $join modifiers
- Clean, declarative syntax`,
  data: {
    status: 'online',
    score: 95,
    role: 'admin'
  }
};
