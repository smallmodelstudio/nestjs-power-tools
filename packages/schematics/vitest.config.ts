import { createVitestConfig } from '@nestjs-power-tools/vitest-config';

export default createVitestConfig({
  test: {
    // Schematic fixtures are templates, not tests.
    exclude: ['src/**/files/**'],
    include: ['test/**/*.spec.ts'],
    // No schematic tests yet; don't fail the run until some exist.
    passWithNoTests: true,
    testTimeout: 15000,
    pool: 'forks',
    // Schematic runs share the collection loaded from disk; keep them in one
    // process to avoid re-resolving it per worker.
    fileParallelism: false,
  },
});
