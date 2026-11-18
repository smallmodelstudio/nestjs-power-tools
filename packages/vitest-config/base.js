import { defineConfig, mergeConfig } from 'vitest/config';

/** Shared defaults for every package in the monorepo. */
export const baseConfig = defineConfig({
  test: {
    root: '.',
    globals: true,
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});

/**
 * Returns the base config deep-merged with `overrides`
 * (arrays such as `include` are concatenated, not replaced).
 *
 * @param {import('vitest/config').ViteUserConfig} [overrides]
 */
export function createVitestConfig(overrides = {}) {
  return mergeConfig(baseConfig, overrides);
}
