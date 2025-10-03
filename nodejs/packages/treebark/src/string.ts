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

// Type for indented output: [indentLevel, htmlContent]
type IndentedOutput = [number, string];

// Helper function to flatten indented output into a string in a single pass
const flattenOutput = (output: IndentedOutput[], indentStr: string | undefined): string => {
  if (!indentStr || output.length === 0) {
    // No indentation: join directly without overhead
    if (output.length === 0) return '';
    if (output.length === 1) return output[0][1];
    
    let result = output[0][1];
    for (let i = 1; i < output.length; i++) {
      result += output[i][1];
    }
    return result;
  }
  
  // Check if we have multiple children or any HTML elements in first pass
  const hasMultipleChildren = output.length > 1;
  let hasHtmlChild = false;
  
  // Single text child: check if it has HTML and return tight if not
  if (!hasMultipleChildren) {
    hasHtmlChild = output[0][1].includes('<');
    if (!hasHtmlChild) {
      return output[0][1];
    }
  }
  
  // Multiple children or HTML elements: build indented string in one pass
  let result = '\n';
  for (let i = 0; i < output.length; i++) {
    const [level, content] = output[i];
    
    // Add indent
    result += indentStr.repeat(level);
    result += content;
    
    // Add newline separator (except we'll add final newline after loop)
    if (i < output.length - 1) {
      result += '\n';
    }
  }
  result += '\n';
  
  return result;
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
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, childrenOutput: IndentedOutput[], indentStr?: string, level?: number, parents: Data[] = []): string {
  // Flatten children output into content
  const formattedContent = flattenOutput(childrenOutput, indentStr);
  
  // For wrapped content, need to add parent indent before closing tag
  const needsParentIndent = formattedContent.startsWith('\n');
  const parentIndent = needsParentIndent && indentStr ? indentStr.repeat(level || 0) : '';

  // Special handling for comment tags
  if (tag === 'comment') {
    return `<!--${formattedContent}${parentIndent}-->`;
  }

  const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents)}>`;
  const isVoid = VOID_TAGS.has(tag);

  // Void tags are never closed, regardless of content
  if (isVoid) {
    return openTag;
  }

  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${formattedContent}${parentIndent}</${tag}>`;
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

  const renderChildren = (children: TemplateElement[], data: Data, childParents: Data[]): IndentedOutput[] => {
    // Split any string children that contain newlines into separate elements (only when indenting)
    const expandedChildren: TemplateElement[] = [];
    for (const child of children) {
      if (typeof child === 'string' && context.indentStr && child.includes('\n')) {
        // Split strings by newline to treat each line as a separate element
        const lines = child.split('\n');
        expandedChildren.push(...lines);
      } else {
        expandedChildren.push(child);
      }
    }
    
    // Return array of [indentLevel, content] tuples
    return expandedChildren.map(child => {
      const content = render(child, data, { ...childContext, parents: childParents });
      return [childContext.level, content] as IndentedOutput;
    });
  };

  let childrenOutput: IndentedOutput[];
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

    // For array binding, collect all children from all items
    childrenOutput = bound.flatMap(item => {
      const newParents = [...parents, data];
      return renderChildren($children, item as Data, newParents);
    });
    contentAttrs = bindAttrs;
  } else {
    childrenOutput = renderChildren(children, data, parents);
    contentAttrs = attrs;
  }
  
  return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = []): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false, parents))}"`).join(" ");
  return pairs ? " " + pairs : "";
}