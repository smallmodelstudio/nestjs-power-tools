import {
  apply,
  filter,
  move,
  noop,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  strings,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import type { HelloWorldOptions } from './hello-world.schema.js';
import { join, Path } from '@angular-devkit/core/src/virtual-fs/index';

// orchestrate
export function main(options: HelloWorldOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const sourceTemplates = url('./files');

    options.language = options.language || 'ts';

    options.path = options.path || '/src';

    transform(options);
    generate(options);

    context.logger.info(`Hello ${options.name}!`);

    return tree;
  };
}

// transform
function transform(options: HelloWorldOptions): HelloWorldOptions {
  const target: HelloWorldOptions = Object.assign({}, options);
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }

  return target;
}

// generate
function generate(options: HelloWorldOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language!)), [
      options.name.endsWith('.spec')
        ? noop()
        : filter((path) => {
            const languageExtension = options.language || 'ts';
            const suffix = `.__specFileSuffix__.${languageExtension}`;
            return !path.endsWith(suffix);
          }),
      template({
        ...strings,
        ...options,
      }),
      move(options.path!),
    ])(context);
}
