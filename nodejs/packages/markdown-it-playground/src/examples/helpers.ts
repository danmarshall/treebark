import type { TemplateElement } from '../../../treebark/dist/types.js';

// Helper function to wrap a treebark template in markdown code block syntax
export function treebark(template: TemplateElement | TemplateElement[]): string {
  return '```treebark\n' + JSON.stringify(template, null, 2) + '\n```';
}
