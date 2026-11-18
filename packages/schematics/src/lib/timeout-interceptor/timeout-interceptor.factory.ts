import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import {
  addDependencies,
  extendNestInterceptor,
  transformInterceptorOptions,
  type PackageDependency,
} from '../../utils/index.js';
import type { TimeoutInterceptorOptions } from './timeout-interceptor.schema.js';

const DEFAULT_TIMEOUT_MS = 5000;

/** Packages the generated files import. */
const TIMEOUT_INTERCEPTOR_DEPENDENCIES: PackageDependency[] = [
  { name: '@nestjs-power-tools/core', version: '^0.0.1' },
];

/**
 * Orchestrates the schematic: prepare options, declare the packages the
 * generated code needs, then run the official Nest interceptor schematic and
 * replace its output with the timeout interceptor templates.
 */
export function main(options: TimeoutInterceptorOptions): Rule {
  options = transform(options);

  return chain([
    addDependencies(TIMEOUT_INTERCEPTOR_DEPENDENCIES, options),
    extendNestInterceptor(options, { timeout: options.timeout }),
  ]);
}

/**
 * Validates the raw options and applies defaults. Returns a copy; the input is
 * left untouched and no Tree changes happen here.
 */
function transform(source: TimeoutInterceptorOptions): TimeoutInterceptorOptions {
  const target = transformInterceptorOptions(source);

  target.timeout = target.timeout ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(target.timeout) || target.timeout < 1) {
    throw new SchematicsException(
      `Invalid timeout "${source.timeout}". Use a positive whole number of milliseconds.`,
    );
  }

  return target;
}
