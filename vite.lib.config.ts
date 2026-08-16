import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { createAutoImportPlugin } from './vite.auto-import.config'

const externalPackages = [
  'vue',
  'pinia',
  'jsbarcode',
  'qrcode',
  'codemirror',
  '@codemirror/lang-javascript',
  '@codemirror/lang-json',
  '@codemirror/state',
  '@codemirror/theme-one-dark',
  '@codemirror/view',
]

export default defineConfig({
  plugins: [createAutoImportPlugin(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
      cssFileName: 'style',
    },
    rollupOptions: {
      external: id => externalPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`)),
      output: {
        exports: 'named',
      },
    },
  },
})
