import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths({ root: __dirname })],
  resolve: {
    alias: {
      '@scss': resolve(__dirname, 'src/scss'),
      '@components': resolve(__dirname, 'src/components'),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@scss/variables" as *;`,
        quietDeps: true
      }
    }
  },
})
