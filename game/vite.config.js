import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  // If your site is at https://username.github.io/waterlooTBOG/, use '/game/'
  // If your site is at a custom domain, use '/game/' or '/' depending on your setup
  base: '/game/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5173,
    strictPort: false
  }
})

