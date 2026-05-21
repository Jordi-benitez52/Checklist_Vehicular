import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    allowedHosts: [
      'df29-2806-250-430-cab1-00-1cf6.ngrok-free.app',
      '3fe9-2806-250-430-cab1-00-1cf6.ngrok-free.app',
      'localhost',
      '127.0.0.1',
    ],
  },
  responseHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'ngrok-skip-browser-warning': 'true',
  },
})
