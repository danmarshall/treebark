// Treebark browser bundle - generated from actual treebark library
const CONTAINER_TAGS = new Set([
    'div', 'span', 'p', 'header', 'footer', 'main', 'section', 'article',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'blockquote', 'code', 'pre',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'a',
    'comment'
]);
const VOID_TAGS = new Set([
    'img'
]);
const ALLOWED_TAGS = new Set([...CONTAINER_TAGS, ...VOID_TAGS]);
const GLOBAL_ATTRS = new Set(['id', 'class', 'style', 'title', 'role', 'data-', 'aria-']);
const TAG_SPECIFIC_ATTRS = {
    'a': new Set(['href', 'target', 'rel']),
    'img': new Set(['src', 'alt', 'width', 'height']),
    'table': new Set(['summary']),
    'th': new Set(['scope', 'colspan', 'rowspan']),
    'td': new Set(['scope', 'colspan', 'rowspan']),
    'blockquote': new Set(['cite'])
};
function getProperty(obj, path) {
    return path.split('.').reduce((o, k) => (o && typeof o === 'object' && o !== null ? o[k] : undefined), obj);
}
function escape(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
}
function interpolate(tpl, data, escapeHtml = true) {
    return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
        const trimmed = expr.trim();
        if (open === '{{{')
            return `{{${trimmed}}}`;
        const val = getProperty(data, trimmed);
        return val == null ? "" : (escapeHtml ? escape(String(val)) : String(val));
    });
}
function validateAttribute(key, tag) {
    const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some(p => p.endsWith('-') && key.startsWith(p));
    const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
    const isTagSpecific = tagAttrs && tagAttrs.has(key);
    if (!isGlobal && !isTagSpecific) {
        throw new Error(`Attribute "${key}" is not allowed on tag "${tag}"`);
    }
}
function isTemplate(schema) {
    return schema !== null && typeof schema === 'object' && '$template' in schema;
}
function hasBinding(rest) {
    return rest !== null && typeof rest === 'object' && !Array.isArray(rest) && '$bind' in rest;
}
function parseSchemaObject(schema) {
    const entries = Object.entries(schema);
    if (entries.length === 0) {
        throw new Error('Schema object must have at least one tag');
    }
    const firstEntry = entries[0];
    if (!firstEntry) {
        throw new Error('Schema object must have at least one tag');
    }
    const [tag, rest] = firstEntry;
    const children = typeof rest === 'string' ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
    const attrs = rest && typeof rest === "object" && !Array.isArray(rest)
        ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== '$children')) : {};
    return { tag, rest, children, attrs };
}



function renderToString(schema, options = {}) {
    const data = options.data || {};
    if (isTemplate(schema)) {
        return renderToString(schema.$template, { data: schema.$data, indent: options.indent });
    }
    const context = options.indent ? {
        indentStr: typeof options.indent === 'number' ? ' '.repeat(options.indent) :
            typeof options.indent === 'string' ? options.indent : '  ',
        level: 0
    } : {};
    return renderStringInternal(schema, data, context);
}
function renderTag(tag, attrs, data, content, indentStr, level) {
    if (tag === 'comment') {
        return `<!--${content || ""}-->`;
    }
    const openTag = `<${tag}${renderAttrs(attrs, data, tag)}>`;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid) {
        return openTag;
    }
    if (indentStr && content && content.includes('<')) {
        const currentIndent = indentStr.repeat(level || 0);
        return `${openTag}\n${content}\n${currentIndent}</${tag}>`;
    }
    return `${openTag}${content || ""}</${tag}>`;
}
function renderStringInternal(schema, data, context = {}) {
    if (typeof schema === "string")
        return interpolate(schema, data);
    const separator = context.indentStr ? '\n' : '';
    if (Array.isArray(schema)) {
        return schema.map(s => renderStringInternal(s, data, context)).join(separator);
    }
    const { tag, rest, children, attrs } = parseSchemaObject(schema);
    if (!ALLOWED_TAGS.has(tag)) {
        throw new Error(`Tag "${tag}" is not allowed`);
    }
    if (tag === 'comment' && context.insideComment) {
        throw new Error('Nested comments are not allowed');
    }
    const hasChildren = children.length > 0;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid && hasChildren) {
        throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    const childContext = {
        ...context,
        insideComment: tag === 'comment' || context.insideComment,
        level: (context.level || 0) + 1
    };
    if (hasBinding(rest)) {
        const bound = getProperty(data, rest.$bind);
        const { $bind, $children = [], ...bindAttrs } = rest;
        if (isVoid && $children.length > 0) {
            throw new Error(`Tag "${tag}" is a void element and cannot have children`);
        }
        if (Array.isArray(bound)) {
            const content = bound.map(item => $children.map((c) => renderStringInternal(c, item, childContext)).join(separator)).join(separator);
            return renderTag(tag, bindAttrs, data, content, context.indentStr, context.level);
        }
        const boundData = bound && typeof bound === 'object' && bound !== null ? bound : {};
        return renderStringInternal({ [tag]: { ...bindAttrs, $children } }, boundData, context);
    }
    const content = children.map((c) => {
        const result = renderStringInternal(c, data, childContext);
        if (context.indentStr && result.startsWith('<')) {
            return context.indentStr.repeat(childContext.level) + result;
        }
        return result;
    }).join(separator);
    return renderTag(tag, attrs, data, content, context.indentStr, context.level);
}
function renderAttrs(attrs, data, tag) {
    const pairs = Object.entries(attrs).filter(([key]) => {
        validateAttribute(key, tag);
        return true;
    }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
    return pairs ? " " + pairs : "";
}




function renderToDOM(schema, options = {}) {
    const data = options.data || {};
    if (isTemplate(schema)) {
        return renderToDOM(schema.$template, { data: schema.$data });
    }
    const fragment = document.createDocumentFragment();
    const result = renderDOMInternal(schema, data, {});
    if (Array.isArray(result))
        result.forEach(n => fragment.appendChild(n));
    else
        fragment.appendChild(result);
    return fragment;
}
function renderDOMInternal(schema, data, context = {}) {
    if (typeof schema === "string")
        return document.createTextNode(interpolate(schema, data));
    if (Array.isArray(schema))
        return schema.flatMap(s => {
            const r = renderDOMInternal(s, data, context);
            return Array.isArray(r) ? r : [r];
        });
    const { tag, rest, children, attrs } = parseSchemaObject(schema);
    if (!ALLOWED_TAGS.has(tag)) {
        throw new Error(`Tag "${tag}" is not allowed`);
    }
    if (tag === 'comment' && context.insideComment) {
        throw new Error('Nested comments are not allowed');
    }
    const hasChildren = children.length > 0;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid && hasChildren) {
        throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    if (tag === 'comment') {
        const stringResult = renderToString(schema, { data });
        const commentContent = stringResult.slice(4, -3);
        return document.createComment(commentContent);
    }
    const element = document.createElement(tag);
    if (hasBinding(rest)) {
        const bound = getProperty(data, rest.$bind);
        const { $bind, $children = [], ...bindAttrs } = rest;
        setAttrs(element, bindAttrs, data, tag);
        if (isVoid && $children.length > 0) {
            throw new Error(`Tag "${tag}" is a void element and cannot have children`);
        }
        if (Array.isArray(bound)) {
            bound.forEach(item => $children.forEach((c) => {
                const nodes = renderDOMInternal(c, item, context);
                (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
            }));
            return element;
        }
        const boundData = bound && typeof bound === 'object' && bound !== null ? bound : {};
        const childNodes = renderDOMInternal({ [tag]: { ...bindAttrs, $children } }, boundData, context);
        return Array.isArray(childNodes) ? childNodes : [childNodes];
    }
    setAttrs(element, attrs, data, tag);
    children.forEach((c) => {
        const nodes = renderDOMInternal(c, data, context);
        (Array.isArray(nodes) ? nodes : [nodes]).forEach(n => element.appendChild(n));
    });
    return element;
}
function setAttrs(element, attrs, data, tag) {
    Object.entries(attrs).forEach(([key, value]) => {
        validateAttribute(key, tag);
        element.setAttribute(key, interpolate(String(value), data, false));
    });
}


// Export the functions globally
window.renderToDOM = renderToDOM;
window.renderToString = renderToString;
