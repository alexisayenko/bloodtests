import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    __BUILD_INFO__: JSON.stringify(process.env.BUILD_INFO || ''),
  },
})
