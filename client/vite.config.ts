import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'react-vendor': ['react', 'react-dom'],
          // Router
          'router': ['@tanstack/react-router'],
          // Animation library
          'motion': ['motion'],
          // Supabase (heavy)
          'supabase': ['@supabase/supabase-js'],
          // Socket.io
          'socket': ['socket.io-client'],
          // i18n
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // UI utilities
          'ui-utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          // Radix UI
          'radix': ['@radix-ui/react-select', '@radix-ui/react-label'],
          // State & notifications
          'state': ['zustand', 'sonner'],
        },
      },
    },
  },
})
