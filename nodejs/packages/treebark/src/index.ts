// Simplified Treebark - tiny recursive walker + pluggable formatters
import { renderToString } from './string';
import { Schema, RenderOptions, TemplateObject } from './common';

export { renderToString } from './string';
export { renderToDOM } from './dom';
export { Schema, Data, RenderOptions, TemplateObject } from './common';

// Main render function (defaults to string)
export function render(schema: Schema | TemplateObject, options: RenderOptions = {}): string {
  return renderToString(schema, options);
}