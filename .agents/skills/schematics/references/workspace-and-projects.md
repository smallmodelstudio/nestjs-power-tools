# Workspace and Project Architecture

## Purpose

Define how schematics interact with NestJS applications, libraries and monorepo workspaces.

This is one of the most important architectural concerns.

A schematic must understand the workspace it is modifying rather than assuming a fixed directory layout.

## 1. NestJS workspace modes

NestJS supports standard application projects and monorepo workspaces.

### Standard project

A conventional application may contain:

```text
project/
├── src/
├── test/
├── nest-cli.json
├── package.json
└── tsconfig.json
```

### Monorepo

A NestJS monorepo may contain:

```text
project/
├── apps/
│   ├── api/
│   └── worker/
├── libs/
│   └── shared/
├── nest-cli.json
├── package.json
└── tsconfig.json
```

This is illustrative, not a mandatory layout.

Projects can have custom roots and source roots.

## 2. Project types

Understand the distinction between:

### Applications

- Independently bootstrapped NestJS applications.
- Usually contain an entry point.
- Have project-specific configuration in monorepos.

### Libraries

- Reusable NestJS functionality.
- Do not normally have an independent application bootstrap.
- Have their own source and compilation configuration.

Do not treat applications and libraries as interchangeable.

## 3. Workspace discovery

Use existing workspace utilities to inspect:

- Nest CLI configuration.
- Project metadata.
- Project roots.
- Source roots.
- Compiler configuration.
- Monorepo status.
- Module system.

Avoid hardcoded assumptions such as always writing to `src/`.

When a schematic targets a particular project, resolve that project before determining its destination.

## 4. Source roots and paths

Consider:

- Standard application source roots.
- Monorepo application source roots.
- Library source roots.
- Custom project roots.
- Nested directories.
- Explicit user-provided paths.

Reuse shared path and source-root utilities.

Do not duplicate path resolution logic across factories.

## 5. Module systems

Consider both ESM and CommonJS.

Where relevant, inspect:

- `package.json` module type.
- TypeScript configuration.
- Existing import/export conventions.
- Generated file extensions.
- Framework-specific module requirements.

Generated output should be compatible with the target project.

Do not assume that the schematic package's own module format matches the target workspace.

## 6. Project configuration

Workspace-level schematics may need to update:

- `nest-cli.json`.
- `tsconfig.json`.
- Project-specific TypeScript configurations.
- Package configuration.
- Build configuration.
- Test configuration.
- Project metadata.

Preserve unrelated existing configuration.

Use structured configuration modification where available.

## 7. Project creation and conversion

Application and library schematics may create complete project structures.

Consider:

- Directory creation.
- Project registration.
- Entry points.
- Source roots.
- Compiler configuration.
- Dependencies.
- Root workspace configuration.
- Existing project preservation.

Converting a standard project into a monorepo is a particularly sensitive operation.

Do not assume arbitrary project structures can be safely moved or reorganised.

Validate the structure before performing destructive operations.

## 8. Workspace compatibility matrix

When relevant, consider these scenarios:

| Dimension | Scenarios |
| --- | --- |
| Workspace | Standard, monorepo |
| Project | Application, library |
| Language | TypeScript, JavaScript where supported |
| Module system | ESM, CommonJS |
| Source root | Default, custom |
| Project count | Single, multiple |
| Configuration | Existing, missing, customised |

Do not test every possible combination automatically.

Select scenarios based on the schematic's actual responsibilities.

## 9. Compatibility principles

- Preserve existing workspace configuration.
- Resolve project-specific paths.
- Avoid assuming a default project.
- Avoid modifying unrelated projects.
- Respect existing module systems.
- Avoid destructive project conversion without validation.
- Verify monorepo behaviour through integration tests.

## 10. Review checklist

- [ ] Workspace mode is understood.
- [ ] Target project is resolved.
- [ ] Project root and source root are correct.
- [ ] Application and library differences are respected.
- [ ] Module system is considered.
- [ ] Configuration is preserved.
- [ ] Existing projects are not unintentionally modified.
- [ ] Relevant workspace scenarios are tested.
