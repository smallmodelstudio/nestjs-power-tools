import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  url,
} from '@angular-devkit/schematics';
import { join, normalize } from '@angular-devkit/core';
import { DEFAULT_LANGUAGE } from '../defaults.js';
import {
  addDependencies,
  isEsmProject,
  mergeSourceRoot,
  normalizeToKebabOrSnakeCase,
  type PackageDependency,
} from '../../utils/index.js';
import type { PinoOptions } from './pino.schema.js';

const SUPPORTED_LANGUAGES = ['ts'];

/** Packages the generated files import, or require as peers. */
const PINO_DEPENDENCIES: PackageDependency[] = [
  { name: '@nestjs-power-tools/pino', version: '^0.0.1' },
  { name: 'pino', version: '^10.4.0' },
];

/**
 * Orchestrates the schematic: prepare options, resolve the output path, detect
 * the module system, declare the packages the generated code needs, then merge
 * the generated files into the workspace.
 */
export function main(options: PinoOptions): Rule {
  options = transform(options);

  return chain([
    mergeSourceRoot(options),
    detectModuleSystem(options),
    addDependencies(PINO_DEPENDENCIES, options),
    mergeWith(generate(options)),
  ]);
}

/**
 * Validates the raw options and applies defaults. Returns a copy; the input is
 * left untouched and no Tree changes happen here.
 */
function transform(source: PinoOptions): PinoOptions {
  const target: PinoOptions = Object.assign({}, source);

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }

  target.language = target.language ?? (DEFAULT_LANGUAGE as PinoOptions['language']);
  if (!SUPPORTED_LANGUAGES.includes(target.language!)) {
    throw new SchematicsException(
      `Unsupported language "${target.language}". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
    );
  }

  target.name = normalizeToKebabOrSnakeCase(target.name);
  if (!/^[a-z][a-z0-9]*([-_][a-z0-9]+)*$/.test(target.name)) {
    throw new SchematicsException(
      `Invalid name "${source.name}". Use letters and digits, starting with a letter.`,
    );
  }

  const words = target.name.split(/[-_]/);
  target.className = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  target.flat = target.flat ?? false;

  return target;
}

/**
 * Relative imports need a `.js` extension in ESM projects. Runs against the
 * Tree, so it is a Rule rather than part of `transform()`.
 */
function detectModuleSystem(options: PinoOptions): Rule {
  return (tree) => {
    options.importExtension = isEsmProject(tree) ? '.js' : '';
    return tree;
  };
}

/**
 * Builds the Source of generated files. It is evaluated lazily so that
 * `options.path`, set by `mergeSourceRoot`, is read at execution time.
 */
function generate(options: PinoOptions): Source {
  return (context: SchematicContext) => {
    const base = normalize(options.path ?? '');
    const destination = options.flat ? base : join(base, options.name);
    return apply(url(`./files/${options.language}`), [
      applyTemplates({
        name: options.name,
        className: options.className,
        importExtension: options.importExtension,
      }),
      move(destination),
    ])(context);
  };
}
