// Common types, constants, and utilities shared between string and DOM renderers
export type Data = Record<string, unknown>;

// Non-recursive template structure types
// Template attributes defined first to avoid circular references
export type TemplateAttributes = {
  $bind?: string;
  $children?: (string | TemplateObject)[];
  [key: string]: unknown;
};

// Template object maps tag names to content
export type TemplateObject = { [tag: string]: string | (string | TemplateObject)[] | TemplateAttributes };

// Template element is either a string or an object
export type TemplateElement = string | TemplateObject;

// API input types
export interface TreebarkInput {
  template: TemplateElement | TemplateElement[];
  data?: Data;
}

// Options interface for render functions
export interface RenderOptions {
  data?: Data;
  indent?: string | number | boolean;
}

// Container tags that can have children and require closing tags
export const CONTAINER_TAGS = new Set([
  'div', 'span', 'p', 'header', 'footer', 'main', 'section', 'article',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'blockquote', 'code', 'pre',
  'ul', 'ol', 'li',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a',
  'comment'
]);

// Void tags that cannot have children and are self-closing
export const VOID_TAGS = new Set([
  'img'
]);

export const ALLOWED_TAGS = new Set([...CONTAINER_TAGS, ...VOID_TAGS]);

// Global attributes allowed on all tags
export const GLOBAL_ATTRS = new Set(['id', 'class', 'style', 'title', 'role', 'data-', 'aria-']);

// Tag-specific attributes
export const TAG_SPECIFIC_ATTRS: Record<string, Set<string>> = {
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height']),
  'table': new Set(['summary']),
  'th': new Set(['scope', 'colspan', 'rowspan']),
  'td': new Set(['scope', 'colspan', 'rowspan']),
  'blockquote': new Set(['cite'])
};

/**
 * Get a nested property from an object using dot notation
 */
export function getProperty(obj: Data, path: string): unknown {
  return path.split('.').reduce((o: unknown, k: string): unknown => 
    (o && typeof o === 'object' && o !== null ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/**
 * HTML escape function for template interpolation
 */
export function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
}

/**
 * Interpolate template variables in a string
 */
export function interpolate(tpl: string, data: Data, escapeHtml = true): string {
  return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{') return `{{${trimmed}}}`;
    const val = getProperty(data, trimmed);
    return val == null ? "" : (escapeHtml ? escape(String(val)) : String(val));
  });
}


/**
 * Validate that an attribute is allowed for the given tag
 */
export function validateAttribute(key: string, tag: string): void {
  // Check global attributes first
  const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));
  
  // Check tag-specific attributes
  const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
  const isTagSpecific = tagAttrs && tagAttrs.has(key);
  
  if (!isGlobal && !isTagSpecific) {
    throw new Error(`Attribute "${key}" is not allowed on tag "${tag}"`);
  }
}

/**
 * Check if input is a TreebarkInput object
 */
export function isTreebarkInput(input: unknown): input is TreebarkInput {
  return input !== null && typeof input === 'object' && 'template' in input;
}

/**
 * Check if a template object has a binding structure
 */
export function hasBinding(rest: string | (string | TemplateObject)[] | TemplateAttributes): rest is TemplateAttributes & { $bind: string } {
  return rest !== null && typeof rest === 'object' && !Array.isArray(rest) && '$bind' in rest;
}

/**
 * Parse template object structure to extract tag, attributes, and children
 */
export function parseTemplateObject(templateObj: TemplateObject): {
  tag: string;
  rest: string | (string | TemplateObject)[] | TemplateAttributes;
  children: (string | TemplateObject)[];
  attrs: Record<string, unknown>;
} {
  if (!templateObj || typeof templateObj !== 'object') {
    throw new Error('Template object cannot be null, undefined, or non-object');
  }
  const entries = Object.entries(templateObj);
  if (entries.length === 0) {
    throw new Error('Template object must have at least one tag');
  }
  const firstEntry = entries[0];
  if (!firstEntry) {
    throw new Error('Template object must have at least one tag');
  }
  const [tag, rest] = firstEntry;
  
  const children = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : (rest as TemplateAttributes)?.$children || [];
  const attrs = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== '$children')) : {};
    
  return { tag, rest, children, attrs };
}