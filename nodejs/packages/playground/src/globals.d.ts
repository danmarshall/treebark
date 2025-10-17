// Global type declarations for browser playground

// js-yaml from CDN
declare const jsyaml: {
  dump(obj: any, options?: { indent?: number; lineWidth?: number }): string;
  load(yamlStr: string): any;
};

// Treebark from browser build
declare const Treebark: {
  renderToString(input: { template: any; data: any }, options?: { indent?: string | boolean }): string;
};
