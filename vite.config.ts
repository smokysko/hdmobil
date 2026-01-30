import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  root: './client',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    outDir: '../dist',
  },
  optimizeDeps: {
    include: [
      '@tanstack/react-query',
      'sonner',
      '@hookform/resolvers/zod',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-separator',
      '@radix-ui/react-select',
      '@radix-ui/react-radio-group',
      'next-themes',
    ],
  },
})
