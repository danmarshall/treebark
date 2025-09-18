#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get the repository root directory (one level up from docs folder)
const repoRoot = path.dirname(path.dirname(__filename));
const readmePath = path.join(repoRoot, 'README.md');
const docsIndexPath = path.join(path.dirname(__filename), 'index.md');

// Front matter for the index page
const frontMatter = `---
layout: default
title: Home
description: Safe tree structures for Markdown and content-driven apps
---

`;

function generateDocsIndex() {
    try {
        // Read the README.md file
        const readmeContent = fs.readFileSync(readmePath, 'utf8');
        
        // Combine front matter with README content
        const indexContent = frontMatter + readmeContent;
        
        // Ensure docs directory exists
        const docsDir = path.dirname(docsIndexPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        // Write the index.md file
        fs.writeFileSync(docsIndexPath, indexContent);
        
        console.log('✅ Successfully generated docs/index.md');
        console.log(`📄 Combined front matter with README.md (${readmeContent.length} characters)`);
        
    } catch (error) {
        console.error('❌ Error generating docs/index.md:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    generateDocsIndex();
}

module.exports = generateDocsIndex;