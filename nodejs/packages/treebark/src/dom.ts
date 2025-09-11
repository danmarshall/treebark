import {
  TreebarkNode,
  TreebarkElement,
  TreebarkTemplate,
  RenderOptions,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES
} from './index';

/**
 * Renders a Treebark node to DOM elements
 */
export function renderToDOM(
  node: TreebarkNode | TreebarkTemplate, 
  options: RenderOptions = {}
): DocumentFragment {
  const { data = {}, allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES } = options;

  // Handle self-contained template blocks
  if (isTemplate(node)) {
    return renderToDOM(node.$template, { ...options, data: node.$data });
  }

  const fragment = document.createDocumentFragment();
  const elements = render(node, data, allowedTags, allowedAttributes);
  
  // Add all rendered elements to fragment
  if (Array.isArray(elements)) {
    elements.forEach(el => fragment.appendChild(el));
  } else {
    fragment.appendChild(elements);
  }

  return fragment;
}

function render(node: TreebarkNode, data: any, allowedTags: Set<string>, allowedAttributes: Set<string>): Node | Node[] {
  // String → text node
  if (typeof node === 'string') {
    return document.createTextNode(interpolate(node, data));
  }
  
  // Array → fragment
  if (Array.isArray(node)) {
    return node.flatMap(child => {
      const rendered = render(child, data, allowedTags, allowedAttributes);
      return Array.isArray(rendered) ? rendered : [rendered];
    });
  }
  
  // Object → element
  if (typeof node === 'object' && node !== null) {
    return renderElement(node, data, allowedTags, allowedAttributes);
  }
  
  return document.createTextNode('');
}

function renderElement(element: TreebarkElement, data: any, allowedTags: Set<string>, allowedAttributes: Set<string>): HTMLElement {
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
      const domElement = document.createElement(tag);
      const { attrs, children } = parseContent(template);
      setAttrs(domElement, attrs, data, allowedAttributes);
      
      boundData.forEach(item => {
        children.forEach(child => {
          const childNodes = render(child, item, allowedTags, allowedAttributes);
          if (Array.isArray(childNodes)) {
            childNodes.forEach(node => domElement.appendChild(node));
          } else {
            domElement.appendChild(childNodes);
          }
        });
      });
      
      return domElement;
    } else {
      // Object binding: use bound data as context
      return renderElement({ [tag]: template }, boundData, allowedTags, allowedAttributes);
    }
  }
  
  // Normal element rendering
  const domElement = document.createElement(tag);
  const { attrs, children } = parseContent(content);
  
  setAttrs(domElement, attrs, data, allowedAttributes);
  
  children.forEach(child => {
    const childNodes = render(child, data, allowedTags, allowedAttributes);
    if (Array.isArray(childNodes)) {
      childNodes.forEach(node => domElement.appendChild(node));
    } else {
      domElement.appendChild(childNodes);
    }
  });
  
  return domElement;
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

function setAttrs(element: HTMLElement, attrs: Record<string, string>, data: any, allowedAttributes: Set<string>): void {
  Object.entries(attrs).forEach(([key, value]) => {
    const allowed = allowedAttributes.has(key) || 
                   [...allowedAttributes].some(p => p.endsWith('-') && key.startsWith(p));
    if (!allowed) throw new Error(`Attribute "${key}" is not allowed`);
    
    element.setAttribute(key, interpolate(value, data));
  });
}

function interpolate(template: string, data: any): string {
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

function isTemplate(node: any): node is TreebarkTemplate {
  return node && typeof node === 'object' && '$template' in node && '$data' in node;
}