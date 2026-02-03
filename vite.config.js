import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  plugins: [react()],
  build: {
    outDir: ssrBuild ? 'dist/server' : 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: ssrBuild ? undefined : 'index.html',
      output: ssrBuild ? undefined : {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) return 'jspdf';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'charts';
            if (id.includes('react-dom')) return 'react-dom';
            return 'vendor';
          }
        }
      }
    }
  }
}))
