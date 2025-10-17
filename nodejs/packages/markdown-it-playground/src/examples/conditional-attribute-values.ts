import type { MarkdownExample } from './types.js';
import type { TemplateElement } from '../../../treebark/dist/types.js';
import { treebark } from './helpers.js';

const statusDashboard: TemplateElement = {
  div: {
    class: "status-dashboard",
    $children: [
      { h3: "Server Status Dashboard" },
      {
        div: {
          class: {
            $check: "status",
            "$=": "online",
            $then: "status-online",
            $else: "status-offline"
          },
          $children: [
            { strong: "Server Status: " },
            { span: "{{status}}" }
          ]
        }
      },
      { hr: {} },
      { h4: "Performance Score: {{score}}" },
      {
        div: {
          class: {
            $check: "score",
            "$>=": 90,
            $then: "score-excellent",
            $else: "score-average"
          },
          style: {
            $check: "score",
            "$>=": 90,
            $then: { color: "green", "font-weight": "bold" },
            $else: { color: "orange" }
          },
          $children: [
            {
              $if: {
                $check: "score",
                "$>=": 90,
                $then: { span: "⭐ Excellent Performance" },
                $else: { span: "Average Performance" }
              }
            }
          ]
        }
      },
      { hr: {} },
      { h4: "User Role Badge" },
      {
        span: {
          class: {
            $check: "role",
            $in: ["admin", "moderator"],
            $then: "badge-special",
            $else: "badge-normal"
          },
          $children: ["Role: {{role}}"]
        }
      }
    ]
  }
};

export const conditionalAttributeValues: MarkdownExample = {
  markdown: `# Dynamic Styling with Conditional Attributes

Apply conditional values to **any attribute** using the same conditional syntax.

## Conditional Attributes Example

${treebark(statusDashboard)}

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
