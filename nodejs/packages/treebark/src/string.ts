type Schema = string | Schema[] | { [tag: string]: any };
type Data = Record<string, any>;

const ALLOWED_TAGS = new Set(['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'img']);
const ALLOWED_ATTRS = new Set(['id', 'class', 'style', 'title', 'href', 'src', 'alt', 'data-', 'aria-']);

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): string {
  const data = options.data || {};
  
  if (schema && typeof schema === 'object' && '$template' in schema) {
    return renderToString(schema.$template, { data: schema.$data });
  }
  
  return render(schema as Schema, data);
}

function render(schema: Schema, data: Data): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data)).join("");
  
  const [tag, rest] = Object.entries(schema)[0];
  if (!ALLOWED_TAGS.has(tag)) throw new Error(`Tag "${tag}" is not allowed`);
  
  // Handle $bind
  if (rest && typeof rest === 'object' && '$bind' in rest) {
    const bound = get(data, rest.$bind);
    const { $bind, $children = [], ...attrs } = rest;
    
    if (Array.isArray(bound)) {
      return `<${tag}${renderAttrs(attrs, data)}>${bound.map(item => 
        $children.map((c: Schema) => render(c, item)).join('')).join('')}</${tag}>`;
    }
    return render({ [tag]: { ...attrs, $children } }, bound);
  }
  
  const children = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
  const attrs = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== '$children')) : {};
    
  return `<${tag}${renderAttrs(attrs, data)}>${children.map((c: Schema) => render(c, data)).join("")}</${tag}>`;
}

function renderAttrs(attrs: Record<string, any>, data: Data): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    const ok = ALLOWED_ATTRS.has(key) || [...ALLOWED_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));
    if (!ok) throw new Error(`Attribute "${key}" is not allowed`);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}

function interpolate(tpl: string, data: Data, escapeHtml = true): string {
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