import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        // THE MAGIC LINE: Route imports directly to the raw package folder
        '@school/ui': resolve(__dirname, '../../packages/ui/index.jsx').replace(/\\/g, '/')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})