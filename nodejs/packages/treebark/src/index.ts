// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string.js';
import { RenderOptions, TreebarkInput } from './types.js';

export * from './types.js';
export { renderToString } from './string.js';
export { renderToDOM } from './dom.js';
export { getProperty } from './common.js';

// Main render function (defaults to string)
export function render(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  return renderToString(input, options);
}