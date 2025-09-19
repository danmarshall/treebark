import MarkdownIt from 'markdown-it';
import { renderToString } from 'treebark';

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
  
  /**
   * YAML library instance (required when allowYaml is true)
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
  const { data = {}, allowJson = true, allowYaml = true, yaml, indent } = options;

  // Validate yaml dependency when YAML is enabled
  if (allowYaml && !yaml) {
    throw new Error('YAML library must be provided when allowYaml is true. Pass js-yaml or compatible library in options.yaml');
  }

  // Store the original fence rule
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = function(tokens, idx, options, env, renderer) {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    
    // Check if this is a treebark block
    if (info === 'treebark' || info.startsWith('treebark ')) {
      try {
        return renderTreebarkBlock(token.content, data, allowYaml, allowJson, yaml, indent);
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
  allowYaml: boolean, 
  allowJson: boolean,
  yaml?: { load: (content: string) => any },
  indent?: string | number | boolean
): string {
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
    if (!yaml) {
      throw new Error('YAML library not provided but YAML parsing is enabled');
    }
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
  return renderToString(schema, { data: defaultData, indent });
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