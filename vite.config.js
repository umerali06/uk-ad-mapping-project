import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
    },
  },
  css: {
    postcss: './postcss.config.js',
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['maplibre-gl', 'chart.js', 'papaparse', 'topojson-client', 'fuse.js', '@turf/turf'],
        },
      },
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    cors: true,
  },
  optimizeDeps: {
    include: [
      'maplibre-gl', 
      'chart.js', 
      'papaparse', 
      'topojson-client', 
      'fuse.js', 
      '@turf/turf'
    ],
    exclude: ['@tailwindcss/forms', '@tailwindcss/typography', '@tailwindcss/aspect-ratio'],
  },
  plugins: [],
})
