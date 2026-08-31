import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'browser',
    emptyOutDir: false, // Don't clear the directory, as we're adding to it
    lib: {
      entry: 'src/react.browser.ts',
      name: 'Treebark',
      formats: ['umd'],
      fileName: () => 'treebark-react-browser.js'
    },
    rollupOptions: {
      // React is a peer dependency and is expected to be loaded separately
      external: ['react'],
      output: {
        extend: true,
        globals: {
          react: 'React'
        }
      }
    },
    sourcemap: true,
    minify: false
  }
});
