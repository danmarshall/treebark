// Common utilities shared between string and DOM renderers
// Type definitions are in types.ts

import type {
  Data,
  ConditionalValueOrTemplate,
  ConditionalValue,
  ConditionalBase,
  TemplateObject,
  TemplateElement,
  TemplateAttributes,
  TreebarkInput,
  Logger,
  CSSProperties,
  StyleValue,
  OuterPropertyResolver,
  BindPath,
  InterpolatedString,
} from './types.js';

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

// Blocked CSS properties that are known to be dangerous
const BLOCKED_CSS_PROPERTIES = new Set([
  'behavior',           // IE behavior property - can execute code
  '-moz-binding',       // Firefox XBL binding - can execute code
]);

// Blocked property names that access the prototype chain
const BLOCKED_PROPERTY_NAMES = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

// Safe URL protocols that are allowed in href and src attributes
const SAFE_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'sms:',
  'ftp:',
  'ftps:',
]);

// URL-based attributes that require protocol validation
const URL_ATTRIBUTES = new Set(['href', 'src']);

/**
 * Get a nested property from data using dot notation
 * Supports parent property access with .. notation
 * If property is not found and getOuterProperty is provided, it will be called
 */
export function getProperty(
  data: Data, 
  path: BindPath, 
  parents: Data[] = [], 
  logger?: Logger,
  getOuterProperty?: OuterPropertyResolver
): unknown {
  // Special case: "." means the current data value itself
  if (path === '.') {
    return data;
  }

  // Handle parent property access patterns
  let currentData: unknown = data;
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
      currentData = parents[parents.length - parentLevels];
      remainingPath = tempPath.startsWith('.') ? tempPath.substring(1) : tempPath;
    } else {
      // Property not found - try outer property resolver
      if (getOuterProperty) {
        return getOuterProperty(path, data, parents);
      }
      return undefined;
    }
  }

  // If there's remaining path, process it normally
  if (remainingPath) {
    // Log error if trying to access property on a primitive (number, string, boolean)
    if (logger && typeof currentData !== 'object' && currentData !== null && currentData !== undefined) {
      logger.error(`Cannot access property "${remainingPath}" on primitive value of type "${typeof currentData}"`);
      return undefined;
    }
    
    const result = remainingPath.split('.').reduce((o: unknown, k: string): unknown => {
      // Block access to prototype chain properties for security
      if (BLOCKED_PROPERTY_NAMES.has(k)) {
        if (logger) {
          logger.warn(`Access to property "${k}" is blocked for security reasons`);
        }
        return undefined;
      }
      return (o && typeof o === 'object' && o !== null ? (o as Record<string, unknown>)[k] : undefined);
    }, currentData);
    
    // If result is undefined, try outer property resolver
    if (result === undefined && getOuterProperty) {
      return getOuterProperty(path, data, parents);
    }
    
    return result;
  }

  return currentData;
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
export function interpolate(
  tpl: InterpolatedString, 
  data: Data, 
  escapeHtml = true, 
  parents: Data[] = [], 
  logger?: Logger,
  getOuterProperty?: OuterPropertyResolver
): string {
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
    const val = getProperty(data, trimmed, parents, logger, getOuterProperty);
    return val == null ? "" : (escapeHtml ? escape(String(val)) : String(val));
  });
}


/**
 * Convert a style object to a CSS string
 * Uses generic property validation - allows any kebab-case CSS property
 * but validates values for dangerous patterns
 */
export function styleObjectToString(styleObj: Record<string, unknown>, logger: Logger): string {
  const cssDeclarations: string[] = [];
  
  for (const [prop, value] of Object.entries(styleObj)) {
    // Property names should be in kebab-case format
    const cssProp = prop;
    
    // Validate property name format: must be kebab-case (lowercase letters and hyphens)
    if (!/^[a-z]([a-z0-9-]*[a-z0-9])?$/.test(cssProp)) {
      logger.warn(`CSS property "${prop}" has invalid format (must be kebab-case)`);
      continue;
    }
    
    // Block known dangerous properties
    if (BLOCKED_CSS_PROPERTIES.has(cssProp)) {
      logger.warn(`CSS property "${prop}" is blocked for security reasons`);
      continue;
    }
    
    // Skip null/undefined values
    if (value == null) {
      continue;
    }
    
    // Convert value to string and sanitize
    let cssValue = String(value).trim();
    
    // Split by semicolon and take only the first chunk to prevent injection
    // This allows trailing semicolons ergonomically while blocking multi-property injection
    if (cssValue.includes(';')) {
      const originalValue = cssValue;
      cssValue = cssValue.split(';')[0].trim();
      if (cssValue && cssValue !== originalValue.trim()) {
        logger.warn(`CSS value for "${prop}" contained semicolon - using only first part: "${cssValue}"`);
      }
    }
    
    // Skip if value is empty after sanitization
    if (!cssValue) {
      continue;
    }
    
    // Block dangerous patterns in values
    // Allow data: URIs but block external URLs
    const hasUrl = /url\s*\(/i.test(cssValue);
    const hasDataUri = /url\s*\(\s*['"]?data:/i.test(cssValue);
    
    if ((hasUrl && !hasDataUri) || 
        /expression\s*\(/i.test(cssValue) ||
        /javascript:/i.test(cssValue) ||
        /@import/i.test(cssValue)) {
      logger.warn(`CSS value for "${prop}" contains potentially dangerous pattern: "${cssValue}"`);
      continue;
    }
    
    cssDeclarations.push(`${cssProp}: ${cssValue}`);
  }
  
  return cssDeclarations.join('; ').trim();
}

/**
 * Process style attribute value - only accepts objects for safety
 * Returns CSS string or empty string if invalid
 */
export function processStyleAttribute(
  value: unknown, 
  data: Data, 
  parents: Data[], 
  logger: Logger,
  getOuterProperty?: OuterPropertyResolver
): string {
  // Handle conditional style values - check for $check property to detect conditionals
  if (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    '$check' in value &&
    typeof (value as any).$check === 'string'
  ) {
    const conditional = value as ConditionalBase<CSSProperties>;
    if (!validatePathExpression(conditional.$check, '$check', logger)) {
      return '';
    }
    const checkValue = getProperty(data, conditional.$check, parents, logger, getOuterProperty);
    const condition = evaluateCondition(checkValue, conditional);
    
    const resultValue = condition ? conditional.$then : conditional.$else;
    if (resultValue === undefined) {
      return '';
    }
    if (typeof resultValue === 'object' && resultValue !== null && !Array.isArray(resultValue)) {
      return styleObjectToString(resultValue as Record<string, unknown>, logger);
    }
    return '';
  }
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return styleObjectToString(value as Record<string, unknown>, logger);
  }
  
  logger.error(`Style attribute must be an object with CSS properties, not ${typeof value}. Example: style: { "color": "red", "font-size": "14px" }`);
  return '';
}

/**
 * Validate that an attribute is allowed for the given tag
 * Returns true if valid, false if invalid (logs warning for invalid)
 */
/**
 * Validate that an attribute name is allowed for the given tag
 * Returns true if valid, false if invalid (logs warning for invalid)
 */
export function validateAttributeName(key: string, tag: string, logger: Logger): boolean {
  // Check global attributes first
  const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));

  // Check tag-specific attributes
  const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
  const isTagSpecific = tagAttrs && tagAttrs.has(key);

  if (!isGlobal && !isTagSpecific) {
    logger.warn(`Attribute "${key}" is not allowed on tag "${tag}"`);
    return false; // Return false to skip the attribute
  }
  return true;
}

/**
 * Validate URL protocol for href and src attributes
 * Returns sanitized URL or null if dangerous protocol detected
 */
function validateUrlProtocol(attrName: string, value: string, logger: Logger): string | null {
  const trimmedValue = value.trim();
  
  // Allow empty values
  if (!trimmedValue) {
    return trimmedValue;
  }
  
  // Allow relative URLs (starting with /, #, or ? or containing no colon)
  if (trimmedValue.startsWith('/') || 
      trimmedValue.startsWith('#') || 
      trimmedValue.startsWith('?') ||
      !trimmedValue.includes(':')) {
    return trimmedValue;
  }
  
  // Extract protocol (everything before first colon)
  const colonIndex = trimmedValue.indexOf(':');
  if (colonIndex === -1) {
    return trimmedValue;
  }
  
  const protocol = trimmedValue.substring(0, colonIndex + 1).toLowerCase();
  
  // Check if protocol is safe
  if (SAFE_URL_PROTOCOLS.has(protocol)) {
    return trimmedValue;
  }
  
  // Dangerous protocol detected
  logger.warn(`Attribute "${attrName}" contains blocked protocol "${protocol}". Allowed protocols: ${[...SAFE_URL_PROTOCOLS].join(', ')}, or relative URLs`);
  return null;
}

/**
 * Validate attribute value
 * Returns sanitized value or null if validation fails
 */
export function validateAttributeValue(attrName: string, value: string, logger: Logger): string | null {
  // Check if this is a URL-based attribute that needs protocol validation
  if (URL_ATTRIBUTES.has(attrName)) {
    return validateUrlProtocol(attrName, value, logger);
  }
  
  // For non-URL attributes, return value as-is (including empty string)
  return value;
}

/**
 * Validate attribute name and value
 * Returns validated value or empty string if validation fails
 * Returns null if attribute name is not allowed
 */
export function validateAttribute(key: string, tag: string, value: string, logger: Logger): string | null {
  // First validate the attribute name is allowed for this tag
  if (!validateAttributeName(key, tag, logger)) {
    return null;
  }
  
  // Then validate the attribute value
  return validateAttributeValue(key, value, logger);
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
export function hasBinding(rest: InterpolatedString | (InterpolatedString | TemplateObject)[] | TemplateAttributes): rest is TemplateAttributes & { $bind: BindPath } {
  return rest !== null && typeof rest === 'object' && !Array.isArray(rest) && '$bind' in rest;
}

/**
 * Check if a template object has a $check structure (for $if tag)
 */
export function hasCheck(rest: InterpolatedString | (InterpolatedString | TemplateObject)[] | TemplateAttributes): rest is TemplateAttributes & { $check: BindPath } {
  return rest !== null && typeof rest === 'object' && !Array.isArray(rest) && '$check' in rest;
}

/**
 * Generic validator for simple path-like expressions used by $bind and $check
 * Disallows parent context access (..) and interpolation ({{...}}).
 * Allows single dot "." to refer to current object.
 * Returns true if valid, false if invalid (and logs error if logger provided)
 */
export function validatePathExpression(value: BindPath, label: string, logger: Logger): boolean {
  // Allow single dot "." to refer to current data object
  if (value === '.') {
    return true;
  }

  if (value.includes('..')) {
    logger.error(`${label} does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: ${label}: "${value}"`);
    return false;
  }
  if (value.includes('{{')) {
    logger.error(`${label} does not support interpolation {{...}} - use literal property paths only. Invalid: ${label}: "${value}"`);
    return false;
  }
  return true;
}

/**
 * Evaluate conditional logic for $if tag and conditional attributes
 * Supports operators: $<, $>, $<=, $>=, $=, $in
 * Supports modifiers: $not, $join
 * Default behavior: truthy check when no operators
 */
export function evaluateCondition<T>(
  checkValue: unknown,
  attrs: ConditionalBase<T>
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
  parents: Data[] = [],
  logger: Logger,
  getOuterProperty?: OuterPropertyResolver
): string {
  if (!validatePathExpression(value.$check, '$check', logger)) {
    return '';
  }
  const checkValue = getProperty(data, value.$check, parents, logger, getOuterProperty);
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

/**
 * Parse template object structure to extract tag, attributes, and children
 * Returns undefined if parsing fails (and logs error if logger provided)
 */
export function parseTemplateObject(templateObj: TemplateObject, logger: Logger): {
  tag: string;
  rest: InterpolatedString | (InterpolatedString | TemplateObject)[] | TemplateAttributes;
  children: (InterpolatedString | TemplateObject)[];
  attrs: Record<string, unknown>;
} | undefined {
  if (!templateObj || typeof templateObj !== 'object') {
    logger.error('Template object cannot be null, undefined, or non-object');
    return undefined;
  }
  const entries = Object.entries(templateObj);
  if (entries.length === 0) {
    logger.error('Template object must have at least one tag');
    return undefined;
  }
  const firstEntry = entries[0];
  if (!firstEntry) {
    logger.error('Template object must have at least one tag');
    return undefined;
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
 * Returns undefined valueToRender if validation fails (and logs error if logger provided)
 */
export function processConditional(
  rest: InterpolatedString | (InterpolatedString | TemplateObject)[] | TemplateAttributes | ConditionalValueOrTemplate,
  data: Data,
  parents: Data[] = [],
  logger: Logger,
  getOuterProperty?: OuterPropertyResolver
): { valueToRender: InterpolatedString | TemplateObject | undefined } {
  // Type cast to Conditional since we know this is a $if tag
  const conditional = rest as ConditionalValueOrTemplate;

  // "$if" tag requires $check
  if (!conditional.$check) {
    logger.error('"$if" tag requires $check attribute to specify the condition');
    return { valueToRender: undefined };
  }

  if (!validatePathExpression(conditional.$check, '$check', logger)) {
    return { valueToRender: undefined };
  }
  const checkValue = getProperty(data, conditional.$check, parents, logger, getOuterProperty);

  // $if tag does not support $children - only $then/$else
  if (typeof rest === 'object' && rest !== null && !Array.isArray(rest) && '$children' in rest) {
    logger.warn('"$if" tag does not support $children, use $then and $else instead');
    // Continue processing - $children will be ignored
  }

  // Extract properties for validation
  const { $then, $else } = conditional;

  // Validate $then and $else are not arrays
  if ($then !== undefined && Array.isArray($then)) {
    logger.error('"$if" tag $then must be a string or single element object, not an array');
    return { valueToRender: undefined };
  }
  if ($else !== undefined && Array.isArray($else)) {
    logger.error('"$if" tag $else must be a string or single element object, not an array');
    return { valueToRender: undefined };
  }

  // Check if any non-conditional properties were provided
  // Get all keys from rest and check if there are any beyond the Conditional properties
  const allKeys = typeof rest === 'object' && rest !== null && !Array.isArray(rest) ? Object.keys(rest) : [];

  const nonConditionalAttrs = allKeys.filter(k => !CONDITIONALKEYS.has(k));
  if (nonConditionalAttrs.length > 0) {
    logger.warn(`"$if" tag does not support attributes: ${nonConditionalAttrs.join(', ')}. Allowed: ${[...CONDITIONALKEYS].join(', ')}`);
    // Continue processing despite invalid attributes
  }

  // Evaluate condition using conditional logic
  const condition = evaluateCondition(checkValue, conditional);

  // Get the value to render based on condition
  const valueToRender = condition ? $then : $else;

  return { valueToRender };
}