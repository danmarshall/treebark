import MarkdownIt from 'markdown-it';
import { renderToString } from 'treebark';
import yaml from 'js-yaml';

export interface TreebarkPluginOptions {
  /**
   * Default data context for templates
   */
  data?: Record<string, any>;
  
  /**
   * Whether to support JSON format (default: true)
   */
  allowJson?: boolean;
  
  /**
   * Whether to support YAML format (default: true)
   */
  allowYaml?: boolean;
}

/**
 * Markdown-it plugin for rendering treebark templates
 */
export default function treebarkPlugin(md: MarkdownIt, options: TreebarkPluginOptions = {}) {
  const { data = {}, allowJson = true, allowYaml = true } = options;

  // Store the original fence rule
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    
    // Check if this is a treebark block
    if (info === 'treebark' || info.startsWith('treebark ')) {
      try {
        return renderTreebarkBlock(token.content, data, allowYaml, allowJson);
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
function renderTreebarkBlock(content: string, defaultData: Record<string, any>, allowYaml: boolean, allowJson: boolean): string {
  let schema: any;
  let yamlError: Error | null = null;
  
  // Validate that at least one format is enabled
  if (!allowYaml && !allowJson) {
    throw new Error('At least one format (YAML or JSON) must be enabled');
  }
  
  // Check for empty content first
  if (!content.trim()) {
    throw new Error('Empty or invalid schema');
  }
  
  // Try YAML first if enabled
  if (allowYaml) {
    try {
      schema = yaml.load(content);
    } catch (error) {
      yamlError = error instanceof Error ? error : new Error('YAML parsing failed');
    }
  }
  
  // If YAML failed or wasn't enabled, try JSON if enabled
  if (!schema && allowJson) {
    try {
      schema = JSON.parse(content);
    } catch (jsonError) {
      // If both failed, provide a helpful error message
      if (allowYaml && yamlError) {
        throw new Error(`Failed to parse as YAML or JSON. YAML error: ${yamlError.message}`);
      } else {
        throw new Error(`Failed to parse as JSON: ${jsonError instanceof Error ? jsonError.message : 'Invalid format'}`);
      }
    }
  }
  
  // If YAML succeeded but JSON wasn't tried, check that schema is valid
  if (!schema && allowYaml && yamlError) {
    throw new Error(`Failed to parse as YAML: ${yamlError.message}`);
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