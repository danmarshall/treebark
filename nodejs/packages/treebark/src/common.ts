// Common types, constants, and utilities shared between string and DOM renderers
export type Schema = string | Schema[] | { [tag: string]: any };
export type Data = Record<string, any>;

export const ALLOWED_TAGS = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img']);
export const ALLOWED_ATTRS = new Set(['id', 'class', 'style', 'title', 'href', 'src', 'alt', 'data-', 'aria-']);

/**
 * Get a nested property from an object using dot notation
 */
export function getProperty(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}

/**
 * Interpolate template variables in a string
 */
export function interpolate(tpl: string, data: Data, escapeHtml = true): string {
  return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{') return `{{${trimmed}}}`;
    const val = getProperty(data, trimmed);
    return val == null ? "" : String(val);
  });
}

/**
 * Validate that a tag is allowed
 */
export function validateTag(tag: string): void {
  if (!ALLOWED_TAGS.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
  }
}

/**
 * Validate that an attribute is allowed
 */
export function validateAttribute(key: string): void {
  const ok = ALLOWED_ATTRS.has(key) || [...ALLOWED_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));
  if (!ok) {
    throw new Error(`Attribute "${key}" is not allowed`);
  }
}

/**
 * Check if a schema object has a template structure
 */
export function isTemplate(schema: any): schema is { $template: Schema; $data: Data } {
  return schema && typeof schema === 'object' && '$template' in schema;
}

/**
 * Check if a schema object has a binding structure
 */
export function hasBinding(rest: any): rest is { $bind: string; $children?: Schema[]; [key: string]: any } {
  return rest && typeof rest === 'object' && '$bind' in rest;
}

/**
 * Parse schema object structure to extract tag, attributes, and children
 */
export function parseSchemaObject(schema: { [tag: string]: any }): {
  tag: string;
  rest: any;
  children: Schema[];
  attrs: Record<string, any>;
} {
  const [tag, rest] = Object.entries(schema)[0];
  
  const children = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
  const attrs = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== '$children')) : {};
    
  return { tag, rest, children, attrs };
}