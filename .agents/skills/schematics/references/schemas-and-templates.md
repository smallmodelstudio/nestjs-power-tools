# Schemas, Options and Templates

## 1. Option contract

Each schematic maintains two primary option representations:

```text
example/
├── schema.json
└── example.schema.d.ts
```

### JSON Schema

Defines the user-facing contract.

Include:

- Property types.
- Required properties.
- Defaults.
- Descriptions.
- Enumerated values.
- Validation constraints.
- CLI aliases where applicable.

### TypeScript interface

Defines the options consumed by the factory.

Keep it aligned with the JSON Schema and implementation.

## 2. User-facing and internal options

Distinguish between user-facing and internal properties.

User-facing examples:

- `name`
- `path`
- `language`
- `flat`
- `spec`
- `format`

Internal examples:

- `className`
- `metadata`
- `isEsm`
- `module`
- `isSwaggerInstalled`

Internal properties should not automatically be exposed through the JSON Schema.

## 3. Option transformation

Perform runtime preparation in the factory's transformation stage.

Typical operations:

- Validation.
- Name parsing.
- Path normalisation.
- Default application.
- Derived property calculation.
- Unsupported option validation.

Keep templates independent of raw CLI input.

## 4. Conditional options

Complex schematics may expose options that change available generation modes.

Examples:

- REST versus GraphQL.
- GraphQL code-first versus schema-first.
- CRUD generation enabled or disabled.
- Optional framework integrations.
- JavaScript versus TypeScript.

Validate incompatible combinations explicitly.

Do not assume every option combination is supported.

## 5. Template organisation

Keep templates with their owning schematic.

Example:

```text
example/
└── files/
    ├── js/
    └── ts/
```

More complex schematics may organise templates into meaningful groups.

Use existing repository conventions rather than introducing arbitrary nested structures.

## 6. Conditional template generation

Use `filter()` to include or exclude files based on prepared options.

Examples:

- Generate controllers for REST.
- Generate resolvers for GraphQL.
- Generate gateways for WebSocket applications.
- Generate DTOs or GraphQL inputs depending on the selected mode.
- Generate spec files conditionally.
- Generate entity files only when CRUD generation is enabled.

Keep conditions understandable and test each relevant generation mode.

## 7. Template helpers

Provide reusable template values through the `template()` context.

Examples:

- Classification.
- Lowercasing.
- Pluralisation.
- Singularisation.
- Framework-specific naming.

Simple formatting helpers can be provided directly to templates.

Complex business logic should live in the factory or a shared utility.

Avoid importing internal library APIs solely to access string helpers.

## 8. Filename interpolation

Follow the established filename conventions.

Ensure:

- Correct casing.
- Correct extensions.
- Correct language-specific filenames.
- Correct suffix replacement.
- No template-only markers remain in output.

## 9. Language support

Do not assume all schematics support JavaScript and TypeScript.

Explicitly define supported languages.

For unsupported languages:

- Reject the option clearly.
- Do not silently fall back to another language.
- Test the error behaviour.

## 10. Generated output

Treat generated files as public output.

Verify:

- Filenames.
- File contents.
- Imports.
- Naming.
- Formatting.
- Language syntax.
- Conditional inclusion.

## 11. Review checklist

- [ ] JSON Schema is valid.
- [ ] TypeScript options match.
- [ ] Internal properties are separated.
- [ ] Conditional options are validated.
- [ ] Template conditions are correct.
- [ ] Language support is explicit.
- [ ] Template helpers are appropriately scoped.
- [ ] Generated output is tested.
