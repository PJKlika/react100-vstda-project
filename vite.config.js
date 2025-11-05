import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This forwards /api requests to your Express server on 3001
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // not needed, kept for reference
      }
    }
    // optional:
    // port: 5173
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    files: './tests/**/*.test.jsx',
  },
})
