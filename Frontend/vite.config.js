import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Ez engedi ki a hálózatot a Dockerből a te böngésződ felé!
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173
    },
    watch: {
      usePolling: true, // Ez kell ahhoz, hogy a Windows és a Docker között működjön az azonnali frissítés
      interval: 100
    }
  }
})