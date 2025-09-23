// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string';
import { TemplateItem, TemplateElement, TemplateString, TemplateObject, TreebarkInput, Data, RenderOptions } from './common';

export { renderToString } from './string';
export { renderToDOM } from './dom';
export { TemplateItem, TemplateElement, TemplateString, TemplateObject, TreebarkInput, Data, RenderOptions } from './common';

// Main render function (defaults to string)
export function render(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  return renderToString(input, options);
}