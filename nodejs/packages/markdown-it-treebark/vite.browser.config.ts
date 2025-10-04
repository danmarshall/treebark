import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'browser',
    lib: {
      entry: 'src/index.ts',
      name: 'MarkdownItTreebark',
      formats: ['umd'],
      fileName: () => 'markdown-it-treebark-browser.js'
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
    minify: false
  },
  resolve: {
    alias: {
      'treebark': path.resolve(__dirname, '../treebark/src/string.ts')
    }
  }
});
