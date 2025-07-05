import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'localhost',
      '.replit.dev',
      'c4376731-ec98-4ae7-afde-6c575838ccc4-00-1gyobh8et8us4.sisko.replit.dev'
    ]
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: [
      'localhost',
      '.replit.dev',
      'c4376731-ec98-4ae7-afde-6c575838ccc4-00-1gyobh8et8us4.sisko.replit.dev'
    ]
  }
})
