import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || 5173),
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || 5000),
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('swiper')) {
              return 'swiper';
            }
            if (id.includes('react-icons')) {
              return 'icons';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
          }
        }
      }
    }
  },
})
