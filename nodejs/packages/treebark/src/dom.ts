import {
  TreebarkNode,
  TreebarkElement,
  TreebarkTemplate,
  TreebarkAttributes,
  RenderOptions,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_ALLOWED_ATTRIBUTES
} from './index';

/**
 * Renders a Treebark node to DOM elements
 */
export function renderToDOM(
  node: TreebarkNode | TreebarkTemplate, 
  options: RenderOptions = {}
): DocumentFragment {
  const {
    data = {},
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES
  } = options;

  // Handle self-contained template blocks
  if (isTemplate(node)) {
    return renderToDOM(node.$template, { ...options, data: node.$data });
  }

  const fragment = document.createDocumentFragment();
  const elements = renderNode(node, data, allowedTags, allowedAttributes);
  
  // Add all rendered elements to fragment
  if (Array.isArray(elements)) {
    elements.forEach(el => fragment.appendChild(el));
  } else {
    fragment.appendChild(elements);
  }

  return fragment;
}

function isTemplate(node: any): node is TreebarkTemplate {
  return node && typeof node === 'object' && '$template' in node && '$data' in node;
}

function renderNode(
  node: TreebarkNode,
  data: any,
  allowedTags: Set<string>,
  allowedAttributes: Set<string>
): Node | Node[] {
  // Handle string nodes (text content)
  if (typeof node === 'string') {
    const interpolated = interpolate(node, data);
    return document.createTextNode(interpolated);
  }

  // Handle arrays (fragments)
  if (Array.isArray(node)) {
    return node.flatMap(child => {
      const rendered = renderNode(child, data, allowedTags, allowedAttributes);
      return Array.isArray(rendered) ? rendered : [rendered];
    });
  }

  // Handle element nodes
  if (typeof node === 'object' && node !== null) {
    return renderElement(node, data, allowedTags, allowedAttributes);
  }

  return document.createTextNode('');
}

function renderElement(
  element: TreebarkElement,
  data: any,
  allowedTags: Set<string>,
  allowedAttributes: Set<string>
): HTMLElement | HTMLElement[] {
  const entries = Object.entries(element);
  if (entries.length !== 1) {
    throw new Error('Element must have exactly one tag');
  }

  const [tagName, content] = entries[0];

  // Security check: only allow whitelisted tags
  if (!allowedTags.has(tagName)) {
    throw new Error(`Tag "${tagName}" is not allowed`);
  }

  // Handle binding
  if (typeof content === 'object' && content !== null && !Array.isArray(content) && '$bind' in content) {
    const bindPath = content.$bind as string;
    const boundData = getPropertyPath(data, bindPath);
    
    if (Array.isArray(boundData)) {
      // Array binding - render children for each item within single parent
      const template = { ...content };
      delete template.$bind;
      const domElement = document.createElement(tagName);
      const { attributes, children } = parseContent(template);
      
      // Set attributes
      setAttributes(domElement, attributes, data, allowedAttributes);
      
      // Render children for each array item
      boundData.forEach(item => {
        children.forEach(child => {
          const childNodes = renderNode(child, item, allowedTags, allowedAttributes);
          if (Array.isArray(childNodes)) {
            childNodes.forEach(node => domElement.appendChild(node));
          } else {
            domElement.appendChild(childNodes);
          }
        });
      });
      
      return domElement;
    } else {
      // Object binding - use bound data as context
      const template = { ...content };
      delete template.$bind;
      return renderElement({ [tagName]: template }, boundData, allowedTags, allowedAttributes) as HTMLElement;
    }
  }

  // Create the DOM element
  const domElement = document.createElement(tagName);

  // Parse content into attributes and children
  const { attributes, children } = parseContent(content);

  // Set attributes
  setAttributes(domElement, attributes, data, allowedAttributes);

  // Render and append children
  children.forEach(child => {
    const childNodes = renderNode(child, data, allowedTags, allowedAttributes);
    if (Array.isArray(childNodes)) {
      childNodes.forEach(node => domElement.appendChild(node));
    } else {
      domElement.appendChild(childNodes);
    }
  });

  return domElement;
}

function parseContent(content: any): { attributes: TreebarkAttributes; children: TreebarkNode[] } {
  if (typeof content === 'string') {
    return { attributes: {}, children: [content] };
  }

  if (Array.isArray(content)) {
    return { attributes: {}, children: content };
  }

  if (typeof content === 'object' && content !== null) {
    const attributes: TreebarkAttributes = {};
    let children: TreebarkNode[] = [];

    for (const [key, value] of Object.entries(content)) {
      if (key === '$children') {
        children = Array.isArray(value) ? value : [value];
      } else if (!key.startsWith('$')) {
        attributes[key] = value as string;
      }
    }

    return { attributes, children };
  }

  return { attributes: {}, children: [] };
}

function setAttributes(
  element: HTMLElement,
  attributes: TreebarkAttributes,
  data: any,
  allowedAttributes: Set<string>
): void {
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || key.startsWith('$')) continue;

    // Security check: only allow whitelisted attributes
    const isAllowed = allowedAttributes.has(key) || 
                     [...allowedAttributes].some(pattern => 
                       pattern.endsWith('-') && key.startsWith(pattern)
                     );
    
    if (!isAllowed) {
      throw new Error(`Attribute "${key}" is not allowed`);
    }

    const interpolatedValue = typeof value === 'string' 
      ? interpolate(value, data)
      : String(value);
    
    element.setAttribute(key, interpolatedValue);
  }
}

function interpolate(template: string, data: any): string {
  // Handle escaping: {{{ becomes {{
  // Use a placeholder to temporarily mark escaped content
  const PLACEHOLDER = '__TREEBARK_ESCAPED__';
  let escapedCount = 0;
  const escapedValues: string[] = [];
  
  // First pass: replace escaped interpolations with placeholders
  let result = template.replace(/\{\{\{([^}]*)\}\}\}/g, (match, content) => {
    const placeholder = `${PLACEHOLDER}${escapedCount++}${PLACEHOLDER}`;
    escapedValues.push(`{{${content}}}`);
    return placeholder;
  });
  
  // Second pass: handle regular interpolation 
  result = result.replace(/\{\{([^}]*)\}\}/g, (match, content) => {
    const value = getPropertyPath(data, content.trim());
    return value !== undefined ? String(value) : '';
  });
  
  // Third pass: restore escaped content
  escapedValues.forEach((escaped, index) => {
    result = result.replace(`${PLACEHOLDER}${index}${PLACEHOLDER}`, escaped);
  });
  
  return result;
}

function getPropertyPath(obj: any, path: string): any {
  if (!path) return obj;
  
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}