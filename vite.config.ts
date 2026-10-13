import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // relative base so it works on GitHub Pages and custom subpaths
  plugins: [react()],
  server: {
    host: true, // listen on all local IPs so mobile devices can access via Wi-Fi
    port: 5173,
  }
})
