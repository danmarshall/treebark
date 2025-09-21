const fs = require('fs');
const path = require('path');

// Read the ES module files
const commonJs = fs.readFileSync(path.join(__dirname, '../dist/browser/common.js'), 'utf8');
const stringJs = fs.readFileSync(path.join(__dirname, '../dist/browser/string.js'), 'utf8');
const domJs = fs.readFileSync(path.join(__dirname, '../dist/browser/dom.js'), 'utf8');

// Remove import statements and create a single bundle
const commonCode = commonJs
  .replace(/^export /gm, '')
  .replace(/^import .+;$/gm, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '');

const stringCode = stringJs
  .replace(/^import .+;$/gm, '')
  .replace(/^export /gm, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '')
  .replace(/function render\(/g, 'function renderStringInternal(') // Rename function definition
  .replace(/ render\(/g, ' renderStringInternal(') // Replace all calls to render
  // Fix indentation for bound children
  .replace(
    /const content = bound\.map\(item => \$children\.map\(\(c\) => renderStringInternal\(c, item, childContext\)\)\.join\(separator\)\)\.join\(separator\);/g,
    `const content = bound.map(item => 
      $children.map((c) => {
        const result = renderStringInternal(c, item, childContext);
        if (context.indentStr && result.startsWith('<')) {
          return context.indentStr.repeat(childContext.level) + result;
        }
        return result;
      }).join(separator)
    ).join(separator);`
  );

const domCode = domJs
  .replace(/^import .+;$/gm, '')
  .replace(/^export /gm, '')
  .replace(/\/\/# sourceMappingURL=.*$/gm, '')
  .replace(/function render\(/g, 'function renderDOMInternal(') // Rename function definition
  .replace(/ render\(/g, ' renderDOMInternal('); // Replace all calls to render

const bundle = `// Treebark browser bundle - generated from actual treebark library
${commonCode}

${stringCode}

${domCode}

// Export the functions globally
window.renderToDOM = renderToDOM;
window.renderToString = renderToString;
`;

// Write the bundle
fs.writeFileSync(path.join(__dirname, '../dist/treebark-browser.js'), bundle);
console.log('Browser bundle created at dist/treebark-browser.js');