import { TreebarkInput, RenderOptions, TemplateElement, Data, TemplateObject, Logger, OuterPropertyResolver } from './types.js';
import { 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate, 
  validateAttributeName,
  validateAttributeValue,
  processStyleAttribute,
  hasBinding,
  validatePathExpression,
  isConditionalValue,
  evaluateConditionalValue,
  parseTemplateObject,
  processConditional
} from './common.js';

export function renderToDOM(
  input: TreebarkInput, 
  options: RenderOptions = {}
): DocumentFragment {
  const data = input.data;
  
  // Set logger to console if not provided
  const logger = options.logger || console;
  const getOuterProperty = options.propertyFallback;
  // Default to true for security - users must explicitly opt-out
  const useBlockContainer = options.useBlockContainer !== false;
  
  const fragment = document.createDocumentFragment();
  
  const result = render(input.template, data, { logger, getOuterProperty });
  
  // Determine the target for appending rendered nodes
  let target: Node;
  if (useBlockContainer) {
    // Create a block container with CSS containment and stacking context isolation
    // This prevents positioned elements from overlaying page elements
    const container = document.createElement('div');
    container.style.cssText = 'contain: content; isolation: isolate;';
    container.setAttribute('data-treebark-container', 'true');
    target = container;
    fragment.appendChild(container);
  } else {
    // Standard rendering without containment (opt-out for trusted templates)
    target = fragment;
  }
  
  // Append rendered content to target
  if (Array.isArray(result)) {
    result.forEach(n => target.appendChild(n));
  } else {
    target.appendChild(result);
  }
  
  return fragment;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; parents?: Data[]; logger: Logger; getOuterProperty?: OuterPropertyResolver }): Node | Node[] {
  const parents = context.parents || [];
  const logger = context.logger;
  const getOuterProperty = context.getOuterProperty;
  
  if (typeof template === "string") {
    // For regular text nodes, we should NOT escape HTML because document.createTextNode() handles it safely.
    // Only escape when inside a comment where we need the HTML string representation.
    const shouldEscape = context.insideComment || false;
    return document.createTextNode(interpolate(template, data, shouldEscape, parents, logger, getOuterProperty));
  }
  if (Array.isArray(template)) {
    const results: Node[] = [];
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
  
  // Inline validateTag: Validate that a tag is allowed
  if (!ALLOWED_TAGS.has(tag)) {
    logger.error(`Tag "${tag}" is not allowed`);
    return [];
  }
  
  // Prevent nested comments
  if (tag === '$comment' && context.insideComment) {
    logger.error('Nested comments are not allowed');
    return [];
  }
  
  // Special handling for "$if" tag
  if (tag === '$if') {
    const { valueToRender } = processConditional(rest, data, parents, logger, getOuterProperty);
    
    // If no value to render, return empty
    if (valueToRender === undefined) {
      return [];
    }
    
    // Render the single element
    const nodes = render(valueToRender, data, context);
    return Array.isArray(nodes) ? nodes : [nodes];
  }
  
  // Inline validateChildren: Validate that void tags don't have children
  const hasChildren = children.length > 0;
  const isVoid = VOID_TAGS.has(tag);
  if (isVoid && hasChildren) {
    logger.warn(`Tag "${tag}" is a void element and cannot have children`);
    // Continue rendering the void tag without children
  }
  
  // Special handling for $comment tags
  if (tag === '$comment') {
    // Create a temporary container to render children as DOM nodes
    const tempContainer = document.createElement('div');
    
    // Render children into the temp container with insideComment flag set
    const commentContext = { ...context, insideComment: true };
    for (const c of children) {
      const nodes = render(c, data, commentContext);
      if (Array.isArray(nodes)) {
        for (const n of nodes) tempContainer.appendChild(n);
      } else {
        tempContainer.appendChild(nodes);
      }
    }
    
    // Extract innerHTML as the comment content
    return document.createComment(tempContainer.innerHTML);
  }
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    if (!validatePathExpression(rest.$bind, '$bind', logger)) {
      return [];
    }
    
    // $bind uses literal property paths only - no parent context access
    const bound = getProperty(data, rest.$bind, [], logger, getOuterProperty);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag, parents, logger, getOuterProperty);
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      logger.warn(`Tag "${tag}" is a void element and cannot have children`);
      // Continue rendering the void tag without children
    }
    
    if (Array.isArray(bound)) {
      for (const item of bound) {
        // For array items, add current data context to parents
        const newParents = [...parents, data];
        // Skip children for void tags
        if (!isVoid) {
          for (const c of $children) {
            const nodes = render(c, item as Data, { ...context, parents: newParents });
            if (Array.isArray(nodes)) {
              for (const n of nodes) element.appendChild(n);
            } else {
              element.appendChild(nodes);
            }
          }
        }
      }
      return element;
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
  
  setAttrs(element, attrs, data, tag, parents, logger, getOuterProperty);
  // Skip children for void tags
  if (!isVoid) {
    for (const c of children) {
      const nodes = render(c, data, context);
      if (Array.isArray(nodes)) {
        for (const n of nodes) element.appendChild(n);
      } else {
        element.appendChild(nodes);
      }
    }
  }
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger: Logger, getOuterProperty?: OuterPropertyResolver): void {
  Object.entries(attrs).forEach(([key, value]) => {
    // First check if attribute name is allowed for this tag
    if (!validateAttributeName(key, tag, logger)) {
      return; // Skip invalid attributes
    }
    
    let attrValue: string;
    
    // Special handling for style attribute
    if (key === 'style') {
      attrValue = processStyleAttribute(value, data, parents, logger, getOuterProperty);
      // If processing resulted in empty string, skip the attribute
      if (!attrValue) {
        return;
      }
    } else {
      // Regular attribute handling
      if (isConditionalValue(value)) {
        const evaluatedValue = evaluateConditionalValue(value, data, parents, logger, getOuterProperty);
        attrValue = interpolate(String(evaluatedValue), data, false, parents, logger, getOuterProperty);
      } else {
        attrValue = interpolate(String(value), data, false, parents, logger, getOuterProperty);
      }
    }
    
    // Validate attribute value (name already validated above)
    const validatedValue = validateAttributeValue(key, attrValue, logger);
    if (validatedValue == null) {  // Checks both null and undefined
      return;
    }
    
    element.setAttribute(key, validatedValue);
  });
}

