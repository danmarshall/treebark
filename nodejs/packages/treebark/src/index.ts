// Core types for Treebark
export type TreebarkNode = 
  | string
  | TreebarkElement
  | TreebarkNode[];

export interface TreebarkElement {
  [tagName: string]: TreebarkContent | TreebarkAttributes;
}

export type TreebarkContent = 
  | string
  | TreebarkNode[]
  | TreebarkAttributes;

export interface TreebarkAttributes {
  [key: string]: string | TreebarkNode[] | undefined;
  $children?: TreebarkNode[];
  $bind?: string;
}

export interface TreebarkTemplate {
  $template: TreebarkNode;
  $data: any;
}

export interface RenderOptions {
  data?: any;
  allowedTags?: Set<string>;
  allowedAttributes?: Set<string>;
}

// Default allowed tags (safe whitelist)
export const DEFAULT_ALLOWED_TAGS = new Set([
  'div', 'span', 'p', 'header', 'footer', 'main', 'section', 'article',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'blockquote', 'code', 'pre',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'img'
]);

// Default allowed attributes
export const DEFAULT_ALLOWED_ATTRIBUTES = new Set([
  // Global attributes
  'id', 'class', 'style', 'title', 'role',
  // Data and aria attributes (will be checked with startsWith)
  'data-', 'aria-',
  // Specific tag attributes
  'href', 'target', 'rel', // a
  'src', 'alt', 'width', 'height', // img
  'summary', // table
  'scope', 'colspan', 'rowspan', // th, td
  'cite' // blockquote
]);

// Main render function (defaults to string)
export function render(node: TreebarkNode | TreebarkTemplate, options?: RenderOptions): string {
  // Import here to avoid circular dependency
  const { renderToString } = require('./string');
  return renderToString(node, options);
}

// Export renderers
export { renderToString } from './string';
export { renderToDOM } from './dom';