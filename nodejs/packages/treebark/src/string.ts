import { 
  TemplateElement,
  TreebarkInput,
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate,
  escape,
  validateAttribute, 
  hasBinding, 
  parseTemplateObject,
  RenderOptions
} from './common';

export function renderToString(
  input: TreebarkInput, 
  options: RenderOptions = {}
): string {
  const data = { ...input.data, ...options.data };
  
  // Conditionally set indent context
  const context = options.indent ? {
    indentStr: typeof options.indent === 'number' ? ' '.repeat(options.indent) :
               typeof options.indent === 'string' ? options.indent : '  ',
    level: 0
  } : {};
  
  // If template is a single element and data is an array, render template for each data item
  if (!Array.isArray(input.template) && Array.isArray(input.data)) {
    const separator = context.indentStr ? '\n' : '';
    return input.data.map(item => 
      render(input.template, { ...item, ...options.data }, context)
    ).join(separator);
  }
  
  return render(input.template, data, context);
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

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; indentStr?: string; level?: number } = {}): string {
  if (typeof template === "string") return interpolate(template, data);
  
  if (Array.isArray(template)) {
    return template.map(t => render(t, data, context)).join(context.indentStr ? '\n' : '');
  }
  
  const { tag, rest, children, attrs } = parseTemplateObject(template);
  
  if (!ALLOWED_TAGS.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
  }
  
  if (tag === 'comment' && context.insideComment) {
    throw new Error('Nested comments are not allowed');
  }
  
  if (VOID_TAGS.has(tag) && children.length > 0) {
    throw new Error(`Tag "${tag}" is a void element and cannot have children`);
  }
  
  const childContext = { 
    ...context, 
    insideComment: tag === 'comment' || context.insideComment,
    level: (context.level || 0) + 1
  };
  
  const addIndent = (result: string, level: number) => 
    context.indentStr && result.startsWith('<') ? context.indentStr.repeat(level) + result : result;
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    if (Array.isArray(bound)) {
      const content = bound.map(item => 
        $children.map(c => addIndent(render(c, item as Data, childContext), childContext.level)).join('')
      ).join(context.indentStr ? '\n' : '');
      return renderTag(tag, bindAttrs, data, content, context.indentStr, context.level);
    }
    
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
  }
  
  const content = children.map(c => addIndent(render(c, data, childContext), childContext.level)).join(context.indentStr ? '\n' : '');
  return renderTag(tag, attrs, data, content, context.indentStr, context.level);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}