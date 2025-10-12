import { 
  TemplateElement,
  TemplateObject,
  TreebarkInput,
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate, 
  validateAttribute, 
  hasBinding,
  hasCheck,
  validateBindExpression,
  validateCheckExpression,
  evaluateCondition,
  isConditionalValue,
  evaluateConditionalValue,
  templateHasCurrentObjectBinding,
  parseTemplateObject,
  RenderOptions
} from './common.js';
import { renderToString } from './string.js';

export function renderToDOM(
  input: TreebarkInput, 
  options: RenderOptions = {}
): DocumentFragment {
  // Preserve arrays as arrays, only spread objects
  const data = Array.isArray(input.data) 
    ? input.data 
    : { ...input.data, ...options.data };
  
  const fragment = document.createDocumentFragment();
  
  // If template is a single element and data is an array, render template for each data item
  // UNLESS the template has $bind: "." which means bind to the array itself
  if (!Array.isArray(input.template) && Array.isArray(input.data) && !templateHasCurrentObjectBinding(input.template)) {
    input.data.forEach(item => {
      const result = render(input.template, { ...item, ...options.data }, {});
      if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
      else fragment.appendChild(result);
    });
    return fragment;
  }
  
  const result = render(input.template, data, {});
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; parents?: Data[] } = {}): Node | Node[] {
  const parents = context.parents || [];
  
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
  
  const { tag, rest, children, attrs } = parseTemplateObject(template);
  
  // Inline validateTag: Validate that a tag is allowed
  if (!ALLOWED_TAGS.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
  }
  
  // Prevent nested comments
  if (tag === '$comment' && context.insideComment) {
    throw new Error('Nested comments are not allowed');
  }
  
  // Special handling for "$if" tag
  if (tag === '$if') {
    // "$if" tag requires $check
    if (!hasCheck(rest)) {
      throw new Error('"$if" tag requires $check attribute to specify the condition');
    }
    
    validateCheckExpression(rest.$check);
    const checkValue = getProperty(data, rest.$check, parents);
    const { $check, $then, $else, $children, ...restAttrs } = rest;
    
    // Support both new ($then/$else) and old ($children) syntax for backward compatibility
    const thenValue = $then !== undefined ? $then : ($children && $children.length > 0 ? $children[0] : undefined);
    const elseValue = $else;
    
    // Check if any non-reserved attributes were provided (excluding operators and modifiers)
    const reservedKeys = new Set(['$not', '$<', '$>', '$<=', '$>=', '$=', '$in', '$join', '$then', '$else']);
    const nonReservedAttrs = Object.keys(restAttrs).filter(key => !reservedKeys.has(key));
    if (nonReservedAttrs.length > 0) {
      throw new Error('"$if" tag does not support attributes, only $check, operators ($<, $>, $<=, $>=, $=, $in), modifiers ($not, $join), and $then/$else');
    }
    
    // Evaluate condition using new operator-based logic
    const condition = evaluateCondition(checkValue, rest);
    
    // Get the value to render based on condition
    const valueToRender = condition ? thenValue : elseValue;
    
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
    throw new Error(`Tag "${tag}" is a void element and cannot have children`);
  }
  
  // Special handling for $comment tags
  if (tag === '$comment') {
    // Use string renderer and extract content between <!-- and -->
    const stringResult = renderToString({ template, data }, { /* no options needed for comment rendering */ });
    const commentContent = stringResult.slice(4, -3); // Remove '<!--' and '-->'
    return document.createComment(commentContent);
  }
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    validateBindExpression(rest.$bind);
    
    // $bind uses literal property paths only - no parent context access
    const bound = getProperty(data, rest.$bind, []);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag, parents);
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
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
    const childNodes = render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag, parents);
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

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = []): void {
  Object.entries(attrs).forEach(([key, value]) => {
    validateAttribute(key, tag);
    
    // Check if value is a conditional value
    if (isConditionalValue(value)) {
      const evaluatedValue = evaluateConditionalValue(value, data, parents);
      element.setAttribute(key, interpolate(String(evaluatedValue), data, false, parents));
    } else {
      element.setAttribute(key, interpolate(String(value), data, false, parents));
    }
  });
}

