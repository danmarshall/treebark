import type { MarkdownExample } from './types.js';
import type { TemplateElement } from '../../../treebark/dist/types.js';
import { treebark } from './helpers.js';

const teamList: TemplateElement = {
  ul: {
    class: "team-list",
    $bind: "members",
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

export const listBinding: MarkdownExample = {
  markdown: `# Team Members

Meet our amazing team:

${treebark(teamList)}

## About Us

We're passionate about building great software!`,
  data: {
    members: [
      { name: 'Alice', role: 'Developer' },
      { name: 'Bob', role: 'Designer' },
      { name: 'Charlie', role: 'Manager' }
    ]
  }
};
