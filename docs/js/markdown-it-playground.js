function createMarkdownWithTreebark(markdown, template) {
    return markdown;
}
const TREEBARK_BLOCK_REGEX = /```treebark\n([\s\S]*?)```/g;
const treebarkTemplates = {
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
};
const examples = {
    'hello-world': {
        label: 'Hello World',
        treebarkTemplates: { greeting: treebarkTemplates.greeting },
        markdown: `# Welcome to markdown-it-treebark!

This plugin allows you to embed **treebark templates** inside markdown code blocks.

\`\`\`treebark
${JSON.stringify(treebarkTemplates.greeting, null, 2)}
\`\`\`

Regular markdown continues to work normally:
- Bullet points
- **Bold text**
- *Italic text*`,
        data: {
            name: 'World'
        }
    },
    'product-card': {
        label: 'Product Card',
        treebarkTemplates: { productCard: treebarkTemplates.productCard },
        markdown: `# Product Showcase

Here's a product card rendered with treebark:

\`\`\`treebark
${JSON.stringify(treebarkTemplates.productCard, null, 2)}
\`\`\`

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
    'list-binding': {
        label: 'List Binding',
        treebarkTemplates: { teamList: treebarkTemplates.teamList },
        markdown: `# Team Members

Meet our amazing team:

\`\`\`treebark
${JSON.stringify(treebarkTemplates.teamList, null, 2)}
\`\`\`

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
    'mixed-content': {
        label: 'Mixed Content',
        markdown: `# {{siteName}} Documentation

Welcome to the **{{siteName}}** documentation!

## Quick Start

Get started with our product in minutes:

\`\`\`treebark
{
  "div": {
    "class": "quick-start",
    "$children": [
      { "h3": "Installation" },
      { "pre": "npm install {{packageName}}" },
      { "h3": "Usage" },
      { "p": "Import and use in your project:" }
    ]
  }
}
\`\`\`

## Features

Check out our latest features:

\`\`\`treebark
{
  "ul": {
    "class": "features",
    "$bind": "features",
    "$children": [
      {
        "li": {
          "$children": [
            { "strong": "{{title}}" },
            " - ",
            "{{description}}"
          ]
        }
      }
    ]
  }
}
\`\`\`

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
    'full-template': {
        label: 'Full Template with Data',
        markdown: `# Product Gallery

Browse our amazing products below:

\`\`\`treebark
{
  "template": {
    "div": {
      "class": "product-grid",
      "$children": [
        { "h2": "Featured Products" },
        {
          "div": {
            "class": "products",
            "$bind": "products",
            "$children": [
              {
                "div": {
                  "class": "product-card",
                  "$children": [
                    { "img": { "src": "{{image}}", "alt": "{{name}}" } },
                    { "h3": "{{name}}" },
                    { "p": "{{description}}" },
                    { "div": { "class": "price", "$children": ["{{price}}"] } }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "data": {
    "products": [
      {
        "name": "Treebark Core",
        "description": "Safe template rendering for Markdown",
        "price": "Free",
        "image": "https://via.placeholder.com/150"
      },
      {
        "name": "Treebark Pro",
        "description": "Advanced features and support",
        "price": "$29/month",
        "image": "https://via.placeholder.com/150"
      }
    ]
  }
}
\`\`\`

*Note: This example includes both template and data in the code block.*`,
        data: {}
    },
    'conditional-rendering': {
        label: 'Conditional Rendering ($if Tag)',
        markdown: `# User Dashboard with Conditional Content

The **$if** tag allows conditional rendering based on data values.

## Basic Example

\`\`\`treebark
{
  "div": {
    "class": "user-status",
    "$children": [
      { "h3": "Account Status" },
      {
        "$if": {
          "$check": "isPremium",
          "$then": { "p": { "style": { "color": "gold" }, "$children": ["⭐ Premium Member"] } }
        }
      },
      {
        "$if": {
          "$check": "isPremium",
          "$not": true,
          "$then": { "p": "Standard Member - Upgrade to Premium!" }
        }
      }
    ]
  }
}
\`\`\`

## Key Features

- Use \`$check\` to specify the condition
- Use \`$not: true\` to invert the condition (like 'unless')
- Works with nested properties like \`user.isAdmin\`
- The $if tag is transparent - it doesn't render itself`,
        data: {
            isPremium: true
        }
    },
    'if-else-branches': {
        label: 'If/Else Branches ($then/$else)',
        markdown: `# User Authentication Status

The **$then** and **$else** keys provide clean if/else branching.

## If/Else Example

\`\`\`treebark
{
  "div": {
    "class": "auth-status",
    "$children": [
      { "h3": "Welcome!" },
      {
        "$if": {
          "$check": "isLoggedIn",
          "$then": {
            "div": {
              "class": "logged-in",
              "$children": [
                { "p": "Hello, {{username}}!" },
                { "a": { "href": "#logout", "$children": ["Logout"] } }
              ]
            }
          },
          "$else": {
            "div": {
              "class": "logged-out",
              "$children": [
                { "p": "Please log in to continue." },
                { "a": { "href": "#login", "class": "btn", "$children": ["Login"] } }
              ]
            }
          }
        }
      }
    ]
  }
}
\`\`\`

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
    'conditional-operators': {
        label: 'Comparison Operators',
        markdown: `# Age-Based Access Control

Use comparison operators to create powerful conditional logic.

## Comparison Examples

\`\`\`treebark
{
  "div": {
    "class": "access-control",
    "$children": [
      { "h3": "Access Level for Age: {{age}}" },
      {
        "$if": {
          "$check": "age",
          "$<": 13,
          "$then": { "p": { "style": { "color": "red" }, "$children": ["❌ Child account - Restricted access"] } }
        }
      },
      {
        "$if": {
          "$check": "age",
          "$>=": 13,
          "$<": 18,
          "$then": { "p": { "style": { "color": "orange" }, "$children": ["⚠️ Teen account - Limited access"] } }
        }
      },
      {
        "$if": {
          "$check": "age",
          "$>=": 18,
          "$then": { "p": { "style": { "color": "green" }, "$children": ["✓ Full access granted"] } }
        }
      },
      { "hr": {} },
      { "h4": "Role-Based Access" },
      {
        "$if": {
          "$check": "role",
          "$in": ["admin", "moderator", "editor"],
          "$then": { "p": { "style": { "color": "blue" }, "$children": ["⭐ Special privileges granted"] } },
          "$else": { "p": "Standard user privileges" }
        }
      }
    ]
  }
}
\`\`\`

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
    'conditional-join': {
        label: 'Operator Stacking ($join)',
        markdown: `# Pricing Logic with Multiple Conditions

Combine multiple operators with **AND** (default) or **OR** logic using \`$join\`.

## AND Logic (Default)

\`\`\`treebark
{
  "div": {
    "class": "pricing",
    "$children": [
      { "h3": "Standard Pricing" },
      { "p": "Age: {{age}}, Member: {{isMember}}" },
      {
        "$if": {
          "$check": "age",
          "$>=": 18,
          "$<=": 65,
          "$then": { "p": { "style": { "color": "green" }, "$children": ["✓ Standard adult rate: $50"] } },
          "$else": { "p": "Discounted rate available" }
        }
      },
      { "hr": {} },
      { "h3": "Discounted Pricing (OR Logic)" },
      {
        "$if": {
          "$check": "age",
          "$<": 18,
          "$>": 65,
          "$join": "OR",
          "$then": { "p": { "style": { "color": "blue" }, "$children": ["🎉 Special discount: $30"] } },
          "$else": { "p": "Standard rate: $50" }
        }
      },
      { "hr": {} },
      { "h3": "Negation Example" },
      {
        "$if": {
          "$check": "age",
          "$>=": 18,
          "$<=": 65,
          "$not": true,
          "$then": { "p": { "style": { "color": "orange" }, "$children": ["Outside working age range"] } },
          "$else": { "p": "Working age range (18-65)" }
        }
      }
    ]
  }
}
\`\`\`

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
    'conditional-attributes': {
        label: 'Conditional Attribute Values',
        markdown: `# Dynamic Styling with Conditional Attributes

Apply conditional values to **any attribute** using the same conditional syntax.

## Conditional Attributes Example

\`\`\`treebark
{
  "div": {
    "class": "status-dashboard",
    "$children": [
      { "h3": "Server Status Dashboard" },
      {
        "div": {
          "class": {
            "$check": "status",
            "$=": "online",
            "$then": "status-online",
            "$else": "status-offline"
          },
          "$children": [
            { "strong": "Server Status: " },
            { "span": "{{status}}" }
          ]
        }
      },
      { "hr": {} },
      { "h4": "Performance Score: {{score}}" },
      {
        "div": {
          "class": {
            "$check": "score",
            "$>=": 90,
            "$then": "score-excellent",
            "$else": "score-average"
          },
          "style": {
            "$check": "score",
            "$>=": 90,
            "$then": { "color": "green", "font-weight": "bold" },
            "$else": { "color": "orange" }
          },
          "$children": [
            {
              "$if": {
                "$check": "score",
                "$>=": 90,
                "$then": { "span": "⭐ Excellent Performance" },
                "$else": { "span": "Average Performance" }
              }
            }
          ]
        }
      },
      { "hr": {} },
      { "h4": "User Role Badge" },
      {
        "span": {
          "class": {
            "$check": "role",
            "$in": ["admin", "moderator"],
            "$then": "badge-special",
            "$else": "badge-normal"
          },
          "$children": ["Role: {{role}}"]
        }
      }
    ]
  }
}
\`\`\`

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
let currentMarkdownFormat = 'json';
const markdownEditor = document.getElementById('markdown-editor');
const dataEditor = document.getElementById('data-editor');
const htmlOutput = document.getElementById('html-output');
const errorDisplay = document.getElementById('error-display');
const indentType = document.getElementById('indent-type');
const indentSize = document.getElementById('indent-size');
const markdownFormatSelect = document.getElementById('markdown-format');
function jsonToYaml(obj) {
    return jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
}
function yamlToJson(yamlStr) {
    return jsyaml.load(yamlStr);
}
function switchMarkdownFormat() {
    const newFormat = markdownFormatSelect.value;
    const currentContent = markdownEditor.value;
    if (!currentContent || !currentContent.includes('```treebark')) {
        currentMarkdownFormat = newFormat;
        return;
    }
    try {
        const converted = currentContent.replace(TREEBARK_BLOCK_REGEX, (match, code) => {
            try {
                const trimmedCode = code.trim();
                if (!trimmedCode) {
                    return match;
                }
                let template;
                if (currentMarkdownFormat === 'json') {
                    template = JSON.parse(trimmedCode);
                }
                else {
                    template = yamlToJson(trimmedCode);
                }
                let newCode;
                if (newFormat === 'json') {
                    newCode = JSON.stringify(template, null, 2);
                }
                else {
                    newCode = jsonToYaml(template);
                }
                return '```treebark\n' + newCode + '\n```';
            }
            catch (e) {
                return match;
            }
        });
        markdownEditor.value = converted;
        currentMarkdownFormat = newFormat;
        updateOutput();
    }
    catch (e) {
        errorDisplay.textContent = 'Error converting format: ' + e.message;
        errorDisplay.style.display = 'block';
    }
}
function updateOutput() {
    try {
        errorDisplay.style.display = 'none';
        const markdownText = markdownEditor.value.trim();
        const dataText = dataEditor.value.trim();
        if (!markdownText) {
            htmlOutput.textContent = '';
            return;
        }
        let data = {};
        if (dataText) {
            try {
                data = JSON.parse(dataText);
            }
            catch (e) {
                throw new Error('Invalid JSON in data context: ' + e.message);
            }
        }
        let indent = false;
        if (indentType.value !== 'none') {
            const size = parseInt(indentSize.value) || 2;
            indent = indentType.value === 'tabs' ? '\t'.repeat(size) : ' '.repeat(size);
        }
        const logs = [];
        const originalConsole = {
            error: console.error,
            warn: console.warn,
            log: console.log
        };
        console.error = function (...args) {
            logs.push({ level: 'error', message: args.join(' ') });
            originalConsole.error.apply(console, args);
        };
        console.warn = function (...args) {
            logs.push({ level: 'warn', message: args.join(' ') });
            originalConsole.warn.apply(console, args);
        };
        console.log = function (...args) {
            logs.push({ level: 'log', message: args.join(' ') });
            originalConsole.log.apply(console, args);
        };
        try {
            const md = markdownit();
            md.use(MarkdownItTreebark, { data, indent });
            const html = md.render(markdownText);
            htmlOutput.textContent = html;
            if (logs.length > 0) {
                const logMessages = logs.map(log => {
                    const prefix = log.level === 'error' ? '❌ Error: ' :
                        log.level === 'warn' ? '⚠️ Warning: ' : 'ℹ️ ';
                    return prefix + log.message;
                }).join('\n');
                errorDisplay.textContent = logMessages;
                errorDisplay.style.display = 'block';
            }
        }
        finally {
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.log = originalConsole.log;
        }
    }
    catch (error) {
        errorDisplay.textContent = 'Error: ' + error.message;
        errorDisplay.style.display = 'block';
        htmlOutput.textContent = '';
    }
}
function loadExample(exampleId) {
    const example = examples[exampleId];
    if (example) {
        let markdown = example.markdown || '';
        if (currentMarkdownFormat === 'yaml' && markdown.includes('```treebark')) {
            markdown = markdown.replace(TREEBARK_BLOCK_REGEX, (match, code) => {
                try {
                    const trimmedCode = code.trim();
                    if (!trimmedCode) {
                        return match;
                    }
                    const template = JSON.parse(trimmedCode);
                    const yamlCode = jsonToYaml(template);
                    return '```treebark\n' + yamlCode + '\n```';
                }
                catch (e) {
                    return match;
                }
            });
        }
        markdownEditor.value = markdown;
        dataEditor.value = JSON.stringify(example.data || {}, null, 2);
        updateOutput();
    }
}
function populateExampleDropdown() {
    const select = document.getElementById('example-select');
    const exampleIds = Object.keys(examples);
    exampleIds.forEach(exampleId => {
        const option = document.createElement('option');
        option.value = exampleId;
        option.textContent = examples[exampleId].label || exampleId;
        select.appendChild(option);
    });
    if (exampleIds.length > 0) {
        select.value = exampleIds[0];
        loadExample(exampleIds[0]);
    }
}
function loadExampleFromDropdown() {
    const select = document.getElementById('example-select');
    const exampleId = select.value;
    if (exampleId) {
        loadExample(exampleId);
    }
}
markdownEditor.addEventListener('input', updateOutput);
dataEditor.addEventListener('input', updateOutput);
indentType.addEventListener('change', updateOutput);
indentSize.addEventListener('input', updateOutput);
document.addEventListener('DOMContentLoaded', function () {
    populateExampleDropdown();
});
window.loadExampleFromDropdown = loadExampleFromDropdown;
window.switchMarkdownFormat = switchMarkdownFormat;
export {};
