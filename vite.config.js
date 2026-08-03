import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('react-helmet-async') || id.includes('react-hot-toast') || id.includes('react-hook-form')) {
              return 'vendor-ui';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            if (id.includes('date-fns') || id.includes('clsx')) {
              return 'vendor-utils';
            }
            return 'vendor-other';
          }

          // Feature chunks
          if (id.includes('/src/pages/meeting/MeetingRoom.jsx') ||
              id.includes('/src/components/meeting/Whiteboard.jsx') ||
              id.includes('/src/components/meeting/Polls.jsx') ||
              id.includes('/src/components/meeting/BreakoutRooms.jsx') ||
              id.includes('/src/components/meeting/Captions.jsx') ||
              id.includes('/src/components/meeting/HostControls.jsx') ||
              id.includes('/src/components/meeting/FileSharing.jsx') ||
              id.includes('/src/components/meeting/MeetingNotes.jsx') ||
              id.includes('/src/components/meeting/VoiceCommandsUI.jsx') ||
              id.includes('/src/components/meeting/AIMeetingSummary.jsx')) {
            return 'meeting-room';
          }
          
          if (id.includes('/src/pages/dashboards/')) {
            return 'dashboards';
          }
          
          if (id.includes('/src/pages/auth/')) {
            return 'auth-pages';
          }
          
          if (id.includes('/src/pages/settings/')) {
            return 'settings-pages';
          }
          
          if (id.includes('/src/pages/admin/')) {
            return 'admin-pages';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    target: 'es2020',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-helmet-async',
      'react-hot-toast',
      'react-hook-form',
      'recharts',
      'clsx',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
  },
});
