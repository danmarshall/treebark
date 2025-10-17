import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const comparisonOperators: MarkdownExample = {
  templates: { ageAccessControl: treebarkTemplates.ageAccessControl },
  markdown: `# Age-Based Access Control

Use comparison operators to create powerful conditional logic.

## Comparison Examples

${treebark(treebarkTemplates.ageAccessControl)}

## Available Operators

- \`$<\` - Less than
- \`$>\` - Greater than
- \`$<=\` - Less than or equal
- \`$>=\` - Greater than or equal
- \`$=\` - Strict equality
- \`$in\` - Array membership`,
  data: {
    age: 25,
    role: 'admin'
  }
};
