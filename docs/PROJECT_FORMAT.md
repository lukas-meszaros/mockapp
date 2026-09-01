# Project Format

## File extension

Preferred extension: `.mockapp.json`

## Versioning

- format: `MockApp`
- version: `1`

Future format upgrades should use dedicated migration functions rather than in-place mutation during parsing.

## Top-level schema

```json
{
  "format": "MockApp",
  "version": 1,
  "metadata": {},
  "settings": {},
  "pages": [],
  "activePageId": "page-id"
}
```

## Required fields

- `format`
- `version`
- `metadata.name`
- `pages`
- `activePageId`
- `page.id`
- `page.root`
- `component.id`
- `component.type`

## Hierarchy model

Components are nested objects through `children[]`. This makes containment explicit and keeps export traversal simple. Root-level components also persist a `frame` object so freeform canvas placement survives save, load, and export.

## Validation rules

Imported projects must reject or flag the following:

- unsupported format
- unsupported version
- missing pages
- duplicate component ids
- unknown component types
- malformed component objects

## Example

```json
{
  "format": "MockApp",
  "version": 1,
  "metadata": {
    "name": "Customer Portal",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-01T00:00:00.000Z",
    "appVersion": "0.2.0",
    "bootstrapVersion": "5.3.8",
    "bootstrapIconsVersion": "1.13.1"
  },
  "settings": {
    "grid": { "visible": true, "snap": true, "size": 8 },
    "showGuides": true,
    "autosaveIntervalMs": 1500
  },
  "pages": [
    {
      "id": "page-dashboard",
      "name": "Dashboard",
      "viewportPreset": "desktop",
      "layoutMode": "freeform",
      "root": {
        "id": "root-dashboard",
        "type": "page-root",
        "name": "Canvas Root",
        "props": {},
        "meta": { "locked": false, "hidden": false },
        "children": []
      }
    }
  ],
  "activePageId": "page-dashboard"
}
```
