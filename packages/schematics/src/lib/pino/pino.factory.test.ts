import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PinoOptions } from './pino.schema.js';

const runner = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));

async function run(options: Partial<PinoOptions>, tree?: Tree): Promise<UnitTestTree> {
  return runner.runSchematic('pino', options, tree);
}

function nestWorkspace(packageJson = '{}'): Tree {
  const tree = Tree.empty();
  tree.create('nest-cli.json', '{}');
  tree.create('package.json', packageJson);
  return tree;
}

const FILES = ['module', 'service'];

describe('pino factory', () => {
  describe('options', () => {
    it('requires a name', async () => {
      await expect(run({})).rejects.toThrow();
    });

    it('rejects unsupported languages', async () => {
      await expect(run({ name: 'app', language: 'js' as never })).rejects.toThrow();
    });

    it('rejects names that cannot form identifiers', async () => {
      await expect(run({ name: '1app' })).rejects.toThrow(/Invalid name/);
      await expect(run({ name: 'ap$p' })).rejects.toThrow(/Invalid name/);
    });

    it('normalises the name to kebab-case', async () => {
      const tree = await run({ name: 'OrderItems' });
      expect(tree.exists('/order-items/order-items-pino.module.ts')).toBe(true);
    });
  });

  describe('generation', () => {
    it('generates the module and service in a feature folder', async () => {
      const tree = await run({ name: 'app' });
      expect(tree.files.sort()).toEqual(FILES.map((f) => `/app/app-pino.${f}.ts`).sort());
    });

    it('generates into the folder-less path when flat', async () => {
      const tree = await run({ name: 'app', flat: true });
      expect(tree.exists('/app-pino.module.ts')).toBe(true);
    });

    it('generates into the given path', async () => {
      const tree = await run({ name: 'app', path: 'logging' });
      expect(tree.exists('/logging/app/app-pino.module.ts')).toBe(true);
    });

    it('leaves no template markers in file names or content', async () => {
      const tree = await run({ name: 'order-items' });
      expect(tree.files.some((f) => f.includes('__') || f.endsWith('.template'))).toBe(false);
      for (const file of tree.files) {
        expect(tree.readContent(file)).not.toMatch(/<%/);
      }
    });

    it('derives class names from the name', async () => {
      const tree = await run({ name: 'order-items' });
      const module = tree.readContent('/order-items/order-items-pino.module.ts');
      expect(module).toContain('export class OrderItemsPinoModule {}');
      expect(module).toContain("from '@nestjs-power-tools/pino'");
      expect(module).toContain('PinoLoggerModule.forRoot');
      expect(tree.readContent('/order-items/order-items-pino.service.ts')).toContain(
        'export class OrderItemsPinoService',
      );
    });

    it('scopes the logger to the service context', async () => {
      const tree = await run({ name: 'app' });
      const service = tree.readContent('/app/app-pino.service.ts');
      expect(service).toContain('logger.child(AppPinoService.name)');
    });
  });

  describe('module system', () => {
    it('uses extensionless relative imports in CommonJS projects', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace());
      const module = tree.readContent('/src/app/app-pino.module.ts');
      expect(module).toContain("from './app-pino.service'");
      expect(module).not.toContain('.js');
    });

    it('uses .js relative imports in ESM projects', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace('{"type":"module"}'));
      const module = tree.readContent('/src/app/app-pino.module.ts');
      expect(module).toContain("from './app-pino.service.js'");
    });
  });

  describe('source root', () => {
    it('generates into src when run from a Nest workspace root', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace());
      expect(tree.exists('/src/app/app-pino.module.ts')).toBe(true);
    });

    it('honours a custom source root', async () => {
      const tree = await run({ name: 'app', sourceRoot: 'lib' }, nestWorkspace());
      expect(tree.exists('/lib/app/app-pino.module.ts')).toBe(true);
    });

    it('preserves existing files', async () => {
      const tree = await run({ name: 'app' }, nestWorkspace());
      expect(tree.readContent('/nest-cli.json')).toBe('{}');
      expect(tree.readContent('/package.json')).toBe('{}');
    });
  });
});
