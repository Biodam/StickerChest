import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    pool: 'forks',
    forks: {
      singleFork: true,
    },
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      electron: path.resolve(import.meta.dirname, 'tests/mocks/electron.ts'),
    },
  },
});
