(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.Treebark = global.Treebark || {}));
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
  const GLOBAL_ATTRS = /* @__PURE__ */ new Set(["id", "class", "style", "title", "role", "tabindex", "data-", "aria-"]);
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
  const BLOCKED_CSS_PROPERTIES = /* @__PURE__ */ new Set([
    "behavior",
    // IE behavior property - can execute code
    "-moz-binding"
    // Firefox XBL binding - can execute code
  ]);
  const BLOCKED_PROPERTY_NAMES = /* @__PURE__ */ new Set([
    "__proto__",
    "constructor",
    "prototype"
  ]);
  const SAFE_URL_PROTOCOLS = /* @__PURE__ */ new Set([
    "http:",
    "https:",
    "mailto:",
    "tel:",
    "sms:",
    "ftp:",
    "ftps:"
  ]);
  const URL_ATTRIBUTES = /* @__PURE__ */ new Set(["href", "src"]);
  function getProperty(data, path, parents = [], logger, getOuterProperty) {
    if (path === ".") {
      return data;
    }
    let currentData = data;
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
        currentData = parents[parents.length - parentLevels];
        remainingPath = tempPath.startsWith(".") ? tempPath.substring(1) : tempPath;
      } else {
        if (getOuterProperty) {
          return getOuterProperty(path, data, parents);
        }
        return void 0;
      }
    }
    if (remainingPath) {
      if (logger && typeof currentData !== "object" && currentData !== null && currentData !== void 0) {
        logger.error(`Cannot access property "${remainingPath}" on primitive value of type "${typeof currentData}"`);
        return void 0;
      }
      const result = remainingPath.split(".").reduce((o, k) => {
        if (BLOCKED_PROPERTY_NAMES.has(k)) {
          if (logger) {
            logger.warn(`Access to property "${k}" is blocked for security reasons`);
          }
          return void 0;
        }
        return o && typeof o === "object" && o !== null ? o[k] : void 0;
      }, currentData);
      if (result === void 0 && getOuterProperty) {
        return getOuterProperty(path, data, parents);
      }
      return result;
    }
    return currentData;
  }
  function escape(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
  }
  function interpolate(tpl, data, escapeHtml = true, parents = [], logger, getOuterProperty) {
    return tpl.replace(/\{\{\{([^{]*?)\}\}\}|\{\{([^{]*?)\}\}/g, (match, escapedExpr, normalExpr) => {
      if (escapedExpr !== void 0) {
        const trimmed2 = escapedExpr.trim();
        return `{{${trimmed2}}}`;
      }
      const trimmed = normalExpr.trim();
      const val = getProperty(data, trimmed, parents, logger, getOuterProperty);
      return val == null ? "" : escapeHtml ? escape(String(val)) : String(val);
    });
  }
  function getValidatedStyleDeclarations(styleObj, logger) {
    const declarations = [];
    for (const [prop, value] of Object.entries(styleObj)) {
      const cssProp = prop;
      if (!/^[a-z]([a-z0-9-]*[a-z0-9])?$/.test(cssProp)) {
        logger.warn(`CSS property "${prop}" has invalid format (must be kebab-case)`);
        continue;
      }
      if (BLOCKED_CSS_PROPERTIES.has(cssProp)) {
        logger.warn(`CSS property "${prop}" is blocked for security reasons`);
        continue;
      }
      if (value == null) {
        continue;
      }
      let cssValue = String(value).trim();
      if (cssValue.includes(";")) {
        const originalValue = cssValue;
        cssValue = cssValue.split(";")[0].trim();
        if (cssValue && cssValue !== originalValue.trim()) {
          logger.warn(`CSS value for "${prop}" contained semicolon - using only first part: "${cssValue}"`);
        }
      }
      if (!cssValue) {
        continue;
      }
      const hasUrl = /url\s*\(/i.test(cssValue);
      const hasDataUri = /url\s*\(\s*['"]?data:/i.test(cssValue);
      if (hasUrl && !hasDataUri || /expression\s*\(/i.test(cssValue) || /javascript:/i.test(cssValue) || /@import/i.test(cssValue)) {
        logger.warn(`CSS value for "${prop}" contains potentially dangerous pattern: "${cssValue}"`);
        continue;
      }
      declarations.push([cssProp, cssValue]);
    }
    return declarations;
  }
  function styleObjectToString(styleObj, logger) {
    return getValidatedStyleDeclarations(styleObj, logger).map(([prop, value]) => `${prop}: ${value}`).join("; ").trim();
  }
  function resolveStyleValue(value, data, parents, logger, getOuterProperty) {
    if (value !== null && typeof value === "object" && !Array.isArray(value) && "$check" in value && typeof value.$check === "string") {
      const conditional = value;
      if (!validatePathExpression(conditional.$check, "$check", logger)) {
        return null;
      }
      const checkValue = getProperty(data, conditional.$check, parents, logger, getOuterProperty);
      const condition = evaluateCondition(checkValue, conditional);
      const resultValue = condition ? conditional.$then : conditional.$else;
      if (resultValue === void 0) {
        return null;
      }
      if (typeof resultValue === "object" && resultValue !== null && !Array.isArray(resultValue)) {
        return resultValue;
      }
      return null;
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value;
    }
    logger.error(`Style attribute must be an object with CSS properties, not ${typeof value}. Example: style: { "color": "red", "font-size": "14px" }`);
    return null;
  }
  function processStyleAttribute(value, data, parents, logger, getOuterProperty) {
    const resolved = resolveStyleValue(value, data, parents, logger, getOuterProperty);
    if (!resolved) {
      return "";
    }
    return styleObjectToString(resolved, logger);
  }
  function validateAttributeName(key, tag, logger) {
    const isGlobal = GLOBAL_ATTRS.has(key) || [...GLOBAL_ATTRS].some((p) => p.endsWith("-") && key.startsWith(p));
    const tagAttrs = TAG_SPECIFIC_ATTRS[tag];
    const isTagSpecific = tagAttrs && tagAttrs.has(key);
    if (!isGlobal && !isTagSpecific) {
      logger.warn(`Attribute "${key}" is not allowed on tag "${tag}"`);
      return false;
    }
    return true;
  }
  function validateUrlProtocol(attrName, value, logger) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return trimmedValue;
    }
    if (trimmedValue.startsWith("/") || trimmedValue.startsWith("#") || trimmedValue.startsWith("?") || !trimmedValue.includes(":")) {
      return trimmedValue;
    }
    const colonIndex = trimmedValue.indexOf(":");
    if (colonIndex === -1) {
      return trimmedValue;
    }
    const protocol = trimmedValue.substring(0, colonIndex + 1).toLowerCase();
    if (SAFE_URL_PROTOCOLS.has(protocol)) {
      return trimmedValue;
    }
    logger.warn(`Attribute "${attrName}" contains blocked protocol "${protocol}". Allowed protocols: ${[...SAFE_URL_PROTOCOLS].join(", ")}, or relative URLs`);
    return null;
  }
  function validateAttributeValue(attrName, value, logger) {
    if (URL_ATTRIBUTES.has(attrName)) {
      return validateUrlProtocol(attrName, value, logger);
    }
    return value;
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
  function evaluateConditionalValue(value, data, parents = [], logger, getOuterProperty) {
    if (!validatePathExpression(value.$check, "$check", logger)) {
      return "";
    }
    const checkValue = getProperty(data, value.$check, parents, logger, getOuterProperty);
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
  function processConditional(rest, data, parents = [], logger, getOuterProperty) {
    const conditional = rest;
    if (!conditional.$check) {
      logger.error('"$if" tag requires $check attribute to specify the condition');
      return { valueToRender: void 0 };
    }
    if (!validatePathExpression(conditional.$check, "$check", logger)) {
      return { valueToRender: void 0 };
    }
    const checkValue = getProperty(data, conditional.$check, parents, logger, getOuterProperty);
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
  function renderToDOM(input, options = {}) {
    const data = input.data;
    const logger = options.logger || console;
    const getOuterProperty = options.propertyFallback;
    const fragment = document.createDocumentFragment();
    const result = render(input.template, data, { logger, getOuterProperty });
    if (Array.isArray(result)) result.forEach((n) => fragment.appendChild(n));
    else fragment.appendChild(result);
    return fragment;
  }
  function render(template, data, context) {
    const parents = context.parents || [];
    const logger = context.logger;
    const getOuterProperty = context.getOuterProperty;
    if (typeof template === "string") {
      const shouldEscape = context.insideComment || false;
      return document.createTextNode(interpolate(template, data, shouldEscape, parents, logger, getOuterProperty));
    }
    if (Array.isArray(template)) {
      const results = [];
      for (const t of template) {
        const r = render(t, data, context);
        if (Array.isArray(r)) results.push(...r);
        else results.push(r);
      }
      return results;
    }
    const parsed = parseTemplateObject(template, logger);
    if (!parsed) {
      return [];
    }
    const { tag, rest, children, attrs } = parsed;
    if (!ALLOWED_TAGS.has(tag)) {
      logger.error(`Tag "${tag}" is not allowed`);
      return [];
    }
    if (tag === "$comment" && context.insideComment) {
      logger.error("Nested comments are not allowed");
      return [];
    }
    if (tag === "$if") {
      const { valueToRender } = processConditional(rest, data, parents, logger, getOuterProperty);
      if (valueToRender === void 0) {
        return [];
      }
      const nodes = render(valueToRender, data, context);
      return Array.isArray(nodes) ? nodes : [nodes];
    }
    const hasChildren = children.length > 0;
    const isVoid = VOID_TAGS.has(tag);
    if (isVoid && hasChildren) {
      logger.warn(`Tag "${tag}" is a void element and cannot have children`);
    }
    if (tag === "$comment") {
      const tempContainer = document.createElement("div");
      const commentContext = { ...context, insideComment: true };
      for (const c of children) {
        const nodes = render(c, data, commentContext);
        if (Array.isArray(nodes)) {
          for (const n of nodes) tempContainer.appendChild(n);
        } else {
          tempContainer.appendChild(nodes);
        }
      }
      return document.createComment(tempContainer.innerHTML);
    }
    const element = document.createElement(tag);
    if (hasBinding(rest)) {
      if (!validatePathExpression(rest.$bind, "$bind", logger)) {
        return [];
      }
      const bound = getProperty(data, rest.$bind, [], logger, getOuterProperty);
      const { $bind, $children = [], ...bindAttrs } = rest;
      setAttrs(element, bindAttrs, data, tag, parents, logger, getOuterProperty);
      if (isVoid && $children.length > 0) {
        logger.warn(`Tag "${tag}" is a void element and cannot have children`);
      }
      if (Array.isArray(bound)) {
        for (const item of bound) {
          const newParents2 = [...parents, data];
          if (!isVoid) {
            for (const c of $children) {
              const nodes = render(c, item, { ...context, parents: newParents2 });
              if (Array.isArray(nodes)) {
                for (const n of nodes) element.appendChild(n);
              } else {
                element.appendChild(nodes);
              }
            }
          }
        }
        return element;
      }
      if (bound !== null && bound !== void 0 && typeof bound !== "object") {
        logger.error(`$bind resolved to primitive value of type "${typeof bound}", cannot render children`);
        return [];
      }
      const boundData = bound && typeof bound === "object" && bound !== null ? bound : {};
      const newParents = [...parents, data];
      const childNodes = render({ [tag]: { ...bindAttrs, $children } }, boundData, { ...context, parents: newParents });
      return Array.isArray(childNodes) ? childNodes : [childNodes];
    }
    setAttrs(element, attrs, data, tag, parents, logger, getOuterProperty);
    if (!isVoid) {
      for (const c of children) {
        const nodes = render(c, data, context);
        if (Array.isArray(nodes)) {
          for (const n of nodes) element.appendChild(n);
        } else {
          element.appendChild(nodes);
        }
      }
    }
    return element;
  }
  function setAttrs(element, attrs, data, tag, parents = [], logger, getOuterProperty) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (!validateAttributeName(key, tag, logger)) {
        return;
      }
      let attrValue;
      if (key === "style") {
        attrValue = processStyleAttribute(value, data, parents, logger, getOuterProperty);
        if (!attrValue) {
          return;
        }
      } else {
        if (isConditionalValue(value)) {
          const evaluatedValue = evaluateConditionalValue(value, data, parents, logger, getOuterProperty);
          attrValue = interpolate(String(evaluatedValue), data, false, parents, logger, getOuterProperty);
        } else {
          attrValue = interpolate(String(value), data, false, parents, logger, getOuterProperty);
        }
      }
      const validatedValue = validateAttributeValue(key, attrValue, logger);
      if (validatedValue == null) {
        return;
      }
      element.setAttribute(key, validatedValue);
    });
  }
  exports2.renderToDOM = renderToDOM;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=treebark-dom-browser.js.map
