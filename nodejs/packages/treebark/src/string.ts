import { 
  TemplateElement,
  TemplateObject,
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

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; indentStr?: string; level?: number; indentCache?: string[] } = {}): string {
  if (typeof template === "string") return interpolate(template, data);
  
  if (Array.isArray(template)) {
    const results: string[] = [];
    for (const t of template) {
      results.push(render(t, data, context));
    }
    return results.join(context.indentStr ? '\n' : '');
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
  
  // Cache indentation for this level
  if (context.indentStr && !context.indentCache) {
    context.indentCache = [];
  }
  const getIndent = (level: number) => {
    if (!context.indentStr) return '';
    if (!context.indentCache![level]) {
      context.indentCache![level] = context.indentStr.repeat(level);
    }
    return context.indentCache![level];
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
      const results: string[] = [];
      
      // Pre-process children templates to avoid redundant parsing
      const processedChildren: Array<{
        parsedTemplate: ReturnType<typeof parseTemplateObject>;
        isString: boolean;
        stringTemplate?: string;
      }> = [];
      
      for (const c of $children) {
        if (typeof c === "string") {
          processedChildren.push({ parsedTemplate: null as any, isString: true, stringTemplate: c });
        } else {
          const parsed = parseTemplateObject(c);
          // Validate tag once instead of for every item
          if (!ALLOWED_TAGS.has(parsed.tag)) {
            throw new Error(`Tag "${parsed.tag}" is not allowed`);
          }
          processedChildren.push({ parsedTemplate: parsed, isString: false });
        }
      }
      
      for (const item of bound) {
        for (const processedChild of processedChildren) {
          let result: string;
          if (processedChild.isString) {
            result = interpolate(processedChild.stringTemplate!, item as Data);
          } else {
            // Use the pre-parsed template data to avoid re-parsing
            const { tag: childTag, attrs: childAttrs, children: grandchildren } = processedChild.parsedTemplate;
            
            // Render the tag content
            const grandchildResults: string[] = [];
            for (const gc of grandchildren) {
              grandchildResults.push(render(gc, item as Data, childContext));
            }
            const childContent = grandchildResults.join(context.indentStr ? '\n' : '');
            
            result = renderTag(childTag, childAttrs, item as Data, childContent, context.indentStr, childContext.level);
          }
          
          if (context.indentStr && result.startsWith('<')) {
            results.push(getIndent(childContext.level) + result);
          } else {
            results.push(result);
          }
        }
      }
      const content = results.join(context.indentStr ? '\n' : '');
      return renderTag(tag, bindAttrs, data, content, context.indentStr, context.level);
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
  }
  
  // Render children with simple loop
  const results: string[] = [];
  for (const c of children) {
    const result = render(c, data, childContext);
    if (context.indentStr && result.startsWith('<')) {
      results.push(getIndent(childContext.level) + result);
    } else {
      results.push(result);
    }
  }
  const content = results.join(context.indentStr ? '\n' : '');
  
  return renderTag(tag, attrs, data, content, context.indentStr, context.level);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}