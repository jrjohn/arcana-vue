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
        'src/domain/entities/user.entity.ts',
        'src/data/repositories/interfaces/**/*.ts'
      ],
      // Recalibrated for vitest v4: the v8 provider now uses AST-aware
      // remapping (ast-v8-to-istanbul) — the legacy remapper and the
      // experimentalAstAwareRemapping toggle were removed in v4, so there is
      // no switch back to v3's measurement. The identical 792 tests that
      // measured 97.28%/97.28%/93.39% under v3 (main #51) measure ~89.4%/~89.9%
      // /~82.1% under v4's stricter per-node accounting (no app source changed).
      // Thresholds re-express the same effective bar in the new measurement
      // basis, with a small margin below observed coverage to absorb the ~0.3pt
      // run-to-run v8 nondeterminism on async branches (avoids a flaky gate).
      thresholds: {
        statements: 88,
        branches: 80,
        functions: 84,
        lines: 88
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
