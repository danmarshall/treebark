// Global type declarations for markdown playground

// js-yaml from CDN
declare const jsyaml: {
  dump(obj: any, options?: { indent?: number; lineWidth?: number }): string;
  load(yamlStr: string): any;
};

// markdown-it from CDN
declare const markdownit: () => MarkdownIt;

interface MarkdownIt {
  use(plugin: any, options?: any): MarkdownIt;
  render(markdown: string): string;
}

// markdown-it-treebark from browser build
declare const MarkdownItTreebark: (md: MarkdownIt, options?: { data?: any; indent?: string | boolean }) => void;
