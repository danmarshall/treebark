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
} from './common.js';

// Type for indented output: [indentLevel, htmlContent]
type IndentedOutput = [number, string];

// Helper function to flatten indented output into a string in a single pass
const flattenOutput = (output: IndentedOutput[], indentStr: string | undefined): string => {
  if (!indentStr) {
    // No indentation: join directly
    return output.length <= 1 ? (output[0]?.[1] ?? '') : output.reduce((acc, [, content]) => acc + content, '');
  }
  if (output.length === 0) return '';
  
  // Single text child without HTML stays tight
  if (output.length === 1 && !output[0][1].includes('<')) {
    return output[0][1];
  }
  
  // Build indented string in one pass
  let result = '\n';
  for (let i = 0; i < output.length; i++) {
    result += indentStr.repeat(output[i][0]) + output[i][1];
    if (i < output.length - 1) result += '\n';
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
  const parentIndent = formattedContent.startsWith('\n') && indentStr ? indentStr.repeat(level || 0) : '';

  // Special handling for comment tags
  if (tag === 'comment') {
    return `<!--${formattedContent}${parentIndent}-->`;
  }

  const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents)}>`;

  // Void tags are never closed, regardless of content
  if (VOID_TAGS.has(tag)) {
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

  // Special handling for "if" tag
  if (tag === 'if') {
    // "if" tag requires $bind
    if (!hasBinding(rest)) {
      throw new Error('"if" tag requires $bind attribute to specify the condition');
    }
    
    validateBindExpression(rest.$bind);
    const bound = getProperty(data, rest.$bind, parents);
    const { $bind, $children = [], $not, ...bindAttrs } = rest;
    
    // Check if any non-reserved attributes were provided
    const hasAttrs = Object.keys(bindAttrs).length > 0;
    if (hasAttrs) {
      throw new Error('"if" tag does not support attributes, only $bind, $not, and $children');
    }
    
    // Check condition with optional negation (uses JavaScript truthiness via Boolean())
    const condition = $not ? !Boolean(bound) : Boolean(bound);
    
    // Only render children if condition is true
    if (!condition) {
      return '';
    }
    
    // Render children without wrapping tag
    // When indentation is enabled, we need to add proper indentation to each child
    // since they won't go through the normal processContent/renderTag flow
    if (!context.indentStr) {
      // No indentation: simple join
      return $children.map(child => render(child, data, context)).join('');
    }
    
    // With indentation: render each child and add appropriate indentation
    // The children should be at the current context level (same as siblings would be)
    const indent = context.indentStr.repeat(context.level || 0);
    return $children.map(child => {
      const content = render(child, data, context);
      // Add indentation to each line of the rendered content
      return content.split('\n').map((line, i) => 
        // First line gets the indent, subsequent lines keep their own indentation
        i === 0 ? indent + line : line
      ).join('\n');
    }).join('\n');
  }

  if (VOID_TAGS.has(tag) && children.length > 0) {
    throw new Error(`Tag "${tag}" is a void element and cannot have children`);
  }

  const childContext = {
    ...context,
    insideComment: tag === 'comment' || context.insideComment,
    level: (context.level || 0) + 1
  };

  // Helper to process rendered content into IndentedOutput
  const processContent = (content: string): IndentedOutput[] => {
    if (context.indentStr && content.includes('\n') && !content.includes('<')) {
      return content.split('\n').map(line => [childContext.level, line]);
    }
    return [[childContext.level, content]];
  };

  let childrenOutput: IndentedOutput[];
  let contentAttrs: Record<string, unknown>;

  // Handle $bind
  if (hasBinding(rest)) {
    validateBindExpression(rest.$bind);
    
    const bound = getProperty(data, rest.$bind, []);
    const { $bind, $children = [], ...bindAttrs } = rest;

    if (!Array.isArray(bound)) {
      const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
      const newParents = [...parents, data];
      return render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
    }

    // Array binding case
    childrenOutput = [];
    for (const item of bound) {
      const newParents = [...parents, data];
      for (const child of $children) {
        const content = render(child, item as Data, { ...childContext, parents: newParents });
        childrenOutput.push(...processContent(content));
      }
    }
    contentAttrs = bindAttrs;
  } else {
    // Normal children case
    childrenOutput = [];
    for (const child of children) {
      const content = render(child, data, { ...childContext, parents });
      childrenOutput.push(...processContent(content));
    }
    contentAttrs = attrs;
  }
  
  return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = []): string {
  const pairs = Object.entries(attrs)
    .filter(([key]) => (validateAttribute(key, tag), true))
    .map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false, parents))}"`)
    .join(" ");
  return pairs ? " " + pairs : "";
}