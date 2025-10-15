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
    "a"
  ]);
  const SPECIAL_TAGS = /* @__PURE__ */ new Set([
    "$comment",
    "$if"
  ]);
  const VOID_TAGS = /* @__PURE__ */ new Set([
    "img",
    "br",
    "hr"
  ]);
  const ALLOWED_TAGS = /* @__PURE__ */ new Set([...CONTAINER_TAGS, ...SPECIAL_TAGS, ...VOID_TAGS]);
  const GLOBAL_ATTRS = /* @__PURE__ */ new Set(["id", "class", "style", "title", "role", "data-", "aria-"]);
  const TAG_SPECIFIC_ATTRS = {
    "a": /* @__PURE__ */ new Set(["href", "target", "rel"]),
    "img": /* @__PURE__ */ new Set(["src", "alt", "width", "height"]),
    "table": /* @__PURE__ */ new Set(["summary"]),
    "th": /* @__PURE__ */ new Set(["scope", "colspan", "rowspan"]),
    "td": /* @__PURE__ */ new Set(["scope", "colspan", "rowspan"]),
    "blockquote": /* @__PURE__ */ new Set(["cite"])
  };
  const OPERATORS = /* @__PURE__ */ new Set(["$<", "$>", "$<=", "$>=", "$=", "$in"]);
  const CONDITIONALKEYS = /* @__PURE__ */ new Set(["$check", "$then", "$else", "$not", "$join", ...OPERATORS]);
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
  function validateAttribute(key, tag, logger) {
    const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some((p) => p.endsWith("-") && key.startsWith(p));
    const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
    const isTagSpecific = tagAttrs && tagAttrs.has(key);
    if (!isGlobal && !isTagSpecific) {
      logger.warn(`Attribute "${key}" is not allowed on tag "${tag}"`);
      return false;
    }
    return true;
  }
  function hasBinding(rest) {
    return rest !== null && typeof rest === "object" && !Array.isArray(rest) && "$bind" in rest;
  }
  function validatePathExpression(value, label, logger) {
    if (value === ".") {
      return true;
    }
    if (value.includes("..")) {
      logger.error(`${label} does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: ${label}: "${value}"`);
      return false;
    }
    if (value.includes("{{")) {
      logger.error(`${label} does not support interpolation {{...}} - use literal property paths only. Invalid: ${label}: "${value}"`);
      return false;
    }
    return true;
  }
  function evaluateCondition(checkValue, attrs) {
    const operators = [];
    for (const op of OPERATORS) {
      if (op in attrs) {
        operators.push({ key: op, value: attrs[op] });
      }
    }
    if (operators.length === 0) {
      const result = Boolean(checkValue);
      return attrs.$not ? !result : result;
    }
    const results = operators.map((op) => {
      switch (op.key) {
        case "$<":
          return typeof checkValue === "number" && typeof op.value === "number" && checkValue < op.value;
        case "$>":
          return typeof checkValue === "number" && typeof op.value === "number" && checkValue > op.value;
        case "$<=":
          return typeof checkValue === "number" && typeof op.value === "number" && checkValue <= op.value;
        case "$>=":
          return typeof checkValue === "number" && typeof op.value === "number" && checkValue >= op.value;
        case "$=":
          return checkValue === op.value;
        case "$in":
          return Array.isArray(op.value) && op.value.includes(checkValue);
        default:
          return false;
      }
    });
    const useOr = attrs.$join === "OR";
    let finalResult;
    if (useOr) {
      finalResult = results.some((r) => r);
    } else {
      finalResult = results.every((r) => r);
    }
    return attrs.$not ? !finalResult : finalResult;
  }
  function isConditionalValue(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value) && "$check" in value && typeof value.$check === "string";
  }
  function evaluateConditionalValue(value, data, parents = [], logger) {
    if (!validatePathExpression(value.$check, "$check", logger)) {
      return "";
    }
    const checkValue = getProperty(data, value.$check, parents);
    const condition = evaluateCondition(checkValue, value);
    if (condition) {
      return value.$then !== void 0 ? value.$then : "";
    } else {
      return value.$else !== void 0 ? value.$else : "";
    }
  }
  function parseTemplateObject(templateObj, logger) {
    if (!templateObj || typeof templateObj !== "object") {
      logger.error("Template object cannot be null, undefined, or non-object");
      return void 0;
    }
    const entries = Object.entries(templateObj);
    if (entries.length === 0) {
      logger.error("Template object must have at least one tag");
      return void 0;
    }
    const firstEntry = entries[0];
    if (!firstEntry) {
      logger.error("Template object must have at least one tag");
      return void 0;
    }
    const [tag, rest] = firstEntry;
    const children = typeof rest === "string" ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
    const attrs = rest && typeof rest === "object" && !Array.isArray(rest) ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "$children")) : {};
    return { tag, rest, children, attrs };
  }
  function processConditional(rest, data, parents = [], logger) {
    const conditional = rest;
    if (!conditional.$check) {
      logger.error('"$if" tag requires $check attribute to specify the condition');
      return { valueToRender: void 0 };
    }
    if (!validatePathExpression(conditional.$check, "$check", logger)) {
      return { valueToRender: void 0 };
    }
    const checkValue = getProperty(data, conditional.$check, parents);
    if (typeof rest === "object" && rest !== null && !Array.isArray(rest) && "$children" in rest) {
      logger.warn('"$if" tag does not support $children, use $then and $else instead');
    }
    const { $then, $else } = conditional;
    if ($then !== void 0 && Array.isArray($then)) {
      logger.error('"$if" tag $then must be a string or single element object, not an array');
      return { valueToRender: void 0 };
    }
    if ($else !== void 0 && Array.isArray($else)) {
      logger.error('"$if" tag $else must be a string or single element object, not an array');
      return { valueToRender: void 0 };
    }
    const allKeys = typeof rest === "object" && rest !== null && !Array.isArray(rest) ? Object.keys(rest) : [];
    const nonConditionalAttrs = allKeys.filter((k) => !CONDITIONALKEYS.has(k));
    if (nonConditionalAttrs.length > 0) {
      logger.warn(`"$if" tag does not support attributes: ${nonConditionalAttrs.join(", ")}. Allowed: ${[...CONDITIONALKEYS].join(", ")}`);
    }
    const condition = evaluateCondition(checkValue, conditional);
    const valueToRender = condition ? $then : $else;
    return { valueToRender };
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
    const data = input.data || {};
    const logger = options.logger || console;
    const context = options.indent ? {
      indentStr: typeof options.indent === "number" ? " ".repeat(options.indent) : typeof options.indent === "string" ? options.indent : "  ",
      level: 0,
      logger
    } : { logger };
    return render(input.template, data, context);
  }
  function renderTag(tag, attrs, data, childrenOutput, logger, indentStr, level, parents = []) {
    const formattedContent = flattenOutput(childrenOutput, indentStr);
    const parentIndent = formattedContent.startsWith("\n") && indentStr ? indentStr.repeat(level || 0) : "";
    if (tag === "$comment") {
      return `<!--${formattedContent}${parentIndent}-->`;
    }
    const openTag = `<${tag}${renderAttrs(attrs, data, tag, parents, logger)}>`;
    if (VOID_TAGS.has(tag)) {
      return openTag;
    }
    return `${openTag}${formattedContent}${parentIndent}</${tag}>`;
  }
  function render(template, data, context) {
    const parents = context.parents || [];
    const logger = context.logger;
    if (typeof template === "string") return interpolate(template, data, true, parents);
    if (Array.isArray(template)) {
      return template.map((t) => render(t, data, context)).join(context.indentStr ? "\n" : "");
    }
    const parsed = parseTemplateObject(template, logger);
    if (!parsed) {
      return "";
    }
    const { tag, rest, children, attrs } = parsed;
    if (!ALLOWED_TAGS.has(tag)) {
      logger.error(`Tag "${tag}" is not allowed`);
      return "";
    }
    if (tag === "$comment" && context.insideComment) {
      logger.error("Nested comments are not allowed");
      return "";
    }
    if (tag === "$if") {
      const { valueToRender } = processConditional(rest, data, parents, logger);
      if (valueToRender === void 0) {
        return "";
      }
      return render(valueToRender, data, context);
    }
    if (VOID_TAGS.has(tag) && children.length > 0) {
      logger.warn(`Tag "${tag}" is a void element and cannot have children`);
    }
    const childContext = {
      ...context,
      insideComment: tag === "$comment" || context.insideComment,
      level: (context.level || 0) + 1
    };
    const processContent = (content) => {
      if (content === "") {
        return [];
      }
      if (context.indentStr && content.includes("\n") && !content.includes("<")) {
        return content.split("\n").map((line) => [childContext.level, line]);
      }
      return [[childContext.level, content]];
    };
    let childrenOutput;
    let contentAttrs;
    if (hasBinding(rest)) {
      if (!validatePathExpression(rest.$bind, "$bind", logger)) {
        return "";
      }
      const bound = getProperty(data, rest.$bind, []);
      const { $bind, $children = [], ...bindAttrs } = rest;
      if (!Array.isArray(bound)) {
        const boundData = bound && typeof bound === "object" && bound !== null ? bound : {};
        const newParents = [...parents, data];
        return render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
      }
      childrenOutput = [];
      if (!VOID_TAGS.has(tag)) {
        for (const item of bound) {
          const newParents = [...parents, data];
          for (const child of $children) {
            const content = render(child, item, { ...childContext, parents: newParents });
            childrenOutput.push(...processContent(content));
          }
        }
      }
      contentAttrs = bindAttrs;
    } else {
      childrenOutput = [];
      if (!VOID_TAGS.has(tag)) {
        for (const child of children) {
          const content = render(child, data, { ...childContext, parents });
          childrenOutput.push(...processContent(content));
        }
      }
      contentAttrs = attrs;
    }
    return renderTag(tag, contentAttrs, data, childrenOutput, logger, context.indentStr, context.level, parents);
  }
  function renderAttrs(attrs, data, tag, parents = [], logger) {
    const pairs = Object.entries(attrs).filter(([key]) => validateAttribute(key, tag, logger)).map(([k, v]) => {
      if (isConditionalValue(v)) {
        const evaluatedValue = evaluateConditionalValue(v, data, parents, logger);
        return `${k}="${escape(interpolate(String(evaluatedValue), data, false, parents))}"`;
      } else {
        return `${k}="${escape(interpolate(String(v), data, false, parents))}"`;
      }
    }).join(" ");
    return pairs ? " " + pairs : "";
  }
  function treebarkPlugin(md, options = {}) {
    const { data = {}, yaml, indent, logger } = options;
    const originalFence = md.renderer.rules.fence;
    md.renderer.rules.fence = function(tokens, idx, options2, env, renderer) {
      const token = tokens[idx];
      const info = token.info ? token.info.trim() : "";
      if (info === "treebark" || info.startsWith("treebark ")) {
        try {
          return renderTreebarkBlock(token.content, data, yaml, indent, logger) + "\n";
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Unknown error";
          return `<div class="treebark-error"><strong>Treebark Error:</strong> ${escapeHtml(errorMsg)}</div>
`;
        }
      }
      return originalFence ? originalFence(tokens, idx, options2, env, renderer) : "";
    };
  }
  function renderTreebarkBlock(content, defaultData, yaml, indent, logger) {
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
    const renderOptions = { indent, logger };
    if (template && typeof template === "object" && "template" in template) {
      const mergedData = { ...defaultData, ...template.data };
      return renderToString({ template: template.template, data: mergedData }, renderOptions);
    } else {
      return renderToString({ template, data: defaultData }, renderOptions);
    }
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
