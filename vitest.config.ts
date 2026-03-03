import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url' // เพิ่มตัวนี้

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // บอก Vitest ว่า @ หมายถึงโฟลเดอร์ root
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})