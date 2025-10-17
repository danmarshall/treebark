import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const conditionalIfTag: MarkdownExample = {
  templates: { userStatus: treebarkTemplates.userStatus },
  markdown: `# User Dashboard with Conditional Content

The **$if** tag allows conditional rendering based on data values.

## Basic Example

${treebark(treebarkTemplates.userStatus)}

## Key Features

- Use \`$check\` to specify the condition
- Use \`$not: true\` to invert the condition (like 'unless')
- Works with nested properties like \`user.isAdmin\`
- The $if tag is transparent - it doesn't render itself`,
  data: {
    isPremium: true
  }
};
