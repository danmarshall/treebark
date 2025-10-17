// Global type declarations for markdown playground

import type * as jsyaml from 'js-yaml';
import type MarkdownIt from 'markdown-it';

// Global declarations for CDN-loaded libraries
declare global {
  const jsyaml: typeof import('js-yaml');
  const markdownit: typeof import('markdown-it');
  
  // markdown-it-treebark from browser build
  const MarkdownItTreebark: (md: MarkdownIt, options?: { data?: any; indent?: string | boolean }) => void;
}
