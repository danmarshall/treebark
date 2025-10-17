(function() {
  "use strict";
  function treebark(template) {
    return "```treebark\n" + JSON.stringify(template, null, 2) + "\n```";
  }
  const greeting = {
    div: {
      class: "greeting",
      $children: [
        { h2: "Hello {{name}}!" },
        { p: "Welcome to the markdown-it-treebark plugin." }
      ]
    }
  };
  const helloWorld = {
    templates: { greeting },
    markdown: `# Welcome to markdown-it-treebark!

This plugin allows you to embed **treebark templates** inside markdown code blocks.

${treebark(greeting)}

Regular markdown continues to work normally:
- Bullet points
- **Bold text**
- *Italic text*`,
    data: {
      name: "World"
    }
  };
  const productCardTemplate = {
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
  };
  const productCard = {
    templates: { productCard: productCardTemplate },
    markdown: `# Product Showcase

Here's a product card rendered with treebark:

${treebark(productCardTemplate)}

## Features

- Dynamic content with data binding
- Clean HTML output
- Safe rendering`,
    data: {
      name: "Gaming Laptop",
      description: "High-performance laptop for gaming and development",
      price: "$1,299",
      image: "https://via.placeholder.com/300x200",
      link: "#product"
    }
  };
  const teamList = {
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
  };
  const listBinding = {
    templates: { teamList },
    markdown: `# Team Members

Meet our amazing team:

${treebark(teamList)}

## About Us

We're passionate about building great software!`,
    data: {
      members: [
        { name: "Alice", role: "Developer" },
        { name: "Bob", role: "Designer" },
        { name: "Charlie", role: "Manager" }
      ]
    }
  };
  const quickStart = {
    div: {
      class: "quick-start",
      $children: [
        { h3: "Installation" },
        { pre: "npm install {{packageName}}" },
        { h3: "Usage" },
        { p: "Import and use in your project:" }
      ]
    }
  };
  const featuresList = {
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
  };
  const mixedContent = {
    templates: {
      quickStart,
      featuresList
    },
    markdown: `# {{siteName}} Documentation

Welcome to the **{{siteName}}** documentation!

## Quick Start

Get started with our product in minutes:

${treebark(quickStart)}

## Features

Check out our latest features:

${treebark(featuresList)}

## Get Help

Visit our [documentation](#) or [contact support](#).`,
    data: {
      siteName: "Treebark",
      packageName: "treebark",
      features: [
        { title: "Safe", description: "XSS protection built-in" },
        { title: "Fast", description: "Optimized rendering" },
        { title: "Simple", description: "Easy to learn and use" }
      ]
    }
  };
  const productGalleryWithData = {
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
  };
  const fullTemplateWithData = {
    templates: { productGalleryWithData },
    markdown: `# Product Gallery

Browse our amazing products below:

${treebark(productGalleryWithData)}

*Note: This example includes both template and data in the code block.*`,
    data: {}
  };
  const userStatus = {
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
  };
  const conditionalIfTag = {
    templates: { userStatus },
    markdown: `# User Dashboard with Conditional Content

The **$if** tag allows conditional rendering based on data values.

## Basic Example

${treebark(userStatus)}

## Key Features

- Use \`$check\` to specify the condition
- Use \`$not: true\` to invert the condition (like 'unless')
- Works with nested properties like \`user.isAdmin\`
- The $if tag is transparent - it doesn't render itself`,
    data: {
      isPremium: true
    }
  };
  const authStatus = {
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
  };
  const ifElseBranches = {
    templates: { authStatus },
    markdown: `# User Authentication Status

The **$then** and **$else** keys provide clean if/else branching.

## If/Else Example

${treebark(authStatus)}

## Key Features

- \`$then\` contains the element to render when condition is true
- \`$else\` contains the element to render when condition is false
- Each branch outputs exactly one element (1:1 mapping)
- Both branches are optional`,
    data: {
      isLoggedIn: true,
      username: "Alice"
    }
  };
  const ageAccessControl = {
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
  };
  const comparisonOperators = {
    templates: { ageAccessControl },
    markdown: `# Age-Based Access Control

Use comparison operators to create powerful conditional logic.

## Comparison Examples

${treebark(ageAccessControl)}

## Available Operators

- \`$<\` - Less than
- \`$>\` - Greater than
- \`$<=\` - Less than or equal
- \`$>=\` - Greater than or equal
- \`$=\` - Strict equality
- \`$in\` - Array membership`,
    data: {
      age: 25,
      role: "admin"
    }
  };
  const ticketPricing = {
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
  };
  const operatorStacking = {
    templates: { ticketPricing },
    markdown: `# Pricing Logic with Multiple Conditions

Combine multiple operators with **AND** (default) or **OR** logic using \`$join\`.

## AND Logic (Default)

${treebark(ticketPricing)}

## Key Features

- Multiple operators use **AND** logic by default
- Use \`$join: 'OR'\` to change to OR logic
- Use \`$not: true\` to invert the entire result
- Operators can be stacked for complex conditions`,
    data: {
      age: 70,
      isMember: false
    }
  };
  const statusDashboard = {
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
            },
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
            },
            style: {
              $check: "score",
              "$>=": 90,
              $then: { color: "green", "font-weight": "bold" },
              $else: { color: "orange" }
            },
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
            },
            $children: ["Role: {{role}}"]
          }
        }
      ]
    }
  };
  const conditionalAttributeValues = {
    templates: { statusDashboard },
    markdown: `# Dynamic Styling with Conditional Attributes

Apply conditional values to **any attribute** using the same conditional syntax.

## Conditional Attributes Example

${treebark(statusDashboard)}

## Key Features

- Conditional values work on **any attribute** (class, style, href, etc.)
- Uses the same operators as $if tag ($<, $>, $=, $in, etc.)
- Supports $not, $join modifiers
- Clean, declarative syntax`,
    data: {
      status: "online",
      score: 95,
      role: "admin"
    }
  };
  const examples = {
    "Hello World": helloWorld,
    "Product Card": productCard,
    "List Binding": listBinding,
    "Mixed Content": mixedContent,
    "Full Template with Data": fullTemplateWithData,
    "Conditional Rendering ($if Tag)": conditionalIfTag,
    "If/Else Branches ($then/$else)": ifElseBranches,
    "Comparison Operators": comparisonOperators,
    "Operator Stacking ($join)": operatorStacking,
    "Conditional Attribute Values": conditionalAttributeValues
  };
  const TREEBARK_BLOCK_REGEX = /```treebark\n([\s\S]*?)```/g;
  let currentMarkdownFormat = "json";
  const markdownEditor = document.getElementById("markdown-editor");
  const dataEditor = document.getElementById("data-editor");
  const htmlOutput = document.getElementById("html-output");
  const errorDisplay = document.getElementById("error-display");
  const indentType = document.getElementById("indent-type");
  const indentSize = document.getElementById("indent-size");
  const markdownFormatSelect = document.getElementById("markdown-format");
  function jsonToYaml(obj) {
    return jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
  }
  function yamlToJson(yamlStr) {
    return jsyaml.load(yamlStr);
  }
  function switchMarkdownFormat() {
    const newFormat = markdownFormatSelect.value;
    const currentContent = markdownEditor.value;
    if (!currentContent || !currentContent.includes("```treebark")) {
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
          if (currentMarkdownFormat === "json") {
            template = JSON.parse(trimmedCode);
          } else {
            template = yamlToJson(trimmedCode);
          }
          let newCode;
          if (newFormat === "json") {
            newCode = JSON.stringify(template, null, 2);
          } else {
            newCode = jsonToYaml(template);
          }
          return "```treebark\n" + newCode + "\n```";
        } catch (e) {
          return match;
        }
      });
      markdownEditor.value = converted;
      currentMarkdownFormat = newFormat;
      updateOutput();
    } catch (e) {
      errorDisplay.textContent = "Error converting format: " + e.message;
      errorDisplay.style.display = "block";
    }
  }
  function updateOutput() {
    try {
      errorDisplay.style.display = "none";
      const markdownText = markdownEditor.value.trim();
      const dataText = dataEditor.value.trim();
      if (!markdownText) {
        htmlOutput.textContent = "";
        return;
      }
      let data = {};
      if (dataText) {
        try {
          data = JSON.parse(dataText);
        } catch (e) {
          throw new Error("Invalid JSON in data context: " + e.message);
        }
      }
      let indent = false;
      if (indentType.value !== "none") {
        const size = parseInt(indentSize.value) || 2;
        indent = indentType.value === "tabs" ? "	".repeat(size) : " ".repeat(size);
      }
      const logs = [];
      const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log
      };
      console.error = function(...args) {
        logs.push({ level: "error", message: args.join(" ") });
        originalConsole.error.apply(console, args);
      };
      console.warn = function(...args) {
        logs.push({ level: "warn", message: args.join(" ") });
        originalConsole.warn.apply(console, args);
      };
      console.log = function(...args) {
        logs.push({ level: "log", message: args.join(" ") });
        originalConsole.log.apply(console, args);
      };
      try {
        const md = markdownit();
        md.use(MarkdownItTreebark, { data, indent, yaml: jsyaml });
        const html = md.render(markdownText);
        htmlOutput.textContent = html;
        if (logs.length > 0) {
          const logMessages = logs.map((log) => {
            const prefix = log.level === "error" ? "❌ Error: " : log.level === "warn" ? "⚠️ Warning: " : "ℹ️ ";
            return prefix + log.message;
          }).join("\n");
          errorDisplay.textContent = logMessages;
          errorDisplay.style.display = "block";
        }
      } finally {
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.log = originalConsole.log;
      }
    } catch (error) {
      errorDisplay.textContent = "Error: " + error.message;
      errorDisplay.style.display = "block";
      htmlOutput.textContent = "";
    }
  }
  function loadExample(exampleId) {
    const example = examples[exampleId];
    if (example) {
      let markdown = example.markdown || "";
      if (currentMarkdownFormat === "yaml" && example.templates) {
        const templateKeys = Object.keys(example.templates);
        let templateIndex = 0;
        markdown = markdown.replace(TREEBARK_BLOCK_REGEX, (match) => {
          if (templateIndex < templateKeys.length) {
            const templateKey = templateKeys[templateIndex];
            const template = example.templates[templateKey];
            templateIndex++;
            const yamlCode = jsonToYaml(template);
            return "```treebark\n" + yamlCode + "\n```";
          }
          return match;
        });
      }
      markdownEditor.value = markdown;
      dataEditor.value = JSON.stringify(example.data || {}, null, 2);
      updateOutput();
    }
  }
  function populateExampleDropdown() {
    const select = document.getElementById("example-select");
    const exampleIds = Object.keys(examples);
    exampleIds.forEach((exampleId) => {
      const option = document.createElement("option");
      option.value = exampleId;
      option.textContent = exampleId;
      select.appendChild(option);
    });
    if (exampleIds.length > 0) {
      select.value = exampleIds[0];
      loadExample(exampleIds[0]);
    }
  }
  function loadExampleFromDropdown() {
    const select = document.getElementById("example-select");
    const exampleId = select.value;
    if (exampleId) {
      loadExample(exampleId);
    }
  }
  markdownEditor.addEventListener("input", updateOutput);
  dataEditor.addEventListener("input", updateOutput);
  indentType.addEventListener("change", updateOutput);
  indentSize.addEventListener("input", updateOutput);
  document.addEventListener("DOMContentLoaded", function() {
    populateExampleDropdown();
  });
  window.loadExampleFromDropdown = loadExampleFromDropdown;
  window.switchMarkdownFormat = switchMarkdownFormat;
})();
