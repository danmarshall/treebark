import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const helloWorld: MarkdownExample = {
  templates: { greeting: treebarkTemplates.greeting },
  markdown: `# Welcome to markdown-it-treebark!

This plugin allows you to embed **treebark templates** inside markdown code blocks.

${treebark(treebarkTemplates.greeting)}

Regular markdown continues to work normally:
- Bullet points
- **Bold text**
- *Italic text*`,
  data: {
    name: 'World'
  }
};
