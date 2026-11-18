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
import { DEFAULT_LANGUAGE } from '../defaults.js';
import { mergeSourceRoot, normalizeToKebabOrSnakeCase } from '../../utils/index.js';
import type { HelloWorldOptions } from './hello-world.schema.js';

const SUPPORTED_LANGUAGES = ['ts', 'js'];

/**
 * Orchestrates the schematic: prepare options, resolve the output path, then
 * merge the generated files into the workspace.
 */
export function main(options: HelloWorldOptions): Rule {
  options = transform(options);

  return chain([mergeSourceRoot(options), mergeWith(generate(options)), logGreeting(options)]);
}

/**
 * Validates the raw options and applies defaults. Returns a copy; the input is
 * left untouched and no Tree changes happen here.
 */
function transform(source: HelloWorldOptions): HelloWorldOptions {
  const target: HelloWorldOptions = Object.assign({}, source);

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }

  target.language = target.language ?? (DEFAULT_LANGUAGE as HelloWorldOptions['language']);
  if (!SUPPORTED_LANGUAGES.includes(target.language!)) {
    throw new SchematicsException(
      `Unsupported language "${target.language}". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
    );
  }

  target.name = normalizeToKebabOrSnakeCase(target.name);

  return target;
}

/**
 * Builds the Source of generated files. It is evaluated lazily so that
 * `options.path`, set by `mergeSourceRoot`, is read at execution time.
 */
function generate(options: HelloWorldOptions): Source {
  return (context: SchematicContext) =>
    apply(url(`./files/${options.language}`), [
      applyTemplates({ name: options.name }),
      move(options.path ?? ''),
    ])(context);
}

function logGreeting(options: HelloWorldOptions): Rule {
  return (tree, context) => {
    context.logger.info(`Hello ${options.name}!`);
    return tree;
  };
}
