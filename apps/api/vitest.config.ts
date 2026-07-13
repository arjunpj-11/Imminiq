import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup/security-test-env.ts'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    maxWorkers: 8,
    unstubEnvs: true,
    unstubGlobals: true,
    testTimeout: 10_000,
  },
});
