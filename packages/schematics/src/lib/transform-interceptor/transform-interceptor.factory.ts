import { chain, Rule } from '@angular-devkit/schematics';
import {
  addDependencies,
  extendNestInterceptor,
  transformInterceptorOptions,
  type PackageDependency,
} from '../../utils/index.js';
import type { TransformInterceptorOptions } from './transform-interceptor.schema.js';

/** Packages the generated files import. */
const TRANSFORM_INTERCEPTOR_DEPENDENCIES: PackageDependency[] = [
  { name: '@nestjs-power-tools/core', version: '^0.0.1' },
];

/**
 * Orchestrates the schematic: prepare options, declare the packages the
 * generated code needs, then run the official Nest interceptor schematic and
 * replace its output with the transform interceptor templates.
 */
export function main(options: TransformInterceptorOptions): Rule {
  options = transformInterceptorOptions(options);

  return chain([
    addDependencies(TRANSFORM_INTERCEPTOR_DEPENDENCIES, options),
    extendNestInterceptor(options),
  ]);
}
