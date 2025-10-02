import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'browser',
    emptyOutDir: false, // Don't clear the directory, as we're adding to it
    lib: {
      entry: 'src/string.ts',
      name: 'Treebark',
      formats: ['umd'],
      fileName: () => 'treebark-browser.min.js'
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: []
      },
      format: {
        comments: false
      }
    }
  }
});
