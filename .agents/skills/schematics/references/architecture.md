# Schematic Architecture

## Purpose

Describe the architectural model used to develop NestJS schematics.

Use the official NestJS Schematics project as an architectural reference while following the directory and implementation conventions of this monorepo.

## 1. A schematic is a workspace transformation

A schematic operates on an Angular DevKit Tree.

It can perform several types of operations:

- Generate new files.
- Modify existing files.
- Update project configuration.
- Modify dependencies.
- Schedule external tasks.
- Transform project structures.

File generation is only one possible operation.

## 2. Architectural layers

### Collection layer

Defines which schematics are available and how they are discovered.

Responsibilities:

- Schematic names.
- Factory references.
- Schema references.
- Descriptions.
- Aliases.

### Factory layer

Coordinates schematic execution.

Responsibilities:

- Option preparation.
- Rule composition.
- Workspace inspection.
- File generation.
- Existing file modification.
- Post-processing.

### Shared utility layer

Provides reusable implementation functionality.

Responsibilities:

- Name parsing.
- Path handling.
- Module discovery.
- Source declarations.
- Dependency manipulation.
- Configuration modification.
- Formatting.

### Template layer

Defines generated files and their contents.

Responsibilities:

- Language-specific output.
- Filename interpolation.
- Conditional templates.
- Template variables.

### Testing layer

Verifies schematic behaviour.

Responsibilities:

- Factory behaviour.
- Generated output.
- Workspace compatibility.
- Cross-schematic regression coverage.

## 3. Factory complexity

Not all schematics require the same architecture.

Classify new work into three broad categories.

### Simple declaration schematics

Examples:

- Class.
- Interface.
- Decorator.
- Guard.
- Pipe.
- Filter.

Typical operations:

- Validate options.
- Resolve a path.
- Generate files.
- Optionally format output.

### Integrated declaration schematics

Examples:

- Controller.
- Service.
- Module.
- Resource.

Typical operations:

- Generate files.
- Discover existing modules.
- Register declarations.
- Inspect dependencies.
- Conditionally generate files.
- Schedule installation tasks.

### Workspace schematics

Examples:

- Application.
- Library.
- Sub-application.
- Project conversion or upgrade operations.

Typical operations:

- Inspect the existing workspace.
- Create or reorganise project structures.
- Modify workspace configuration.
- Generate multiple groups of files.
- Update compiler configuration.
- Modify dependencies.
- Schedule installation tasks.

Do not force workspace schematics into the simple declaration pattern.

## 4. Separation of concerns

Use focused responsibilities:

| Concern        | Responsibility                    |
| -------------- | --------------------------------- |
| Orchestration  | Coordinates the lifecycle         |
| Transformation | Prepares incoming options         |
| Generation     | Constructs Sources                |
| Discovery      | Finds existing workspace elements |
| Modification   | Changes existing files            |
| Dependencies   | Updates package dependencies      |
| Tasks          | Schedules external operations     |
| Formatting     | Processes generated output        |

These responsibilities do not necessarily require separate files.

Keep implementation local until reuse or complexity justifies extraction.

## 5. Architectural boundaries

Prefer:

```text
Factory
  |
  +-- Option transformation
  |
  +-- Rule composition
  |     |
  |     +-- Workspace discovery
  |     +-- Workspace modification
  |     +-- Dependency management
  |     +-- Source generation
  |     +-- Post-processing
  |
  +-- Resulting Tree
```

Factories may depend on shared utilities.

Shared utilities should not depend on individual factory implementations.

Avoid circular dependencies.

## 6. Design principles

- Prefer composition over inheritance.
- Prefer focused functions over large factory classes.
- Reuse established utilities.
- Keep side effects explicit.
- Keep workspace assumptions visible.
- Preserve existing user configuration.
- Make operations predictable and testable.
- Avoid abstractions that have no demonstrated reuse.
