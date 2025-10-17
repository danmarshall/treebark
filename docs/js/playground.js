"use strict";
// Example templates and data - strongly typed
const examples = {
    'hello-world': {
        template: {
            div: {
                class: "greeting",
                $children: [
                    { h1: "Hello World!" },
                    { p: "Welcome to Treebark - safe HTML tree structures." }
                ]
            }
        },
        data: {}
    },
    'card-layout': {
        template: {
            div: {
                class: "product-card",
                $children: [
                    { h2: "{{name}}" },
                    { p: "{{description}}" },
                    {
                        div: {
                            class: "price",
                            $children: ["{{price}}"]
                        }
                    }
                ]
            }
        },
        data: {
            name: "Gaming Laptop",
            description: "High-performance laptop for gaming and development",
            price: "$1,299"
        }
    },
    'list-binding': {
        template: {
            ul: {
                class: "product-list",
                $bind: "products",
                $children: [
                    { li: "{{name}} - {{price}}" }
                ]
            }
        },
        data: {
            products: [
                { name: "Laptop", price: "$999" },
                { name: "Phone", price: "$499" },
                { name: "Tablet", price: "$299" }
            ]
        }
    },
    'user-profile': {
        template: {
            div: {
                class: "user-profile",
                $children: [
                    { h3: "{{name}}" },
                    { p: "Email: {{email}}" },
                    { p: "Skills: {{skills}}" }
                ]
            }
        },
        data: {
            name: "Alice Johnson",
            email: "alice@example.com",
            skills: "JavaScript, Python, React"
        }
    },
    'shorthand-syntax': {
        template: {
            div: [
                { h2: "Welcome" },
                { p: "This is much cleaner with shorthand array syntax!" },
                {
                    ul: [
                        { li: "Item 1" },
                        { li: "Item 2" },
                        { li: "Item 3" }
                    ]
                }
            ]
        },
        data: {}
    },
    'mixed-content': {
        template: {
            div: {
                $children: [
                    "Hello ",
                    {
                        span: {
                            style: {
                                color: "blue",
                                "font-weight": "bold"
                            },
                            $children: ["World"]
                        }
                    },
                    "! This mixes text and elements."
                ]
            }
        },
        data: {}
    },
    'stack-of-cards': {
        template: {
            div: {
                class: "cards-container",
                $children: [
                    { h2: "Team Members" },
                    {
                        div: {
                            class: "cards-stack",
                            $bind: "team",
                            $children: [
                                {
                                    div: {
                                        class: "member-card",
                                        $children: [
                                            { h3: "{{name}}" },
                                            { p: "{{role}}" },
                                            { p: "Experience: {{experience}} years" }
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
            team: [
                { name: "Alice Smith", role: "Frontend Developer", experience: 5 },
                { name: "Bob Johnson", role: "Backend Developer", experience: 8 },
                { name: "Carol Brown", role: "UI/UX Designer", experience: 3 }
            ]
        }
    },
    'array-bind-property': {
        label: "Array Binding: $bind to Property",
        template: {
            ul: {
                $bind: "products",
                $children: [
                    { li: "{{name}} — {{price}}" }
                ]
            }
        },
        data: {
            products: [
                { name: "Laptop", price: "$999" },
                { name: "Phone", price: "$499" }
            ]
        }
    },
    'array-bind-dot': {
        label: "Array Binding: $bind with \".\"",
        template: {
            ul: {
                $bind: ".",
                $children: [
                    { li: "{{name}} — {{price}}" }
                ]
            }
        },
        data: [
            { name: "Laptop", price: "$999" },
            { name: "Phone", price: "$499" }
        ]
    },
    'parent-property-access': {
        label: "Access Parent Property with double dot (..) notation",
        template: {
            div: {
                $bind: "customers",
                $children: [
                    { h2: "{{name}}" },
                    { p: "Company: {{..companyName}}" },
                    {
                        ul: {
                            $bind: "orders",
                            $children: [
                                {
                                    li: {
                                        $children: [
                                            "Order #{{orderId}} for {{..name}}: ",
                                            {
                                                ul: {
                                                    $bind: "products",
                                                    $children: [
                                                        {
                                                            li: {
                                                                $children: [
                                                                    {
                                                                        a: {
                                                                            href: "/customer/{{../../..customerId}}/order/{{..orderId}}/product/{{productId}}",
                                                                            $children: ["{{name}} - {{price}}"]
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
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
            companyName: "ACME Corp",
            customerId: "cust123",
            customers: [
                {
                    name: "Alice Johnson",
                    orders: [
                        {
                            orderId: "ord456",
                            products: [
                                { productId: "prod789", name: "Laptop", price: "$999" },
                                { productId: "prod101", name: "Mouse", price: "$25" }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    'conditional-if-basic': {
        label: "Conditional: Basic $if Tag",
        template: {
            div: {
                class: "user-greeting",
                $children: [
                    { h2: "User Dashboard" },
                    {
                        $if: {
                            $check: "isLoggedIn",
                            $then: {
                                div: {
                                    $children: [
                                        { p: "Welcome back, {{username}}!" },
                                        { a: { href: "/profile", $children: ["View Profile"] } }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $if: {
                            $check: "isLoggedIn",
                            $not: true,
                            $then: {
                                div: {
                                    $children: [
                                        { p: "Please log in to continue." },
                                        { a: { href: "/login", $children: ["Login"] } }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        },
        data: {
            isLoggedIn: true,
            username: "Alice"
        }
    },
    'conditional-if-admin': {
        label: "Conditional: Role-Based Access",
        template: {
            div: {
                class: "user-panel",
                $children: [
                    { h2: "Welcome {{user.name}}!" },
                    { p: "Role: {{user.role}}" },
                    {
                        $if: {
                            $check: "user.isAdmin",
                            $then: {
                                div: {
                                    class: "admin-panel",
                                    $children: [
                                        { h3: "Admin Tools" },
                                        {
                                            ul: [
                                                {
                                                    li: {
                                                        $children: [
                                                            { a: { href: "/admin/users", $children: ["Manage Users"] } }
                                                        ]
                                                    }
                                                },
                                                {
                                                    li: {
                                                        $children: [
                                                            { a: { href: "/admin/settings", $children: ["System Settings"] } }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $if: {
                            $check: "user.isPremium",
                            $then: {
                                div: {
                                    class: "premium-badge",
                                    style: {
                                        background: "gold",
                                        padding: "5px"
                                    },
                                    $children: ["⭐ Premium Member"]
                                }
                            }
                        }
                    }
                ]
            }
        },
        data: {
            user: {
                name: "Alice Johnson",
                role: "Administrator",
                isAdmin: true,
                isPremium: true
            }
        }
    },
    'conditional-if-inventory': {
        label: "Conditional: Stock Status with $not",
        template: {
            div: {
                class: "product-inventory",
                $children: [
                    { h2: "Product Inventory" },
                    {
                        div: {
                            $bind: "products",
                            $children: [
                                {
                                    div: {
                                        class: "product-item",
                                        $children: [
                                            { h3: "{{name}}" },
                                            { p: "Price: {{price}}" },
                                            {
                                                $if: {
                                                    $check: "inStock",
                                                    $then: {
                                                        p: {
                                                            style: { color: "green" },
                                                            $children: ["✓ In Stock ({{quantity}} available)"]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                $if: {
                                                    $check: "inStock",
                                                    $not: true,
                                                    $then: {
                                                        p: {
                                                            style: { color: "red" },
                                                            $children: ["✗ Out of Stock"]
                                                        }
                                                    }
                                                }
                                            }
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
                { name: "Laptop", price: "$999", inStock: true, quantity: 15 },
                { name: "Phone", price: "$499", inStock: false, quantity: 0 },
                { name: "Tablet", price: "$299", inStock: true, quantity: 8 }
            ]
        }
    },
    'conditional-if-nested': {
        label: "Conditional: Nested Conditions",
        template: {
            div: {
                class: "access-control",
                $children: [
                    { h2: "Document Access" },
                    {
                        $if: {
                            $check: "hasPermission",
                            $then: {
                                div: {
                                    class: "content-area",
                                    $children: [
                                        { h3: "Secure Document" },
                                        { p: "This is protected content." },
                                        {
                                            $if: {
                                                $check: "isVerified",
                                                $then: {
                                                    div: {
                                                        style: {
                                                            background: "lightgreen",
                                                            padding: "10px"
                                                        },
                                                        $children: [
                                                            { strong: "✓ Verified Access" },
                                                            { p: "You have full access to this document." }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            $if: {
                                                $check: "isVerified",
                                                $not: true,
                                                $then: {
                                                    p: {
                                                        style: { color: "orange" },
                                                        $children: ["⚠ Limited access - verification pending"]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $if: {
                            $check: "hasPermission",
                            $not: true,
                            $then: {
                                div: {
                                    style: {
                                        background: "#ffe0e0",
                                        padding: "15px",
                                        border: "2px solid red"
                                    },
                                    $children: [
                                        { strong: "Access Denied" },
                                        { p: "You do not have permission to view this content." }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        },
        data: {
            hasPermission: true,
            isVerified: true
        }
    },
    'conditional-then-else': {
        label: "Conditional: $then and $else Branching",
        template: {
            div: {
                class: "auth-status",
                $children: [
                    { h2: "Authentication Status" },
                    {
                        $if: {
                            $check: "isLoggedIn",
                            $then: {
                                div: {
                                    class: "logged-in",
                                    $children: [
                                        { p: "Hello, {{username}}!" },
                                        { a: { href: "/logout", $children: ["Logout"] } }
                                    ]
                                }
                            },
                            $else: {
                                div: {
                                    class: "logged-out",
                                    $children: [
                                        { p: "Please log in to continue." },
                                        { a: { href: "/login", class: "btn", $children: ["Login"] } }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        },
        data: {
            isLoggedIn: true,
            username: "Alice"
        }
    },
    'conditional-comparison-operators': {
        label: "Conditional: Comparison Operators",
        template: {
            div: {
                class: "access-control",
                $children: [
                    { h2: "Age-Based Access (Age: {{age}})" },
                    {
                        $if: {
                            $check: "age",
                            "$<": 13,
                            $then: {
                                p: {
                                    style: { color: "red" },
                                    $children: ["❌ Child account - Restricted access"]
                                }
                            }
                        }
                    },
                    {
                        $if: {
                            $check: "age",
                            "$>=": 13,
                            "$<": 18,
                            $then: {
                                p: {
                                    style: { color: "orange" },
                                    $children: ["⚠️ Teen account - Limited access"]
                                }
                            }
                        }
                    },
                    {
                        $if: {
                            $check: "age",
                            "$>=": 18,
                            $then: {
                                p: {
                                    style: { color: "green" },
                                    $children: ["✓ Full access granted"]
                                }
                            }
                        }
                    },
                    { hr: {} },
                    { h3: "Role-Based Access" },
                    {
                        $if: {
                            $check: "role",
                            $in: ["admin", "moderator", "editor"],
                            $then: {
                                p: {
                                    style: { color: "blue" },
                                    $children: ["⭐ Special privileges granted"]
                                }
                            },
                            $else: { p: "Standard user privileges" }
                        }
                    }
                ]
            }
        },
        data: {
            age: 25,
            role: "admin"
        }
    },
    'conditional-join-or': {
        label: "Conditional: OR Logic with $join",
        template: {
            div: {
                class: "pricing",
                $children: [
                    { h2: "Ticket Pricing" },
                    { p: "Age: {{age}}" },
                    {
                        $if: {
                            $check: "age",
                            "$>=": 18,
                            "$<=": 65,
                            $then: {
                                p: {
                                    style: { color: "green" },
                                    $children: ["✓ Standard adult rate: $50"]
                                }
                            },
                            $else: { p: "Discounted rate available" }
                        }
                    },
                    { hr: {} },
                    { h3: "Discount Eligibility (OR Logic)" },
                    {
                        $if: {
                            $check: "age",
                            "$<": 18,
                            "$>": 65,
                            $join: "OR",
                            $then: {
                                p: {
                                    style: { color: "blue" },
                                    $children: ["🎉 Special discount: $30 (child or senior)"]
                                }
                            },
                            $else: { p: "Standard rate: $50" }
                        }
                    }
                ]
            }
        },
        data: {
            age: 70
        }
    },
    'conditional-attribute-values': {
        label: "Conditional: Attribute Values",
        template: {
            div: {
                class: "status-dashboard",
                $children: [
                    { h2: "Server Status Dashboard" },
                    {
                        div: {
                            class: {
                                $check: "status",
                                "$=": "online",
                                $then: "status-online",
                                $else: "status-offline"
                            },
                            style: {
                                $check: "status",
                                "$=": "online",
                                $then: "color: green; font-weight: bold;",
                                $else: "color: red; font-weight: bold;"
                            },
                            $children: [
                                { strong: "Server Status: " },
                                { span: "{{status}}" }
                            ]
                        }
                    },
                    { hr: {} },
                    { h3: "Performance Score: {{score}}" },
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
                                $then: "color: green; font-weight: bold;",
                                $else: "color: orange;"
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
                    }
                ]
            }
        },
        data: {
            status: "online",
            score: 95
        }
    },
    'style-objects': {
        label: "Styling with Style Objects",
        template: {
            div: {
                class: "style-demo",
                $children: [
                    { h2: "Style Object Examples" },
                    { p: "Style attributes now use structured objects for security and type safety." },
                    { hr: {} },
                    { h3: "Basic Styling" },
                    {
                        div: {
                            style: {
                                color: "{{primaryColor}}",
                                "font-size": "18px",
                                padding: "10px",
                                border: "2px solid {{primaryColor}}",
                                "border-radius": "8px",
                                "background-color": "#f0f0f0"
                            },
                            $children: ["This div has structured styles with interpolated color!"]
                        }
                    },
                    { hr: {} },
                    { h3: "Conditional Styles" },
                    {
                        div: {
                            style: {
                                $check: "theme",
                                "$=": "dark",
                                $then: {
                                    "background-color": "#333",
                                    color: "#fff",
                                    padding: "15px",
                                    "border-radius": "5px"
                                },
                                $else: {
                                    "background-color": "#fff",
                                    color: "#333",
                                    padding: "15px",
                                    border: "1px solid #ccc",
                                    "border-radius": "5px"
                                }
                            },
                            $children: ["This div changes styles based on theme: {{theme}}"]
                        }
                    },
                    { hr: {} },
                    { h3: "Dynamic Status Colors" },
                    {
                        div: {
                            $bind: "statuses",
                            $children: [
                                {
                                    div: {
                                        style: {
                                            $check: "status",
                                            "$=": "success",
                                            $then: {
                                                color: "green",
                                                "font-weight": "bold",
                                                padding: "10px",
                                                margin: "5px 0",
                                                "border-left": "4px solid green"
                                            },
                                            $else: {
                                                color: "red",
                                                "font-weight": "bold",
                                                padding: "10px",
                                                margin: "5px 0",
                                                "border-left": "4px solid red"
                                            }
                                        },
                                        $children: ["{{message}} ({{status}})"]
                                    }
                                }
                            ]
                        }
                    },
                    { hr: {} },
                    { h3: "Flexbox Layout" },
                    {
                        div: {
                            style: {
                                display: "flex",
                                gap: "10px",
                                "align-items": "center",
                                "justify-content": "space-between",
                                padding: "10px",
                                "background-color": "#e3f2fd"
                            },
                            $children: [
                                {
                                    span: {
                                        style: { "font-weight": "bold" },
                                        $children: ["Left"]
                                    }
                                },
                                { span: "Center" },
                                {
                                    span: {
                                        style: { "font-style": "italic" },
                                        $children: ["Right"]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        data: {
            primaryColor: "#3f51b5",
            theme: "dark",
            statuses: [
                { status: "success", message: "Operation completed successfully" },
                { status: "error", message: "Operation failed" },
                { status: "success", message: "All tests passed" }
            ]
        }
    }
};
let currentTemplateFormat = 'json';
// Get DOM elements
const templateEditor = document.getElementById('template-editor');
const dataEditor = document.getElementById('data-editor');
const htmlOutput = document.getElementById('html-output');
const errorDisplay = document.getElementById('error-display');
const indentType = document.getElementById('indent-type');
const indentSize = document.getElementById('indent-size');
const templateFormatSelect = document.getElementById('template-format');
// Convert JSON to YAML string
function jsonToYaml(obj) {
    return jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
}
// Convert YAML to JSON object
function yamlToJson(yamlStr) {
    return jsyaml.load(yamlStr);
}
// Switch template format
function switchTemplateFormat() {
    const newFormat = templateFormatSelect.value;
    const currentContent = templateEditor.value.trim();
    if (!currentContent) {
        currentTemplateFormat = newFormat;
        return;
    }
    try {
        let template;
        // Parse current content based on current format
        if (currentTemplateFormat === 'json') {
            template = JSON.parse(currentContent);
        }
        else {
            template = yamlToJson(currentContent);
        }
        // Convert to new format
        if (newFormat === 'json') {
            templateEditor.value = JSON.stringify(template, null, 2);
        }
        else {
            templateEditor.value = jsonToYaml(template);
        }
        currentTemplateFormat = newFormat;
        updateOutput();
    }
    catch (e) {
        // If conversion fails, just switch format without converting
        errorDisplay.innerHTML = '<div class="log-warn">⚠️ Could not convert format: ' + escapeHtml(e.message) + '.</div>';
        errorDisplay.style.display = 'block';
        currentTemplateFormat = newFormat;
    }
}
// Update output when inputs change
function updateOutput() {
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
        let template;
        try {
            if (currentTemplateFormat === 'json') {
                template = JSON.parse(templateText);
            }
            else {
                template = yamlToJson(templateText);
            }
        }
        catch (e) {
            throw new Error('Invalid ' + currentTemplateFormat.toUpperCase() + ' in template: ' + e.message);
        }
        // Parse data
        let data = {};
        if (dataText) {
            try {
                data = JSON.parse(dataText);
            }
            catch (e) {
                throw new Error('Invalid JSON in data: ' + e.message);
            }
        }
        // Get indent options
        let indent = false;
        if (indentType.value !== 'none') {
            const size = parseInt(indentSize.value) || 2;
            indent = indentType.value === 'tabs' ? '\t'.repeat(size) : ' '.repeat(size);
        }
        // Capture console logs during rendering
        const logs = [];
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;
        console.error = (msg) => { logs.push({ level: 'error', message: msg }); originalError(msg); };
        console.warn = (msg) => { logs.push({ level: 'warn', message: msg }); originalWarn(msg); };
        console.log = (msg) => { logs.push({ level: 'log', message: msg }); originalLog(msg); };
        try {
            // Render using treebark
            const input = { template, data };
            const options = { indent };
            const html = Treebark.renderToString(input, options);
            htmlOutput.textContent = html;
        }
        finally {
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
    }
    catch (error) {
        errorDisplay.innerHTML = '<div class="log-error">❌ Error: ' + escapeHtml(error.message) + '</div>';
        errorDisplay.style.display = 'block';
        htmlOutput.textContent = '';
    }
}
// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// Load example
function loadExample(exampleId) {
    const example = examples[exampleId];
    if (example) {
        // Display template in the current format
        if (currentTemplateFormat === 'json') {
            templateEditor.value = JSON.stringify(example.template, null, 2);
        }
        else {
            templateEditor.value = jsonToYaml(example.template);
        }
        dataEditor.value = JSON.stringify(example.data, null, 2);
        updateOutput();
    }
}
// Populate dropdown from examples
function populateExampleDropdown() {
    const select = document.getElementById('example-select');
    const exampleIds = Object.keys(examples);
    // Add options for each example
    exampleIds.forEach(exampleId => {
        const option = document.createElement('option');
        option.value = exampleId;
        option.textContent = examples[exampleId].label || exampleId;
        select.appendChild(option);
    });
    // Auto-select and load the first example
    if (exampleIds.length > 0) {
        select.value = exampleIds[0];
        loadExample(exampleIds[0]);
    }
}
// Load example from dropdown
function loadExampleFromDropdown() {
    const select = document.getElementById('example-select');
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
window.loadExampleFromDropdown = loadExampleFromDropdown;
window.switchTemplateFormat = switchTemplateFormat;
