# MockApp architecture

## Overview

MockApp is an offline-first browser application that opens directly from `file://` and does not require a server or build step.

## Implemented application shell

- `mockapp.html` provides the top toolbar, left component palette, center canvas, right property inspector, and bottom status bar.
- `css/mockapp.css` contains the application layout plus lightweight local Bootstrap-style classes used by the mockup components.
- `js/app/app.js` contains the project model, palette registry, canvas rendering, selection, property editing, autosave, JSON import/export, and HTML export logic.

## Data model

The current project format is JSON:

```json
{
  "version": 1,
  "name": "MockApp Project",
  "pages": [
    {
      "id": "page-1",
      "name": "Page 1",
      "components": []
    }
  ]
}
```

Each component stores:

- `id`
- `type`
- `props`

## Offline strategy

- All runtime assets are local repository files.
- Autosave uses `localStorage`.
- Save/load uses browser file APIs.
- Export produces a standalone HTML file with inline styles.

## Implemented milestones

1. Application shell and responsive layout
2. Palette-driven component creation
3. Selection and property editing
4. Local persistence and HTML export
