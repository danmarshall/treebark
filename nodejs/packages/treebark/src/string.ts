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
  validateBindExpression,
  templateHasCurrentObjectBinding,
  parseTemplateObject,
  RenderOptions
} from './common';

// Helper function to check if indentation should be applied and return [shouldIndent, repeatedIndentStr]
const getIndentInfo = (indentStr: string | undefined, htmlContent: string | undefined, isElement = false, level = 0): [boolean, string] => {
  if (!indentStr || !htmlContent) {
    return [false, ''];
  }
  
  // Wrap with newlines if:
  // 1. Content has HTML elements, OR
  // 2. Content starts with indentation (meaning children were indented, so there are multiple)
  const hasHtml = htmlContent.includes('<');
  const startsWithIndent = htmlContent.startsWith(indentStr);
  const should = hasHtml || startsWithIndent;
  
  return [Boolean(should), should ? indentStr.repeat(level) : ''];
};

export function renderToString(
  input: TreebarkInput,
  options: RenderOptions = {}
): string {
  // Preserve arrays as arrays, only spread objects
  const data = Array.isArray(input.data) 
    ? input.data 
    : { ...input.data, ...options.data };

  // Conditionally set indent context
  const context = options.indent ? {
    indentStr: typeof options.indent === 'number' ? ' '.repeat(options.indent) :
      typeof options.indent === 'string' ? options.indent : '  ',
    level: 0
  } : {};

  // If template is a single element and data is an array, render template for each data item
  // UNLESS the template has $bind: "." which means bind to the array itself
  if (!Array.isArray(input.template) && Array.isArray(input.data) && !templateHasCurrentObjectBinding(input.template)) {
    const separator = context.indentStr ? '\n' : '';
    return input.data.map(item =>
      render(input.template, { ...item, ...options.data }, context)
    ).join(separator);
  }

  return render(input.template, data, context);
}

// Helper function to render tag, deciding internally whether to close or not
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, content?: string, indentStr?: string, level?: number, parents: Data[] = []): string {
  // Apply indentation if enabled and content has child elements
  const [shouldIndentContent, currentIndent] = getIndentInfo(indentStr, content, false, level || 0);
  const formattedContent = shouldIndentContent ? `\n${content}\n${currentIndent}` : (content || "");

  // Special handling for comment tags
  if (tag === 'comment') {
    return `<!--${formattedContent}-->`;
  }

  const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents)}>`;
  const isVoid = VOID_TAGS.has(tag);

  // Void tags are never closed, regardless of content
  if (isVoid) {
    return openTag;
  }

  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${formattedContent}</${tag}>`;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; indentStr?: string; level?: number; parents?: Data[] } = {}): string {
  const parents = context.parents || [];
  
  if (typeof template === "string") return interpolate(template, data, true, parents);

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

  const renderChildren = (children: TemplateElement[], data: Data, separator: string, childParents: Data[]) => {
    // Split any string children that contain newlines into separate elements (only when using newline separator)
    const expandedChildren: TemplateElement[] = [];
    for (const child of children) {
      if (typeof child === 'string' && separator === '\n' && child.includes('\n')) {
        // Split strings by newline to treat each line as a separate element
        const lines = child.split('\n');
        expandedChildren.push(...lines);
      } else {
        expandedChildren.push(child);
      }
    }
    
    const renderedChildren = expandedChildren.map(child => render(child, data, { ...childContext, parents: childParents }));
    
    // Check if we have multiple children or if any child is an HTML element
    const hasMultipleChildren = renderedChildren.length > 1;
    const hasHtmlChild = renderedChildren.some(result => result.includes('<'));
    
    // Only indent if we have multiple children OR if we have HTML elements (not just a single text child)
    const shouldIndent = separator === '\n' && (hasMultipleChildren || hasHtmlChild);
    
    return renderedChildren.map(result => {
      const indent = shouldIndent && result ? context.indentStr!.repeat(childContext.level) : '';
      return indent + result;
    }).join(separator);
  };

  let content: string;
  let contentAttrs: Record<string, unknown>;

  // Handle $bind
  if (hasBinding(rest)) {
    validateBindExpression(rest.$bind);
    
    // $bind uses literal property paths only - no parent context access
    const bound = getProperty(data, rest.$bind, []);
    const { $bind, $children = [], ...bindAttrs } = rest;

    if (!Array.isArray(bound)) {
      const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
      // When binding to an object, add current data context to parents for child context
      const newParents = [...parents, data];
      return render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
    }

    content = bound.map(item => {
      // For array items, add current data context to parents
      const newParents = [...parents, data];
      return renderChildren($children, item as Data, context.indentStr ? '\n' : '', newParents);
    }).join(context.indentStr ? '\n' : '');
    contentAttrs = bindAttrs;
  } else {
    content = renderChildren(children, data, context.indentStr ? '\n' : '', parents);
    contentAttrs = attrs;
  }
  return renderTag(tag, contentAttrs, data, content, context.indentStr, context.level, parents);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = []): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false, parents))}"`).join(" ");
  return pairs ? " " + pairs : "";
}