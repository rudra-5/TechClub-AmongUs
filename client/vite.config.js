import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_CLIENT_PORT || '3000'),
    proxy: {
      '/api': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  define: {
    // Ensure environment variables are properly embedded in production build
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(process.env.VITE_SERVER_URL)
  }
})
