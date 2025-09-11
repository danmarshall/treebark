import {
  TreebarkNode,
  TreebarkElement,
  TreebarkTemplate,
  TreebarkAttributes,
  RenderOptions,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES
} from './index';

/**
 * Renders a Treebark node to an HTML string
 */
export function renderToString(node: TreebarkNode | TreebarkTemplate, options: RenderOptions = {}): string {
  const {
    data = {},
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES
  } = options;

  // Handle self-contained template blocks
  if (isTemplate(node)) {
    return renderToString(node.$template, { ...options, data: node.$data });
  }

  return renderNode(node, data, allowedTags, allowedAttributes);
}

function isTemplate(node: any): node is TreebarkTemplate {
  return node && typeof node === 'object' && '$template' in node && '$data' in node;
}

function renderNode(
  node: TreebarkNode,
  data: any,
  allowedTags: Set<string>,
  allowedAttributes: Set<string>
): string {
  // Handle string nodes (text content)
  if (typeof node === 'string') {
    return interpolate(node, data);
  }

  // Handle arrays (fragments)
  if (Array.isArray(node)) {
    return node.map(child => renderNode(child, data, allowedTags, allowedAttributes)).join('');
  }

  // Handle element nodes
  if (typeof node === 'object' && node !== null) {
    return renderElement(node, data, allowedTags, allowedAttributes);
  }

  return '';
}

function renderElement(
  element: TreebarkElement,
  data: any,
  allowedTags: Set<string>,
  allowedAttributes: Set<string>
): string {
  const entries = Object.entries(element);
  if (entries.length !== 1) {
    throw new Error('Element must have exactly one tag');
  }

  const [tagName, content] = entries[0];

  // Security check: only allow whitelisted tags
  if (!allowedTags.has(tagName)) {
    throw new Error(`Tag "${tagName}" is not allowed`);
  }

  // Handle binding
  if (typeof content === 'object' && content !== null && !Array.isArray(content) && '$bind' in content) {
    const bindPath = content.$bind as string;
    const boundData = getPropertyPath(data, bindPath);
    
    if (Array.isArray(boundData)) {
      // Array binding - render children for each item within single parent
      const template = { ...content };
      delete template.$bind;
      const { attributes, children } = parseContent(template);
      const attrString = renderAttributes(attributes, data, allowedAttributes);
      const openTag = `<${tagName}${attrString}>`;
      
      // Render children for each array item
      const childrenHtml = boundData.map(item => 
        children.map(child => renderNode(child, item, allowedTags, allowedAttributes)).join('')
      ).join('');
      
      return `${openTag}${childrenHtml}</${tagName}>`;
    } else {
      // Object binding - use bound data as context
      const template = { ...content };
      delete template.$bind;
      return renderElement({ [tagName]: template }, boundData, allowedTags, allowedAttributes);
    }
  }

  // Render opening tag with attributes
  const { attributes, children } = parseContent(content);
  const attrString = renderAttributes(attributes, data, allowedAttributes);
  const openTag = `<${tagName}${attrString}>`;

  // Render children
  const childrenHtml = children.map(child => 
    renderNode(child, data, allowedTags, allowedAttributes)
  ).join('');

  // Return complete element
  return `${openTag}${childrenHtml}</${tagName}>`;
}

function parseContent(content: any): { attributes: TreebarkAttributes; children: TreebarkNode[] } {
  if (typeof content === 'string') {
    return { attributes: {}, children: [content] };
  }

  if (Array.isArray(content)) {
    return { attributes: {}, children: content };
  }

  if (typeof content === 'object' && content !== null) {
    const attributes: TreebarkAttributes = {};
    let children: TreebarkNode[] = [];

    for (const [key, value] of Object.entries(content)) {
      if (key === '$children') {
        children = Array.isArray(value) ? value : [value];
      } else if (!key.startsWith('$')) {
        attributes[key] = value as string;
      }
    }

    return { attributes, children };
  }

  return { attributes: {}, children: [] };
}

function renderAttributes(
  attributes: TreebarkAttributes,
  data: any,
  allowedAttributes: Set<string>
): string {
  const attrPairs: string[] = [];

  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || key.startsWith('$')) continue;

    // Security check: only allow whitelisted attributes
    const isAllowed = allowedAttributes.has(key) || 
                     [...allowedAttributes].some(pattern => 
                       pattern.endsWith('-') && key.startsWith(pattern)
                     );
    
    if (!isAllowed) {
      throw new Error(`Attribute "${key}" is not allowed`);
    }

    // For attributes, interpolate but don't escape (escapeHtml will be called)
    const interpolatedValue = typeof value === 'string' 
      ? interpolateAttribute(value, data)
      : String(value);
    
    attrPairs.push(`${key}="${escapeHtml(interpolatedValue)}"`);
  }

  return attrPairs.length > 0 ? ' ' + attrPairs.join(' ') : '';
}

function interpolate(template: string, data: any, escape = true): string {
  return template.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (match, open, expr, close) => {
    const trimmed = expr.trim();

    // Triple curlies → literal double curlies
    if (open === "{{{" && close === "}}}") {
      return `{{${trimmed}}}`;
    }

    // Normal double curlies → interpolate and conditionally escape
    const value = getPropertyPath(data, trimmed);
    if (value === undefined) return "";
    
    const stringValue = String(value);
    return escape ? escapeHtml(stringValue) : stringValue;
  });
}

function interpolateAttribute(template: string, data: any): string {
  return interpolate(template, data, false);
}

function getPropertyPath(obj: any, path: string): any {
  if (!path) return obj;
  
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

function escapeHtml(text: string): string {
  // Simple HTML escaping for server-side rendering
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}