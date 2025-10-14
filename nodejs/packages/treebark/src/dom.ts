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
  // Preserve arrays as arrays, only spread objects
  const data = Array.isArray(input.data) 
    ? input.data 
    : { ...input.data, ...options.data };
  
  const fragment = document.createDocumentFragment();
  
  const result = render(input.template, data, { logger: options.logger });
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; parents?: Data[]; logger?: Logger } = {}): Node | Node[] {
  const parents = context.parents || [];
  const logger = context.logger;
  
  if (typeof template === "string") return document.createTextNode(interpolate(template, data, true, parents));
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
    (logger || console).error(`Tag "${tag}" is not allowed`);
    return [];
  }
  
  // Prevent nested comments
  if (tag === '$comment' && context.insideComment) {
    (logger || console).error('Nested comments are not allowed');
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
    (logger || console).error(`Tag "${tag}" is a void element and cannot have children`);
    return [];
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
    const bound = getProperty(data, rest.$bind, []);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag, parents, logger);
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      (logger || console).error(`Tag "${tag}" is a void element and cannot have children`);
      return [];
    }
    
    if (Array.isArray(bound)) {
      for (const item of bound) {
        // For array items, add current data context to parents
        const newParents = [...parents, data];
        for (const c of $children) {
          const nodes = render(c, item as Data, { ...context, parents: newParents });
          if (Array.isArray(nodes)) {
            for (const n of nodes) element.appendChild(n);
          } else {
            element.appendChild(nodes);
          }
        }
      }
      return element;
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    // When binding to an object, add current data context to parents for child context
    const newParents = [...parents, data];
    const childNodes = render({ [tag]: { ...bindAttrs, $children } } as TemplateObject, boundData, { ...context, parents: newParents });
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag, parents, logger);
  for (const c of children) {
    const nodes = render(c, data, context);
    if (Array.isArray(nodes)) {
      for (const n of nodes) element.appendChild(n);
    } else {
      element.appendChild(nodes);
    }
  }
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger?: Logger): void {
  Object.entries(attrs).forEach(([key, value]) => {
    if (!validateAttribute(key, tag, logger)) {
      return; // Skip invalid attributes
    }
    
    // Check if value is a conditional value
    if (isConditionalValue(value)) {
      const evaluatedValue = evaluateConditionalValue(value, data, parents, logger);
      element.setAttribute(key, interpolate(String(evaluatedValue), data, false, parents));
    } else {
      element.setAttribute(key, interpolate(String(value), data, false, parents));
    }
  });
}

