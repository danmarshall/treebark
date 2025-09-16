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

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): string {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToString(schema.$template, { data: schema.$data });
  }
  
  return render(schema as Schema, data);
}

function render(schema: Schema, data: Data): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data)).join("");
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  validateTag(tag);
  
  // Validate that void tags don't have children
  const hasChildren = children.length > 0;
  validateChildren(tag, hasChildren);
  
  // Validate no nested comments
  validateNoNestedComments(tag, children);
  
  // Handle comment tags specially
  if (isCommentTag(tag)) {
    const commentContent = children.map((c: Schema) => render(c, data)).join("");
    return commentContent ? `<!-- ${commentContent} -->` : `<!-- -->`;
  }
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    // Validate children for bound elements
    validateChildren(tag, $children.length > 0);
    
    // Validate no nested comments for bound elements
    validateNoNestedComments(tag, $children);
    
    if (Array.isArray(bound)) {
      if (isVoidTag(tag)) {
        return `<${tag}${renderAttrs(bindAttrs, data, tag)}>`;
      }
      
      // Handle comment tags in binding
      if (isCommentTag(tag)) {
        return bound.map(item => {
          const commentContent = $children.map((c: Schema) => render(c, item)).join('');
          return commentContent ? `<!-- ${commentContent} -->` : `<!-- -->`;
        }).join('');
      }
      
      return `<${tag}${renderAttrs(bindAttrs, data, tag)}>${bound.map(item => 
        $children.map((c: Schema) => render(c, item)).join('')).join('')}</${tag}>`;
    }
    return render({ [tag]: { ...bindAttrs, $children } }, bound);
  }
  
  // Render void tags without closing tag
  if (isVoidTag(tag)) {
    return `<${tag}${renderAttrs(attrs, data, tag)}>`;
  }
  
  return `<${tag}${renderAttrs(attrs, data, tag)}>${children.map((c: Schema) => render(c, data)).join("")}</${tag}>`;
}

function renderAttrs(attrs: Record<string, any>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}