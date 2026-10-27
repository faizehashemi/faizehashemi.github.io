/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Builds the React pages as an ES-module bundle into ../pms/react/ (served by the same Worker as the legacy pages).
// The legacy router (pms/app/main.js) imports react/bridge.js only for pages switched to React (see src/bridge.tsx).
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src'), '@core': path.resolve(import.meta.dirname, '../pms/app/core') } },
    base: './',
    define: { 'process.env.NODE_ENV': '"production"' },   // library mode does not replace it; React and Radix read it
    build: {
        outDir: '../pms/react',
        emptyOutDir: true,
        lib: { entry: path.resolve(import.meta.dirname, 'src/bridge.tsx'), formats: ['es'], fileName: () => 'bridge.js', cssFileName: 'style' },
        rollupOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js', assetFileNames: (info) => (info.names?.[0] || '').endsWith('.css') ? 'style.css' : 'assets/[name]-[hash][extname]' } },
        target: 'es2022',
    },
    test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
