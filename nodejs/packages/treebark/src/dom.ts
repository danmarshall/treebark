import { 
  TemplateItem,
  TemplateElement,
  TreebarkInput,
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate, 
  validateAttribute, 
  normalizeInput,
  hasBinding, 
  parseTemplateObject,
  RenderOptions
} from './common';
import { renderToString } from './string';

export function renderToDOM(
  input: TreebarkInput, 
  options: RenderOptions = {}
): DocumentFragment {
  const { template, data: inputData } = normalizeInput(input);
  const data = { ...inputData, ...options.data };
  
  const fragment = document.createDocumentFragment();
  const result = render(template, data, {});
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(template: TemplateItem, data: Data, context: { insideComment?: boolean } = {}): Node | Node[] {
  if (typeof template === "string") return document.createTextNode(interpolate(template, data));
  if (Array.isArray(template)) return template.flatMap(t => {
    const r = render(t, data, context); return Array.isArray(r) ? r : [r];
  });
  
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
      bound.forEach(item => $children.forEach((c: TemplateElement) => {
        const nodes = render(c, item as Data, context);
        (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
      }));
      return element;
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    const childNodes = render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag);
  children.forEach((c: TemplateElement) => {
    const nodes = render(c, data, context);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
  });
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, unknown>, data: Data, tag: string): void {
  Object.entries(attrs).forEach(([key, value]) => {
    validateAttribute(key, tag);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

