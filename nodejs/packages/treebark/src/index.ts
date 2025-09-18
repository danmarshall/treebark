// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string';
import { Schema, Data, RenderOptions } from './common';

export { renderToString } from './string';
export { renderToDOM } from './dom';
export { Schema, Data, RenderOptions } from './common';

// Main render function (defaults to string)
export function render(schema: Schema | { $template: Schema; $data: Data }, options: RenderOptions = {}): string {
  return renderToString(schema, options);
}