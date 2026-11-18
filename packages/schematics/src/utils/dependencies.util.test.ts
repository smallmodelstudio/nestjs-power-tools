import { Tree } from '@angular-devkit/schematics';
import { describe, expect, it } from 'vitest';
import { addPackageDependencies, detectPackageManager } from './dependencies.util.js';

function treeWith(files: Record<string, string>): Tree {
  const tree = Tree.empty();
  for (const [path, content] of Object.entries(files)) {
    tree.create(path, content);
  }
  return tree;
}

describe('detectPackageManager', () => {
  it.each([
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
    ['package-lock.json', 'npm'],
  ])('maps %s to %s', (file, manager) => {
    expect(detectPackageManager(treeWith({ [file]: '' }))).toBe(manager);
  });

  it('falls back to npm', () => {
    expect(detectPackageManager(Tree.empty())).toBe('npm');
  });
});

describe('addPackageDependencies', () => {
  it('inserts packages alphabetically and preserves formatting', () => {
    const tree = treeWith({
      'package.json': '{\n    "dependencies": {\n    "a": "1",\n    "z": "1"\n  }\n}\n',
    });
    expect(addPackageDependencies(tree, [{ name: 'm', version: '2' }])).toEqual(['m']);
    const keys = Object.keys(JSON.parse(tree.read('package.json')!.toString()).dependencies);
    expect(keys).toEqual(['a', 'm', 'z']);
  });

  it('writes to the requested section', () => {
    const tree = treeWith({ 'package.json': '{}' });
    addPackageDependencies(tree, [{ name: 'x', version: '1', type: 'devDependencies' }]);
    expect(JSON.parse(tree.read('package.json')!.toString())).toEqual({
      devDependencies: { x: '1' },
    });
  });

  it('skips packages declared in any section', () => {
    const tree = treeWith({ 'package.json': '{"devDependencies":{"x":"1"}}' });
    expect(addPackageDependencies(tree, [{ name: 'x', version: '2' }])).toEqual([]);
    expect(JSON.parse(tree.read('package.json')!.toString()).dependencies).toBeUndefined();
  });

  it('is a no-op without a package.json', () => {
    expect(addPackageDependencies(Tree.empty(), [{ name: 'x', version: '1' }])).toEqual([]);
  });
});
