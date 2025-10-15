import { TreebarkInput, RenderOptions, TemplateElement, Data, TemplateObject, Logger } from './types.js';
import { 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate, 
  validateAttribute, 
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
  // Use empty object as default only when data is undefined
  // Allow null, 0, false, empty string as valid data values
  const data = input.data === undefined ? {} : input.data;
  
  // Set logger to console if not provided
  const logger = options.logger || console;
  
  const fragment = document.createDocumentFragment();
  
  const result = render(input.template, data, { logger });
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; parents?: Data[]; logger: Logger }): Node | Node[] {
  const parents = context.parents || [];
  const logger = context.logger;
  
  if (typeof template === "string") return document.createTextNode(interpolate(template, data, true, parents, logger));
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
    const { valueToRender } = processConditional(rest, data, parents, logger);
    
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
    const bound = getProperty(data, rest.$bind, [], logger);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag, parents, logger);
    
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
  
  setAttrs(element, attrs, data, tag, parents, logger);
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

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger: Logger): void {
  Object.entries(attrs).forEach(([key, value]) => {
    if (!validateAttribute(key, tag, logger)) {
      return; // Skip invalid attributes
    }
    
    // Check if value is a conditional value
    if (isConditionalValue(value)) {
      const evaluatedValue = evaluateConditionalValue(value, data, parents, logger);
      element.setAttribute(key, interpolate(String(evaluatedValue), data, false, parents, logger));
    } else {
      element.setAttribute(key, interpolate(String(value), data, false, parents, logger));
    }
  });
}

