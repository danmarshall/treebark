// Global type declarations for markdown playground

// js-yaml from CDN - types provided by @types/js-yaml (hoisted to root)
declare const jsyaml: any;

// markdown-it from CDN - types provided by @types/markdown-it (hoisted to root)
declare const markdownit: any;

// markdown-it-treebark from browser build
declare const MarkdownItTreebark: (md: any, options?: { data?: any; indent?: string | boolean }) => void;
