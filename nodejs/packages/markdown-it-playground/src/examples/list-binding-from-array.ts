import type { MarkdownExample } from './types.js';
import type { TemplateElement } from '../../../treebark/dist/types.js';
import { treebark } from './helpers.js';

const teamList: TemplateElement = {
  ul: {
    class: "team-list",
    $bind: ".",
    $children: [
      {
        li: {
          class: "team-member",
          $children: [
            { strong: "{{name}}" },
            " - ",
            { em: "{{role}}" }
          ]
        }
      }
    ]
  }
};

export const listBindingFromArray: MarkdownExample = {
  markdown: `# Team Members (Array Binding)

This example shows **$bind: "."** to bind directly to an array as the root data.

${treebark(teamList)}

## Key Difference

When your data **is** the array itself (not nested in an object), use \`$bind: "."\` to bind to the root.`,
  data: [
    { name: 'Alice', role: 'Developer' },
    { name: 'Bob', role: 'Designer' },
    { name: 'Charlie', role: 'Manager' }
  ]
};
