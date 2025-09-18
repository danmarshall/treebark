import { 
  Schema, 
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate,
  escape,
  validateAttribute, 
  isTemplate, 
  hasBinding, 
  parseSchemaObject,
  RenderOptions
} from './common';

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: RenderOptions = {}): string {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToString(schema.$template, { data: schema.$data });
  }
  
  return render(schema as Schema, data, {});
}

// Helper function to render tag, deciding internally whether to close or not
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, content?: string): string {
  // Special handling for comment tags
  if (tag === 'comment') {
    return `<!--${content || ""}-->`;
  }
  
  const openTag = `<${tag}${renderAttrs(attrs, data, tag)}>`;
  const isVoid = VOID_TAGS.has(tag);
  
  // Void tags are never closed, regardless of content
  if (isVoid) {
    return openTag;
  }
  
  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${content || ""}</${tag}>`;
}

function render(schema: Schema, data: Data, context: { insideComment?: boolean } = {}): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data, context)).join("");
  
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
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    
    if (Array.isArray(bound)) {
      const newContext = tag === 'comment' ? { ...context, insideComment: true } : context;
      const content = bound.map(item => 
        $children.map((c: Schema) => render(c, item as Data, newContext)).join('')).join('');
      
      return renderTag(tag, bindAttrs, data, content);
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
  }
  
  // Render void tags without closing tag or complete tags with content
  const newContext = tag === 'comment' ? { ...context, insideComment: true } : context;
  const content = children.map((c: Schema) => render(c, data, newContext)).join("");
  return renderTag(tag, attrs, data, content);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}