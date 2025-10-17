import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../../../docs/js',
    lib: {
      entry: 'src/markdown-it-playground.ts',
      name: 'MarkdownItTreebarkPlayground',
      formats: ['iife'],
      fileName: () => 'markdown-it-playground.js'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: false,
    minify: false,
    emptyOutDir: false
  }
});
