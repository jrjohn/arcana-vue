import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/domain/**/*.ts',
        'src/data/**/*.ts',
        'src/presentation/**/*.vue',
        'src/presentation/**/*.ts',
        'src/router/**/*.ts'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/main.ts',
        'src/App.vue',
        'src/vite-env.d.ts',
        'src/data/dtos/**/*.ts',
        'src/domain/entities/user.entity.ts'
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 80,
        lines: 90
      }
    },
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/presentation': fileURLToPath(new URL('./src/presentation', import.meta.url)),
      '@/domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@/data': fileURLToPath(new URL('./src/data', import.meta.url))
    }
  }
})
