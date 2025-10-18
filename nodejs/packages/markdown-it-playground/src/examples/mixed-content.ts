import type { MarkdownExample } from './types.js';
import type { TemplateElement } from '../../../treebark/dist/types.js';
import { treebark } from './helpers.js';

const quickStart: TemplateElement = {
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

const featuresList: TemplateElement = {
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

export const mixedContent: MarkdownExample = {
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
    siteName: 'Treebark',
    packageName: 'treebark',
    features: [
      { title: 'Safe', description: 'XSS protection built-in' },
      { title: 'Fast', description: 'Optimized rendering' },
      { title: 'Simple', description: 'Easy to learn and use' }
    ]
  }
};
