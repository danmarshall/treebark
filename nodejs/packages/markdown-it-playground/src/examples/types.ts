import type { TemplateElement } from '../../../treebark/dist/types.js';

export interface MarkdownExample {
  markdown: string;
  data: unknown;
  templates?: Record<string, TemplateElement | TemplateElement[]>;
}
