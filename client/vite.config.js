import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '')).replace(/\/$/, '');

  return {
    plugins: [
      react(),
      {
        name: 'html-transform-og',
        transformIndexHtml(html) {
          if (!siteUrl) return html;
          return html
            .replaceAll('content="/og-image.png"', `content="${siteUrl}/og-image.png"`)
            .replaceAll('href="/og-image.png"', `href="${siteUrl}/og-image.png"`);
        },
      },
    ],
  server: {
    port: 5173,
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['axios', 'sweetalert2'],
          'vendor-three': ['three'],
        },
      },
    },
  },
};
});
