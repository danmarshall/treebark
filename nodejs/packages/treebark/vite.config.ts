import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Treebark',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `treebark.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {
          // Add any global dependencies here if needed
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});