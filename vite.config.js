import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preload the display face so the hero wordmark never reflows when it arrives.
function preloadDisplayFont() {
  return {
    name: 'preload-display-font',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const file = Object.keys(ctx.bundle).find((f) => /big-shoulders-display-latin-wght-normal.*\.woff2$/.test(f));
        if (!file) return html;
        const tag = `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${file}" />`;
        return html.replace('</head>', `    ${tag}\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadDisplayFont()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 650, // three.js is code-split and loaded on idle, off the critical path
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
});
