import MarkdownIt from 'markdown-it';
import { renderToString } from 'treebark';
import yaml from 'js-yaml';

export interface TreebarkPluginOptions {
  /**
   * Default data context for templates
   */
  data?: Record<string, any>;
  
  /**
   * Whether to support JSON in addition to YAML
   */
  allowJson?: boolean;
}

/**
 * Markdown-it plugin for rendering treebark templates
 */
export default function treebarkPlugin(md: MarkdownIt, options: TreebarkPluginOptions = {}) {
  const { data = {}, allowJson = true } = options;

  // Store the original fence rule
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    
    // Check if this is a treebark block
    if (info === 'treebark' || info.startsWith('treebark ')) {
      try {
        return renderTreebarkBlock(token.content, data, allowJson);
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
function renderTreebarkBlock(content: string, defaultData: Record<string, any>, allowJson: boolean): string {
  let schema: any;
  
  try {
    // First try to parse as YAML
    schema = yaml.load(content);
  } catch (yamlError) {
    if (allowJson) {
      try {
        // If YAML fails and JSON is allowed, try JSON
        schema = JSON.parse(content);
      } catch (jsonError) {
        throw new Error(`Failed to parse as YAML or JSON: ${yamlError instanceof Error ? yamlError.message : 'Invalid format'}`);
      }
    } else {
      throw new Error(`Failed to parse as YAML: ${yamlError instanceof Error ? yamlError.message : 'Invalid format'}`);
    }
  }
  
  if (!schema) {
    throw new Error('Empty or invalid schema');
  }
  
  // Render using treebark
  return renderToString(schema, { data: defaultData });
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