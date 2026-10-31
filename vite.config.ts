/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    test: {
    environment: 'node', // nuestras funciones puras no necesitan DOM
    include: ['src/**/*.test.ts'],
  },
  
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
     '@': fileURLToPath(new URL('./src', import.meta.url)),
   },
  },
})