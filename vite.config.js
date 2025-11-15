import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build optimizations
  build: {
    // Output directory (Firebase hosting expects 'dist')
    outDir: 'dist',
    
    // Generate source maps for production debugging (optional)
    sourcemap: false,
    
    // Minification settings
    minify: 'esbuild', // Fast and efficient
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React and React DOM together
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // React Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Firebase SDK
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Other vendors
            return 'vendor-other';
          }
          
          // Separate products data into its own chunk
          if (id.includes('/data/products.json')) {
            return 'data-products';
          }
        },
        
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/]
    },
    
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Reduce console output during build
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for debugging (set to true in production)
        drop_debugger: true
      }
    }
  },
  
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  
  // Preview server configuration (for testing production builds)
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  },
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    open: true
  }
})
