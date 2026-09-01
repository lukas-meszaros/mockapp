# AGENTS

## Project purpose

MockApp is a standalone offline browser application for visually designing realistic Bootstrap-based UI mockups. The repository is intentionally structured for maintainability, predictable file ownership, and future AI-assisted changes.

## Mandatory workflow before changing code

1. Read `AGENTS.md`.
2. Read `docs/FILE_INDEX.md`.
3. Identify the subsystem related to the request.
4. Read only the relevant files first.
5. Avoid scanning the entire repository unless the change genuinely spans multiple subsystems.
6. Update `docs/FILE_INDEX.md` whenever a file is added, removed, renamed, or substantially repurposed.
7. Update architecture or design documentation when architecture or workflows change.
8. Update tests when behavior changes.
9. Keep modules focused. Do not place unrelated behavior into convenient existing files.
10. Prefer creating or refactoring focused modules when responsibilities become mixed.

## Project-specific rules

- Preserve direct `file://` launch from `mockapp.html`.
- Do not introduce a runtime server dependency.
- Do not introduce runtime CDN dependencies.
- Do not modify `vendor/` code unless updating vendored dependencies intentionally.
- Keep Bootstrap-specific metadata centralized in `js/components/registry.js` and `js/app/constants.js`.
- Do not duplicate component definitions across files.
- Preserve backwards compatibility of saved MockApp JSON where practical.
- When the project format changes, document the migration path in `docs/PROJECT_FORMAT.md` and keep migrations separate from normal loading logic.
- Prefer structured property editing over raw HTML, CSS, or class-string editing.
- Keep export behavior documented when adding new formats or limitations.

## Architecture guardrails

- Runtime JavaScript is split across classic scripts under `js/` instead of ES modules to preserve reliable `file://` behavior.
- UI is organized around five main surfaces: toolbar, left navigation panels, canvas, right inspector, and status bar.
- The data model uses explicit nested component trees per page.
- History uses bounded snapshots of the project model.
- Browser storage is allowed for autosave, preferences, and recent project metadata.

## Files to check first

- `mockapp.html`
- `docs/FILE_INDEX.md`
- `docs/ARCHITECTURE.md`
- `js/app/controller.js`
- `js/components/registry.js`
- `js/data/project.js`

## Vendor policy

Vendored runtime dependencies currently include Bootstrap, Bootstrap Icons, and html2canvas. Their versions and update policy live in `docs/DEPENDENCIES.md`.
