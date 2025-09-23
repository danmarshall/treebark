import { 
  TemplateItem,
  TemplateElement,
  TreebarkInput,
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate,
  escape,
  validateAttribute, 
  normalizeInput,
  hasBinding, 
  parseTemplateObject,
  RenderOptions
} from './common';

export function renderToString(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  const { template, data: inputData } = normalizeInput(input);
  const data = { ...inputData, ...options.data };
  
  // Conditionally set indent context
  const context = options.indent ? {
    indentStr: typeof options.indent === 'number' ? ' '.repeat(options.indent) :
               typeof options.indent === 'string' ? options.indent : '  ',
    level: 0
  } : {};
  
  return render(template, data, context);
}

// Helper function to render tag, deciding internally whether to close or not
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, content?: string, indentStr?: string, level?: number): string {
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
  
  // Apply indentation if enabled and content has child elements
  if (indentStr && content && content.includes('<')) {
    const currentIndent = indentStr.repeat(level || 0);
    return `${openTag}\n${content}\n${currentIndent}</${tag}>`;
  }
  
  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${content || ""}</${tag}>`;
}

function render(template: TemplateItem, data: Data, context: { insideComment?: boolean; indentStr?: string; level?: number } = {}): string {
  if (typeof template === "string") return interpolate(template, data);
  
  const separator = context.indentStr ? '\n' : '';
  
  if (Array.isArray(template)) {
    return template.map(t => render(t, data, context)).join(separator);
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
  
  // Prepare child context with incremented level
  const childContext = { 
    ...context, 
    insideComment: tag === 'comment' || context.insideComment,
    level: (context.level || 0) + 1
  };
  
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
        $children.map((c: TemplateElement) => render(c, item as Data, childContext)).join(separator)
      ).join(separator);
      
      return renderTag(tag, bindAttrs, data, content, context.indentStr, context.level);
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
  }
  
  // Render children with indentation
  const content = children.map((c: TemplateElement) => {
    const result = render(c, data, childContext);
    // Add indentation to child tags
    if (context.indentStr && result.startsWith('<')) {
      return context.indentStr.repeat(childContext.level) + result;
    }
    return result;
  }).join(separator);
  
  return renderTag(tag, attrs, data, content, context.indentStr, context.level);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}