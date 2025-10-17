import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../../../docs/js',
    lib: {
      entry: 'src/playground.ts',
      name: 'TreebarkPlayground',
      formats: ['iife'],
      fileName: () => 'playground.js'
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
