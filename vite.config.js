import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5174 },
  // The lazily loaded hero relief (three.js + react-three-fiber) is one ~940 kB chunk by design.
  build: { chunkSizeWarningLimit: 1000 },
})
