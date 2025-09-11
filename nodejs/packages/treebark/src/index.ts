// Simplified Treebark - tiny recursive walker + pluggable formatters
export { renderToString } from './string';
export { renderToDOM } from './dom';
export { Schema, Data } from './common';

// Main render function (defaults to string)
export function render(schema: any, options: any = {}): string {
  const { renderToString } = require('./string');
  return renderToString(schema, options);
}