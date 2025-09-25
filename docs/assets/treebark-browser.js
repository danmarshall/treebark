(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Treebark = {}));
})(this, function(exports2) {
  "use strict";
  const CONTAINER_TAGS = /* @__PURE__ */ new Set([
    "div",
    "span",
    "p",
    "header",
    "footer",
    "main",
    "section",
    "article",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "blockquote",
    "code",
    "pre",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "a",
    "comment"
  ]);
  const VOID_TAGS = /* @__PURE__ */ new Set([
    "img"
  ]);
  const ALLOWED_TAGS = /* @__PURE__ */ new Set([...CONTAINER_TAGS, ...VOID_TAGS]);
  const GLOBAL_ATTRS = /* @__PURE__ */ new Set(["id", "class", "style", "title", "role", "data-", "aria-"]);
  const TAG_SPECIFIC_ATTRS = {
    "a": /* @__PURE__ */ new Set(["href", "target", "rel"]),
    "img": /* @__PURE__ */ new Set(["src", "alt", "width", "height"]),
    "table": /* @__PURE__ */ new Set(["summary"]),
    "th": /* @__PURE__ */ new Set(["scope", "colspan", "rowspan"]),
    "td": /* @__PURE__ */ new Set(["scope", "colspan", "rowspan"]),
    "blockquote": /* @__PURE__ */ new Set(["cite"])
  };
  function getProperty(obj, path) {
    return path.split(".").reduce((o, k) => o && typeof o === "object" && o !== null ? o[k] : void 0, obj);
  }
  function escape(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
  }
  function interpolate(tpl, data, escapeHtml = true) {
    return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
      const trimmed = expr.trim();
      if (open === "{{{") return `{{${trimmed}}}`;
      const val = getProperty(data, trimmed);
      return val == null ? "" : escapeHtml ? escape(String(val)) : String(val);
    });
  }
  function validateAttribute(key, tag) {
    const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some((p) => p.endsWith("-") && key.startsWith(p));
    const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
    const isTagSpecific = tagAttrs && tagAttrs.has(key);
    if (!isGlobal && !isTagSpecific) {
      throw new Error(`Attribute "${key}" is not allowed on tag "${tag}"`);
    }
  }
  function hasBinding(rest) {
    return rest !== null && typeof rest === "object" && !Array.isArray(rest) && "$bind" in rest;
  }
  function parseTemplateObject(templateObj) {
    if (!templateObj || typeof templateObj !== "object") {
      throw new Error("Template object cannot be null, undefined, or non-object");
    }
    const entries = Object.entries(templateObj);
    if (entries.length === 0) {
      throw new Error("Template object must have at least one tag");
    }
    const firstEntry = entries[0];
    if (!firstEntry) {
      throw new Error("Template object must have at least one tag");
    }
    const [tag, rest] = firstEntry;
    const children = typeof rest === "string" ? [rest] : Array.isArray(rest) ? rest : (rest == null ? void 0 : rest.$children) || [];
    const attrs = rest && typeof rest === "object" && !Array.isArray(rest) ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "$children")) : {};
    return { tag, rest, children, attrs };
  }
  const getIndentInfo = (indentStr, htmlContent, isElement = false, level = 0) => {
    const should = indentStr && htmlContent && (isElement ? htmlContent.startsWith("<") : htmlContent.includes("<"));
    return [Boolean(should), should ? indentStr.repeat(level) : ""];
  };
  function renderToString(input, options = {}) {
    const data = { ...input.data, ...options.data };
    const context = options.indent ? {
      indentStr: typeof options.indent === "number" ? " ".repeat(options.indent) : typeof options.indent === "string" ? options.indent : "  ",
      level: 0
    } : {};
    if (!Array.isArray(input.template) && Array.isArray(input.data)) {
      const separator = context.indentStr ? "\n" : "";
      return input.data.map(
        (item) => render(input.template, { ...item, ...options.data }, context)
      ).join(separator);
    }
    return render(input.template, data, context);
  }
  function renderTag(tag, attrs, data, content, indentStr, level) {
    if (tag === "comment") {
      const hasHtmlContent = content && content.includes("<");
      const formattedContent2 = indentStr && hasHtmlContent ? `
${content}
${indentStr.repeat(level || 0)}` : content || "";
      return `<!--${formattedContent2}-->`;
    }
    const openTag = `<${tag}${renderAttrs(attrs, data, tag)}>`;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid) {
      return openTag;
    }
    const [shouldIndentContent, currentIndent] = getIndentInfo(indentStr, content, false, level || 0);
    const formattedContent = shouldIndentContent ? `
${content}
${currentIndent}` : content || "";
    return `${openTag}${formattedContent}</${tag}>`;
  }
  function render(template, data, context = {}) {
    if (typeof template === "string") return interpolate(template, data);
    if (Array.isArray(template)) {
      return template.map((t) => render(t, data, context)).join(context.indentStr ? "\n" : "");
    }
    const { tag, rest, children, attrs } = parseTemplateObject(template);
    if (!ALLOWED_TAGS.has(tag)) {
      throw new Error(`Tag "${tag}" is not allowed`);
    }
    if (tag === "comment" && context.insideComment) {
      throw new Error("Nested comments are not allowed");
    }
    if (VOID_TAGS.has(tag) && children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
    }
    const childContext = {
      ...context,
      insideComment: tag === "comment" || context.insideComment,
      level: (context.level || 0) + 1
    };
    const renderChildren = (children2, data2, separator) => {
      return children2.map((child) => {
        const result = render(child, data2, childContext);
        const [shouldIndentElement, repeatedIndent] = getIndentInfo(context.indentStr, result, true, childContext.level);
        return shouldIndentElement ? repeatedIndent + result : result;
      }).join(separator);
    };
    let content;
    let contentAttrs;
    if (hasBinding(rest)) {
      const bound = getProperty(data, rest.$bind);
      const { $bind, $children = [], ...bindAttrs } = rest;
      if (!Array.isArray(bound)) {
        const boundData = bound && typeof bound === "object" && bound !== null ? bound : {};
        return render({ [tag]: { ...bindAttrs, $children } }, boundData, context);
      }
      content = bound.map(
        (item) => renderChildren($children, item, "")
      ).join(context.indentStr ? "\n" : "");
      contentAttrs = bindAttrs;
    } else {
      content = renderChildren(children, data, context.indentStr ? "\n" : "");
      contentAttrs = attrs;
    }
    return renderTag(tag, contentAttrs, data, content, context.indentStr, context.level);
  }
  function renderAttrs(attrs, data, tag) {
    const pairs = Object.entries(attrs).filter(([key]) => {
      validateAttribute(key, tag);
      return true;
    }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false))}"`).join(" ");
    return pairs ? " " + pairs : "";
  }
  exports2.renderToString = renderToString;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=treebark-browser.js.map
