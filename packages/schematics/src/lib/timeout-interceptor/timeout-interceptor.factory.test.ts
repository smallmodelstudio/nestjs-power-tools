import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { TimeoutInterceptorOptions } from './timeout-interceptor.schema.js';

const SCHEMATIC = 'timeout-interceptor';
const runner = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));

async function run(
  options: Partial<TimeoutInterceptorOptions>,
  tree?: Tree,
): Promise<UnitTestTree> {
  return runner.runSchematic(SCHEMATIC, options, tree);
}

function nestWorkspace(packageJson = '{}'): Tree {
  const tree = Tree.empty();
  tree.create('nest-cli.json', '{}');
  tree.create('package.json', packageJson);
  return tree;
}

describe('timeout-interceptor factory', () => {
  describe('options', () => {
    it('requires a name', async () => {
      await expect(run({})).rejects.toThrow();
    });

    it('rejects unsupported languages', async () => {
      await expect(run({ name: 'app', language: 'js' as never })).rejects.toThrow();
    });

    it('normalises the name to kebab-case', async () => {
      const tree = await run({ name: 'OrderItems' });
      expect(tree.exists('/order-items.interceptor.ts')).toBe(true);
    });

    it('resolves the alias', async () => {
      const aliased = await runner.runSchematic('ti', { name: 'app' });
      expect(aliased.exists('/app.interceptor.ts')).toBe(true);
    });
  });

  describe('generation', () => {
    it('generates the interceptor and spec like the Nest schematic', async () => {
      const tree = await run({ name: 'app' });
      expect(tree.files.sort()).toEqual(['/app.interceptor.spec.ts', '/app.interceptor.ts']);
    });

    it('omits the spec when spec is false', async () => {
      const tree = await run({ name: 'app', spec: false });
      expect(tree.files).toEqual(['/app.interceptor.ts']);
    });

    it('honours the spec file suffix', async () => {
      const tree = await run({ name: 'app', specFileSuffix: 'test' });
      expect(tree.exists('/app.interceptor.test.ts')).toBe(true);
      expect(tree.exists('/app.interceptor.spec.ts')).toBe(false);
    });

    it('generates into a folder when not flat', async () => {
      const tree = await run({ name: 'app', flat: false });
      expect(tree.exists('/app/app.interceptor.ts')).toBe(true);
    });

    it('generates into the given path', async () => {
      const tree = await run({ name: 'app', path: 'common/interceptors' });
      expect(tree.exists('/common/interceptors/app.interceptor.ts')).toBe(true);
    });

    it('takes the path from a nested name', async () => {
      const tree = await run({ name: 'common/order-items' });
      expect(tree.exists('/common/order-items.interceptor.ts')).toBe(true);
      expect(tree.readContent('/common/order-items.interceptor.ts')).toContain(
        'export class OrderItemsInterceptor',
      );
    });

    it('replaces the Nest output with the power-tools template', async () => {
      const tree = await run({ name: 'order-items' });
      const interceptor = tree.readContent('/order-items.interceptor.ts');
      expect(interceptor).toContain("from '@nestjs-power-tools/core'");
      expect(interceptor).toContain('export class OrderItemsInterceptor');
      expect(interceptor).toContain('extends TimeoutInterceptor');
      expect(interceptor).not.toContain('next.handle()');
    });

    it('imports the interceptor from its spec', async () => {
      const tree = await run({ name: 'order-items' });
      const spec = tree.readContent('/order-items.interceptor.spec.ts');
      expect(spec).toContain("describe('OrderItemsInterceptor'");
      expect(spec).toContain("from './order-items.interceptor'");
    });

    it('leaves no template markers in file names or content', async () => {
      const tree = await run({ name: 'order-items' });
      expect(tree.files.some((f) => f.includes('__') || f.endsWith('.template'))).toBe(false);
      for (const file of tree.files) {
        expect(tree.readContent(file)).not.toMatch(/<%/);
      }
    });

    it('refuses to overwrite an existing interceptor', async () => {
      const tree = Tree.empty();
      tree.create('/app.interceptor.ts', '// mine');
      await expect(run({ name: 'app' }, tree)).rejects.toThrow();
      expect(tree.read('/app.interceptor.ts')!.toString()).toBe('// mine');
    });

    it('uses the default timeout', async () => {
      const tree = await run({ name: 'slow' });
      expect(tree.readContent('/slow.interceptor.ts')).toContain('super(5000)');
    });

    it('uses a custom timeout', async () => {
      const tree = await run({ name: 'slow', timeout: 1200 });
      expect(tree.readContent('/slow.interceptor.ts')).toContain('super(1200)');
      expect(tree.readContent('/slow.interceptor.spec.ts')).toContain('1200 + 50');
    });

    it('rejects an invalid timeout', async () => {
      await expect(run({ name: 'slow', timeout: 0 })).rejects.toThrow(/timeout/);
      await expect(run({ name: 'slow', timeout: 1.5 })).rejects.toThrow(/timeout/);
    });
  });

  describe('module system', () => {
    it('uses extensionless relative imports in CommonJS projects', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace());
      expect(tree.readContent('/src/app.interceptor.spec.ts')).toContain(
        "from './app.interceptor'",
      );
    });

    it('uses .js relative imports in ESM projects', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace('{"type":"module"}'));
      expect(tree.readContent('/src/app.interceptor.spec.ts')).toContain(
        "from './app.interceptor.js'",
      );
    });
  });

  describe('source root', () => {
    it('generates into src when run from a Nest workspace root', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace());
      expect(tree.exists('/src/app.interceptor.ts')).toBe(true);
    });

    it('honours a custom source root', async () => {
      const tree = await run({ name: 'app', sourceRoot: 'lib' }, nestWorkspace());
      expect(tree.exists('/lib/app.interceptor.ts')).toBe(true);
    });

    it('preserves existing files', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace('{"name":"demo"}'));
      expect(tree.readContent('/nest-cli.json')).toBe('{}');
      expect(JSON.parse(tree.readContent('/package.json')).name).toBe('demo');
    });
  });

  describe('dependencies', () => {
    const manifest = (tree: Tree | UnitTestTree) =>
      JSON.parse(tree.read('/package.json')!.toString());

    it('adds the core package to package.json', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace('{"name":"demo"}'));
      expect(manifest(tree).dependencies).toEqual({ '@nestjs-power-tools/core': '^0.0.1' });
      expect(manifest(tree).name).toBe('demo');
    });

    it('keeps an existing version and section', async () => {
      const tree = await run(
        { name: 'app' },
        nestWorkspace('{"devDependencies":{"@nestjs-power-tools/core":"^1.0.0"}}'),
      );
      expect(manifest(tree).dependencies).toBeUndefined();
      expect(manifest(tree).devDependencies).toEqual({ '@nestjs-power-tools/core': '^1.0.0' });
    });

    it('schedules one install task using the detected package manager', async () => {
      const tree = nestWorkspace('{}');
      tree.create('pnpm-lock.yaml', '');
      const runner2 = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));
      await runner2.runSchematic(SCHEMATIC, { name: 'app' }, tree);
      expect(runner2.tasks).toHaveLength(1);
      expect((runner2.tasks[0]!.options as { packageManager: string }).packageManager).toBe('pnpm');
    });

    it('does not schedule an install when skipInstall is set', async () => {
      const runner2 = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));
      const tree = await runner2.runSchematic(
        SCHEMATIC,
        { name: 'app', skipInstall: true },
        nestWorkspace('{}'),
      );
      expect(manifest(tree).dependencies['@nestjs-power-tools/core']).toBe('^0.0.1');
      expect(runner2.tasks).toHaveLength(0);
    });

    it('does nothing without a package.json', async () => {
      const tree = await run({ name: 'app' });
      expect(tree.exists('/package.json')).toBe(false);
    });

    it('rejects an unparseable package.json', async () => {
      await expect(run({ name: 'app' }, nestWorkspace('[]'))).rejects.toThrow(/package.json/);
    });
  });
});
