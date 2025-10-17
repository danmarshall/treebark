import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const userStatus = {
  div: {
    class: "user-status",
    $children: [
      { h3: "Account Status" },
      {
        $if: {
          $check: "isPremium",
          $then: { p: { style: { color: "gold" }, $children: ["⭐ Premium Member"] } }
        }
      },
      {
        $if: {
          $check: "isPremium",
          $not: true,
          $then: { p: "Standard Member - Upgrade to Premium!" }
        }
      }
    ]
  }
};

export const conditionalIfTag: MarkdownExample = {
  templates: { userStatus },
  markdown: `# User Dashboard with Conditional Content

The **$if** tag allows conditional rendering based on data values.

## Basic Example

${treebark(userStatus)}

## Key Features

- Use \`$check\` to specify the condition
- Use \`$not: true\` to invert the condition (like 'unless')
- Works with nested properties like \`user.isAdmin\`
- The $if tag is transparent - it doesn't render itself`,
  data: {
    isPremium: true
  }
};
