import { TreebarkNode, TreebarkTemplate, RenderOptions, DEFAULT_ALLOWED_TAGS, DEFAULT_ALLOWED_ATTRIBUTES } from './index';

export function renderToDOM(schema: TreebarkNode | TreebarkTemplate, options: RenderOptions = {}): DocumentFragment {
  const { data = {}, allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES } = options;

  if (schema && typeof schema === 'object' && '$template' in schema) {
    return renderToDOM(schema.$template as TreebarkNode, { ...options, data: schema.$data });
  }

  const fragment = document.createDocumentFragment();
  const elements = render(schema as TreebarkNode, data, allowedTags, allowedAttributes);
  
  if (Array.isArray(elements)) {
    elements.forEach(el => fragment.appendChild(el));
  } else {
    fragment.appendChild(elements);
  }

  return fragment;
}

function render(schema: TreebarkNode, data: any, tags: Set<string>, attrs: Set<string>): Node | Node[] {
  if (typeof schema === "string") return document.createTextNode(interpolate(schema, data));
  if (Array.isArray(schema)) return schema.flatMap(s => {
    const rendered = render(s, data, tags, attrs);
    return Array.isArray(rendered) ? rendered : [rendered];
  });
  
  const [tag, rest] = Object.entries(schema)[0];
  if (!tags.has(tag)) throw new Error(`Tag "${tag}" is not allowed`);
  
  // Handle $bind
  if (rest && typeof rest === 'object' && '$bind' in rest) {
    const bound = get(data, rest.$bind as string);
    const tmpl = { ...rest }; delete tmpl.$bind;
    
    if (Array.isArray(bound)) {
      const element = document.createElement(tag);
      const kids = (tmpl as any).$children || [];
      const as = Object.fromEntries(Object.entries(tmpl).filter(([k]) => !k.startsWith('$')));
      setAttrs(element, as, data, attrs);
      
      bound.forEach(item => {
        kids.forEach((child: TreebarkNode) => {
          const childNodes = render(child, item, tags, attrs);
          if (Array.isArray(childNodes)) {
            childNodes.forEach(node => element.appendChild(node));
          } else {
            element.appendChild(childNodes);
          }
        });
      });
      return element;
    }
    return render({ [tag]: tmpl }, bound, tags, attrs) as HTMLElement;
  }
  
  const element = document.createElement(tag);
  const kids = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : (rest as any)?.$children || [];
  const as = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => !k.startsWith('$'))) : {};
    
  setAttrs(element, as, data, attrs);
  kids.forEach((child: TreebarkNode) => {
    const childNodes = render(child, data, tags, attrs);
    if (Array.isArray(childNodes)) {
      childNodes.forEach(node => element.appendChild(node));
    } else {
      element.appendChild(childNodes);
    }
  });
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, any>, data: any, allowed: Set<string>): void {
  Object.entries(attrs).forEach(([key, value]) => {
    const ok = allowed.has(key) || [...allowed].some(p => p.endsWith('-') && key.startsWith(p));
    if (!ok) throw new Error(`Attribute "${key}" is not allowed`);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

function interpolate(tpl: string, data: any, escapeHtml = true): string {
  return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{') return `{{${trimmed}}}`;
    const val = get(data, trimmed);
    return val == null ? "" : (escapeHtml ? escape(String(val)) : String(val));
  });
}

function get(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
}