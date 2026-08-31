import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'browser',
    emptyOutDir: false, // Don't clear the directory, as we're adding to it
    lib: {
      entry: 'src/dom.ts',
      name: 'Treebark',
      formats: ['umd'],
      fileName: () => 'treebark-dom-browser.js'
    },
    rollupOptions: {
      external: [],
      output: {
        extend: true,
        globals: {}
      }
    },
    sourcemap: true,
    minify: false
  }
});
