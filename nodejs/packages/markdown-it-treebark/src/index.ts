import MarkdownIt from 'markdown-it';
import { renderToString } from 'treebark';

export interface TreebarkPluginOptions {
  /**
   * Default data context for templates
   */
  data?: Record<string, any>;

  /**
   * YAML library instance (if provided, enables YAML parsing)
   * Pass js-yaml or compatible library to enable YAML parsing
   */
  yaml?: {
    load: (content: string) => any;
  };

  /**
   * Optional indentation for HTML output
   * - true: use 2 spaces (default)
   * - number: use that many spaces
   * - string: use the string as indentation (e.g., '\t' for tabs)
   * - false/undefined: no indentation (default)
   */
  indent?: string | number | boolean;
}

/**
 * Markdown-it plugin for rendering treebark templates
 */
export default function treebarkPlugin(md: MarkdownIt, options: TreebarkPluginOptions = {}) {
  const { data = {}, yaml, indent } = options;

  // Store the original fence rule
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';

    // Check if this is a treebark block
    if (info === 'treebark' || info.startsWith('treebark ')) {
      try {
        return renderTreebarkBlock(token.content, data, yaml, indent);
      } catch (error) {
        // On error, return the original content with error message
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        return `<div class="treebark-error"><strong>Treebark Error:</strong> ${escapeHtml(errorMsg)}</div>`;
      }
    }

    // For non-treebark blocks, use the original fence renderer
    return originalFence ? originalFence(tokens, idx, options, env, renderer) : '';
  };
}

/**
 * Render a treebark block content
 */
function renderTreebarkBlock(
  content: string,
  defaultData: Record<string, any>,
  yaml?: { load: (content: string) => any },
  indent?: string | number | boolean
): string {
  let template: any;
  let yamlError: Error | null = null;

  // Check for empty content first
  if (!content.trim()) {
    throw new Error('Empty or invalid template');
  }

  // Try YAML first if yaml lib is provided
  if (yaml) {
    try {
      template = yaml.load(content);
    } catch (error) {
      yamlError = error instanceof Error ? error : new Error('YAML parsing failed');
    }
  }

  // If YAML failed or not provided, try JSON
  if (!template) {
    try {
      template = JSON.parse(content);
    } catch (jsonError) {
      if (yaml && yamlError) {
        throw new Error(`Failed to parse as YAML or JSON. YAML error: ${yamlError.message}`);
      } else {
        throw new Error(`Failed to parse as JSON: ${jsonError instanceof Error ? jsonError.message : 'Invalid format'}`);
      }
    }
  }

  if (!template) {
    throw new Error('Empty or invalid template');
  }

  // Check if template is already in TreebarkInput format
  if (template && typeof template === 'object' && 'template' in template) {
    // Already in TreebarkInput format, merge with default data
    const mergedData = { ...defaultData, ...template.data };
    return renderToString({ template: template.template, data: mergedData }, { indent });
  }

  // Template is a direct template, wrap it in TreebarkInput format
  return renderToString({ template: template, data: defaultData }, { indent });
}

/**
 * Simple HTML escape utility
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}