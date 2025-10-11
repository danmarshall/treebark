// Common types, constants, and utilities shared between string and DOM renderers
export type Data = Record<string, unknown> | Record<string, unknown>[];

// Conditional value type for attribute values
export type ConditionalValue = {
  $check: string;
  $then?: unknown;
  $else?: unknown;
  // Operators
  '$<'?: unknown;
  '$>'?: unknown;
  '$='?: unknown;
  $in?: unknown[];
  // Modifiers
  $not?: boolean;
  $and?: boolean;
  $or?: boolean;
};

// Non-recursive template structure types
// Template attributes defined first to avoid circular references
export type TemplateAttributes = {
  $bind?: string;
  $check?: string;  // v2.0: for $if tag
  $children?: (string | TemplateObject)[];
  $then?: string | TemplateObject; // v2.0: single element when condition is true
  $else?: string | TemplateObject; // v2.0: single element when condition is false
  $not?: boolean;
  // Operators for $if tag
  '$<'?: unknown;
  '$>'?: unknown;
  '$='?: unknown;
  $in?: unknown[];
  // Modifiers for $if tag
  $and?: boolean;
  $or?: boolean;
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
  'a'
]);

// Special tags that have unique behavior
export const SPECIAL_TAGS = new Set([
  '$comment',
  '$if'
]);

// Void tags that cannot have children and are self-closing
export const VOID_TAGS = new Set([
  'img'
]);

export const ALLOWED_TAGS = new Set([...CONTAINER_TAGS, ...SPECIAL_TAGS, ...VOID_TAGS]);

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
 * Supports parent property access with .. notation
 */
export function getProperty(obj: Data, path: string, parents: Data[] = []): unknown {
  // Special case: "." means the current object itself
  if (path === '.') {
    return obj;
  }

  // Handle parent property access patterns
  let currentObj: unknown = obj;
  let remainingPath = path;

  // Process parent references (..)
  while (remainingPath.startsWith('..')) {
    // Count consecutive parent references
    let parentLevels = 0;
    let tempPath = remainingPath;

    // Count leading .. patterns
    while (tempPath.startsWith('..')) {
      parentLevels++;
      tempPath = tempPath.substring(2);
      // Skip optional slash after ..
      if (tempPath.startsWith('/')) {
        tempPath = tempPath.substring(1);
      }
    }

    // Navigate up the parent chain
    if (parentLevels <= parents.length) {
      currentObj = parents[parents.length - parentLevels];
      remainingPath = tempPath.startsWith('.') ? tempPath.substring(1) : tempPath;
    } else {
      return undefined;
    }
  }

  // If there's remaining path, process it normally
  if (remainingPath) {
    return remainingPath.split('.').reduce((o: unknown, k: string): unknown =>
      (o && typeof o === 'object' && o !== null ? (o as Record<string, unknown>)[k] : undefined), currentObj);
  }

  return currentObj;
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
export function interpolate(tpl: string, data: Data, escapeHtml = true, parents: Data[] = []): string {
  // Use non-overlapping alternation with restricted character class to avoid ReDoS vulnerability
  // [^{]*? prevents the regex from matching opening braces in the content, eliminating polynomial backtracking
  // First alternative matches {{{...}}} for escaping, second matches {{...}} for interpolation
  return tpl.replace(/\{\{\{([^{]*?)\}\}\}|\{\{([^{]*?)\}\}/g, (match, escapedExpr, normalExpr) => {
    // If escapedExpr is defined, we matched {{{...}}}
    if (escapedExpr !== undefined) {
      const trimmed = escapedExpr.trim();
      return `{{${trimmed}}}`;
    }
    // Otherwise, we matched {{...}}
    const trimmed = normalExpr.trim();
    const val = getProperty(data, trimmed, parents);
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
 * Check if a template object has a $check structure (for $if tag)
 */
export function hasCheck(rest: string | (string | TemplateObject)[] | TemplateAttributes): rest is TemplateAttributes & { $check: string } {
  return rest !== null && typeof rest === 'object' && !Array.isArray(rest) && '$check' in rest;
}

/**
 * Validate $bind expression - no parent context access or interpolation
 */
export function validateBindExpression(bindValue: string): void {
  // Allow single dot "." to bind to current data object
  if (bindValue === '.') {
    return;
  }

  if (bindValue.includes('..')) {
    throw new Error(`$bind does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: $bind: "${bindValue}"`);
  }
  if (bindValue.includes('{{')) {
    throw new Error(`$bind does not support interpolation {{...}} - use literal property paths only. Invalid: $bind: "${bindValue}"`);
  }
}

/**
 * Validate $check expression - no parent context access or interpolation (for $if tag)
 */
export function validateCheckExpression(checkValue: string): void {
  // Allow single dot "." to check current data object
  if (checkValue === '.') {
    return;
  }

  if (checkValue.includes('..')) {
    throw new Error(`$check does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: $check: "${checkValue}"`);
  }
  if (checkValue.includes('{{')) {
    throw new Error(`$check does not support interpolation {{...}} - use literal property paths only. Invalid: $check: "${checkValue}"`);
  }
}

/**
 * Evaluate conditional logic for $if tag
 * Supports operators: $<, $>, $=, $in
 * Supports modifiers: $not, $and, $or
 * Default behavior: truthy check when no operators
 */
export function evaluateCondition(
  checkValue: unknown,
  attrs: TemplateAttributes | ConditionalValue
): boolean {
  const operators: { key: string; value: unknown }[] = [];
  
  // Collect operators
  if ('$<' in attrs) operators.push({ key: '$<', value: attrs['$<'] });
  if ('$>' in attrs) operators.push({ key: '$>', value: attrs['$>'] });
  if ('$=' in attrs) operators.push({ key: '$=', value: attrs['$='] });
  if ('$in' in attrs) operators.push({ key: '$in', value: attrs['$in'] });
  
  // If no operators, use truthy check
  if (operators.length === 0) {
    const result = Boolean(checkValue);
    return attrs.$not ? !result : result;
  }
  
  // Evaluate each operator
  const results = operators.map(op => {
    switch (op.key) {
      case '$<':
        return typeof checkValue === 'number' && typeof op.value === 'number' && checkValue < op.value;
      case '$>':
        return typeof checkValue === 'number' && typeof op.value === 'number' && checkValue > op.value;
      case '$=':
        return checkValue === op.value;
      case '$in':
        return Array.isArray(op.value) && op.value.includes(checkValue);
      default:
        return false;
    }
  });
  
  // Combine results using AND or OR logic
  const useOr = attrs.$or === true;
  let finalResult: boolean;
  
  if (useOr) {
    // OR logic: at least one must be true
    finalResult = results.some(r => r);
  } else {
    // AND logic (default): all must be true
    finalResult = results.every(r => r);
  }
  
  // Apply negation if $not is true
  return attrs.$not ? !finalResult : finalResult;
}

/**
 * Check if a value is a conditional value object
 */
export function isConditionalValue(value: unknown): value is ConditionalValue {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    '$check' in value &&
    typeof (value as ConditionalValue).$check === 'string'
  );
}

/**
 * Evaluate a conditional value and return $then or $else based on condition
 */
export function evaluateConditionalValue(
  value: ConditionalValue,
  data: Data,
  parents: Data[] = []
): unknown {
  validateCheckExpression(value.$check);
  const checkValue = getProperty(data, value.$check, parents);
  const condition = evaluateCondition(checkValue, value);
  
  if (condition) {
    return value.$then !== undefined ? value.$then : '';
  } else {
    return value.$else !== undefined ? value.$else : '';
  }
}

/**
 * Check if a template has $bind: "." which means bind to current data object
 */
export function templateHasCurrentObjectBinding(template: TemplateElement): boolean {
  if (Array.isArray(template) || typeof template !== 'object' || template === null) {
    return false;
  }

  const entries = Object.entries(template);
  if (entries.length === 0) {
    return false;
  }

  const [, rest] = entries[0];
  if (!rest || typeof rest !== 'object' || Array.isArray(rest)) {
    return false;
  }

  return '$bind' in rest && rest.$bind === '.';
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