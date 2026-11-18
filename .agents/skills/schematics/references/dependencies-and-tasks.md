# Dependencies and Tasks

## Purpose

Define how schematics inspect and modify package dependencies and schedule external operations.

## 1. Dependency inspection

Before adding a dependency:

- Inspect existing `package.json` files.
- Check whether the dependency is already installed.
- Determine its dependency section.
- Preserve existing versions where appropriate.
- Determine whether the selected schematic mode requires it.

Use shared dependency utilities.

## 2. Dependency types

Use the appropriate dependency category.

Examples:

- Default dependencies.
- Development dependencies.
- Peer dependencies where appropriate.

The choice should reflect how the generated project consumes the package.

## 3. Version selection

Follow repository conventions.

Avoid:

- Arbitrary version upgrades.
- Replacing existing compatible versions.
- Unnecessary dependency additions.
- Inconsistent version ranges.

## 4. Conditional dependencies

Dependencies may depend on:

- REST or GraphQL generation.
- Database integrations.
- Swagger support.
- Optional framework functionality.
- Selected generation modes.

Only add dependencies required by the selected configuration.

## 5. Package manager detection

Use the shared package manager detection utility.

Do not hardcode npm, pnpm, yarn or another package manager.

Respect the target workspace's package manager configuration and lockfile conventions.

## 6. Installation tasks

Use Angular DevKit's task infrastructure when installation needs to be scheduled.

For example:

```ts
context.addTask(
  new NodePackageInstallTask({
    packageManager: detectPackageManager(tree),
  }),
);
```

Understand the distinction between:

- Updating `package.json`.
- Scheduling a package installation task.
- Executing the scheduled task.

Do not claim that scheduling a task immediately installs packages.

Only schedule installation when required.

## 7. Error handling

Consider:

- Missing `package.json`.
- Existing dependency.
- Invalid dependency configuration.
- Unsupported package manager.
- Installation failure.

Do not silently suppress unexpected errors.

Optional operations may use warnings or safe no-op behaviour where appropriate.

## 8. Testing

Verify:

- Existing dependency.
- Missing dependency.
- Correct dependency section.
- Correct version.
- Conditional requirements.
- Package manager detection.
- Task scheduling.
- Missing `package.json` handling.

Test `package.json` modifications separately from task scheduling where practical.

## 9. Review checklist

- [ ] Existing dependencies are inspected.
- [ ] Correct dependency type is used.
- [ ] Existing versions are preserved where appropriate.
- [ ] Conditional requirements are respected.
- [ ] Package manager detection is reused.
- [ ] Installation tasks are scheduled correctly.
- [ ] Errors are handled deliberately.
- [ ] Relevant tests exist.
