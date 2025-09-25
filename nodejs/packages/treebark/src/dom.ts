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
  parseTemplateObject,
  RenderOptions
} from './common';
import { renderToString } from './string';

export function renderToDOM(
  input: TreebarkInput, 
  options: RenderOptions = {}
): DocumentFragment {
  const data = { ...input.data, ...options.data };
  
  const fragment = document.createDocumentFragment();
  
  // If template is a single element and data is an array, render template for each data item
  if (!Array.isArray(input.template) && Array.isArray(input.data)) {
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

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean } = {}): Node | Node[] {
  if (typeof template === "string") return document.createTextNode(interpolate(template, data));
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
  if (tag === 'comment' && context.insideComment) {
    throw new Error('Nested comments are not allowed');
  }
  
  // Inline validateChildren: Validate that void tags don't have children
  const hasChildren = children.length > 0;
  const isVoid = VOID_TAGS.has(tag);
  if (isVoid && hasChildren) {
    throw new Error(`Tag "${tag}" is a void element and cannot have children`);
  }
  
  // Special handling for comment tags
  if (tag === 'comment') {
    // Use string renderer and extract content between <!-- and -->
    const stringResult = renderToString({ template, data });
    const commentContent = stringResult.slice(4, -3); // Remove '<!--' and '-->'
    return document.createComment(commentContent);
  }
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag);
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    
    if (Array.isArray(bound)) {
      for (const item of bound) {
        for (const c of $children) {
          const nodes = render(c, item as Data, context);
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
    const childNodes = render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag);
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

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string): void {
  Object.entries(attrs).forEach(([key, value]) => {
    validateAttribute(key, tag);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

