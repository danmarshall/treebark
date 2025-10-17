import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const greeting = {
  div: {
    class: "greeting",
    $children: [
      { h2: "Hello {{name}}!" },
      { p: "Welcome to the markdown-it-treebark plugin." }
    ]
  }
};

export const helloWorld: MarkdownExample = {
  templates: { greeting },
  markdown: `# Welcome to markdown-it-treebark!

This plugin allows you to embed **treebark templates** inside markdown code blocks.

${treebark(greeting)}

Regular markdown continues to work normally:
- Bullet points
- **Bold text**
- *Italic text*`,
  data: {
    name: 'World'
  }
};
