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
    // Integration suites share process-level Mongo/Redis clients through the application
    // composition root. Running files serially prevents one suite from clearing or closing
    // another suite's singleton-backed test state.
    fileParallelism: false,
    unstubEnvs: true,
    unstubGlobals: true,
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
});
