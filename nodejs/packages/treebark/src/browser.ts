// Browser-specific entry point for the playground
import { renderToString } from './string';

// Export for browser usage
export { renderToString };

// Global window assignment for browser usage
if (typeof window !== 'undefined') {
  (window as any).Treebark = {
    renderToString
  };
}