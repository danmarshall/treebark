type Schema = string | Schema[] | { [tag: string]: any };
type Data = Record<string, any>;

const ALLOWED_TAGS = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img']);
const ALLOWED_ATTRS = new Set(['id', 'class', 'style', 'title', 'href', 'src', 'alt', 'data-', 'aria-']);

export function renderToDOM(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): DocumentFragment {
  const data = options.data || {};
  
  if (schema && typeof schema === 'object' && '$template' in schema) {
    return renderToDOM(schema.$template, { data: schema.$data });
  }
  
  const fragment = document.createDocumentFragment();
  const result = render(schema as Schema, data);
  if (Array.isArray(result)) result.forEach(n => fragment.appendChild(n));
  else fragment.appendChild(result);
  return fragment;
}

function render(schema: Schema, data: Data): Node | Node[] {
  if (typeof schema === "string") return document.createTextNode(interpolate(schema, data));
  if (Array.isArray(schema)) return schema.flatMap(s => {
    const r = render(s, data); return Array.isArray(r) ? r : [r];
  });
  
  const [tag, rest] = Object.entries(schema)[0];
  if (!ALLOWED_TAGS.has(tag)) throw new Error(`Tag "${tag}" is not allowed`);
  
  const element = document.createElement(tag);
  
  // Handle $bind
  if (rest && typeof rest === 'object' && '$bind' in rest) {
    const bound = get(data, rest.$bind);
    const { $bind, $children = [], ...attrs } = rest;
    setAttrs(element, attrs, data);
    
    if (Array.isArray(bound)) {
      bound.forEach(item => $children.forEach((c: Schema) => {
        const nodes = render(c, item);
        (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
      }));
      return element;
    }
    const childNodes = render({ [tag]: { ...attrs, $children } }, bound);
    return Array.isArray(childNodes) ? childNodes : [childNodes];
  }
  
  const children = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
  const attrs = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== '$children')) : {};
  
  setAttrs(element, attrs, data);
  children.forEach((c: Schema) => {
    const nodes = render(c, data);
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
  });
  
  return element;
}

function setAttrs(element: HTMLElement, attrs: Record<string, any>, data: Data): void {
  Object.entries(attrs).forEach(([key, value]) => {
    const ok = ALLOWED_ATTRS.has(key) || [...ALLOWED_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));
    if (!ok) throw new Error(`Attribute "${key}" is not allowed`);
    element.setAttribute(key, interpolate(String(value), data, false));
  });
}

function interpolate(tpl: string, data: Data, escapeHtml = true): string {
  return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
    const trimmed = expr.trim();
    if (open === '{{{') return `{{${trimmed}}}`;
    const val = get(data, trimmed);
    return val == null ? "" : String(val);
  });
}

function get(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}