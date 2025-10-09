import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'main.js',
        string: 'main-string.js'
      },
      output: {
        entryFileNames: '[name].bundle.js'
      }
    },
    minify: false,
    sourcemap: false
  }
});
