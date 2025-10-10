(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.MarkdownItTreebark = factory());
})(this, (function() {
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
  function interpolate(tpl, data, escapeHtml2 = true, parents = []) {
    return tpl.replace(/\{\{\{([^{]*?)\}\}\}|\{\{([^{]*?)\}\}/g, (match, escapedExpr, normalExpr) => {
      if (escapedExpr !== void 0) {
        const trimmed2 = escapedExpr.trim();
        return `{{${trimmed2}}}`;
      }
      const trimmed = normalExpr.trim();
      const val = getProperty(data, trimmed, parents);
      return val == null ? "" : escapeHtml2 ? escape(String(val)) : String(val);
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
    if ("$bind" in rest && rest.$bind === ".") {
      return true;
    }
    const children = rest?.$children || [];
    for (const child of children) {
      if (templateHasCurrentObjectBinding(child)) {
        return true;
      }
    }
    return false;
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
    const children = typeof rest === "string" ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
    const attrs = rest && typeof rest === "object" && !Array.isArray(rest) ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "$children")) : {};
    return { tag, rest, children, attrs };
  }
  const flattenOutput = (output, indentStr) => {
    if (!indentStr) {
      return output.length <= 1 ? output[0]?.[1] ?? "" : output.reduce((acc, [, content]) => acc + content, "");
    }
    if (output.length === 0) return "";
    if (output.length === 1 && !output[0][1].includes("<")) {
      return output[0][1];
    }
    let result = "\n";
    for (let i = 0; i < output.length; i++) {
      result += indentStr.repeat(output[i][0]) + output[i][1];
      if (i < output.length - 1) result += "\n";
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
    const parentIndent = formattedContent.startsWith("\n") && indentStr ? indentStr.repeat(level || 0) : "";
    if (tag === "comment") {
      return `<!--${formattedContent}${parentIndent}-->`;
    }
    const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents)}>`;
    if (VOID_TAGS.has(tag)) {
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
    const processContent = (content) => {
      if (context.indentStr && content.includes("\n") && !content.includes("<")) {
        return content.split("\n").map((line) => [childContext.level, line]);
      }
      return [[childContext.level, content]];
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
      childrenOutput = [];
      for (const item of bound) {
        const newParents = [...parents, data];
        for (const child of $children) {
          const content = render(child, item, { ...childContext, parents: newParents });
          childrenOutput.push(...processContent(content));
        }
      }
      contentAttrs = bindAttrs;
    } else {
      childrenOutput = [];
      const shouldCheckDeepBind = Array.isArray(data);
      for (const child of children) {
        if (shouldCheckDeepBind && typeof child === "object" && !Array.isArray(child) && child !== null) {
          const childEntries = Object.entries(child);
          if (childEntries.length > 0) {
            const [childTag, childRest] = childEntries[0];
            if (childRest && typeof childRest === "object" && !Array.isArray(childRest) && "$bind" in childRest && childRest.$bind === ".") {
              for (const item of data) {
                const content2 = render(child, item, { ...childContext, parents: [...parents, data] });
                childrenOutput.push(...processContent(content2));
              }
              continue;
            }
          }
        }
        const content = render(child, data, { ...childContext, parents });
        childrenOutput.push(...processContent(content));
      }
      contentAttrs = attrs;
    }
    return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents);
  }
  function renderAttrs(attrs, data, tag, parents = []) {
    const pairs = Object.entries(attrs).filter(([key]) => (validateAttribute(key, tag), true)).map(([k, v]) => `${k}="${escape(interpolate(String(v), data, false, parents))}"`).join(" ");
    return pairs ? " " + pairs : "";
  }
  function treebarkPlugin(md, options = {}) {
    const { data = {}, yaml, indent } = options;
    const originalFence = md.renderer.rules.fence;
    md.renderer.rules.fence = function(tokens, idx, options2, env, renderer) {
      const token = tokens[idx];
      const info = token.info ? token.info.trim() : "";
      if (info === "treebark" || info.startsWith("treebark ")) {
        try {
          return renderTreebarkBlock(token.content, data, yaml, indent) + "\n";
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          return `<div class="treebark-error"><strong>Treebark Error:</strong> ${escapeHtml(errorMsg)}</div>
`;
        }
      }
      return originalFence ? originalFence(tokens, idx, options2, env, renderer) : "";
    };
  }
  function renderTreebarkBlock(content, defaultData, yaml, indent) {
    let template;
    let yamlError = null;
    if (!content.trim()) {
      throw new Error("Empty or invalid template");
    }
    if (yaml) {
      try {
        template = yaml.load(content);
      } catch (error) {
        yamlError = error instanceof Error ? error : new Error("YAML parsing failed");
      }
    }
    if (!template) {
      try {
        template = JSON.parse(content);
      } catch (jsonError) {
        if (yaml && yamlError) {
          throw new Error(`Failed to parse as YAML or JSON. YAML error: ${yamlError.message}`);
        } else {
          throw new Error(`Failed to parse as JSON: ${jsonError instanceof Error ? jsonError.message : "Invalid format"}`);
        }
      }
    }
    if (!template) {
      throw new Error("Empty or invalid template");
    }
    if (template && typeof template === "object" && "template" in template) {
      const mergedData = { ...defaultData, ...template.data };
      return renderToString({ template: template.template, data: mergedData }, { indent });
    }
    return renderToString({ template, data: defaultData }, { indent });
  }
  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
  return treebarkPlugin;
}));
//# sourceMappingURL=markdown-it-treebark-browser.js.map
