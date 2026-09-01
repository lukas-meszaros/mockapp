# Data Model

## Project

```json
{
  "format": "MockApp",
  "version": 1,
  "metadata": {
    "name": "MockApp Project",
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
  "pages": [],
  "activePageId": "page-1"
}
```

## Page

Each page owns a root node and a viewport preset.

```json
{
  "id": "page-1",
  "name": "Dashboard",
  "viewportPreset": "desktop",
  "layoutMode": "freeform",
  "root": {
    "id": "root-1",
    "type": "page-root",
    "name": "Canvas Root",
    "props": {},
    "meta": { "locked": false, "hidden": false },
    "children": []
  }
}
```

## Component

```json
{
  "id": "cmp-1",
  "type": "content.card",
  "name": "Card",
  "frame": {
    "x": 48,
    "y": 48,
    "width": 320,
    "height": 220
  },
  "props": {
    "title": "Card title",
    "text": "Card body"
  },
  "meta": {
    "locked": false,
    "hidden": false
  },
  "children": []
}
```

## Selection

Selection is UI state, not stored in the project file.

```json
{
  "ids": ["cmp-1"]
}
```

## ComponentDefinition

Definitions live in the centralized registry and describe:

- palette name
- category
- icon
- tags
- default props
- whether the component can contain children
- field metadata for the inspector

## PropertyDefinition

Each property descriptor contains:

- `path`
- `label`
- `type`
- optional `options`
- optional numeric bounds

## Viewport

Viewport presets are centralized in `js/app/constants.js`.

- mobile: 390 x 844
- mobile-landscape: 740 x 390
- tablet: 820 x 1180
- laptop: 1280 x 800
- desktop: 1440 x 900
- wide: 1680 x 1050

## Freeform placement

Root-level components are placed on the canvas with a persisted `frame` object. Nested components retain that field for forward compatibility, but page-root placement is the main active use in the current editor.

## HistoryAction

History uses bounded project snapshots rather than fine-grained command objects in the current implementation.

- `past[]`
- `present`
- `future[]`

## UserPreferences

Preferences are stored outside the project JSON.

- zoom
- left panel width
- right panel width
