---
layout: default
title: Playground
description: Interactive playground for experimenting with Treebark schemas
---

<style>
.playground-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
    height: 400px;
}

.playground-panel {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.panel-header {
    background: #f5f5f5;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #ddd;
    font-weight: 600;
    color: #333;
}

.editor {
    flex: 1;
    padding: 1rem;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    border: none;
    resize: none;
    outline: none;
    background: #fafafa;
}

.output {
    flex: 1;
    padding: 1rem;
    overflow: auto;
    background: white;
}

.error {
    color: #d73a49;
    background: #ffeef0;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #f1b2b8;
    font-size: 0.9rem;
}

.examples {
    margin: 2rem 0;
}

.example-button {
    display: inline-block;
    background: #007acc;
    color: white;
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: none;
}

.example-button:hover {
    background: #005a9c;
    color: white;
}

.format-toggle {
    margin: 1rem 0;
}

.format-toggle label {
    margin-right: 1rem;
    cursor: pointer;
}

.format-toggle input[type="radio"] {
    margin-right: 0.5rem;
}

.html-output {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
    white-space: pre-wrap;
    overflow-x: auto;
}

@media (max-width: 768px) {
    .playground-container {
        grid-template-columns: 1fr;
        height: auto;
    }
    
    .playground-panel {
        height: 300px;
    }
}
</style>

# 🎮 Treebark Playground

Try out Treebark schemas interactively! Edit the schema on the left and see the rendered output on the right.

<div class="format-toggle">
    <label><input type="radio" name="format" value="json" checked> JSON Format</label>
    <label><input type="radio" name="format" value="yaml"> YAML Format</label>
</div>

<div class="playground-container">
    <div class="playground-panel">
        <div class="panel-header">Schema Editor</div>
        <textarea class="editor" id="schema-editor" placeholder="Enter your Treebark schema here..."></textarea>
    </div>
    <div class="playground-panel">
        <div class="panel-header">Live Preview</div>
        <div class="output" id="output"></div>
    </div>
</div>

<div class="html-output" id="html-output"></div>

<div class="examples">
    <h3>📚 Try These Examples:</h3>
    <button class="example-button" onclick="loadExample('hello')">Hello World</button>
    <button class="example-button" onclick="loadExample('card')">Card Layout</button>
    <button class="example-button" onclick="loadExample('list')">List Binding</button>
    <button class="example-button" onclick="loadExample('template')">Self-Contained</button>
    <button class="example-button" onclick="loadExample('shorthand')">Shorthand Syntax</button>
    <button class="example-button" onclick="loadExample('mixed')">Mixed Content</button>
</div>

<script src="{{ '/js/treebark-browser.js' | relative_url }}"></script>
<script>
// Wait for the module to be available
window.addEventListener('load', function() {
    const editor = document.getElementById('schema-editor');
    const output = document.getElementById('output');
    const htmlOutput = document.getElementById('html-output');
    const formatRadios = document.querySelectorAll('input[name="format"]');
    
    let currentFormat = 'json';
    
    // Check if treebark is available
    if (typeof window.renderToDOM === 'undefined') {
        output.innerHTML = '<div class="error">Treebark library not loaded. Please check the console for errors.</div>';
        return;
    }
    
    // Example schemas
    const examples = {
        hello: {
            json: `{
  "div": "Hello world"
}`,
            yaml: `div: "Hello world"`
        },
        card: {
            json: `{
  "div": {
    "class": "card",
    "$children": [
      { "h2": "{{title}}" },
      { "p": "{{description}}" }
    ]
  }
}`,
            yaml: `div:
  class: card
  $children:
    - h2: "{{title}}"
    - p: "{{description}}"`
        },
        list: {
            json: `{
  "$template": {
    "ul": {
      "$bind": "items",
      "$children": [
        { "li": "{{name}} - {{price}}" }
      ]
    }
  },
  "$data": {
    "items": [
      { "name": "Laptop", "price": "$999" },
      { "name": "Phone", "price": "$499" }
    ]
  }
}`,
            yaml: `$template:
  ul:
    $bind: items
    $children:
      - li: "{{name}} - {{price}}"
$data:
  items:
    - name: "Laptop"
      price: "$999"
    - name: "Phone"
      price: "$499"`
        },
        template: {
            json: `{
  "$template": {
    "div": {
      "class": "product-card",
      "$children": [
        { "h2": "{{name}}" },
        { "p": "Only {{price}}!" }
      ]
    }
  },
  "$data": {
    "name": "Gaming Laptop",
    "price": "$1299"
  }
}`,
            yaml: `$template:
  div:
    class: product-card
    $children:
      - h2: "{{name}}"
      - p: "Only {{price}}!"
$data:
  name: "Gaming Laptop"
  price: "$1299"`
        },
        shorthand: {
            json: `{
  "div": [
    { "h2": "Welcome" },
    { "p": "This is much cleaner!" },
    {
      "ul": [
        { "li": "Item 1" },
        { "li": "Item 2" },
        { "li": "Item 3" }
      ]
    }
  ]
}`,
            yaml: `div:
  - h2: "Welcome"
  - p: "This is much cleaner!"
  - ul:
      - li: "Item 1"
      - li: "Item 2"
      - li: "Item 3"`
        },
        mixed: {
            json: `{
  "div": {
    "$children": [
      "Hello ",
      { "span": { "style": "color: blue;", "$children": ["World"] } },
      "!"
    ]
  }
}`,
            yaml: `div:
  $children:
    - "Hello "
    - span:
        style: "color: blue;"
        $children: ["World"]
    - "!"`
        }
    };
    
    // Load example function
    window.loadExample = function(exampleKey) {
        const example = examples[exampleKey];
        if (example) {
            editor.value = example[currentFormat];
            renderSchema();
        }
    };
    
    // Format change handler
    formatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentFormat = this.value;
            // Clear editor when switching formats
            editor.value = '';
            output.innerHTML = '';
            htmlOutput.textContent = '';
        });
    });
    
    // Render function
    function renderSchema() {
        const schemaText = editor.value.trim();
        if (!schemaText) {
            output.innerHTML = '<div style="color: #666; font-style: italic;">Enter a schema to see the preview</div>';
            htmlOutput.textContent = '';
            return;
        }
        
        try {
            let schema;
            
            if (currentFormat === 'yaml') {
                // For now, show a message that YAML requires a parser
                output.innerHTML = '<div class="error">YAML parsing requires the js-yaml library. Please use JSON format in this playground.</div>';
                htmlOutput.textContent = '';
                return;
            } else {
                schema = JSON.parse(schemaText);
            }
            
            // Check if treebark functions are available
            if (typeof window.renderToDOM === 'undefined') {
                output.innerHTML = '<div class="error">Treebark library not loaded. Please check the console for errors.</div>';
                return;
            }
            
            // Render with treebark
            const fragment = window.renderToDOM(schema);
            
            // Clear and append result
            output.innerHTML = '';
            output.appendChild(fragment.cloneNode(true));
            
            // Show HTML output
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment.cloneNode(true));
            htmlOutput.textContent = tempDiv.innerHTML;
            
        } catch (error) {
            output.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            htmlOutput.textContent = '';
        }
    }
    
    // Editor input handler
    editor.addEventListener('input', renderSchema);
    
    // Load initial example
    loadExample('hello');
});
</script>