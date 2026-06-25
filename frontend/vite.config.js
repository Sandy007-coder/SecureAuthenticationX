import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_TARGET = env.VITE_API_BASE_URL || 'http://localhost:5000';

  return {
    plugins: [react()],

    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: API_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 3000,
      strictPort: true,
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react:  ['react', 'react-dom'],
            router: ['react-router-dom'],
            icons:  ['lucide-react'],
          },
        },
      },
    },
  };
});