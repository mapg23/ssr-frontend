import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '"https://mapg23.github.io/ssr-frontend/',
  plugins: [react()],
})
