import { 
  Schema, 
  Data, 
  ALLOWED_TAGS, 
  VOID_TAGS,
  getProperty, 
  interpolate,
  escape,
  validateAttribute, 
  isTemplate, 
  hasBinding, 
  parseSchemaObject,
  RenderOptions
} from './common';

// Simple and efficient indentation formatter - no regex
function formatWithIndentation(html: string, indentStr: string): string {
  if (!html.includes('<')) return html;
  
  // Parse HTML into parts (tags and text)
  const parts: Array<{type: 'tag' | 'text', content: string}> = [];
  let i = 0;
  
  while (i < html.length) {
    const tagStart = html.indexOf('<', i);
    if (tagStart === -1) {
      if (i < html.length) {
        const text = html.substring(i);
        if (text.trim()) parts.push({ type: 'text', content: text });
      }
      break;
    }
    
    if (tagStart > i) {
      const text = html.substring(i, tagStart);
      if (text.trim()) parts.push({ type: 'text', content: text });
    }
    
    const tagEnd = html.indexOf('>', tagStart);
    if (tagEnd === -1) break;
    
    const tag = html.substring(tagStart, tagEnd + 1);
    parts.push({ type: 'tag', content: tag });
    
    i = tagEnd + 1;
  }
  
  // Now format with proper indentation
  const result: string[] = [];
  let depth = 0;
  
  for (let j = 0; j < parts.length; j++) {
    const part = parts[j];
    
    if (part.type === 'text') {
      result.push(part.content);
    } else {
      const tag = part.content;
      
      if (tag.startsWith('</')) {
        // Closing tag
        depth--;
        const prevPart = parts[j - 1];
        if (prevPart && prevPart.type === 'text') {
          // Previous was text, no newline before closing tag
          result.push(tag);
        } else {
          // Previous was tag, add newline and indent
          result.push('\n' + indentStr.repeat(depth) + tag);
        }
      } else if (tag.startsWith('<!--')) {
        // Comment
        result.push(tag);
      } else if (tag.endsWith('/>') || isVoidTag(tag)) {
        // Void tag
        result.push('\n' + indentStr.repeat(depth) + tag);
      } else {
        // Opening tag
        result.push('\n' + indentStr.repeat(depth) + tag);
        depth++;
      }
    }
  }
  
  return result.join('').replace(/^\n/, ''); // Remove leading newline
}

// Helper to check if a tag is void (no regex needed)
function isVoidTag(tag: string): boolean {
  const tagName = tag.substring(1, tag.indexOf(' ') !== -1 ? tag.indexOf(' ') : tag.indexOf('>'));
  return VOID_TAGS.has(tagName);
}

export function renderToString(schema: Schema | { $template: Schema; $data: Data }, options: RenderOptions = {}): string {
  const data = options.data || {};
  
  if (isTemplate(schema)) {
    return renderToString(schema.$template, { data: schema.$data, indent: options.indent });
  }
  
  // Process indent option
  let indentConfig: { indentStr: string; enabled: boolean } = { indentStr: '', enabled: false };
  if (options.indent) {
    if (typeof options.indent === 'number') {
      indentConfig = { indentStr: ' '.repeat(options.indent), enabled: true };
    } else if (typeof options.indent === 'string') {
      indentConfig = { indentStr: options.indent, enabled: true };
    } else if (options.indent === true) {
      indentConfig = { indentStr: '  ', enabled: true };
    }
  }
  
  const result = render(schema as Schema, data, { indentConfig });
  
  // Apply formatting if indentation is enabled
  if (indentConfig.enabled) {
    return formatWithIndentation(result, indentConfig.indentStr);
  }
  
  return result;
}

// Helper function to render tag, deciding internally whether to close or not
function renderTag(tag: string, attrs: Record<string, unknown>, data: Data, content?: string): string {
  // Special handling for comment tags
  if (tag === 'comment') {
    return `<!--${content || ""}-->`;
  }
  
  const openTag = `<${tag}${renderAttrs(attrs, data, tag)}>`;
  const isVoid = VOID_TAGS.has(tag);
  
  // Void tags are never closed, regardless of content
  if (isVoid) {
    return openTag;
  }
  
  // Non-void tags get content (even if empty) and closing tag
  return `${openTag}${content || ""}</${tag}>`;
}

function render(schema: Schema, data: Data, context: { insideComment?: boolean; indentConfig?: any } = {}): string {
  if (typeof schema === "string") return interpolate(schema, data);
  if (Array.isArray(schema)) return schema.map(s => render(s, data, context)).join("");
  
  const { tag, rest, children, attrs } = parseSchemaObject(schema);
  
  // Inline validateTag: Validate that a tag is allowed
  if (!ALLOWED_TAGS.has(tag)) {
    throw new Error(`Tag "${tag}" is not allowed`);
  }
  
  // Prevent nested comments
  if (tag === 'comment' && context.insideComment) {
    throw new Error('Nested comments are not allowed');
  }
  
  // Inline validateChildren: Validate that void tags don't have children
  const hasChildren = children.length > 0;
  const isVoid = VOID_TAGS.has(tag);
  if (isVoid && hasChildren) {
    throw new Error(`Tag "${tag}" is a void element and cannot have children`);
  }
  
  // Handle $bind
  if (hasBinding(rest)) {
    const bound = getProperty(data, rest.$bind);
    const { $bind, $children = [], ...bindAttrs } = rest;
    
    // Validate children for bound elements
    if (isVoid && $children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    
    if (Array.isArray(bound)) {
      const newContext = tag === 'comment' ? { ...context, insideComment: true } : context;
      const content = bound.map(item => 
        $children.map((c: Schema) => render(c, item as Data, newContext)).join('')).join('');
      
      return renderTag(tag, bindAttrs, data, content);
    }
    
    // For object binding, bound should be a Data object
    const boundData = bound && typeof bound === 'object' && bound !== null ? bound as Data : {};
    return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
  }
  
  // Render void tags without closing tag or complete tags with content
  const newContext = tag === 'comment' ? { ...context, insideComment: true } : context;
  const content = children.map((c: Schema) => render(c, data, newContext)).join("");
  return renderTag(tag, attrs, data, content);
}

function renderAttrs(attrs: Record<string, unknown>, data: Data, tag: string): string {
  const pairs = Object.entries(attrs).filter(([key]) => {
    validateAttribute(key, tag);
    return true;
  }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
  return pairs ? " " + pairs : "";
}