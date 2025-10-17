import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const ifElseBranches: MarkdownExample = {
  templates: { authStatus: treebarkTemplates.authStatus },
  markdown: `# User Authentication Status

The **$then** and **$else** keys provide clean if/else branching.

## If/Else Example

${treebark(treebarkTemplates.authStatus)}

## Key Features

- \`$then\` contains the element to render when condition is true
- \`$else\` contains the element to render when condition is false
- Each branch outputs exactly one element (1:1 mapping)
- Both branches are optional`,
  data: {
    isLoggedIn: true,
    username: 'Alice'
  }
};
