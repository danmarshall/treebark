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
  escape,
  validateTag, 
  validateAttribute, 
  validateChildren,
  isVoidTag,
  isCommentTag,
  validateNoNestedComments,
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
  
  // Validate that void tags don't have children
  const hasChildren = children.length > 0;
  validateChildren(tag, hasChildren);
  
  // Validate no nested comments
  validateNoNestedComments(tag, children);
  
  // Handle comment tags specially
  if (isCommentTag(tag)) {
    // For comments, render all children as text and create a comment node
    const commentContent = children.map((c: Schema) => {
      if (typeof c === "string") {
        // For strings in comments, escape everything including literal text
        const interpolated = interpolate(c, data, false);
        return escape(interpolated);
      }
      if (Array.isArray(c)) return c.map(s => escape(renderToString(s, data))).join("");
      // For object children, render them as HTML string and escape
      return escape(renderToString(c, data));
    }).join("");
    return document.createComment(commentContent);
  }
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    setAttrs(element, bindAttrs, data, tag);
    
    // Validate children for bound elements
    validateChildren(tag, $children.length > 0);
    
    // Validate no nested comments for bound elements
    validateNoNestedComments(tag, $children);
    
    if (Array.isArray(bound)) {
      if (isCommentTag(tag)) {
        // Handle comment tags in binding - return array of comment nodes
        return bound.map(item => {
          const commentContent = $children.map((c: Schema) => {
            if (typeof c === "string") {
              const interpolated = interpolate(c, item, false);
              return escape(interpolated);
            }
            if (Array.isArray(c)) return c.map(s => escape(renderToString(s, item))).join("");
            return escape(renderToString(c, item));
          }).join("");
          return document.createComment(commentContent);
        });
      }
      
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

// Helper function to render schema to string (needed for comment content)
function renderToString(schema: Schema, data: Data): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => renderToString(s, data)).join("");
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  
  if (isCommentTag(tag)) {
    const commentContent = children.map((c: Schema) => {
      if (typeof c === "string") {
        const interpolated = interpolate(c, data, false);
        return escape(interpolated);
      }
      return escape(renderToString(c, data));
    }).join("");
    return commentContent ? `<!-- ${commentContent} -->` : `<!-- -->`;
  }
  
  const renderedChildren = children.map((c: Schema) => renderToString(c, data)).join("");
  return `<${tag}>${renderedChildren}</${tag}>`;
}

function setAttrs(element: HTMLElement, attrs: Record<string, any>, data: Data, tag: string): void {
  Object.entries(attrs).forEach(([key, value]) => {
    validateAttribute(key, tag);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

