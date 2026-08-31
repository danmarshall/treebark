import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../../../docs/js',
    lib: {
      entry: 'src/react-playground.ts',
      name: 'TreebarkReactPlayground',
      formats: ['iife'],
      fileName: () => 'react-playground.js'
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
