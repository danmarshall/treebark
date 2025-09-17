import { 
  Schema, 
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate, 
  validateAttribute, 
  isTemplate, 
  hasBinding, 
  parseSchemaObject 
} from './common';

export function renderToDOM(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): DocumentFragment {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToDOM(schema.$template, { data: schema.$data });
  }
  
  const fragment = document.createDocumentFragment();
  const result = render(schema as Schema, data, {});
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(schema: Schema, data: Data, context: { insideComment?: boolean } = {}): Node | Node[] {
  if (typeof schema === "string") return document.createTextNode(interpolate(schema, data));
  if (Array.isArray(schema)) return schema.flatMap(s => {
    const r = render(s, data, context); return Array.isArray(r) ? r : [r];
  });
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  
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
    const newContext = { ...context, insideComment: true };
    const childNodes = children.flatMap(c => {
      const nodes = render(c, data, newContext);
      return Array.isArray(nodes) ? nodes : [nodes];
    });
    
    // Create comment content by collecting all text content from child nodes
    let commentText = '';
    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        commentText += node.textContent || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        commentText += (node as Element).outerHTML;
      }
    });
    
    return document.createComment(commentText);
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
      bound.forEach(item => $children.forEach((c: Schema) => {
        const nodes = render(c, item, context);
        (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
      }));
      return element;
    }
    const childNodes = render({ [tag]: { ...bindAttrs, $children } }, bound, context);
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag);
  children.forEach((c: Schema) => {
    const nodes = render(c, data, context);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
  });
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, any>, data: Data, tag: string): void {
  Object.entries(attrs).forEach(([key, value]) => {
    validateAttribute(key, tag);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

