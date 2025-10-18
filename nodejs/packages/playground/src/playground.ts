import type { TemplateElement } from '../../treebark/dist/types.js';
import type JSYaml from 'js-yaml';
import { examples } from './examples/index.js';

declare const jsyaml: typeof JSYaml;

declare const Treebark: {
  renderToString(input: { template: TemplateElement | TemplateElement[]; data: unknown }, options?: { indent?: string | boolean }): string;
};

let currentTemplateFormat: 'json' | 'yaml' = 'json';

// Get DOM elements
const templateEditor = document.getElementById('template-editor') as HTMLTextAreaElement;
const dataEditor = document.getElementById('data-editor') as HTMLTextAreaElement;
const htmlOutput = document.getElementById('html-output') as HTMLElement;
const errorDisplay = document.getElementById('error-display') as HTMLElement;
const indentType = document.getElementById('indent-type') as HTMLSelectElement;
const indentSize = document.getElementById('indent-size') as HTMLInputElement;
const templateFormatSelect = document.getElementById('template-format') as HTMLSelectElement;

// Convert JSON to YAML string
function jsonToYaml(obj: any): string {
  return jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
}

// Convert YAML to JSON object
function yamlToJson(yamlStr: string): any {
  return jsyaml.load(yamlStr);
}

// Switch template format
function switchTemplateFormat(): void {
  const newFormat = templateFormatSelect.value as 'json' | 'yaml';
  const currentContent = templateEditor.value.trim();

  if (!currentContent) {
    currentTemplateFormat = newFormat;
    return;
  }

  try {
    let template: any;

    // Parse current content based on current format
    if (currentTemplateFormat === 'json') {
      template = JSON.parse(currentContent);
    } else {
      template = yamlToJson(currentContent);
    }

    // Convert to new format
    if (newFormat === 'json') {
      templateEditor.value = JSON.stringify(template, null, 2);
    } else {
      templateEditor.value = jsonToYaml(template);
    }

    currentTemplateFormat = newFormat;
    updateOutput();
  } catch (e: any) {
    // If conversion fails, just switch format without converting
    errorDisplay.innerHTML = '<div class="log-warn">⚠️ Could not convert format: ' + escapeHtml(e.message) + '.</div>';
    errorDisplay.style.display = 'block';
    currentTemplateFormat = newFormat;
  }
}

// Update output when inputs change
function updateOutput(): void {
  try {
    errorDisplay.style.display = 'none';
    errorDisplay.innerHTML = '';

    const templateText = templateEditor.value.trim();
    const dataText = dataEditor.value.trim();

    if (!templateText) {
      htmlOutput.textContent = '';
      return;
    }

    // Parse template
    let template: any;
    try {
      if (currentTemplateFormat === 'json') {
        template = JSON.parse(templateText);
      } else {
        template = yamlToJson(templateText);
      }
    } catch (e: any) {
      throw new Error('Invalid ' + currentTemplateFormat.toUpperCase() + ' in template: ' + e.message);
    }

    // Parse data
    let data: any = {};
    if (dataText) {
      try {
        data = JSON.parse(dataText);
      } catch (e: any) {
        throw new Error('Invalid JSON in data: ' + e.message);
      }
    }

    // Get indent options
    let indent: string | false = false;
    if (indentType.value !== 'none') {
      const size = parseInt(indentSize.value) || 2;
      indent = indentType.value === 'tabs' ? '\t'.repeat(size) : ' '.repeat(size);
    }

    // Capture console logs during rendering
    const logs: Array<{ level: 'error' | 'warn' | 'log'; message: string }> = [];
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (msg: string) => { logs.push({ level: 'error', message: msg }); originalError(msg); };
    console.warn = (msg: string) => { logs.push({ level: 'warn', message: msg }); originalWarn(msg); };
    console.log = (msg: string) => { logs.push({ level: 'log', message: msg }); originalLog(msg); };

    try {
      // Render using treebark
      const input = { template, data };
      const options = { indent };

      const html = Treebark.renderToString(input, options);

      htmlOutput.textContent = html;
    } finally {
      // Restore original console methods
      console.error = originalError;
      console.warn = originalWarn;
      console.log = originalLog;
    }

    // Display captured logs
    if (logs.length > 0) {
      const logMessages = logs.map(log => {
        const icon = log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : 'ℹ️';
        return `<div class="log-${log.level}">${icon} ${escapeHtml(log.message)}</div>`;
      }).join('');
      errorDisplay.innerHTML = logMessages;
      errorDisplay.style.display = 'block';
    }

  } catch (error: any) {
    errorDisplay.innerHTML = '<div class="log-error">❌ Error: ' + escapeHtml(error.message) + '</div>';
    errorDisplay.style.display = 'block';
    htmlOutput.textContent = '';
  }
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load example
function loadExample(exampleId: string): void {
  const example = examples[exampleId];
  if (example) {
    // Display template in the current format
    if (currentTemplateFormat === 'json') {
      templateEditor.value = JSON.stringify(example.template, null, 2);
    } else {
      templateEditor.value = jsonToYaml(example.template);
    }
    dataEditor.value = JSON.stringify(example.data, null, 2);
    updateOutput();
  }
}

// Populate dropdown from examples
function populateExampleDropdown(): void {
  const select = document.getElementById('example-select') as HTMLSelectElement;

  const exampleIds = Object.keys(examples);

  // Add options for each example (using key as-is)
  exampleIds.forEach(exampleId => {
    const option = document.createElement('option');
    option.value = exampleId;
    option.textContent = exampleId;
    select.appendChild(option);
  });

  // Auto-select and load the first example
  if (exampleIds.length > 0) {
    select.value = exampleIds[0];
    loadExample(exampleIds[0]);
  }
}

// Load example from dropdown
function loadExampleFromDropdown(): void {
  const select = document.getElementById('example-select') as HTMLSelectElement;
  const exampleId = select.value;
  if (exampleId) {
    loadExample(exampleId);
  }
}

// Event listeners
templateEditor.addEventListener('input', updateOutput);
dataEditor.addEventListener('input', updateOutput);
indentType.addEventListener('change', updateOutput);
indentSize.addEventListener('input', updateOutput);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  populateExampleDropdown();
});

// Export functions to global scope for HTML onclick handlers
(window as any).loadExampleFromDropdown = loadExampleFromDropdown;
(window as any).switchTemplateFormat = switchTemplateFormat;
