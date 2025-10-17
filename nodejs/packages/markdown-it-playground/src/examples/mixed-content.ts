import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';
import { treebarkTemplates } from './templates.js';

export const mixedContent: MarkdownExample = {
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
};
