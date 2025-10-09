#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Add .js to relative imports that don't already have an extension
      content = content.replace(/from ['"](\.\/.+?)(?<!\.js)['"]/g, 'from \'$1.js\'');
      content = content.replace(/export \* from ['"](\.\/.+?)(?<!\.js)['"]/g, 'export * from \'$1.js\'');
      content = content.replace(/export \{[^}]+\} from ['"](\.\/.+?)(?<!\.js)['"]/g, (match) => {
        return match.replace(/from ['"](\.\/.+?)(?<!\.js)['"]/, 'from \'$1.js\'');
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

const esmDir = path.join(__dirname, 'dist', 'esm');
if (fs.existsSync(esmDir)) {
  addJsExtensions(esmDir);
  
  // Copy package.json to mark ESM directory as module
  const esmPackageJson = path.join(esmDir, 'package.json');
  fs.copyFileSync(
    path.join(__dirname, 'src', 'esm-package.json'),
    esmPackageJson
  );
  
  console.log('Added .js extensions to ESM imports and marked directory as ESM');
}
