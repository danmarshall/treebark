// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string.js';
import { TemplateElement, TemplateObject, TreebarkInput, Data, RenderOptions } from './common.js';

export { renderToString } from './string.js';
export { renderToDOM } from './dom.js';
export { TemplateElement, TemplateObject, TreebarkInput, Data, RenderOptions } from './common.js';

// Main render function (defaults to string)
export function render(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  return renderToString(input, options);
}