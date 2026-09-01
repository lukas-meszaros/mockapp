# Design

## Visual direction

MockApp uses a neutral editor chrome with a bright workspace, soft blue accents, and clear separation between editor controls and the Bootstrap preview surface. The goal is to feel closer to a desktop design tool than to a raw form builder.

## Layout

- Top menu bar: File, Edit, View, Insert, Arrange, Help.
- Action toolbar: file actions, undo/redo, duplicate/delete, export, preview.
- Left panel tabs: Components, Pages, Layers.
- Center canvas: viewport toolbar, zoom controls, responsive preview frame, drop zones.
- Right inspector: structured properties only.
- Bottom status bar: project, viewport, selection, component count, autosave status.

## Interaction model

- Palette items can be clicked or dragged onto the canvas.
- Canvas nodes expose selection chrome and trusted internal rendering.
- Root-level canvas items are freeform by default and can be moved visually around the page.
- Hierarchy is explicit: components are nested in a tree, not treated as unrelated absolute rectangles.
- Preview mode hides editor chrome so Bootstrap interactions can be exercised more realistically.
- Page management is surfaced in a dedicated left-panel tab.

## Property editing

The inspector is metadata-driven. Shared fields are rendered first:

- name
- locked
- hidden in editor

Component-specific fields are then generated from the registry. Raw class editing is intentionally excluded from version 1 to keep saved projects predictable.

## Responsive workflow

Viewport presets are first-class UI controls:

- Mobile
- Mobile Landscape
- Tablet
- Laptop
- Desktop
- Large Desktop

Grid-based column widths are edited with structured breakpoint fields rather than direct class entry.

## Layout behavior

- Default page layout mode: freeform canvas at the page root.
- Root-level components persist `x`, `y`, `width`, and `height`.
- Dragging snaps to the configured grid and aligns to nearby root component edges and centers.
- Nested Bootstrap layout components still preserve structural parent-child relationships.

## Visual mockup

```text
+--------------------------------------------------------------------------------------------------+
| MockApp | File Edit View Insert Arrange Help                           [Preview]                 |
| [New] [Open] [Save] [Save As] [Undo] [Redo] [Duplicate] [Delete] [Copy JSON] [HTML] [PNG] [SVG] |
+-------------------------------+-----------------------------------------------+------------------+
| Components | Pages | Layers   | Canvas: Dashboard                             | Properties       |
| Search components...          | [ - ] [100%] [ + ]   Viewport [ Desktop v ]   | Selected Card    |
|                               +-----------------------------------------------+------------------|
| Layout                        | Responsive Bootstrap preview surface                                 |
|  Container                    | +---------------------------------------------------------------+    |
|  Row                          | | Navbar                                                        |    |
|  Column                       | |                                                               |    |
| Content                       | | +-------------------+  +----------------------------------+ |    |
|  Card                         | | | Revenue Card      |  | Table                             | |    |
|  Table                        | | +-------------------+  +----------------------------------+ |    |
| Forms                         | |                                                               |    |
|  Text Input                   | +---------------------------------------------------------------+    |
+-------------------------------+-----------------------------------------------+------------------+
| Project | Viewport | Selection | Components | Autosave                                                  |
+--------------------------------------------------------------------------------------------------+
```
