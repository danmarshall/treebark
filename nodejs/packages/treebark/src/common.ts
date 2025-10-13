// Common types, constants, and utilities shared between string and DOM renderers
export type Data = Record<string, unknown> | Record<string, unknown>[];

// Primitive value type for attribute values
export type PrimitiveValue = string | number | boolean;

// Generic conditional type shared by $if tag and conditional attribute values
export type ConditionalBase<T> = {
  $check: string;
  $then?: T;
  $else?: T;
  // Comparison operators (require numbers)
  '$<'?: number;
  '$>'?: number;
  '$<='?: number;
  '$>='?: number;
  // Equality operators (can compare any value)
  '$='?: PrimitiveValue;
  $in?: PrimitiveValue[];
  // Modifiers
  $not?: boolean;
  $join?: 'AND' | 'OR';
};

// Conditional type for $if tag - T can be string or TemplateObject
export type ConditionalValueOrTemplate = ConditionalBase<string | TemplateObject>;

// Conditional value type for attribute values - T is restricted to primitives
export type ConditionalValue = ConditionalBase<string>;

// Non-recursive template structure types
// Template attributes for regular tags (not $if)
export type TemplateAttributes = {
  $bind?: string;
  $children?: (string | TemplateObject)[];
  [key: string]: unknown;
};

// Template object maps tag names to content
// Special case: $if tag uses Conditional type instead of TemplateAttributes
export type TemplateObject = {
  [tag: string]: string | (string | TemplateObject)[] | TemplateAttributes | ConditionalValueOrTemplate;
};

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
  'img',
  'br',
  'hr'
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

export const OPERATORS = new Set(['$<', '$>', '$<=', '$>=', '$=', '$in']);

export const CONDITIONALKEYS = new Set(['$check', '$then', '$else', '$not', '$join', ...OPERATORS]);

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
 * Evaluate conditional logic for $if tag and conditional attributes
 * Supports operators: $<, $>, $<=, $>=, $=, $in
 * Supports modifiers: $not, $join
 * Default behavior: truthy check when no operators
 */
export function evaluateCondition(
  checkValue: unknown,
  attrs: ConditionalValueOrTemplate | ConditionalValue
): boolean {
  const operators: { key: string; value: unknown }[] = [];

  // Collect operators
  for (const op of OPERATORS) {
    if (op in attrs) {
      operators.push({ key: op, value: (attrs as Record<string, unknown>)[op] });
    }
  }

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
      case '$<=':
        return typeof checkValue === 'number' && typeof op.value === 'number' && checkValue <= op.value;
      case '$>=':
        return typeof checkValue === 'number' && typeof op.value === 'number' && checkValue >= op.value;
      case '$=':
        return checkValue === op.value;
      case '$in':
        return Array.isArray(op.value) && op.value.includes(checkValue);
      default:
        return false;
    }
  });

  // Combine results using AND or OR logic (default is AND)
  const useOr = attrs.$join === 'OR';
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
): string {
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

/**
 * Validate and process a $if tag's conditional attributes
 * Returns the validated conditional and the value to render based on condition
 */
export function processConditional(
  rest: string | (string | TemplateObject)[] | TemplateAttributes | ConditionalValueOrTemplate,
  data: Data,
  parents: Data[] = []
): { valueToRender: string | TemplateObject | undefined } {
  // Type cast to Conditional since we know this is a $if tag
  const conditional = rest as ConditionalValueOrTemplate;

  // "$if" tag requires $check
  if (!conditional.$check) {
    throw new Error('"$if" tag requires $check attribute to specify the condition');
  }

  validateCheckExpression(conditional.$check);
  const checkValue = getProperty(data, conditional.$check, parents);

  // $if tag does not support $children - only $then/$else
  if (typeof rest === 'object' && rest !== null && !Array.isArray(rest) && '$children' in rest) {
    throw new Error('"$if" tag does not support $children, use $then and $else instead');
  }

  // Extract properties for validation
  const { $then, $else } = conditional;

  // Validate $then and $else are not arrays
  if ($then !== undefined && Array.isArray($then)) {
    throw new Error('"$if" tag $then must be a string or single element object, not an array');
  }
  if ($else !== undefined && Array.isArray($else)) {
    throw new Error('"$if" tag $else must be a string or single element object, not an array');
  }

  // Check if any non-conditional properties were provided
  // Get all keys from rest and check if there are any beyond the Conditional properties
  const allKeys = typeof rest === 'object' && rest !== null && !Array.isArray(rest) ? Object.keys(rest) : [];

  const nonConditionalAttrs = allKeys.filter(k => !CONDITIONALKEYS.has(k));
  if (nonConditionalAttrs.length > 0) {
    throw new Error(`"$if" tag does not support attributes: ${nonConditionalAttrs.join(', ')}. Allowed: ${[...CONDITIONALKEYS].join(', ')}`);
  }

  // Evaluate condition using conditional logic
  const condition = evaluateCondition(checkValue, conditional);

  // Get the value to render based on condition
  const valueToRender = condition ? $then : $else;

  return { valueToRender };
}