import { 
  Schema, 
  Data, 
  ALLOWED_TAGS, 
  CONTAINER_TAGS,
  VOID_TAGS,
  GLOBAL_ATTRS, 
  TAG_SPECIFIC_ATTRS,
  getProperty, 
  interpolate, 
  validateTag, 
  validateAttribute, 
  validateChildren,
  isVoidTag,
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
  const result = render(schema as Schema, data);
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(schema: Schema, data: Data): Node | Node[] {
  if (typeof schema === "string") return document.createTextNode(interpolate(schema, data));
  if (Array.isArray(schema)) return schema.flatMap(s => {
    const r = render(s, data); return Array.isArray(r) ? r : [r];
  });
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  validateTag(tag);
  
  // Handle comment tags specially
  if (tag === 'comment') {
    const content = children.map((c: Schema) => {
      if (typeof c === "string") return interpolate(c, data);
      // For complex content, render to string and extract text content
      const tempDiv = document.createElement('div');
      const nodes = render(c, data);
      (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => tempDiv.appendChild(n));
      return tempDiv.innerHTML;
    }).join("").replace(/-->/g, '--&gt;');
    return document.createComment(content);
  }
  
  // Validate that void tags don't have children
  const hasChildren = children.length > 0;
  validateChildren(tag, hasChildren);
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    // Validate children for bound elements
    validateChildren(tag, $children.length > 0);
    
    if (Array.isArray(bound)) {
      if (tag === 'comment') {
        return bound.map(item => {
          const content = $children.map((c: Schema) => {
            if (typeof c === "string") return interpolate(c, item);
            // For complex content, render to string and extract text content
            const tempDiv = document.createElement('div');
            const nodes = render(c, item);
            (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => tempDiv.appendChild(n));
            return tempDiv.innerHTML;
          }).join("").replace(/-->/g, '--&gt;');
          return document.createComment(content);
        });
      }
      setAttrs(element, bindAttrs, data, tag);
      bound.forEach(item => $children.forEach((c: Schema) => {
        const nodes = render(c, item);
        (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
      }));
      return element;
    }
    const childNodes = render({ [tag]: { ...bindAttrs, $children } }, bound);
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  setAttrs(element, attrs, data, tag);
  children.forEach((c: Schema) => {
    const nodes = render(c, data);
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

