import type { MarkdownExample } from './types.js';
import type { TemplateElement } from '../../../treebark/dist/types.js';
import { treebark } from './helpers.js';

const ageAccessControl: TemplateElement = {
  div: {
    class: "access-control",
    $children: [
      { h3: "Access Level for Age: {{age}}" },
      {
        $if: {
          $check: "age",
          "$<": 13,
          $then: { p: { style: { color: "red" }, $children: ["❌ Child account - Restricted access"] } }
        }
      },
      {
        $if: {
          $check: "age",
          "$>=": 13,
          "$<": 18,
          $then: { p: { style: { color: "orange" }, $children: ["⚠️ Teen account - Limited access"] } }
        }
      },
      {
        $if: {
          $check: "age",
          "$>=": 18,
          $then: { p: { style: { color: "green" }, $children: ["✓ Full access granted"] } }
        }
      },
      { hr: {} },
      { h4: "Role-Based Access" },
      {
        $if: {
          $check: "role",
          $in: ["admin", "moderator", "editor"],
          $then: { p: { style: { color: "blue" }, $children: ["⭐ Special privileges granted"] } },
          $else: { p: "Standard user privileges" }
        }
      }
    ]
  }
};

export const comparisonOperators: MarkdownExample = {
  markdown: `# Age-Based Access Control

Use comparison operators to create powerful conditional logic.

## Comparison Examples

${treebark(ageAccessControl)}

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
