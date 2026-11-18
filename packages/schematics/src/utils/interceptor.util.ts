import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { dirname } from 'node:path/posix';
import { DEFAULT_LANGUAGE } from '../lib/defaults.js';
import { isEsmProject } from './source-root.helpers.js';

/** Options shared by the schematics that extend the official Nest interceptor schematic. */
export interface InterceptorOptions {
  name: string;
  path?: string;
  flat?: boolean;
  spec?: boolean;
  specFileSuffix?: string;
  language?: 'ts';
  skipInstall?: boolean;
  sourceRoot?: string;
}

const SUPPORTED_LANGUAGES = ['ts'];
const INTERCEPTOR_FILE = /\.interceptor\.ts$/;
const SPEC_FILE = /\.interceptor\.([^./]+)\.ts$/;

/**
 * Validates the options every interceptor schematic shares and applies
 * defaults. Returns a copy; the input is left untouched.
 */
export function transformInterceptorOptions<T extends InterceptorOptions>(source: T): T {
  const target: T = Object.assign({}, source);

  if (!target.name) {
    throw new SchematicsException('Option (name) is required.');
  }

  target.language = target.language ?? (DEFAULT_LANGUAGE as T['language']);
  if (!SUPPORTED_LANGUAGES.includes(target.language!)) {
    throw new SchematicsException(
      `Unsupported language "${target.language}". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
    );
  }

  return target;
}

/**
 * Runs the official `@nestjs/schematics` interceptor schematic, so that name
 * parsing, path and source-root resolution, `--flat` and `--spec` behave
 * exactly like `nest g interceptor`, then replaces the generated files with
 * this package's templates (`./files/<language>` of the calling schematic).
 *
 * `data` supplies the extra template variables of the calling schematic.
 */
export function extendNestInterceptor(
  options: InterceptorOptions,
  data: Record<string, unknown> = {},
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const existing = new Set(listFiles(tree));

    return chain([
      externalSchematic('@nestjs/schematics', 'interceptor', {
        name: options.name,
        path: options.path,
        flat: options.flat,
        spec: options.spec,
        specFileSuffix: options.specFileSuffix,
        language: options.language,
        sourceRoot: options.sourceRoot,
      }),
      (host: Tree) => overrideGenerated(host, existing, options, data),
    ])(tree, context);
  };
}

function overrideGenerated(
  tree: Tree,
  existing: Set<string>,
  options: InterceptorOptions,
  data: Record<string, unknown>,
): Rule {
  const created = listFiles(tree).filter((file) => !existing.has(file));
  const interceptor = created.find((file) => INTERCEPTOR_FILE.test(file) && !SPEC_FILE.test(file));
  if (!interceptor) {
    throw new SchematicsException(
      'The Nest interceptor schematic did not generate an interceptor.',
    );
  }
  const spec = created.find((file) => SPEC_FILE.test(file));

  const name = interceptor.slice(interceptor.lastIndexOf('/') + 1).replace(INTERCEPTOR_FILE, '');
  const templateOptions = {
    ...data,
    name,
    className: strings.classify(name),
    specFileSuffix: spec?.match(SPEC_FILE)?.[1] ?? '',
    importExtension: isEsmProject(tree) ? '.js' : '',
  };

  return mergeWith(
    apply(url(`./files/${options.language}`), [
      spec ? (source) => source : filter((path) => !path.includes('__specFileSuffix__')),
      applyTemplates(templateOptions),
      move(dirname(interceptor)),
    ]),
    MergeStrategy.Overwrite,
  );
}

function listFiles(tree: Tree): string[] {
  const files: string[] = [];
  tree.getDir('/').visit((path) => files.push(path));
  return files;
}
