# Schematic Testing

## Purpose

Define how schematic behaviour is tested at factory and workspace levels.

Testing should verify both generated output and the effects of modifying existing workspaces.

## 1. Testing layers

Use two primary testing layers.

### Factory unit tests

Located alongside their factory:

```text
lib/
└── example/
    ├── example.factory.ts
    └── example.factory.test.ts
```

Verify individual schematic behaviour using controlled Trees and schematic execution helpers.

### Integration tests

Located separately:

```text
tests/
├── integration/
└── utils/
```

Verify behaviour in realistic NestJS applications and monorepos.

Keep the distinction between these layers clear.

## 2. Factory unit tests

Test:

### Options

- Required properties.
- Invalid values.
- Defaults.
- Name parsing.
- Path normalisation.
- Conditional options.

### Generation

- Generated filenames.
- File contents.
- Language selection.
- Conditional filtering.
- Spec generation.
- Template helpers.

### Workspace modification

- Module discovery.
- Declaration insertion.
- Existing imports.
- Duplicate declarations.
- Configuration updates.

### Dependencies

- Existing dependencies.
- Missing dependencies.
- Correct dependency types.
- Installation task scheduling.

### Errors and warnings

- Missing modules.
- Unsupported project types.
- Missing configuration.
- Invalid options.

Test observable behaviour rather than private implementation details.

## 3. Integration tests

Integration tests should execute schematics against representative workspace structures.

Cover relevant combinations of:

- Standard applications.
- Monorepo applications.
- Libraries.
- Multiple projects.
- Custom source roots.
- ESM and CommonJS.
- TypeScript and JavaScript where supported.
- Existing modules.
- Existing dependencies.
- Custom configuration.

Test interactions between multiple schematic operations.

## 4. Workspace test infrastructure

Reusable helpers belong in `tests/utils/`.

Examples:

- Workspace creation.
- Project fixture creation.
- Schematic execution.
- Filesystem assertions.
- Configuration assertions.
- Dependency assertions.

Avoid sharing mutable workspace state between unrelated tests.

Clean up temporary resources.

## 5. Testing destructive operations

Operations that reorganise projects or modify existing configuration require additional care.

Test:

- Existing content preservation.
- Missing files.
- Unexpected directory layouts.
- Duplicate registrations.
- Repeated execution.
- Failure handling.
- Partial modification scenarios.

Do not rely solely on successful-path tests.

## 6. Test idempotency

Where practical, executing the same schematic twice should not create duplicate declarations, imports, dependencies or configuration entries.

Explicitly test repeated execution for operations that modify existing workspace content.

## 7. Test tooling

Use the repository's configured test runner and test utilities.

Do not assume the test runner used by another version of the official repository matches this monorepo.

Inspect:

- Package scripts.
- Test configuration.
- TypeScript test configuration.
- Existing test conventions.

## 8. Regression testing

When modifying shared utilities, identify all affected factories.

Run the relevant factory tests and integration tests.

When changing generated templates, verify the actual generated output.

## 9. Review checklist

- [ ] Factory tests cover core behaviour.
- [ ] Option validation is tested.
- [ ] Generated output is asserted.
- [ ] Workspace modifications are tested.
- [ ] Dependency changes are tested.
- [ ] Relevant integration scenarios are covered.
- [ ] Existing configuration is preserved.
- [ ] Repeated execution is considered.
- [ ] Temporary workspaces are cleaned up.
- [ ] Regression tests pass.
