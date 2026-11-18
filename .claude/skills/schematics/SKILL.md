---
name: schematics
description: Develop, extend, test and maintain NestJS Angular DevKit schematics. Use when creating or modifying schematic factories, collections, schemas, templates, workspace transformations, dependencies, project configuration or tests.
---

# NestJS Schematics Development

## Purpose

Develop schematics using the architectural principles demonstrated by the official NestJS Schematics project and the conventions established in this monorepo.

A schematic is a workspace transformation, not simply a file generator.

It may:

- Generate files from templates.
- Inspect existing project configuration.
- Modify existing source files.
- Register declarations in NestJS modules.
- Modify package dependencies.
- Schedule package installation tasks.
- Create or modify NestJS applications and libraries.
- Transform existing projects into monorepo structures.
- Update build, compiler and CLI configuration.

Understand the complete workspace transformation before implementing a schematic.

## Repository conventions

The monorepo's implementation is the primary source of truth.

The expected schematic package structure is:

```text
schematics/
├── collection.json
├── index.ts
├── lib/
│   ├── defaults.ts
│   └── <schematic>/
│       ├── files/
│       ├── <schematic>.factory.ts
│       ├── <schematic>.factory.test.ts
│       ├── <schematic>.schema.d.ts
│       └── schema.json
├── utils/
└── tests/
    ├── integration/
    └── utils/
```

Do not copy the official repository's directory structure blindly. Adopt its architectural principles while preserving this monorepo's conventions.

## Core architectural principles

### 1. Factories orchestrate workspace transformations

A factory should have one public entry point, conventionally `main()`.

Use focused functions for:

- Option transformation.
- Source generation.
- Existing file modification.
- Project configuration changes.
- Dependency management.
- Other reusable workspace operations.

Use Angular DevKit Rules to compose operations.

### 2. Separate input preparation from execution

Keep raw option interpretation separate from workspace operations.

- `main()` coordinates execution.
- `transform()` validates and prepares options.
- `generate()` constructs generated Sources.
- Dedicated Rule functions modify or inspect the workspace.

These are architectural responsibilities, not mandatory function names for every schematic.

### 3. Treat the Tree as the workspace

Always understand the existing workspace before modifying it.

Consider:

- Standard NestJS projects.
- NestJS monorepos.
- Multiple applications and libraries.
- Custom source roots.
- Existing modules.
- ESM and CommonJS.
- Existing dependencies and configuration.

Avoid assuming a canonical directory structure when the workspace provides project metadata that should be inspected.

### 4. Reuse shared utilities

Use existing utilities for:

- Name parsing.
- Path resolution.
- Source-root handling.
- Module discovery.
- Module declarations.
- Dependency management.
- Formatting.
- Configuration modification.

Do not duplicate existing behaviour or introduce unnecessary abstractions.

### 5. Treat generated output as a public contract

Generated files and workspace modifications are observable behaviour.

Preserve established conventions and consider compatibility whenever changing generated output.

## Development workflow

When implementing a new schematic:

1. Inspect comparable existing schematics.
2. Identify whether it is a declaration generator, workspace generator or workspace modifier.
3. Understand its required options.
4. Inspect relevant shared utilities.
5. Define its JSON Schema and TypeScript interface.
6. Design the factory Rule pipeline.
7. Implement template generation and workspace modifications.
8. Handle dependencies and scheduled tasks if necessary.
9. Add factory unit tests.
10. Add integration tests for realistic workspace scenarios.
11. Register the schematic in `collection.json`.
12. Update public exports where required.
13. Verify build and distribution behaviour.
14. Run relevant tests, type checking and formatting.

## Reference documentation

Consult the relevant references before implementation.

| Reference                       | Responsibility                                |
| ------------------------------- | --------------------------------------------- |
| `architecture.md`               | Repository architecture and design principles |
| `factory-patterns.md`           | Factory structure and Rule composition        |
| `schemas-and-templates.md`      | Options, validation and generation            |
| `workspace-and-projects.md`     | NestJS projects, applications and monorepos   |
| `dependencies-and-tasks.md`     | Dependencies and installation tasks           |
| `testing.md`                    | Unit and integration testing                  |
| `packaging-and-registration.md` | Collection registration and distribution      |

Consult multiple references when a task crosses architectural boundaries.

## Important rules

- Inspect existing implementations before creating new abstractions.
- Prefer established repository utilities.
- Use public Angular DevKit APIs.
- Avoid internal package imports.
- Keep workspace modifications focused and predictable.
- Preserve existing configuration and source content.
- Avoid duplicate imports, declarations and dependencies.
- Handle missing project files deliberately.
- Do not silently swallow unexpected errors.
- Respect the existing module system and language.
- Do not introduce breaking changes without justification.
- Do not assume every schematic supports every language or project type.

## Completion checklist

- [ ] Factory responsibilities are clearly separated.
- [ ] Options and schemas are consistent.
- [ ] Workspace assumptions are validated.
- [ ] Generated files are correct.
- [ ] Existing files are modified safely.
- [ ] Dependencies are handled correctly.
- [ ] Module and configuration modifications are correct.
- [ ] Unit tests cover individual behaviour.
- [ ] Integration tests cover relevant workspace scenarios.
- [ ] Collection registration is correct.
- [ ] Build output includes required assets.
- [ ] Existing functionality remains compatible.
