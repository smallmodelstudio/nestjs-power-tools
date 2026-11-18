import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { HelloWorldOptions } from './hello-world.schema.js';

const runner = new SchematicTestRunner('.', join(__dirname, '../../collection.json'));

async function run(options: Partial<HelloWorldOptions>, tree?: Tree): Promise<UnitTestTree> {
  return runner.runSchematic('hello-world', options, tree);
}

function nestWorkspace(): Tree {
  const tree = Tree.empty();
  tree.create('nest-cli.json', '{}');
  return tree;
}

describe('hello-world factory', () => {
  describe('options', () => {
    it('requires a name', async () => {
      await expect(run({})).rejects.toThrow();
    });

    it('rejects unsupported languages', async () => {
      await expect(run({ name: 'world', language: 'py' as never })).rejects.toThrow();
    });

    it('normalises the name to kebab-case', async () => {
      const tree = await run({ name: 'HelloWorld' });
      expect(tree.files).toEqual(['/hello-world.ts']);
    });
  });

  describe('generation', () => {
    it('generates a TypeScript file by default', async () => {
      const tree = await run({ name: 'world' });
      expect(tree.files).toEqual(['/world.ts']);
      expect(tree.readContent('/world.ts')).toBe(
        "export const greeting: string = 'Hello, world!';\n",
      );
    });

    it('generates a JavaScript file when language is js', async () => {
      const tree = await run({ name: 'world', language: 'js' });
      expect(tree.files).toEqual(['/world.js']);
    });

    it('leaves no template markers in file names', async () => {
      const tree = await run({ name: 'world' });
      expect(tree.files.some((f) => f.includes('__') || f.endsWith('.template'))).toBe(false);
    });

    it('generates into the given path', async () => {
      const tree = await run({ name: 'world', path: 'greetings' });
      expect(tree.files).toEqual(['/greetings/world.ts']);
    });
  });

  describe('source root', () => {
    it('generates into src when run from a Nest workspace root', async () => {
      const tree = await run({ name: 'world' }, nestWorkspace());
      expect(tree.exists('/src/world.ts')).toBe(true);
    });

    it('honours a custom source root', async () => {
      const tree = await run({ name: 'world', sourceRoot: 'lib' }, nestWorkspace());
      expect(tree.exists('/lib/world.ts')).toBe(true);
    });

    it('preserves existing files', async () => {
      const workspace = nestWorkspace();
      const tree = await run({ name: 'world' }, workspace);
      expect(tree.readContent('/nest-cli.json')).toBe('{}');
    });
  });
});
