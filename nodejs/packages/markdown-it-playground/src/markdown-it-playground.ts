// Type definitions for markdown playground examples - using types from ../../treebark/dist/types.js
// Note: TemplateElement type would be ideal but can't import with module: "None"

interface MarkdownExample {
  markdown: string;
  data: any;
  templates?: Record<string, any>; // Store template references for format switching
}

type MarkdownExamples = Record<string, MarkdownExample>;

// Regex pattern for matching treebark code blocks in markdown
const TREEBARK_BLOCK_REGEX = /```treebark\n([\s\S]*?)```/g;

// Helper function to wrap a treebark template in markdown code block syntax
function treebark(template: any): string {
  return '```treebark\n' + JSON.stringify(template, null, 2) + '\n```';
}

// Strongly-typed treebark template dictionary
const treebarkTemplates: Record<string, any> = {
  greeting: {
    div: {
      class: "greeting",
      $children: [
        { h2: "Hello {{name}}!" },
        { p: "Welcome to the markdown-it-treebark plugin." }
      ]
    }
  },
  
  productCard: {
    div: {
      class: "product-card",
      $children: [
        { h2: "{{name}}" },
        { img: { src: "{{image}}", alt: "{{name}}" } },
        { p: "{{description}}" },
        { div: { class: "price", $children: ["{{price}}"] } },
        { a: { href: "{{link}}", class: "btn", $children: ["Learn More"] } }
      ]
    }
  },
  
  teamList: {
    ul: {
      class: "team-list",
      $bind: "members",
      $children: [
        {
          li: {
            class: "team-member",
            $children: [
              { strong: "{{name}}" },
              " - ",
              { em: "{{role}}" }
            ]
          }
        }
      ]
    }
  },
  
  quickStart: {
    div: {
      class: "quick-start",
      $children: [
        { h3: "Installation" },
        { pre: "npm install {{packageName}}" },
        { h3: "Usage" },
        { p: "Import and use in your project:" }
      ]
    }
  },
  
  featuresList: {
    ul: {
      class: "features",
      $bind: "features",
      $children: [
        {
          li: {
            $children: [
              { strong: "{{title}}" },
              " - ",
              "{{description}}"
            ]
          }
        }
      ]
    }
  },
  
  productGallery: {
    div: {
      class: "product-grid",
      $children: [
        { h2: "Featured Products" },
        {
          div: {
            class: "products",
            $bind: "products",
            $children: [
              {
                div: {
                  class: "product-card",
                  $children: [
                    { img: { src: "{{image}}", alt: "{{name}}" } },
                    { h3: "{{name}}" },
                    { p: "{{description}}" },
                    { div: { class: "price", $children: ["{{price}}"] } }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  
  productGalleryWithData: {
    template: {
      div: {
        class: "product-grid",
        $children: [
          { h2: "Featured Products" },
          {
            div: {
              class: "products",
              $bind: "products",
              $children: [
                {
                  div: {
                    class: "product-card",
                    $children: [
                      { img: { src: "{{image}}", alt: "{{name}}" } },
                      { h3: "{{name}}" },
                      { p: "{{description}}" },
                      { div: { class: "price", $children: ["{{price}}"] } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    data: {
      products: [
        {
          name: "Treebark Core",
          description: "Safe template rendering for Markdown",
          price: "Free",
          image: "https://via.placeholder.com/150"
        },
        {
          name: "Treebark Pro",
          description: "Advanced features and support",
          price: "$29/month",
          image: "https://via.placeholder.com/150"
        }
      ]
    }
  } as any,
  
  userStatus: {
    div: {
      class: "user-status",
      $children: [
        { h3: "Account Status" },
        {
          $if: {
            $check: "isPremium",
            $then: { p: { style: { color: "gold" }, $children: ["⭐ Premium Member"] } }
          }
        },
        {
          $if: {
            $check: "isPremium",
            $not: true,
            $then: { p: "Standard Member - Upgrade to Premium!" }
          }
        }
      ]
    }
  },
  
  authStatus: {
    div: {
      class: "auth-status",
      $children: [
        { h3: "Welcome!" },
        {
          $if: {
            $check: "isLoggedIn",
            $then: {
              div: {
                class: "logged-in",
                $children: [
                  { p: "Hello, {{username}}!" },
                  { a: { href: "#logout", $children: ["Logout"] } }
                ]
              }
            },
            $else: {
              div: {
                class: "logged-out",
                $children: [
                  { p: "Please log in to continue." },
                  { a: { href: "#login", class: "btn", $children: ["Login"] } }
                ]
              }
            }
          }
        }
      ]
    }
  },
  
  ageAccessControl: {
    div: {
      class: "access-control",
      $children: [
        { h3: "Access Level for Age: {{age}}" },
        {
          $if: {
            $check: "age",
            "$<": 13,
            $then: { p: { style: { color: "red" }, $children: ["❌ Child account - Restricted access"] } }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 13,
            "$<": 18,
            $then: { p: { style: { color: "orange" }, $children: ["⚠️ Teen account - Limited access"] } }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            $then: { p: { style: { color: "green" }, $children: ["✓ Full access granted"] } }
          }
        },
        { hr: {} },
        { h4: "Role-Based Access" },
        {
          $if: {
            $check: "role",
            $in: ["admin", "moderator", "editor"],
            $then: { p: { style: { color: "blue" }, $children: ["⭐ Special privileges granted"] } },
            $else: { p: "Standard user privileges" }
          }
        }
      ]
    }
  },
  
  ticketPricing: {
    div: {
      class: "pricing",
      $children: [
        { h3: "Standard Pricing" },
        { p: "Age: {{age}}, Member: {{isMember}}" },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            "$<=": 65,
            $then: { p: { style: { color: "green" }, $children: ["✓ Standard adult rate: $50"] } },
            $else: { p: "Discounted rate available" }
          }
        },
        { hr: {} },
        { h3: "Discounted Pricing (OR Logic)" },
        {
          $if: {
            $check: "age",
            "$<": 18,
            "$>": 65,
            $join: "OR",
            $then: { p: { style: { color: "blue" }, $children: ["🎉 Special discount: $30"] } },
            $else: { p: "Standard rate: $50" }
          }
        },
        { hr: {} },
        { h3: "Negation Example" },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            "$<=": 65,
            $not: true,
            $then: { p: { style: { color: "orange" }, $children: ["Outside working age range"] } },
            $else: { p: "Working age range (18-65)" }
          }
        }
      ]
    }
  },
  
  statusDashboard: {
    div: {
      class: "status-dashboard",
      $children: [
        { h3: "Server Status Dashboard" },
        {
          div: {
            class: {
              $check: "status",
              "$=": "online",
              $then: "status-online",
              $else: "status-offline"
            } as any,
            $children: [
              { strong: "Server Status: " },
              { span: "{{status}}" }
            ]
          }
        },
        { hr: {} },
        { h4: "Performance Score: {{score}}" },
        {
          div: {
            class: {
              $check: "score",
              "$>=": 90,
              $then: "score-excellent",
              $else: "score-average"
            } as any,
            style: {
              $check: "score",
              "$>=": 90,
              $then: { color: "green", "font-weight": "bold" },
              $else: { color: "orange" }
            } as any,
            $children: [
              {
                $if: {
                  $check: "score",
                  "$>=": 90,
                  $then: { span: "⭐ Excellent Performance" },
                  $else: { span: "Average Performance" }
                }
              }
            ]
          }
        },
        { hr: {} },
        { h4: "User Role Badge" },
        {
          span: {
            class: {
              $check: "role",
              $in: ["admin", "moderator"],
              $then: "badge-special",
              $else: "badge-normal"
            } as any,
            $children: ["Role: {{role}}"]
          }
        }
      ]
    }
  },
};

// Example markdown documents with embedded treebark - strongly typed
const examples: MarkdownExamples = {
  'Hello World': {
    templates: { greeting: treebarkTemplates.greeting },
    markdown: `# Welcome to markdown-it-treebark!

This plugin allows you to embed **treebark templates** inside markdown code blocks.

${treebark(treebarkTemplates.greeting)}

Regular markdown continues to work normally:
- Bullet points
- **Bold text**
- *Italic text*`,
    data: {
      name: 'World'
    }
  },
  'Product Card': {
    templates: { productCard: treebarkTemplates.productCard },
    markdown: `# Product Showcase

Here's a product card rendered with treebark:

${treebark(treebarkTemplates.productCard)}

## Features

- Dynamic content with data binding
- Clean HTML output
- Safe rendering`,
    data: {
      name: 'Gaming Laptop',
      description: 'High-performance laptop for gaming and development',
      price: '$1,299',
      image: 'https://via.placeholder.com/300x200',
      link: '#product'
    }
  },
  'List Binding': {
    templates: { teamList: treebarkTemplates.teamList },
    markdown: `# Team Members

Meet our amazing team:

${treebark(treebarkTemplates.teamList)}

## About Us

We're passionate about building great software!`,
    data: {
      members: [
        { name: 'Alice', role: 'Developer' },
        { name: 'Bob', role: 'Designer' },
        { name: 'Charlie', role: 'Manager' }
      ]
    }
  },
  'Mixed Content': {
    templates: { 
      quickStart: treebarkTemplates.quickStart,
      featuresList: treebarkTemplates.featuresList
    },
    markdown: `# {{siteName}} Documentation

Welcome to the **{{siteName}}** documentation!

## Quick Start

Get started with our product in minutes:

${treebark(treebarkTemplates.quickStart)}

## Features

Check out our latest features:

${treebark(treebarkTemplates.featuresList)}

## Get Help

Visit our [documentation](#) or [contact support](#).`,
    data: {
      siteName: 'Treebark',
      packageName: 'treebark',
      features: [
        { title: 'Safe', description: 'XSS protection built-in' },
        { title: 'Fast', description: 'Optimized rendering' },
        { title: 'Simple', description: 'Easy to learn and use' }
      ]
    }
  },
  'Full Template with Data': {
    templates: { productGalleryWithData: treebarkTemplates.productGalleryWithData },
    markdown: `# Product Gallery

Browse our amazing products below:

${treebark(treebarkTemplates.productGalleryWithData)}

*Note: This example includes both template and data in the code block.*`,
    data: {}
  },
  'Conditional Rendering ($if Tag)': {
    templates: { userStatus: treebarkTemplates.userStatus },
    markdown: `# User Dashboard with Conditional Content

The **$if** tag allows conditional rendering based on data values.

## Basic Example

${treebark(treebarkTemplates.userStatus)}

## Key Features

- Use \`$check\` to specify the condition
- Use \`$not: true\` to invert the condition (like 'unless')
- Works with nested properties like \`user.isAdmin\`
- The $if tag is transparent - it doesn't render itself`,
    data: {
      isPremium: true
    }
  },
  'If/Else Branches ($then/$else)': {
    templates: { authStatus: treebarkTemplates.authStatus },
    markdown: `# User Authentication Status

The **$then** and **$else** keys provide clean if/else branching.

## If/Else Example

${treebark(treebarkTemplates.authStatus)}

## Key Features

- \`$then\` contains the element to render when condition is true
- \`$else\` contains the element to render when condition is false
- Each branch outputs exactly one element (1:1 mapping)
- Both branches are optional`,
    data: {
      isLoggedIn: true,
      username: 'Alice'
    }
  },
  'Comparison Operators': {
    templates: { ageAccessControl: treebarkTemplates.ageAccessControl },
    markdown: `# Age-Based Access Control

Use comparison operators to create powerful conditional logic.

## Comparison Examples

${treebark(treebarkTemplates.ageAccessControl)}

## Available Operators

- \`$<\` - Less than
- \`$>\` - Greater than
- \`$<=\` - Less than or equal
- \`$>=\` - Greater than or equal
- \`$=\` - Strict equality
- \`$in\` - Array membership`,
    data: {
      age: 25,
      role: 'admin'
    }
  },
  'Operator Stacking ($join)': {
    templates: { ticketPricing: treebarkTemplates.ticketPricing },
    markdown: `# Pricing Logic with Multiple Conditions

Combine multiple operators with **AND** (default) or **OR** logic using \`$join\`.

## AND Logic (Default)

${treebark(treebarkTemplates.ticketPricing)}

## Key Features

- Multiple operators use **AND** logic by default
- Use \`$join: 'OR'\` to change to OR logic
- Use \`$not: true\` to invert the entire result
- Operators can be stacked for complex conditions`,
    data: {
      age: 70,
      isMember: false
    }
  },
  'Conditional Attribute Values': {
    templates: { statusDashboard: treebarkTemplates.statusDashboard },
    markdown: `# Dynamic Styling with Conditional Attributes

Apply conditional values to **any attribute** using the same conditional syntax.

## Conditional Attributes Example

${treebark(treebarkTemplates.statusDashboard)}

## Key Features

- Conditional values work on **any attribute** (class, style, href, etc.)
- Uses the same operators as $if tag ($<, $>, $=, $in, etc.)
- Supports $not, $join modifiers
- Clean, declarative syntax`,
    data: {
      status: 'online',
      score: 95,
      role: 'admin'
    }
  }
};

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
    console.error = function(...args: any[]) {
      logs.push({ level: 'error', message: args.join(' ') });
      originalConsole.error.apply(console, args);
    };
    console.warn = function(...args: any[]) {
      logs.push({ level: 'warn', message: args.join(' ') });
      originalConsole.warn.apply(console, args);
    };
    console.log = function(...args: any[]) {
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
    
    let markdown = example.markdown || '';

    // If switching to YAML format and we have template references, regenerate markdown
    if (currentMarkdownFormat === 'yaml' && example.templates) {
      // Replace treebark blocks using stored template references
      const templateKeys = Object.keys(example.templates);
      let templateIndex = 0;
      
      markdown = markdown.replace(TREEBARK_BLOCK_REGEX, (match) => {
        if (templateIndex < templateKeys.length) {
          const templateKey = templateKeys[templateIndex];
          const template = example.templates![templateKey];
          templateIndex++;
          const yamlCode = jsonToYaml(template);
          return '```treebark\n' + yamlCode + '\n```';
        }
        return match;
      });
    }

    markdownEditor.value = markdown;
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
document.addEventListener('DOMContentLoaded', function() {
  populateExampleDropdown();
});

// Export functions to global scope for HTML onclick handlers
(window as any).loadExampleFromDropdown = loadExampleFromDropdown;
(window as any).switchMarkdownFormat = switchMarkdownFormat;
