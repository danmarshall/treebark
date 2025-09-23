// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string';
import { Template, TreebarkInput, Data, RenderOptions } from './common';

export { renderToString } from './string';
export { renderToDOM } from './dom';
export { Template, TreebarkInput, Data, RenderOptions } from './common';

// Main render function (defaults to string)
export function render(
  input: Template | TreebarkInput, 
  options: RenderOptions = {}
): string {
  return renderToString(input, options);
}