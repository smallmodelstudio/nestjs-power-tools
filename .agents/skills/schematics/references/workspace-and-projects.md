# Shared Utilities

## Purpose

Define how reusable functionality is organised, implemented and maintained across schematic factories.

Shared utilities reduce duplication and ensure consistent behaviour across the schematic collection.

## 1. Directory structure

Production utilities belong in:

```text
schematics/
└── utils/
    ├── formatting.ts
    ├── name.parser.ts
    ├── source-root.helpers.ts
    └── ...
```

Test utilities belong separately in:

```text
schematics/
└── tests/
    └── utils/
        ├── workspace.ts
        ├── schematic.ts
        └── assertions.ts
```

Never mix production utilities with test-only infrastructure.

## 2. When to create a shared utility

Before creating a new utility:

- Search the existing repository for equivalent functionality.
- Check whether another schematic already implements the same behaviour.
- Determine whether the behaviour is genuinely reusable.
- Identify whether it belongs in production code or test infrastructure.
- Keep the implementation focused.

Good candidates include:

- Name parsing.
- Name normalisation.
- Path handling.
- Source-root resolution.
- Project configuration detection.
- ESM/CommonJS detection.
- File formatting.
- Reusable schematic Rules.

Avoid extracting functionality simply because it is a function.

A function can remain private to a factory if it only serves that factory.

## 3. Utility responsibilities

Utilities should have clear and limited responsibilities.

For example:

### Formatting utilities

Handle:

- Kebab-case normalisation.
- Snake-case normalisation.
- Class-name formatting.
- Consistent naming transformations.

### Name parsing utilities

Handle:

- Parsing user-provided names.
- Resolving requested locations.
- Separating names from paths.
- Interpreting naming conventions.

### Source-root helpers

Handle:

- Source-root resolution.
- Project-relative paths.
- Source-root merging.
- Consistent path behaviour across schematics.

### Project configuration helpers

Handle:

- Inspecting project configuration.
- Detecting ESM projects.
- Determining relevant workspace characteristics.

### Formatting rules

Handle:

- Formatting generated files.
- Reusable formatting operations.
- Optional post-generation formatting.

Prefer using existing Angular DevKit APIs and repository dependencies rather than implementing equivalent functionality manually.

## 4. Shared Rules

A reusable utility may also expose an Angular DevKit Rule.

For example:

```ts
export function someSharedRule(): Rule {
  return (tree) => {
    // Apply a focused transformation.
    return tree;
  };
}
```

Shared Rules should:

- Have a clearly defined responsibility.
- Be reusable by multiple factories.
- Avoid unnecessary dependencies on individual schematic options.
- Return the expected Angular DevKit abstraction.
- Handle errors appropriately.

Use composition to combine shared Rules within individual factories.

## 5. Dependencies and coupling

Shared utilities should not depend on individual schematic implementations.

Prefer this dependency direction:

```text
Individual schematic factories
          |
          v
    Shared utilities
```

Avoid circular dependencies between factories and utilities.

Avoid putting schematic-specific business logic in shared utilities merely to reduce the size of a factory.

## 6. Changing shared utilities

Shared utilities have a wider impact than private factory functions.

Before modifying one:

1. Find every consumer.
2. Understand existing behaviour.
3. Identify potential breaking changes.
4. Update affected tests.
5. Consider integration coverage.
6. Verify dependent schematics.

Do not assume a change is safe simply because the utility has a small implementation.

## 7. Utility testing

Utilities should have appropriate tests for their complexity and importance.

Prefer testing:

- Input and output behaviour.
- Edge cases.
- Invalid inputs.
- Path handling.
- Naming conventions.
- Project configuration variations.

Use factory tests to verify that utilities integrate correctly with schematic behaviour.

Avoid duplicating utility tests across every factory.

## 8. Avoiding unnecessary abstractions

Do not introduce:

- Generic base factories without a demonstrated need.
- Large utility classes containing unrelated functions.
- Global state shared between factories.
- Unnecessary dependency injection.
- Helpers that merely wrap a single existing DevKit API without adding meaningful value.

Prefer small, focused functions.

## 9. Review checklist

- [ ] Existing utilities have been checked before creating new ones.
- [ ] The utility has a clear responsibility.
- [ ] The functionality is genuinely reusable.
- [ ] Production and test utilities are separated.
- [ ] Dependencies flow from factories to utilities.
- [ ] Circular dependencies are avoided.
- [ ] Existing consumers have been considered.
- [ ] Relevant tests have been added or updated.

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
