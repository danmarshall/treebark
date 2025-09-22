import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/browser.ts'),
      name: 'Treebark',
      formats: ['umd'],
      fileName: () => 'treebark-browser.js',
    },
    rollupOptions: {
      output: {
        globals: {
          // No external dependencies for the browser bundle
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
  },
})