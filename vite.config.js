import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // Raise limit to 1000kb to suppress warnings
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],         // Core React
          router: ['react-router-dom'],            // Routing
          ui: ['your-ui-library'],                 // e.g. antd, mui, chakra
        }
      }
    }
  }
})
