// Global type declarations for browser playground

// js-yaml from CDN - types provided by @types/js-yaml (hoisted to root)
declare const jsyaml: any;

// Treebark from browser build
declare const Treebark: {
  renderToString(input: { template: any; data: any }, options?: { indent?: string | boolean }): string;
};
