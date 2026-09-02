# Development

## Runtime model

MockApp is buildless at runtime. Open `mockapp.html` directly from `file://`.

## Why classic scripts instead of ES modules

The direct file-launch requirement takes priority. External classic scripts load reliably from `file://` in current desktop browsers, while ES module behavior from local file URLs is inconsistent and often blocked by browser security policies.

## Required tools

- Modern desktop browser
- Git
- Optional: Node.js for local tests

## Useful commands

- `node tests/run-tests.js`
- `open mockapp.html`

## App version workflow

1. Update `version.js` and set `window.MockAppVersion` to the next semantic version.
2. Keep the `version.js` script include before `js/app/constants.js` in `mockapp.html`.
3. Open the app to verify the status bar shows `MockApp v<version>`.

## Dependency update flow

1. Replace local files in `vendor/bootstrap/`.
2. Replace local files in `vendor/bootstrap-icons/`.
3. Replace local files in `vendor/html2canvas/` if PNG export is retained.
4. Update versions in `js/app/constants.js`.
5. Update `docs/DEPENDENCIES.md`.
6. Update `docs/COMPONENT_LIBRARY.md` if Bootstrap coverage changes.
7. Run tests.
8. Re-test `file://` launch.

## Debugging

- Use browser devtools console.
- Inspect autosave and preferences in localStorage.
- Validate imported JSON before assuming load issues are UI-related.
- Check `docs/FILE_INDEX.md` before modifying modules.

## Release shape

Current runtime layout is already release-friendly:

- `mockapp.html`
- `css/`
- `js/`
- `vendor/`
- `examples/`
- `docs/`

A future `dist/` mirror can be added without changing runtime assumptions.
