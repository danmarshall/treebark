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
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, content?: string, indentStr?: string, level?: number): string {
  // Special handling for comment tags
  if (tag === 'comment') {
    // For comments, content is already properly formatted by renderChildren
    // Just add newlines if indentation is enabled and content contains HTML
    const hasHtmlContent = content && content.includes('<');
    const formattedContent = indentStr && hasHtmlContent ? `\n${content}\n${indentStr.repeat((level || 0))}` : (content || "");
    return `<!--${formattedContent}-->`;
  }

  const openTag = `<${tag}${renderAttrs(attrs, data, tag)}>`;
  const isVoid = VOID_TAGS.has(tag);

  // Void tags are never closed, regardless of content
  if (isVoid) {
    return openTag;
  }

  // Apply indentation if enabled and content has child elements
  const [shouldIndentContent, currentIndent] = getIndentInfo(indentStr, content, false, level || 0);
  const formattedContent = shouldIndentContent ? `\n${content}\n${currentIndent}` : (content || "");

  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${formattedContent}</${tag}>`;
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

  const renderChildren = (children: TemplateElement[], data: Data, separator: string) => {
    return children.map(child => {
      const result = render(child, data, childContext);
      const [shouldIndentElement, repeatedIndent] = getIndentInfo(context.indentStr, result, true, childContext.level);
      return shouldIndentElement ? repeatedIndent + result : result;
    }).join(separator);
  };

  let content: string;
  let contentAttrs: Record<string, unknown>;

  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;

    if (!Array.isArray(bound)) {
      const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
      return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
    }

    content = bound.map(item =>
      renderChildren($children, item as Data, '')
    ).join(context.indentStr ? '\n' : '');
    contentAttrs = bindAttrs;
  } else {
    content = renderChildren(children, data, context.indentStr ? '\n' : '');
    contentAttrs = attrs;
  }
  return renderTag(tag, contentAttrs, data, content, context.indentStr, context.level);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}