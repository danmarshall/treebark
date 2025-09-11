import { 
  Schema, 
  Data, 
  ALLOWED_TAGS, 
  ALLOWED_ATTRS, 
  getProperty, 
  interpolate,
  escape,
  validateTag, 
  validateAttribute, 
  isTemplate, 
  hasBinding, 
  parseSchemaObject 
} from './common';

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: any = {}): string {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToString(schema.$template, { data: schema.$data });
  }
  
  return render(schema as Schema, data);
}

function render(schema: Schema, data: Data): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data)).join("");
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  validateTag(tag);
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    if (Array.isArray(bound)) {
      return `<${tag}${renderAttrs(bindAttrs, data)}>${bound.map(item => 
        $children.map((c: Schema) => render(c, item)).join('')).join('')}</${tag}>`;
    }
    return render({ [tag]: { ...bindAttrs, $children } }, bound);
  }
    
  return `<${tag}${renderAttrs(attrs, data)}>${children.map((c: Schema) => render(c, data)).join("")}</${tag}>`;
}

function renderAttrs(attrs: Record<string, any>, data: Data): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}