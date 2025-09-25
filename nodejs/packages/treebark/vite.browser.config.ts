import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'browser',
    lib: {
      entry: 'src/string.ts',
      name: 'Treebark',
      formats: ['umd'],
      fileName: () => 'treebark-browser.js'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: false
  }
});