import { createVitestConfig } from '@nestjs-power-tools/vitest-config';

export default createVitestConfig({
  test: {
    // Schematic fixtures are templates, not tests.
    exclude: ['src/**/files/**'],
    include: ['test/**/*.spec.ts'],
    testTimeout: 15000,
    pool: 'forks',
    // Schematic runs share the collection loaded from disk; keep them in one
    // process to avoid re-resolving it per worker.
    fileParallelism: false,
  },
});
