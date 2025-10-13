(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Treebark = {}));
})(this, (function(exports2) {
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
  function interpolate(tpl, data, escapeHtml = true, parents = []) {
    return tpl.replace(/\{\{\{([^{]*?)\}\}\}|\{\{([^{]*?)\}\}/g, (match, escapedExpr, normalExpr) => {
      if (escapedExpr !== void 0) {
        const trimmed2 = escapedExpr.trim();
        return `{{${trimmed2}}}`;
      }
      const trimmed = normalExpr.trim();
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
  function validateCheckExpression(checkValue) {
    if (checkValue === ".") {
      return;
    }
    if (checkValue.includes("..")) {
      throw new Error(`$check does not support parent context access (..) - use interpolation {{..prop}} in content/attributes instead. Invalid: $check: "${checkValue}"`);
    }
    if (checkValue.includes("{{")) {
      throw new Error(`$check does not support interpolation {{...}} - use literal property paths only. Invalid: $check: "${checkValue}"`);
    }
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
  function evaluateConditionalValue(value, data, parents = []) {
    validateCheckExpression(value.$check);
    const checkValue = getProperty(data, value.$check, parents);
    const condition = evaluateCondition(checkValue, value);
    if (condition) {
      return value.$then !== void 0 ? value.$then : "";
    } else {
      return value.$else !== void 0 ? value.$else : "";
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
    const children = typeof rest === "string" ? [rest] : Array.isArray(rest) ? rest : rest?.$children || [];
    const attrs = rest && typeof rest === "object" && !Array.isArray(rest) ? Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "$children")) : {};
    return { tag, rest, children, attrs };
  }
  function processConditional(rest, data, parents = []) {
    const conditional = rest;
    if (!conditional.$check) {
      throw new Error('"$if" tag requires $check attribute to specify the condition');
    }
    validateCheckExpression(conditional.$check);
    const checkValue = getProperty(data, conditional.$check, parents);
    if (typeof rest === "object" && rest !== null && !Array.isArray(rest) && "$children" in rest) {
      throw new Error('"$if" tag does not support $children, use $then and $else instead');
    }
    const { $then, $else } = conditional;
    if ($then !== void 0 && Array.isArray($then)) {
      throw new Error('"$if" tag $then must be a string or single element object, not an array');
    }
    if ($else !== void 0 && Array.isArray($else)) {
      throw new Error('"$if" tag $else must be a string or single element object, not an array');
    }
    const allKeys = typeof rest === "object" && rest !== null && !Array.isArray(rest) ? Object.keys(rest) : [];
    const nonConditionalAttrs = allKeys.filter((k) => !CONDITIONALKEYS.has(k));
    if (nonConditionalAttrs.length > 0) {
      throw new Error(`"$if" tag does not support attributes: ${nonConditionalAttrs.join(", ")}. Allowed: ${[...CONDITIONALKEYS].join(", ")}`);
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
    if (tag === "$comment") {
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
    if (tag === "$comment" && context.insideComment) {
      throw new Error("Nested comments are not allowed");
    }
    if (tag === "$if") {
      const { valueToRender } = processConditional(rest, data, parents);
      if (valueToRender === void 0) {
        return "";
      }
      return render(valueToRender, data, context);
    }
    if (VOID_TAGS.has(tag) && children.length > 0) {
      throw new Error(`Tag "${tag}" is a void element and cannot have children`);
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
      for (const child of children) {
        const content = render(child, data, { ...childContext, parents });
        childrenOutput.push(...processContent(content));
      }
      contentAttrs = attrs;
    }
    return renderTag(tag, contentAttrs, data, childrenOutput, context.indentStr, context.level, parents);
  }
  function renderAttrs(attrs, data, tag, parents = []) {
    const pairs = Object.entries(attrs).filter(([key]) => (validateAttribute(key, tag), true)).map(([k, v]) => {
      if (isConditionalValue(v)) {
        const evaluatedValue = evaluateConditionalValue(v, data, parents);
        return `${k}="${escape(interpolate(String(evaluatedValue), data, false, parents))}"`;
      } else {
        return `${k}="${escape(interpolate(String(v), data, false, parents))}"`;
      }
    }).join(" ");
    return pairs ? " " + pairs : "";
  }
  exports2.renderToString = renderToString;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=treebark-browser.js.map
