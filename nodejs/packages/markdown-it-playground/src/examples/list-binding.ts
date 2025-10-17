import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const listBinding: MarkdownExample = {
  templates: { teamList: treebarkTemplates.teamList },
  markdown: `# Team Members

Meet our amazing team:

${treebark(treebarkTemplates.teamList)}

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
