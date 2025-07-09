import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    plugins: [react()],
    base: './', // Add this for correct asset paths in production
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },
    resolve: {
      alias: {
        '@':            path.resolve(__dirname, '.'),
        '@components':  path.resolve(__dirname, 'components'),
        '@utils':       path.resolve(__dirname, 'utils'),
      },
    },
  };
});
