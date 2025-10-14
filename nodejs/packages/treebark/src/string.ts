import { TreebarkInput, RenderOptions, Data, TemplateElement, TemplateObject, Logger } from './types.js';
import {
  ALLOWED_TAGS,
  VOID_TAGS,
  getProperty,
  interpolate,
  escape,
  validateAttribute,
  hasBinding,
  validatePathExpression,
  isConditionalValue,
  evaluateConditionalValue,
  parseTemplateObject,
  processConditional
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
    level: 0,
    logger: options.logger
  } : { logger: options.logger };

  return render(input.template, data, context);
}

// Helper function to render tag, deciding internally whether to close or not
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, childrenOutput: IndentedOutput[], indentStr?: string, level?: number, parents: Data[] = [], logger?: Logger): string {
  // Flatten children output into content
  const formattedContent = flattenOutput(childrenOutput, indentStr);
  
  // For wrapped content, need to add parent indent before closing tag
  const parentIndent = formattedContent.startsWith('\n') && indentStr ? indentStr.repeat(level || 0) : '';

  // Special handling for $comment tags
  if (tag === '$comment') {
    return `<!--${formattedContent}${parentIndent}-->`;
  }

  const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents, logger)}>`;

  // Void tags are never closed, regardless of content
  if (VOID_TAGS.has(tag)) {
    return openTag;
  }

  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${formattedContent}${parentIndent}</${tag}>`;
}

function render(template: TemplateElement | TemplateElement[], data: Data, context: { insideComment?: boolean; indentStr?: string; level?: number; parents?: Data[]; logger?: Logger } = {}): string {
  const parents = context.parents || [];
  const logger = context.logger;
  
  if (typeof template === "string") return interpolate(template, data, true, parents);

  if (Array.isArray(template)) {
    return template.map(t => render(t, data, context)).join(context.indentStr ? '\n' : '');
  }

  const parsed = parseTemplateObject(template, logger);
  if (!parsed) {
    return ''; // Error was logged, return empty string
  }
  const { tag, rest, children, attrs } = parsed;

  if (!ALLOWED_TAGS.has(tag)) {
    (logger || console).error(`Tag "${tag}" is not allowed`);
    return '';
  }

  if (tag === '$comment' && context.insideComment) {
    (logger || console).error('Nested comments are not allowed');
    return '';
  }

  // Special handling for "$if" tag
  if (tag === '$if') {
    const { valueToRender } = processConditional(rest, data, parents, logger);
    
    // If no value to render, return empty string
    if (valueToRender === undefined) {
      return '';
    }
    
    // Render the single element
    return render(valueToRender, data, context);
  }

  if (VOID_TAGS.has(tag) && children.length > 0) {
    (logger || console).error(`Tag "${tag}" is a void element and cannot have children`);
    return '';
  }

  const childContext = {
    ...context,
    insideComment: tag === '$comment' || context.insideComment,
    level: (context.level || 0) + 1
  };

  // Helper to process rendered content into IndentedOutput
  const processContent = (content: string): IndentedOutput[] => {
    // Skip empty content to avoid blank lines
    if (content === '') {
      return [];
    }
    if (context.indentStr && content.includes('\n') && !content.includes('<')) {
      return content.split('\n').map(line => [childContext.level, line]);
    }
    return [[childContext.level, content]];
  };

  let childrenOutput: IndentedOutput[];
  let contentAttrs: Record<string, unknown>;

  // Handle $bind
  if (hasBinding(rest)) {
    if (!validatePathExpression(rest.$bind, '$bind', logger)) {
      return '';
    }
    
    const bound = getProperty(data, rest.$bind, []);
    const { $bind, $children = [], ...bindAttrs } = rest;

    if (!Array.isArray(bound)) {
      const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
      const newParents = [...parents, data];
      return render({ [tag]: { ...bindAttrs, $children } } as TemplateObject, boundData, { ...context, parents: newParents });
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
  
  return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents, logger);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string, parents: Data[] = [], logger?: Logger): string {
  const pairs = Object.entries(attrs)
    .filter(([key]) => validateAttribute(key, tag, logger))
    .map(([k, v]) => {
      // Check if value is a conditional value
      if (isConditionalValue(v)) {
        const evaluatedValue = evaluateConditionalValue(v, data, parents, logger);
        return `${k}="${escape(interpolate(String(evaluatedValue), data, false, parents))}"`;
      } else {
        return `${k}="${escape(interpolate(String(v), data, false, parents))}"`;
      }
    })
    .join(" ");
  return pairs ? " " + pairs : "";
}