# nestjs-power-tools

A monorepo of tools that extend the NestJS CLI.

## Packages

- `packages/schematics` (`@nestjs-power-tools/schematics`): schematics that build on top of the Nest CLI.
- `packages/typescript-config` (`@nestjs-power-tools/typescript-config`): shared `tsconfig` base used across the workspace.

## Tooling

- [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting (`pnpm lint`)
- [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting (`pnpm format`, `pnpm format:check`)
- [commitlint](https://commitlint.js.org/) with the Angular convention, run from a `commit-msg` hook via [husky](https://typicode.github.io/husky/)
- [Turborepo](https://turborepo.dev/) to run tasks across packages (`pnpm build`, `pnpm test`, `pnpm check-types`)

## Getting started

```sh
pnpm install
pnpm build
```
