import {
  TreebarkNode,
  TreebarkElement,
  TreebarkTemplate,
  RenderOptions,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES
} from './index';

/**
 * Renders a Treebark node to an HTML string
 */
export function renderToString(node: TreebarkNode | TreebarkTemplate, options: RenderOptions = {}): string {
  const { data = {}, allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES } = options;
  
  // Handle self-contained template blocks
  if (isTemplate(node)) {
    return renderToString(node.$template, { ...options, data: node.$data });
  }
  
  return render(node, data, allowedTags, allowedAttributes);
}

function render(node: TreebarkNode, data: any, allowedTags: Set<string>, allowedAttributes: Set<string>): string {
  // String → interpolate
  if (typeof node === 'string') {
    return interpolate(node, data);
  }
  
  // Array → fragment
  if (Array.isArray(node)) {
    return node.map(child => render(child, data, allowedTags, allowedAttributes)).join('');
  }
  
  // Object → element
  if (typeof node === 'object' && node !== null) {
    return renderElement(node, data, allowedTags, allowedAttributes);
  }
  
  return '';
}

function renderElement(element: TreebarkElement, data: any, allowedTags: Set<string>, allowedAttributes: Set<string>): string {
  const [tag, content] = Object.entries(element)[0];
  
  // Security: whitelist tags
  if (!allowedTags.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
  }
  
  // Handle $bind directive
  if (typeof content === 'object' && content && '$bind' in content) {
    const boundData = get(data, content.$bind as string);
    const template = { ...content };
    delete template.$bind;
    
    if (Array.isArray(boundData)) {
      // Array binding: render template for each item
      const { attrs, children } = parseContent(template);
      const attrStr = renderAttrs(attrs, data, allowedAttributes);
      const childrenHtml = boundData.map(item => 
        children.map(child => render(child, item, allowedTags, allowedAttributes)).join('')
      ).join('');
      return `<${tag}${attrStr}>${childrenHtml}</${tag}>`;
    } else {
      // Object binding: use bound data as context
      return renderElement({ [tag]: template }, boundData, allowedTags, allowedAttributes);
    }
  }
  
  // Normal element rendering
  const { attrs, children } = parseContent(content);
  const attrStr = renderAttrs(attrs, data, allowedAttributes);
  const childrenHtml = children.map(child => render(child, data, allowedTags, allowedAttributes)).join('');
  
  return `<${tag}${attrStr}>${childrenHtml}</${tag}>`;
}

function parseContent(content: any): { attrs: Record<string, string>; children: TreebarkNode[] } {
  if (typeof content === 'string') return { attrs: {}, children: [content] };
  if (Array.isArray(content)) return { attrs: {}, children: content };
  if (!content || typeof content !== 'object') return { attrs: {}, children: [] };
  
  const attrs: Record<string, string> = {};
  let children: TreebarkNode[] = [];
  
  Object.entries(content).forEach(([key, value]) => {
    if (key === '$children') {
      children = Array.isArray(value) ? value : [value];
    } else if (!key.startsWith('$')) {
      attrs[key] = String(value);
    }
  });
  
  return { attrs, children };
}

function renderAttrs(attrs: Record<string, string>, data: any, allowedAttributes: Set<string>): string {
  const pairs = Object.entries(attrs)
    .filter(([key]) => {
      const allowed = allowedAttributes.has(key) || 
                     [...allowedAttributes].some(p => p.endsWith('-') && key.startsWith(p));
      if (!allowed) throw new Error(`Attribute "${key}" is not allowed`);
      return true;
    })
    .map(([key, value]) => `${key}="${escape(interpolateAttr(value, data))}"`)
    .join(' ');
  
  return pairs ? ' ' + pairs : '';
}

function interpolate(template: string, data: any): string {
  return template.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{' && close === '}}}') return `{{${trimmed}}}`;
    
    const value = get(data, trimmed);
    return value != null ? escape(String(value)) : '';
  });
}

function interpolateAttr(template: string, data: any): string {
  return template.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{' && close === '}}}') return `{{${trimmed}}}`;
    
    const value = get(data, trimmed);
    return value != null ? String(value) : '';
  });
}

function get(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
}

function isTemplate(node: any): node is TreebarkTemplate {
  return node && typeof node === 'object' && '$template' in node && '$data' in node;
}