import { TreebarkNode, TreebarkTemplate, RenderOptions, DEFAULT_ALLOWED_TAGS, DEFAULT_ALLOWED_ATTRIBUTES } from './index';

export function renderToString(schema: TreebarkNode | TreebarkTemplate, options: RenderOptions = {}): string {
  const { data = {}, allowedTags = DEFAULT_ALLOWED_TAGS, allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES } = options;
  
  if (schema && typeof schema === 'object' && '$template' in schema) {
    return renderToString(schema.$template as TreebarkNode, { ...options, data: schema.$data });
  }
  
  return render(schema as TreebarkNode, data, allowedTags, allowedAttributes);
}

function render(schema: TreebarkNode, data: any, tags: Set<string>, attrs: Set<string>): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data, tags, attrs)).join("");
  
  const [tag, rest] = Object.entries(schema)[0];
  if (!tags.has(tag)) throw new Error(`Tag "${tag}" is not allowed`);
  
  // Handle $bind
  if (rest && typeof rest === 'object' && '$bind' in rest) {
    const bound = get(data, rest.$bind as string);
    const tmpl = { ...rest }; delete tmpl.$bind;
    
    if (Array.isArray(bound)) {
      const kids = (tmpl as any).$children || [];
      const as = Object.fromEntries(Object.entries(tmpl).filter(([k]) => !k.startsWith('$')));
      return `<${tag}${renderAttrs(as, data, attrs)}>${bound.map(item => 
        kids.map((c: TreebarkNode) => render(c, item, tags, attrs)).join('')).join('')}</${tag}>`;
    }
    return render({ [tag]: tmpl }, bound, tags, attrs);
  }
  
  const kids = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : (rest as any)?.$children || [];
  const as = rest && typeof rest === "object" && !Array.isArray(rest) 
    ? Object.fromEntries(Object.entries(rest).filter(([k]) => !k.startsWith('$'))) : {};
    
  return `<${tag}${renderAttrs(as, data, attrs)}>${kids.map((c: TreebarkNode) => render(c, data, tags, attrs)).join("")}</${tag}>`;
}

function renderAttrs(attrs: Record<string, any>, data: any, allowed: Set<string>): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    const ok = allowed.has(key) || [...allowed].some(p => p.endsWith('-') && key.startsWith(p));
    if (!ok) throw new Error(`Attribute "${key}" is not allowed`);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
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