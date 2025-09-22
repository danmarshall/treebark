---
layout: default
title: Playground
description: Interactive playground for experimenting with Treebark schemas
---

<style>
/* Playground-specific styles */
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

.controls {
    margin: 1rem 0;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.control-group label {
    font-size: 0.9rem;
    color: #666;
}

.control-group input[type="number"], 
.control-group select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.html-output {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    margin-top: 1rem;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
    white-space: pre;
    overflow-x: auto;
    border-left: 4px solid #007acc;
}

.html-output-header {
    background: #f5f5f5;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #ddd;
    font-weight: 600;
    color: #333;
    margin: 1rem 0 0 0;
    border-radius: 4px 4px 0 0;
    border: 1px solid #ddd;
    border-bottom: none;
}

@media (max-width: 768px) {
    .playground-container {
        grid-template-columns: 1fr;
        height: auto;
    }
    
    .playground-panel {
        height: 300px;
    }
    
    .controls {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>

# 🎮 Treebark Playground

Try out Treebark schemas interactively! Edit the template on the left and data on the right to see the generated HTML below.

<div class="format-toggle">
    <label><input type="radio" name="format" value="json" checked> JSON Format</label>
    <label><input type="radio" name="format" value="yaml"> YAML Format</label>
</div>

<div class="controls">
    <div class="control-group">
        <label>Indent:</label>
        <select id="indent-type">
            <option value="none">None</option>
            <option value="spaces" selected>Spaces</option>
            <option value="tabs">Tabs</option>
        </select>
    </div>
    <div class="control-group">
        <label>Size:</label>
        <input type="number" id="indent-size" value="2" min="1" max="8" style="width: 60px;">
    </div>
</div>

<div class="playground-container">
    <div class="playground-panel">
        <div class="panel-header">Template Editor</div>
        <textarea class="editor" id="template-editor" placeholder="Enter your Treebark template here..."></textarea>
    </div>
    <div class="playground-panel">
        <div class="panel-header">Data Editor</div>
        <textarea class="editor" id="data-editor" placeholder="Enter JSON data here (optional)..."></textarea>
    </div>
</div>

<div class="html-output-header">Generated HTML</div>
<pre class="html-output" id="html-output"></pre>

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
// Wait for the page to load
window.addEventListener('load', function() {
    const templateEditor = document.getElementById('template-editor');
    const dataEditor = document.getElementById('data-editor');
    const htmlOutput = document.getElementById('html-output');
    const formatRadios = document.querySelectorAll('input[name="format"]');
    const indentType = document.getElementById('indent-type');
    const indentSize = document.getElementById('indent-size');
    
    let currentFormat = 'json';
    
    // Check if treebark is available
    if (typeof window.Treebark === 'undefined' || typeof window.Treebark.renderToString === 'undefined') {
        htmlOutput.textContent = 'Treebark library not loaded. Please check the console for errors.';
        return;
    }
    
    // Example schemas
    const examples = {
        hello: {
            template: {
                json: `{
  "div": "Hello world"
}`,
                yaml: `div: "Hello world"`
            },
            data: {
                json: `{}`,
                yaml: `{}`
            }
        },
        card: {
            template: {
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
            data: {
                json: `{
  "title": "Product Title",
  "description": "This is a great product!"
}`,
                yaml: `title: "Product Title"
description: "This is a great product!"`
            }
        },
        list: {
            template: {
                json: `{
  "ul": {
    "$bind": "items",
    "$children": [
      { "li": "{{name}} - {{price}}" }
    ]
  }
}`,
                yaml: `ul:
  $bind: items
  $children:
    - li: "{{name}} - {{price}}"`
            },
            data: {
                json: `{
  "items": [
    { "name": "Laptop", "price": "$999" },
    { "name": "Phone", "price": "$499" }
  ]
}`,
                yaml: `items:
  - name: "Laptop"
    price: "$999"
  - name: "Phone"
    price: "$499"`
            }
        },
        template: {
            template: {
                json: `{
  "div": {
    "class": "product-card",
    "$children": [
      { "h2": "{{name}}" },
      { "p": "Only {{price}}!" }
    ]
  }
}`,
                yaml: `div:
  class: product-card
  $children:
    - h2: "{{name}}"
    - p: "Only {{price}}!"`
            },
            data: {
                json: `{
  "name": "Gaming Laptop",
  "price": "$1299"
}`,
                yaml: `name: "Gaming Laptop"
price: "$1299"`
            }
        },
        shorthand: {
            template: {
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
            data: {
                json: `{}`,
                yaml: `{}`
            }
        },
        mixed: {
            template: {
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
            },
            data: {
                json: `{}`,
                yaml: `{}`
            }
        }
    };
    
    // Get indent options
    function getIndentOptions() {
        const type = indentType.value;
        const size = parseInt(indentSize.value, 10);
        
        if (type === 'none') {
            return undefined;
        } else if (type === 'tabs') {
            return '\t';
        } else {
            return size;
        }
    }
    
    // Load example function
    window.loadExample = function(exampleKey) {
        const example = examples[exampleKey];
        if (example) {
            templateEditor.value = example.template[currentFormat];
            dataEditor.value = example.data[currentFormat];
            renderSchema();
        }
    };
    
    // Format change handler
    formatRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentFormat = this.value;
            // Clear editors when switching formats
            templateEditor.value = '';
            dataEditor.value = '';
            htmlOutput.textContent = '';
        });
    });
    
    // Indent controls change handler
    [indentType, indentSize].forEach(control => {
        control.addEventListener('change', renderSchema);
    });
    
    // Render function
    function renderSchema() {
        const templateText = templateEditor.value.trim();
        const dataText = dataEditor.value.trim();
        
        if (!templateText) {
            htmlOutput.textContent = 'Enter a template to see the HTML output';
            return;
        }
        
        try {
            let template, data = {};
            
            if (currentFormat === 'yaml') {
                // For now, show a message that YAML requires a parser
                htmlOutput.textContent = 'YAML parsing requires the js-yaml library. Please use JSON format in this playground.';
                return;
            } else {
                template = JSON.parse(templateText);
                if (dataText) {
                    data = JSON.parse(dataText);
                }
            }
            
            // Get indent options
            const indentOptions = getIndentOptions();
            
            // Generate HTML string with indentation
            const htmlString = window.Treebark.renderToString(template, { 
                data: data,
                indent: indentOptions 
            });
            htmlOutput.textContent = htmlString;
            
        } catch (error) {
            htmlOutput.textContent = `Error: ${error.message}`;
        }
    }
    
    // Editor input handlers
    templateEditor.addEventListener('input', renderSchema);
    dataEditor.addEventListener('input', renderSchema);
    
    // Load initial example
    loadExample('hello');
});
</script>