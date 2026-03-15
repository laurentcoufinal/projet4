import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/server.ts',
        'src/app.ts',
        'src/shared/config/env.ts',
        'src/container.ts',
        'src/domain/entities/**',
        'src/domain/ports/**',
        'src/infrastructure/db/**',
        'src/infrastructure/repositories/**',
        'src/interfaces/http/types/**',
        '**/node_modules/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
