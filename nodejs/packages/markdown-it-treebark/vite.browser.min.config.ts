import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'browser',
    emptyOutDir: false, // Don't clear the directory, as we're adding to it
    lib: {
      entry: 'src/index.ts',
      name: 'MarkdownItTreebark',
      formats: ['umd'],
      fileName: () => 'markdown-it-treebark-browser.min.js'
    },
    rollupOptions: {
      external: ['markdown-it'],
      output: {
        globals: {
          'markdown-it': 'markdownit'
        }
      }
    },
    sourcemap: true,
    minify: true
  },
  resolve: {
    alias: {
      'treebark': path.resolve(__dirname, '../treebark/src/string.ts')
    }
  }
});
