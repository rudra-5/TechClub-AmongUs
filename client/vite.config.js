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
        changeOrigin: true
      },
      '/socket.io': {
        target: process.env.VITE_SERVER_URL || 'http://localhost:3001',
        ws: true
      }
    }
  }
})
