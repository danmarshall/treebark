import { createElement, Fragment, cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { TreebarkInput, RenderOptions, TemplateElement, Data, TemplateObject, Logger, OuterPropertyResolver } from './types.js';
import {
  ALLOWED_TAGS,
  VOID_TAGS,
  getProperty,
  interpolate,
  validateAttributeName,
  validateAttributeValue,
  processStyleAttributeToProperties,
  hasBinding,
  validatePathExpression,
  isConditionalValue,
  evaluateConditionalValue,
  parseTemplateObject,
  processConditional
} from './common.js';

// Map treebark's HTML attribute names to the React prop names that React's
// element model expects. Template authors always write the HTML names (class,
// colspan, ...) in YAML/JSON — this translation is internal only and exists so the
// renderer works across React 17/18/19. data-*/aria-* are passed through unchanged.
const REACT_PROP_NAMES: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  tabindex: 'tabIndex'
};

interface RenderContext {
  parents?: Data[];
  logger: Logger;
  getOuterProperty?: OuterPropertyResolver;
}

export function renderToReact(
  input: TreebarkInput,
  options: RenderOptions = {}
): ReactNode {
  const data = input.data;

  // Set logger to console if not provided
  const logger = options.logger || console;
  const getOuterProperty = options.propertyFallback;

  const result = render(input.template, data, { logger, getOuterProperty });
  const nodes = Array.isArray(result) ? result : [result];
  return createElement(Fragment, null, ...withKeys(nodes));
}

// Props for the <Treebark> component: the template input plus the rendering options
// that make sense for React (indentation is a string-output concept and is ignored).
export interface TreebarkProps extends TreebarkInput {
  logger?: Logger;
  propertyFallback?: OuterPropertyResolver;
}

/**
 * Idiomatic React component wrapper around renderToReact. Drop it straight into JSX:
 *
 *   <Treebark template={template} data={data} />
 */
export function Treebark({ template, data, logger, propertyFallback }: TreebarkProps): ReactNode {
  return renderToReact({ template, data }, { logger, propertyFallback });
}

// React requires a `key` on each element rendered as part of an array. Text nodes
// (strings) don't need one, so only valid elements are touched.
function withKeys(nodes: ReactNode[]): ReactNode[] {
  return nodes.map((node, index) =>
    isValidElement(node) && node.key == null
      ? cloneElement(node, { key: String(index) })
      : node
  );
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: RenderContext): ReactNode | ReactNode[] {
  const parents = context.parents || [];
  const logger = context.logger;
  const getOuterProperty = context.getOuterProperty;

  if (typeof template === 'string') {
    // React escapes text children by default, so interpolate without HTML escaping.
    return interpolate(template, data, false, parents, logger, getOuterProperty);
  }

  if (Array.isArray(template)) {
    const results: ReactNode[] = [];
    for (const t of template) {
      const r = render(t, data, context);
      if (Array.isArray(r)) results.push(...r);
      else results.push(r);
    }
    return results;
  }

  const parsed = parseTemplateObject(template, logger);
  if (!parsed) {
    return []; // Error was logged, return empty array
  }
  const { tag, rest, children, attrs } = parsed;

  if (!ALLOWED_TAGS.has(tag)) {
    logger.error(`Tag "${tag}" is not allowed`);
    return [];
  }

  // React has no comment node. Comments are silently dropped from React output.
  if (tag === '$comment') {
    return [];
  }

  // Special handling for "$if" tag
  if (tag === '$if') {
    const { valueToRender } = processConditional(rest, data, parents, logger, getOuterProperty);
    if (valueToRender === undefined) {
      return [];
    }
    const nodes = render(valueToRender, data, context);
    return Array.isArray(nodes) ? nodes : [nodes];
  }

  const isVoid = VOID_TAGS.has(tag);
  if (isVoid && children.length > 0) {
    logger.warn(`Tag "${tag}" is a void element and cannot have children`);
    // Continue rendering the void tag without children
  }

  // Handle $bind
  if (hasBinding(rest)) {
    if (!validatePathExpression(rest.$bind, '$bind', logger)) {
      return [];
    }

    // $bind uses literal property paths only - no parent context access
    const bound = getProperty(data, rest.$bind, [], logger, getOuterProperty);
    const { $bind, $children = [], ...bindAttrs } = rest;

    if (isVoid && $children.length > 0) {
      logger.warn(`Tag "${tag}" is a void element and cannot have children`);
      // Continue rendering the void tag without children
    }

    if (Array.isArray(bound)) {
      const childNodes: ReactNode[] = [];
      if (!isVoid) {
        for (const item of bound) {
          // For array items, add current data context to parents
          const newParents = [...parents, data];
          for (const c of $children) {
            const nodes = render(c, item as Data, { ...context, parents: newParents });
            if (Array.isArray(nodes)) childNodes.push(...nodes);
            else childNodes.push(nodes);
          }
        }
      }
      return createElementWithAttrs(tag, bindAttrs, data, parents, logger, getOuterProperty, childNodes);
    }

    // Check if bound is a primitive and we're trying to access children
    if (bound !== null && bound !== undefined && typeof bound !== 'object') {
      logger.error(`$bind resolved to primitive value of type "${typeof bound}", cannot render children`);
      return [];
    }

    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    // When binding to an object, add current data context to parents for child context
    const newParents = [...parents, data];
    const childNodes = render({ [tag]: { ...bindAttrs, $children } } as TemplateObject, boundData, { ...context, parents: newParents });
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }

  const childNodes: ReactNode[] = [];
  if (!isVoid) {
    for (const c of children) {
      const nodes = render(c, data, context);
      if (Array.isArray(nodes)) childNodes.push(...nodes);
      else childNodes.push(nodes);
    }
  }

  return createElementWithAttrs(tag, attrs, data, parents, logger, getOuterProperty, childNodes);
}

function createElementWithAttrs(
  tag: string,
  attrs: Record<string, unknown>,
  data: Data,
  parents: Data[],
  logger: Logger,
  getOuterProperty: OuterPropertyResolver | undefined,
  childNodes: ReactNode[]
): ReactNode {
  const props = buildProps(attrs, data, tag, parents, logger, getOuterProperty);
  if (childNodes.length === 0) {
    return createElement(tag, props);
  }
  return createElement(tag, props, ...withKeys(childNodes));
}

function buildProps(
  attrs: Record<string, unknown>,
  data: Data,
  tag: string,
  parents: Data[],
  logger: Logger,
  getOuterProperty?: OuterPropertyResolver
): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  Object.entries(attrs).forEach(([key, value]) => {
    // First check if attribute name is allowed for this tag
    if (!validateAttributeName(key, tag, logger)) {
      return; // Skip invalid attributes
    }

    // Special handling for style attribute - React wants an object, not a string
    if (key === 'style') {
      const styleObj = processStyleAttributeToProperties(value, data, parents, logger, getOuterProperty);
      if (styleObj && Object.keys(styleObj).length > 0) {
        props.style = styleObj;
      }
      return;
    }

    let attrValue: string;
    if (isConditionalValue(value)) {
      const evaluatedValue = evaluateConditionalValue(value, data, parents, logger, getOuterProperty);
      attrValue = interpolate(String(evaluatedValue), data, false, parents, logger, getOuterProperty);
    } else {
      attrValue = interpolate(String(value), data, false, parents, logger, getOuterProperty);
    }

    // Validate attribute value (name already validated above)
    const validatedValue = validateAttributeValue(key, attrValue, logger);
    if (validatedValue == null) {  // Checks both null and undefined
      return;
    }

    const propName = REACT_PROP_NAMES[key] || key;
    props[propName] = validatedValue;
  });

  return props;
}
