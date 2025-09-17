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
  parseSchemaObject 
} from './common';

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): string {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToString(schema.$template, { data: schema.$data });
  }
  
  return render(schema as Schema, data);
}

// Helper function to render opening tag with attributes
function renderOpenTag(tag: string, attrs: Record<string, any>, data: Data): string {
  return `<${tag}${renderAttrs(attrs, data, tag)}>`;
}

// Helper function to render complete tag with content
function renderCompleteTag(tag: string, attrs: Record<string, any>, content: string, data: Data): string {
  return `${renderOpenTag(tag, attrs, data)}${content}</${tag}>`;
}

function render(schema: Schema, data: Data): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data)).join("");
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  
  // Inline validateTag: Validate that a tag is allowed
  if (!ALLOWED_TAGS.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
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
      const content = bound.map(item => 
        $children.map((c: Schema) => render(c, item)).join('')).join('');
      
      return isVoid ? renderOpenTag(tag, bindAttrs, data) : renderCompleteTag(tag, bindAttrs, content, data);
    }
    return render({ [tag]: { ...bindAttrs, $children } }, bound);
  }
  
  // Render void tags without closing tag or complete tags with content
  const content = children.map((c: Schema) => render(c, data)).join("");
  return isVoid ? renderOpenTag(tag, attrs, data) : renderCompleteTag(tag, attrs, content, data);
}

function renderAttrs(attrs: Record<string, any>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}