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

// Helper function to check if indentation should be applied and return [shouldIndent, repeatedIndentStr]
const getIndentInfo = (indentStr: string | undefined, htmlContent: string | undefined, isElement = false, level = 0): [boolean, string] => {
  const should = indentStr && htmlContent && (isElement ? htmlContent.startsWith('<') : htmlContent.includes('<'));
  return [Boolean(should), should ? indentStr.repeat(level) : ''];
};

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
    return children.map(child => {
      const result = render(child, data, { ...childContext, parents: childParents });
      const [shouldIndentElement, repeatedIndent] = getIndentInfo(context.indentStr, result, true, childContext.level);
      return shouldIndentElement ? repeatedIndent + result : result;
    }).join(separator);
  };

  let content: string;
  let contentAttrs: Record<string, unknown>;

  // Handle $bind
  if (hasBinding(rest)) {
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
      return renderChildren($children, item as Data, '', newParents);
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