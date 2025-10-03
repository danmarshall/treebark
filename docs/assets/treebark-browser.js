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
  function getProperty(obj, path, parents = []) {
    if (path === ".") {
      return obj;
    }
    let currentObj = obj;
    let remainingPath = path;
    while (remainingPath.startsWith("..")) {
      let parentLevels = 0;
      let tempPath = remainingPath;
      while (tempPath.startsWith("..")) {
        parentLevels++;
        tempPath = tempPath.substring(2);
        if (tempPath.startsWith("/")) {
          tempPath = tempPath.substring(1);
        }
      }
      if (parentLevels <= parents.length) {
        currentObj = parents[parents.length - parentLevels];
        remainingPath = tempPath.startsWith(".") ? tempPath.substring(1) : tempPath;
      } else {
        return void 0;
      }
    }
    if (remainingPath) {
      return remainingPath.split(".").reduce((o, k) => o && typeof o === "object" && o !== null ? o[k] : void 0, currentObj);
    }
    return currentObj;
  }
  function escape(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
  }
  function interpolate(tpl, data, escapeHtml = true, parents = []) {
    return tpl.replace(/(\{\{\{|\{\{)(.*?)(\}\}\}|\}\})/g, (_, open, expr, close) => {
      const trimmed = expr.trim();
      if (open === "{{{") return `{{${trimmed}}}`;
      const val = getProperty(data, trimmed, parents);
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
  function validateBindExpression(bindValue) {
    if (bindValue === ".") {
      return;
    }
    if (bindValue.includes("..")) {
      throw new Error(`$bind does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: $bind: "${bindValue}"`);
    }
    if (bindValue.includes("{{")) {
      throw new Error(`$bind does not support interpolation {{...}} - use literal property paths only. Invalid: $bind: "${bindValue}"`);
    }
  }
  function templateHasCurrentObjectBinding(template) {
    if (Array.isArray(template) || typeof template !== "object" || template === null) {
      return false;
    }
    const entries = Object.entries(template);
    if (entries.length === 0) {
      return false;
    }
    const [, rest] = entries[0];
    if (!rest || typeof rest !== "object" || Array.isArray(rest)) {
      return false;
    }
    return "$bind" in rest && rest.$bind === ".";
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
  const flattenOutput = (output, indentStr) => {
    if (!indentStr || output.length === 0) {
      if (output.length === 0) return "";
      if (output.length === 1) return output[0][1];
      let result2 = output[0][1];
      for (let i = 1; i < output.length; i++) {
        result2 += output[i][1];
      }
      return result2;
    }
    const hasMultipleChildren = output.length > 1;
    let hasHtmlChild = false;
    if (!hasMultipleChildren) {
      hasHtmlChild = output[0][1].includes("<");
      if (!hasHtmlChild) {
        return output[0][1];
      }
    }
    let result = "\n";
    for (let i = 0; i < output.length; i++) {
      const [level, content] = output[i];
      result += indentStr.repeat(level);
      result += content;
      if (i < output.length - 1) {
        result += "\n";
      }
    }
    result += "\n";
    return result;
  };
  function renderToString(input, options = {}) {
    const data = Array.isArray(input.data) ? input.data : { ...input.data, ...options.data };
    const context = options.indent ? {
      indentStr: typeof options.indent === "number" ? " ".repeat(options.indent) : typeof options.indent === "string" ? options.indent : "  ",
      level: 0
    } : {};
    if (!Array.isArray(input.template) && Array.isArray(input.data) && !templateHasCurrentObjectBinding(input.template)) {
      const separator = context.indentStr ? "\n" : "";
      return input.data.map(
        (item) => render(input.template, { ...item, ...options.data }, context)
      ).join(separator);
    }
    return render(input.template, data, context);
  }
  function renderTag(tag, attrs, data, childrenOutput, indentStr, level, parents = []) {
    const formattedContent = flattenOutput(childrenOutput, indentStr);
    const needsParentIndent = formattedContent.startsWith("\n");
    const parentIndent = needsParentIndent && indentStr ? indentStr.repeat(level || 0) : "";
    if (tag === "comment") {
      return `<!--${formattedContent}${parentIndent}-->`;
    }
    const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents)}>`;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid) {
      return openTag;
    }
    return `${openTag}${formattedContent}${parentIndent}</${tag}>`;
  }
  function render(template, data, context = {}) {
    const parents = context.parents || [];
    if (typeof template === "string") return interpolate(template, data, true, parents);
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
    const renderChildren = (children2, data2, childParents) => {
      const results = [];
      for (const child of children2) {
        const content = render(child, data2, { ...childContext, parents: childParents });
        if (context.indentStr && content.includes("\n") && !content.includes("<")) {
          const lines = content.split("\n");
          for (const line of lines) {
            results.push([childContext.level, line]);
          }
        } else {
          results.push([childContext.level, content]);
        }
      }
      return results;
    };
    let childrenOutput;
    let contentAttrs;
    if (hasBinding(rest)) {
      validateBindExpression(rest.$bind);
      const bound = getProperty(data, rest.$bind, []);
      const { $bind, $children = [], ...bindAttrs } = rest;
      if (!Array.isArray(bound)) {
        const boundData = bound && typeof bound === "object" && bound !== null ? bound : {};
        const newParents = [...parents, data];
        return render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
      }
      childrenOutput = bound.flatMap((item) => {
        const newParents = [...parents, data];
        return renderChildren($children, item, newParents);
      });
      contentAttrs = bindAttrs;
    } else {
      childrenOutput = renderChildren(children, data, parents);
      contentAttrs = attrs;
    }
    return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents);
  }
  function renderAttrs(attrs, data, tag, parents = []) {
    const pairs = Object.entries(attrs).filter(([key]) => {
      validateAttribute(key, tag);
      return true;
    }).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false, parents))}"`).join(" ");
    return pairs ? " " + pairs : "";
  }
  exports2.renderToString = renderToString;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=treebark-browser.js.map
