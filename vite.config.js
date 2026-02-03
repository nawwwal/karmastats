import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  plugins: [react()],
  build: {
    outDir: ssrBuild ? 'dist/server' : 'dist/client',
    rollupOptions: {
      input: ssrBuild ? undefined : 'index.html'
    }
  },
  ssr: {
    noExternal: ['react-helmet-async']
  }
}))
