// Global type declarations for browser playground

import type * as jsyaml from 'js-yaml';

// Global declarations for CDN-loaded libraries
declare global {
  const jsyaml: typeof import('js-yaml');
  
  // Treebark from browser build
  const Treebark: {
    renderToString(input: { template: any; data: any }, options?: { indent?: string | boolean }): string;
  };
}
