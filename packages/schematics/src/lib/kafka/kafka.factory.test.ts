import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { KafkaOptions } from './kafka.schema.js';

const runner = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));

async function run(options: Partial<KafkaOptions>, tree?: Tree): Promise<UnitTestTree> {
  return runner.runSchematic('kafka', options, tree);
}

function nestWorkspace(packageJson = '{}'): Tree {
  const tree = Tree.empty();
  tree.create('nest-cli.json', '{}');
  tree.create('package.json', packageJson);
  return tree;
}

const FILES = ['constants', 'controller', 'module', 'service'];

describe('kafka factory', () => {
  describe('options', () => {
    it('requires a name', async () => {
      await expect(run({})).rejects.toThrow();
    });

    it('rejects unsupported languages', async () => {
      await expect(run({ name: 'orders', language: 'js' as never })).rejects.toThrow();
    });

    it('rejects names that cannot form identifiers', async () => {
      await expect(run({ name: '1orders' })).rejects.toThrow(/Invalid name/);
      await expect(run({ name: 'or$ders' })).rejects.toThrow(/Invalid name/);
    });

    it('normalises the name to kebab-case', async () => {
      const tree = await run({ name: 'OrderItems' });
      expect(tree.exists('/order-items/order-items-kafka.module.ts')).toBe(true);
    });
  });

  describe('generation', () => {
    it('generates the module, service, controller and constants in a feature folder', async () => {
      const tree = await run({ name: 'orders' });
      expect(tree.files.sort()).toEqual(FILES.map((f) => `/orders/orders-kafka.${f}.ts`).sort());
    });

    it('generates into the folder-less path when flat', async () => {
      const tree = await run({ name: 'orders', flat: true });
      expect(tree.exists('/orders-kafka.module.ts')).toBe(true);
    });

    it('generates into the given path', async () => {
      const tree = await run({ name: 'orders', path: 'messaging' });
      expect(tree.exists('/messaging/orders/orders-kafka.module.ts')).toBe(true);
    });

    it('leaves no template markers in file names or content', async () => {
      const tree = await run({ name: 'order-items' });
      expect(tree.files.some((f) => f.includes('__') || f.endsWith('.template'))).toBe(false);
      for (const file of tree.files) {
        expect(tree.readContent(file)).not.toMatch(/<%/);
      }
    });

    it('derives class names and the client token from the name', async () => {
      const tree = await run({ name: 'order-items' });
      const module = tree.readContent('/order-items/order-items-kafka.module.ts');
      expect(module).toContain('export class OrderItemsKafkaModule {}');
      expect(module).toContain('name: ORDER_ITEMS_KAFKA_CLIENT');
      expect(module).toContain("from '@nestjs-power-tools/kafka'");
      expect(tree.readContent('/order-items/order-items-kafka.constants.ts')).toContain(
        "ORDER_ITEMS_KAFKA_CLIENT = 'ORDER_ITEMS_KAFKA_CLIENT'",
      );
      expect(tree.readContent('/order-items/order-items-kafka.controller.ts')).toContain(
        "@EventPattern('order-items.created')",
      );
    });

    it('wires the service to the client registered by the module', async () => {
      const tree = await run({ name: 'orders' });
      const service = tree.readContent('/orders/orders-kafka.service.ts');
      expect(service).toContain('@InjectKafkaClient(ORDERS_KAFKA_CLIENT)');
      expect(service).toContain('this.client.connect()');
    });
  });

  describe('module system', () => {
    it('uses extensionless relative imports in CommonJS projects', async () => {
      const tree = await run({ name: 'orders' }, nestWorkspace());
      const module = tree.readContent('/src/orders/orders-kafka.module.ts');
      expect(module).toContain("from './orders-kafka.service'");
      expect(module).not.toContain('.js');
    });

    it('uses .js relative imports in ESM projects', async () => {
      const tree = await run({ name: 'orders' }, nestWorkspace('{"type":"module"}'));
      const module = tree.readContent('/src/orders/orders-kafka.module.ts');
      expect(module).toContain("from './orders-kafka.service.js'");
      expect(module).toContain("from './orders-kafka.constants.js'");
    });
  });

  describe('source root', () => {
    it('generates into src when run from a Nest workspace root', async () => {
      const tree = await run({ name: 'orders' }, nestWorkspace());
      expect(tree.exists('/src/orders/orders-kafka.module.ts')).toBe(true);
    });

    it('honours a custom source root', async () => {
      const tree = await run({ name: 'orders', sourceRoot: 'lib' }, nestWorkspace());
      expect(tree.exists('/lib/orders/orders-kafka.module.ts')).toBe(true);
    });

    it('preserves existing files', async () => {
      const tree = await run({ name: 'orders' }, nestWorkspace());
      expect(tree.readContent('/nest-cli.json')).toBe('{}');
      expect(tree.readContent('/package.json')).toBe('{}');
    });
  });
});
