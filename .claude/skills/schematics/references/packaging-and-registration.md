# Packaging and Registration

## Purpose

Define how schematics are registered, exposed and packaged for distribution.

A schematic can work correctly in development but fail after publishing if its collection, schemas or templates are missing from the distribution.

## 1. Collection registration

`collection.json` is the registry of available schematics.

Each public schematic should define the appropriate:

- Factory reference.
- Description.
- Schema reference.
- Aliases where appropriate.

Example:

```json
{
  "example": {
    "factory": "./lib/example/example.factory#main",
    "description": "Create an example.",
    "schema": "./lib/example/schema.json",
    "aliases": ["ex"]
  }
}
```

Use paths relative to the built collection.

Keep collection entries aligned with the actual factory and schema locations.

## 2. Public exports

Use `index.ts` for the repository's intended public exports.

Do not assume every internal factory helper needs to be exported.

Keep the public API deliberate.

## 3. Schematic discovery

Ensure that:

- The collection is valid.
- Factory paths resolve.
- Schema paths resolve.
- Aliases do not conflict.
- Public schematic names are consistent.
- The package points to the correct collection.

## 4. Build output

Inspect the package build configuration.

Ensure that the distribution includes:

- Compiled JavaScript.
- Collection metadata.
- JSON schemas.
- Template files.
- Hidden template files where required.
- Other static assets consumed by schematics.

Do not assume TypeScript compilation automatically copies templates or JSON schemas.

## 5. Static asset copying

The build process may need explicit asset-copying steps.

Check the package scripts and build configuration.

Verify that:

- Templates retain their directory structure.
- Schema files are copied.
- Collection paths remain valid.
- Hidden files are preserved where required.
- Template extensions are retained.

Follow the actual package's build conventions.

## 6. Package metadata

Inspect:

- Package entry points.
- Published files.
- Schematic collection metadata.
- Build scripts.
- Package dependencies.
- Peer dependencies.

Ensure the published package references the correct built collection.

## 7. Testing the built package

Do not rely exclusively on source-level schematic tests.

Where practical, verify the built distribution.

Check:

- Collection loading.
- Schematic discovery.
- Factory resolution.
- Schema resolution.
- Template availability.
- Actual schematic execution.

A successful source test does not guarantee a correctly packaged schematic.

## 8. Version compatibility

When updating Angular DevKit or related dependencies, verify:

- Public API compatibility.
- Rule behaviour.
- Task behaviour.
- Template processing.
- Build compatibility.
- Supported Node.js versions.

Avoid depending on internal package implementation paths.

## 9. Review checklist

- [ ] Collection registration is valid.
- [ ] Factory paths resolve.
- [ ] Schema paths resolve.
- [ ] Aliases are correct.
- [ ] Public exports are intentional.
- [ ] Templates are included in the build.
- [ ] Schemas are included in the build.
- [ ] Hidden assets are handled.
- [ ] Package metadata is correct.
- [ ] Built distribution can load and execute schematics.
