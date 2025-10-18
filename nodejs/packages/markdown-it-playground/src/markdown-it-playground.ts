import type JSYaml from 'js-yaml';
import type MarkdownIt from 'markdown-it';
import { examples } from './examples/index.js';

declare const jsyaml: typeof JSYaml;
declare const markdownit: typeof MarkdownIt;
declare const MarkdownItTreebark: (md: MarkdownIt, options?: { data?: unknown; indent?: string | boolean; yaml?: typeof JSYaml }) => void;

// Regex pattern for matching treebark code blocks in markdown
const TREEBARK_BLOCK_REGEX = /```treebark\n([\s\S]*?)```/g;

let currentMarkdownFormat: 'json' | 'yaml' = 'json';

// Get DOM elements
const markdownEditor = document.getElementById('markdown-editor') as HTMLTextAreaElement;
const dataEditor = document.getElementById('data-editor') as HTMLTextAreaElement;
const htmlOutput = document.getElementById('html-output') as HTMLElement;
const errorDisplay = document.getElementById('error-display') as HTMLElement;
const indentType = document.getElementById('indent-type') as HTMLSelectElement;
const indentSize = document.getElementById('indent-size') as HTMLInputElement;
const markdownFormatSelect = document.getElementById('markdown-format') as HTMLSelectElement;

// Convert JSON to YAML string
function jsonToYaml(obj: any): string {
  return jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
}

// Convert YAML to JSON object
function yamlToJson(yamlStr: string): any {
  return jsyaml.load(yamlStr);
}

// Switch markdown treebark format
function switchMarkdownFormat(): void {
  const newFormat = markdownFormatSelect.value as 'json' | 'yaml';
  const currentContent = markdownEditor.value;

  if (!currentContent || !currentContent.includes('```treebark')) {
    currentMarkdownFormat = newFormat;
    return;
  }

  try {
    // Convert treebark code blocks in markdown
    const converted = currentContent.replace(TREEBARK_BLOCK_REGEX, (match, code) => {
      try {
        // Trim the code to handle edge cases
        const trimmedCode = code.trim();
        if (!trimmedCode) {
          return match; // Keep empty blocks unchanged
        }

        let template: any;

        // Parse current code block based on current format
        if (currentMarkdownFormat === 'json') {
          template = JSON.parse(trimmedCode);
        } else {
          template = yamlToJson(trimmedCode);
        }

        // Convert to new format
        let newCode: string;
        if (newFormat === 'json') {
          newCode = JSON.stringify(template, null, 2);
        } else {
          newCode = jsonToYaml(template);
        }

        return '```treebark\n' + newCode + '\n```';
      } catch (e) {
        // If this block fails to convert, return it unchanged
        return match;
      }
    });

    markdownEditor.value = converted;
    currentMarkdownFormat = newFormat;
    updateOutput();
  } catch (e: any) {
    errorDisplay.textContent = 'Error converting format: ' + e.message;
    errorDisplay.style.display = 'block';
  }
}

// Update output when inputs change
function updateOutput(): void {
  try {
    errorDisplay.style.display = 'none';

    const markdownText = markdownEditor.value.trim();
    const dataText = dataEditor.value.trim();

    if (!markdownText) {
      htmlOutput.textContent = '';
      return;
    }

    // Parse data context
    let data: any = {};
    if (dataText) {
      try {
        data = JSON.parse(dataText);
      } catch (e: any) {
        throw new Error('Invalid JSON in data context: ' + e.message);
      }
    }

    // Get indent options
    let indent: string | false = false;
    if (indentType.value !== 'none') {
      const size = parseInt(indentSize.value) || 2;
      indent = indentType.value === 'tabs' ? '\t'.repeat(size) : ' '.repeat(size);
    }

    // Capture console logs
    const logs: Array<{ level: 'error' | 'warn' | 'log'; message: string }> = [];
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log
    };

    // Override console methods to capture logs
    console.error = function (...args: any[]) {
      logs.push({ level: 'error', message: args.join(' ') });
      originalConsole.error.apply(console, args);
    };
    console.warn = function (...args: any[]) {
      logs.push({ level: 'warn', message: args.join(' ') });
      originalConsole.warn.apply(console, args);
    };
    console.log = function (...args: any[]) {
      logs.push({ level: 'log', message: args.join(' ') });
      originalConsole.log.apply(console, args);
    };

    try {
      // Create markdown-it instance with treebark plugin
      const md = markdownit();

      // Apply the treebark plugin
      md.use(MarkdownItTreebark, { data, indent, yaml: jsyaml });

      // Render markdown
      const html = md.render(markdownText);

      htmlOutput.textContent = html;

      // Display captured logs if any
      if (logs.length > 0) {
        const logMessages = logs.map(log => {
          const prefix = log.level === 'error' ? '❌ Error: ' :
            log.level === 'warn' ? '⚠️ Warning: ' : 'ℹ️ ';
          return prefix + log.message;
        }).join('\n');
        errorDisplay.textContent = logMessages;
        errorDisplay.style.display = 'block';
      }
    } finally {
      // Restore original console methods
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.log = originalConsole.log;
    }

  } catch (error: any) {
    errorDisplay.textContent = 'Error: ' + error.message;
    errorDisplay.style.display = 'block';
    htmlOutput.textContent = '';
  }
}

// Load example
function loadExample(exampleId: string): void {
  const example = examples[exampleId];
  if (example) {
    markdownEditor.value = example.markdown || '';
    dataEditor.value = JSON.stringify(example.data || {}, null, 2);
    updateOutput();
  }
}

// Populate dropdown from examples
function populateExampleDropdown(): void {
  const select = document.getElementById('example-select') as HTMLSelectElement;

  const exampleIds = Object.keys(examples);

  // Add options for each example (using key as label)
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
markdownEditor.addEventListener('input', updateOutput);
dataEditor.addEventListener('input', updateOutput);
indentType.addEventListener('change', updateOutput);
indentSize.addEventListener('input', updateOutput);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  populateExampleDropdown();
});

// Export functions to global scope for HTML onclick handlers
(window as any).loadExampleFromDropdown = loadExampleFromDropdown;
(window as any).switchMarkdownFormat = switchMarkdownFormat;
