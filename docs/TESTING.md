# Testing

## Current automated coverage

Run the non-visual model tests with:

- `node tests/run-tests.js`

These tests cover:

- default project creation
- component creation
- hierarchy insertion and movement
- frame normalization and persisted positioning
- project validation
- snapshot history undo/redo

## Manual browser checks

Run these against `file://.../mockapp.html`:

- page loads without required network calls beyond local files
- Bootstrap styles render correctly
- Bootstrap Icons render correctly
- palette click and drag-to-drop work
- root canvas items can be dragged and snap near other root items
- page tab operations work
- inspector updates re-render the selection
- Save/Open JSON works
- autosave recovery works
- HTML, PNG, and SVG export buttons produce files
- Preview mode hides editor chrome

## Future testing

- Playwright smoke tests against a local static copy
- export content validation
- clipboard behavior tests
- regression tests for templates and migrations
