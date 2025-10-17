import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const fullTemplateWithData: MarkdownExample = {
  templates: { productGalleryWithData: treebarkTemplates.productGalleryWithData },
  markdown: `# Product Gallery

Browse our amazing products below:

${treebark(treebarkTemplates.productGalleryWithData)}

*Note: This example includes both template and data in the code block.*`,
  data: {}
};
