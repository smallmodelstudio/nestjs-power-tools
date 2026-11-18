import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks/index.js';
import { applyEdits, modify, parse } from 'jsonc-parser';

export type DependencyType = 'dependencies' | 'devDependencies';

export interface PackageDependency {
  name: string;
  version: string;
  /** Defaults to `dependencies`. */
  type?: DependencyType;
}

const PACKAGE_JSON = 'package.json';
const DEPENDENCY_SECTIONS: DependencyType[] = ['dependencies', 'devDependencies'];
const FORMATTING = { insertSpaces: true, tabSize: 2 };

/**
 * Lockfiles in the order they are checked, mapped to the manager that owns them.
 */
const LOCKFILES: [file: string, manager: PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
];

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/**
 * Detects the package manager from the lockfile in the workspace root,
 * falling back to npm.
 */
export function detectPackageManager(tree: Tree): PackageManager {
  return LOCKFILES.find(([file]) => tree.exists(file))?.[1] ?? 'npm';
}

/**
 * Adds the given packages to package.json. A package already declared in any
 * dependency section keeps its existing version and section. Returns the names
 * that were added.
 *
 * Does nothing when there is no package.json, since the schematic may be
 * running against a bare tree. Throws when package.json is not valid JSON.
 */
export function addPackageDependencies(tree: Tree, dependencies: PackageDependency[]): string[] {
  const buffer = tree.read(PACKAGE_JSON);
  if (!buffer) {
    return [];
  }

  let content = buffer.toString();
  const manifest = parse(content) as Record<string, Record<string, string> | undefined> | undefined;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new SchematicsException(`Unable to parse ${PACKAGE_JSON}.`);
  }

  const added: string[] = [];
  for (const { name, version, type = 'dependencies' } of dependencies) {
    const declared = DEPENDENCY_SECTIONS.some((section) => manifest[section]?.[name] !== undefined);
    if (declared) {
      continue;
    }
    content = applyEdits(
      content,
      modify(content, [type, name], version, {
        formattingOptions: FORMATTING,
        getInsertionIndex: (keys) => keys.filter((key) => key < name).length,
      }),
    );
    added.push(name);
  }

  if (added.length > 0) {
    tree.overwrite(PACKAGE_JSON, content);
  }
  return added;
}

/**
 * Adds packages to package.json and, unless `skipInstall` is set, schedules a
 * single install task for the workspace's package manager. The task only runs
 * when the schematic is executed by the CLI, not when the Tree is updated.
 */
export function addDependencies(
  dependencies: PackageDependency[],
  options: { skipInstall?: boolean } = {},
): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const added = addPackageDependencies(tree, dependencies);
    if (added.length > 0 && !options.skipInstall) {
      context.addTask(new NodePackageInstallTask({ packageManager: detectPackageManager(tree) }));
    }
    return tree;
  };
}
