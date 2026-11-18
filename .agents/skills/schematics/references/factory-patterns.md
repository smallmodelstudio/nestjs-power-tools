# Factory Patterns and Rule Composition

## Purpose

Define the expected implementation patterns for simple, integrated and workspace-level schematics.

## 1. Public entry point

Each schematic exposes a public `main()` function returning an Angular DevKit Rule.

```ts
export function main(options: ExampleOptions): Rule {
  options = transform(options);

  return chain([
    mergeSourceRoot(options),
    mergeWith(generate(options)),
  ]);
}
```

The example is illustrative. Actual Rule composition depends on the schematic's requirements.

## 2. Option transformation

`transform()` prepares incoming options.

Typical responsibilities:

- Required option validation.
- Name parsing.
- Name normalisation.
- Path normalisation.
- Defaults.
- Derived properties.
- Output path resolution.
- Unsupported option combinations.

Prefer copying the input object before transforming it.

Avoid performing Tree modifications during transformation.

## 3. Source generation

`generate()` constructs a Source.

Typical responsibilities:

- Template directory selection.
- Conditional file filtering.
- Template interpolation.
- Filename transformations.
- Destination selection.

Keep complex workspace operations outside template generation.

## 4. Dedicated Rules

Integrated schematics may require additional Rule functions.

Examples:

```ts
function addDeclarationToModule(
  options: ExampleOptions,
): Rule {
  return (tree, context) => {
    // Discover and modify an existing module.
    return tree;
  };
}
```

```ts
function addRequiredDependencies(
  options: ExampleOptions,
): Rule {
  return (tree, context) => {
    // Inspect and update dependencies.
    return tree;
  };
}
```

A dedicated Rule should have one clearly defined responsibility.

## 5. Rule composition

Common Angular DevKit operations:

| API | Use |
| --- | --- |
| `chain()` | Compose sequential Rules |
| `mergeWith()` | Merge a Source into a Tree |
| `apply()` | Apply Source transformations |
| `url()` | Load templates |
| `template()` | Interpolate variables |
| `filter()` | Conditionally include files |
| `move()` | Set destination paths |
| `noop()` | Represent an optional no-op |
| `branchAndMerge()` | Execute a Rule against a branch and merge its changes |

Understand the semantics of each operation before using it.

Do not add `branchAndMerge()` automatically. Use it when the required isolation and merge behaviour is appropriate.

## 6. Rule ordering

Rule ordering is significant.

Consider dependencies between operations.

For example:

- Inspect workspace configuration before resolving project-specific paths.
- Determine dependency requirements before scheduling installation.
- Ensure generated content is available before operations that depend on it.
- Format after the relevant files have been created or modified.

Do not assume Rules are independent.

## 7. Tree and context

Understand the responsibilities of:

- `Tree`: virtual filesystem and workspace changes.
- `SchematicContext`: execution context, logging and task scheduling.
- `Rule`: transformation of the Tree.
- `Source`: collection of files to be applied.

Do not confuse scheduling a task with executing it immediately.

## 8. Error handling

Use `SchematicsException` for expected schematic validation and execution errors where appropriate.

Distinguish:

- Invalid user input.
- Missing optional workspace elements.
- Unsupported project configurations.
- Unexpected implementation errors.

Use warnings when an optional operation can safely be skipped.

Do not silently suppress unexpected errors.

## 9. Idempotency

Where appropriate, Rules should avoid repeated modifications.

Check for:

- Existing imports.
- Existing declarations.
- Existing dependencies.
- Existing configuration entries.
- Existing generated files.

Repeated execution should not create unnecessary duplicates.

## 10. API compatibility

Prefer public Angular DevKit APIs.

Avoid importing internal package paths such as:

```ts
@angular-devkit/core/src/...
```

Use documented public APIs or repository-owned helpers instead.

## 11. Factory review

- One public entry point.
- Options prepared before execution.
- Rules have focused responsibilities.
- Rule ordering is intentional.
- Tree modifications are safe.
- Task scheduling is explicit.
- Errors and warnings are appropriate.
- Duplicate modifications are prevented.
- Public APIs are preferred.
