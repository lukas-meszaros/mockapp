# File Index

## mockapp.html
Purpose: Browser entry point and static application shell.
Subsystem: App shell.
Responsibilities: Loads vendor assets, panel layout, toolbars, dialog, toast region, and all runtime scripts.
Depends on: `css/`, `js/`, `vendor/` (Bootstrap, Bootstrap Icons, html2canvas, Highlight.js).
Modify when: Changing shell structure, adding UI mount points, changing load order.
Do NOT modify when: Changing business logic only.

## README.md
Purpose: Human-facing project overview.
Subsystem: Documentation.
Responsibilities: Launch instructions, scope, structure, documentation entry points.
Depends on: Current repo structure.
Modify when: Project capabilities, structure, or launch workflow changes.
Do NOT modify when: Internal refactors do not affect users or contributors.

## AGENTS.md
Purpose: Working rules for AI and automated contributors.
Subsystem: Contributor workflow.
Responsibilities: Mandatory reading order, guardrails, vendor policy, file protocol constraints.
Depends on: Current architecture and repository practices.
Modify when: Workflow or architectural guardrails change.
Do NOT modify when: A change is purely feature-local.

## THIRD_PARTY_NOTICES.md
Purpose: Third-party notice summary for vendored runtime libraries.
Subsystem: Compliance.
Responsibilities: List vendored dependency names, versions, and license file locations.
Depends on: `vendor/licenses/`, `docs/DEPENDENCIES.md`.
Modify when: Vendored libraries change.
Do NOT modify when: App-only code changes.

## css/mockapp.css
Purpose: CSS aggregator.
Subsystem: Styling.
Responsibilities: Imports the focused editor stylesheets.
Depends on: `css/layout.css`, `css/panels.css`, `css/canvas.css`, `css/dialogs.css`.
Modify when: Adding or removing stylesheet modules.
Do NOT modify when: A specific style belongs in one of the imported files.

## css/layout.css
Purpose: Global variables and shell layout styling.
Subsystem: Styling.
Responsibilities: Top bar, status bar, workspace grid, splitters, responsive shell behavior, preview mode chrome hiding.
Depends on: `mockapp.html` class names.
Modify when: Changing global visual system or shell layout.
Do NOT modify when: A change is limited to canvas or inspector styling.

## css/panels.css
Purpose: Side panel styling.
Subsystem: Styling.
Responsibilities: Palette cards, tabs, tree panel, pages panel, property inspector controls.
Depends on: `js/ui/sidebar.js`, `js/ui/inspector.js`.
Modify when: Changing palette, page list, layer tree, or inspector presentation.
Do NOT modify when: Canvas frame behavior changes.

## css/canvas.css
Purpose: Canvas and viewport styling.
Subsystem: Canvas UI.
Responsibilities: Viewport frame, grid backdrop, component chrome, drop zones, quick actions.
Depends on: `js/ui/canvas.js`, `js/ui/shell.js`.
Modify when: Changing viewport presentation, grid visuals, or canvas node chrome.
Do NOT modify when: A change is purely about panel controls.

## css/dialogs.css
Purpose: Dialog and toast styling.
Subsystem: Feedback UI.
Responsibilities: Modal dialog container, backdrop, footer, toast presentation.
Depends on: `js/ui/shell.js`.
Modify when: Changing notices, confirmation dialogs, or toast visuals.
Do NOT modify when: Changing business rules for when messages appear.

## js/app/namespace.js
Purpose: Shared namespace bootstrap.
Subsystem: Runtime foundation.
Responsibilities: Creates the `window.MockApp` namespaces used by all classic scripts.
Depends on: Nothing.
Modify when: Restructuring global module buckets.
Do NOT modify when: Adding regular app behavior.

## js/app/constants.js
Purpose: Central runtime constants.
Subsystem: Runtime foundation.
Responsibilities: Versions, storage keys, viewport presets, breakpoints, history size, event names.
Depends on: None.
Modify when: Versions, defaults, or shared enumerations change.
Do NOT modify when: A value is local to one feature.

## vendor/highlightjs/highlight.min.js
Purpose: Vendored syntax highlighter runtime.
Subsystem: Third-party runtime.
Responsibilities: Tokenization and HTML rendering for syntax highlighting in code editors.
Depends on: `vendor/highlightjs/languages/*.min.js`.
Modify when: Upgrading Highlight.js.
Do NOT modify when: Changing MockApp business logic.

## vendor/highlightjs/languages/xml.min.js
Purpose: Highlight.js XML/HTML language definition.
Subsystem: Third-party runtime.
Responsibilities: Language grammar for HTML/XML highlighting.
Depends on: `vendor/highlightjs/highlight.min.js`.
Modify when: Upgrading Highlight.js language packs.
Do NOT modify when: Changing app code.

## vendor/highlightjs/languages/css.min.js
Purpose: Highlight.js CSS language definition.
Subsystem: Third-party runtime.
Responsibilities: Language grammar for CSS highlighting.
Depends on: `vendor/highlightjs/highlight.min.js`.
Modify when: Upgrading Highlight.js language packs.
Do NOT modify when: Changing app code.

## vendor/highlightjs/styles/github.min.css
Purpose: Highlight.js editor theme.
Subsystem: Third-party runtime.
Responsibilities: Syntax token colors used by HTML/CSS editor fields.
Depends on: Highlight.js token class output.
Modify when: Adjusting syntax theme or upgrading Highlight.js styles.
Do NOT modify when: Changing non-editor panel styles.

## vendor/licenses/highlightjs-LICENSE
Purpose: License text for Highlight.js.
Subsystem: Compliance.
Responsibilities: Stores redistributed third-party license.
Depends on: `vendor/highlightjs/`.
Modify when: Upgrading Highlight.js or license text changes.
Do NOT modify when: App-only source changes.

## js/app/utils.js
Purpose: Shared utilities.
Subsystem: Runtime foundation.
Responsibilities: IDs, cloning, file download, escaping, debounce, nested object path helpers.
Depends on: Browser globals.
Modify when: A utility is reused across multiple modules.
Do NOT modify when: A helper is feature-local and belongs in its owning module.

## js/app/controller.js
Purpose: Central action controller.
Subsystem: Application control.
Responsibilities: Owns app state, mutation flow, autosave updates, history integration, high-level user commands, multi-selection management, root alignment commands, and root layering commands.
Depends on: `js/data/project.js`, `js/history/history.js`, `js/persistence/persistence.js`, `js/export/exporters.js`, `js/ui/*`.
Modify when: Adding or changing top-level user actions or state transitions.
Do NOT modify when: A change is limited to presentation markup or styling.

## js/app/app.js
Purpose: Runtime boot entry.
Subsystem: Application control.
Responsibilities: Collect refs, create controller, bind toolbar, tab, keyboard, file input, and splitter interactions.
Depends on: `js/app/controller.js`, `js/ui/shell.js`.
Modify when: Wiring new shell commands or startup behavior.
Do NOT modify when: Changing project data semantics.

## js/components/registry.js
Purpose: Central component metadata registry.
Subsystem: Component library.
Responsibilities: Defines supported components, categories, tags, child rules, defaults, inspector schemas, and default freeform canvas frame sizes.
Depends on: `js/app/constants.js`.
Modify when: Adding components, fields, categories, containment rules, or default freeform sizing.
Do NOT modify when: Adjusting generic project traversal or storage.

## js/data/project.js
Purpose: Project tree model and invariants.
Subsystem: Data model.
Responsibilities: Creates projects/pages/components, normalizes persisted projects, validates project files, inserts, removes, clones, traverses, moves nodes, persists freeform root frame geometry, and stores per-component advanced HTML/CSS overrides.
Depends on: `js/components/registry.js`, `js/app/utils.js`.
Modify when: Changing JSON shape, freeform frame semantics, tree semantics, validation, or template construction.
Do NOT modify when: Changing pure UI styling or toolbar layout.

## js/history/history.js
Purpose: Undo/redo state manager.
Subsystem: History.
Responsibilities: Maintains bounded snapshot history and exposes undo/redo helpers.
Depends on: `js/app/utils.js`.
Modify when: Changing history storage strategy.
Do NOT modify when: Changing canvas rendering or component definitions.

## js/persistence/persistence.js
Purpose: Browser persistence services.
Subsystem: Persistence.
Responsibilities: Autosave, preferences, recents, file save, file load, File System Access API fallback handling.
Depends on: `js/data/project.js`, `js/app/constants.js`, `js/app/utils.js`.
Modify when: Changing save/open behavior or local storage policies.
Do NOT modify when: Changing component rendering.

## js/export/exporters.js
Purpose: Export pipeline.
Subsystem: Export.
Responsibilities: Converts project content into HTML, PNG, SVG, and clipboard JSON output; applies per-component code overrides and control-local render fallback handling.
Depends on: `js/data/project.js`, `js/components/registry.js`, `vendor/html2canvas/html2canvas.min.js`.
Modify when: Adding export formats or changing markup generation.
Do NOT modify when: Changing toolbar bindings only.

## js/ui/shell.js
Purpose: Shared shell helpers.
Subsystem: UI shell.
Responsibilities: DOM refs, tab activation, status bar updates, dialog control (including custom modal-body renderers), toasts, panel splitters, viewport shell updates.
Depends on: `mockapp.html`, `css/layout.css`, `css/dialogs.css`.
Modify when: Changing shell-level UI behavior.
Do NOT modify when: A change is isolated to palette or inspector field generation.

## js/ui/sidebar.js
Purpose: Left panel renderer.
Subsystem: Sidebar UI.
Responsibilities: Renders palette groups, page list, and hierarchy tree; handles tree drop behavior and root-layer ordering actions.
Depends on: `js/components/registry.js`, `js/data/project.js`.
Modify when: Changing left-panel tabs or hierarchy presentation.
Do NOT modify when: Changing data model invariants.

## js/ui/inspector.js
Purpose: Structured property inspector renderer.
Subsystem: Inspector UI.
Responsibilities: Renders page settings, component fields, root-level frame controls, action controls from registry schema, advanced designers (for example table and toolbar modals), and per-component advanced HTML/CSS override editors with syntax highlighting previews.
Depends on: `js/components/registry.js`, `js/data/project.js`, `js/app/utils.js`.
Modify when: Changing property editing UX.
Do NOT modify when: Adding low-level project traversal helpers.

## js/ui/canvas.js
Purpose: Canvas renderer.
Subsystem: Canvas UI.
Responsibilities: Renders nested component nodes, freeform root placement, pointer-drag movement, drop surfaces, alignment guides, selection chrome, quick actions, live preview rendering, marquee-based multi-selection, and direct per-control HTML/CSS editor launchers.
Depends on: `js/data/project.js`, `js/components/registry.js`, `js/export/exporters.js`.
Modify when: Changing canvas composition, freeform dragging, snapping, or drag/drop targets.
Do NOT modify when: Changing export-only markup or persisted format rules.

## docs/ARCHITECTURE.md
Purpose: Canonical architecture description.
Subsystem: Documentation.
Responsibilities: Runtime design, module ownership, file protocol strategy, persistence, export, history.
Depends on: Current code structure.
Modify when: Architecture or ownership changes.
Do NOT modify when: Changes are purely stylistic.

## docs/DESIGN.md
Purpose: UX and visual design record.
Subsystem: Documentation.
Responsibilities: Shell layout, interaction model, structured editing principles, textual wireframe.
Depends on: Current editor UI.
Modify when: UX decisions materially change.
Do NOT modify when: Internal logic changes without UX impact.

## docs/DATA_MODEL.md
Purpose: Data model reference.
Subsystem: Documentation.
Responsibilities: Describes project, page, component, selection, history, preferences.
Depends on: `js/data/project.js`.
Modify when: JSON or in-memory model changes.
Do NOT modify when: Styling or toolbar changes only.

## docs/PROJECT_FORMAT.md
Purpose: Saved file format reference.
Subsystem: Documentation.
Responsibilities: File extension, versioning, validation rules, example schema.
Depends on: `js/data/project.js`, `js/persistence/persistence.js`.
Modify when: Saved format or validation rules change.
Do NOT modify when: UI-only behavior changes.

## docs/COMPONENT_LIBRARY.md
Purpose: Bootstrap coverage inventory.
Subsystem: Documentation.
Responsibilities: Supported components, planned components, coverage mapping, upgrade checklist.
Depends on: `js/components/registry.js`, current Bootstrap version.
Modify when: Registry coverage changes or Bootstrap is upgraded.
Do NOT modify when: Persistence internals change.

## docs/KEYBOARD_SHORTCUTS.md
Purpose: Shortcut reference.
Subsystem: Documentation.
Responsibilities: Implemented shortcuts and planned additions.
Depends on: `js/app/app.js`.
Modify when: Keyboard bindings change.
Do NOT modify when: Non-shortcut features change.

## docs/DEVELOPMENT.md
Purpose: Developer workflow reference.
Subsystem: Documentation.
Responsibilities: Tooling expectations, test command, dependency update flow, debugging notes.
Depends on: Current repo workflow.
Modify when: Setup or update procedure changes.
Do NOT modify when: End-user behavior changes only.

## docs/TESTING.md
Purpose: Testing strategy and checklist.
Subsystem: Documentation.
Responsibilities: Automated tests, manual `file://` checks, future test expansion.
Depends on: `tests/run-tests.js`.
Modify when: Test coverage or validation workflow changes.
Do NOT modify when: A code change does not affect tests.

## docs/ROADMAP.md
Purpose: Product planning record.
Subsystem: Documentation.
Responsibilities: MVP, version 1.x, and future feature grouping.
Depends on: Current product plan.
Modify when: Priorities or milestone scope changes.
Do NOT modify when: Implementing details without roadmap impact.

## docs/DEPENDENCIES.md
Purpose: Dependency inventory.
Subsystem: Documentation.
Responsibilities: Runtime dependency versions, licenses, purpose, update procedure.
Depends on: `vendor/`, `js/app/constants.js`.
Modify when: Vendored dependencies change.
Do NOT modify when: App-only logic changes.

## examples/login.mockapp.json
Purpose: Login example project.
Subsystem: Examples.
Responsibilities: Demonstrates nested form-oriented layout.
Depends on: Current project format.
Modify when: The saved format changes or the example becomes invalid.
Do NOT modify when: Editing unrelated runtime code.

## examples/dashboard.mockapp.json
Purpose: Dashboard example project.
Subsystem: Examples.
Responsibilities: Demonstrates navbar, grid, badge, and table usage.
Depends on: Current project format.
Modify when: Format changes or dashboard coverage changes.
Do NOT modify when: A feature is unrelated to examples.

## examples/form.mockapp.json
Purpose: Form example project.
Subsystem: Examples.
Responsibilities: Demonstrates structured form controls and text content.
Depends on: Current project format.
Modify when: Form component defaults or schema change materially.
Do NOT modify when: Only shell visuals change.

## examples/admin-table.mockapp.json
Purpose: Admin table example project.
Subsystem: Examples.
Responsibilities: Demonstrates table and alert composition.
Depends on: Current project format.
Modify when: Table schema or format changes.
Do NOT modify when: A change is unrelated to examples.

## tests/run-tests.js
Purpose: Minimal automated model test harness.
Subsystem: Testing.
Responsibilities: Loads the non-visual runtime modules in Node and validates creation, movement, validation, and history behavior.
Depends on: `js/app/namespace.js`, `js/app/constants.js`, `js/app/utils.js`, `js/components/registry.js`, `js/data/project.js`, `js/history/history.js`.
Modify when: The model or history contract changes.
Do NOT modify when: A UI-only change does not affect model behavior.

## initial_prompt.txt
Purpose: Captured product brief.
Subsystem: Reference.
Responsibilities: Preserves the original implementation prompt inside the repository.
Depends on: None.
Modify when: Only if intentionally updating the canonical prompt text for future sessions.
Do NOT modify when: Implementing the application.
