# MockApp

MockApp is a standalone offline browser application for designing Bootstrap-based UI mockups with a palette, design canvas, hierarchy view, structured property inspector, page management, and export workflows.

## Launch

Open `mockapp.html` directly in a current desktop browser.

- No web server is required.
- No npm install is required to run the app.
- Runtime dependencies are vendored locally.
- The application is intended to keep working from `file://` while offline.

## Current implementation highlights

- Local Bootstrap 5.3.8 and Bootstrap Icons 1.13.1 integration
- Multi-panel editor shell with toolbar, component palette, pages tab, layers tab, canvas, inspector, and status bar
- Structured component registry with nested layout support
- Page-based project model with explicit component hierarchy
- Autosave to localStorage
- Open and save of `.mockapp.json` files
- Export to HTML, PNG, SVG, and clipboard JSON
- Preview mode that hides editor chrome
- Example project files in `examples/`
- Node-based model tests in `tests/run-tests.js`

## Current scope

The current build focuses on the maintainable editor foundation and a usable first slice of Bootstrap-aware authoring. It does not yet cover every Bootstrap component or every planned editing tool from the original roadmap.

## Project structure

- `mockapp.html` — runtime entry point
- `css/` — editor shell and panel styling
- `js/` — modular buildless runtime scripts
- `vendor/` — vendored runtime dependencies
- `docs/` — architecture, design, format, roadmap, and maintenance documentation
- `examples/` — sample MockApp project files
- `tests/` — non-visual automated checks

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/FILE_INDEX.md`
- `docs/DATA_MODEL.md`
- `docs/PROJECT_FORMAT.md`
- `docs/COMPONENT_LIBRARY.md`
- `docs/KEYBOARD_SHORTCUTS.md`
- `docs/DEVELOPMENT.md`
- `docs/TESTING.md`
- `docs/ROADMAP.md`
- `docs/DEPENDENCIES.md`

## Run tests

```bash
node tests/run-tests.js
```