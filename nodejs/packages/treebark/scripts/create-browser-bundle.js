const fs = require('fs');
const path = require('path');

// Read the ES module files
const commonJs = fs.readFileSync(path.join(__dirname, '../dist/browser/common.js'), 'utf8');
const domJs = fs.readFileSync(path.join(__dirname, '../dist/browser/dom.js'), 'utf8');

// Remove import statements and create a single bundle
const commonCode = commonJs
  .replace(/^export /gm, '')
  .replace(/^import .+;$/gm, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '');

const domCode = domJs
  .replace(/^import .+;$/gm, '')
  .replace(/^export /gm, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '');

const bundle = `// Treebark browser bundle - generated from actual treebark library
${commonCode}

${domCode}

// Export the renderToDOM function globally
window.renderToDOM = renderToDOM;
`;

// Write the bundle
fs.writeFileSync(path.join(__dirname, '../dist/treebark-browser.js'), bundle);
console.log('Browser bundle created at dist/treebark-browser.js');