import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'giai-do-jsx-loader',
      async transform(code, id) {
        const normalizedId = id.replace(/\\/g, '/')
        if (!normalizedId.includes('/src/giai_do/src/') || !normalizedId.endsWith('.js')) {
          return null
        }

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
  ],
  server: {
    port: 5173,
  }
})
