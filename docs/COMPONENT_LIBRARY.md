# Component Library

Bootstrap version reference: 5.3.8

## Current implementation status

### Supported

- Layout: Container, Row, Column
- Typography: Heading, Paragraph
- Buttons: Button
- Forms: Text Input, Textarea, Select, Checkbox
- Navigation: Navbar
- Content: Card, Badge, Table
- Feedback: Alert
- Templates: Login Form, Dashboard Grid

### Supported as composite

- Login Form
- Dashboard Grid

### Represented visually later

- Modal
- Offcanvas
- Accordion
- Collapse
- Dropdown
- Tabs / Pills
- Toast
- Tooltip
- Popover
- Carousel
- Progress
- Spinner

### Planned later

- Breadcrumb
- Pagination
- List Group
- Button Group / Toolbar
- Floating Labels
- Input Group
- Validation states
- Placeholder
- Close button
- Figure
- Image helpers
- Multi-select
- Switch
- Range
- File input

## Implemented component details

### Container
- Category: Layout
- Palette name: Container
- Properties: fluid, padding, gap
- Allowed children: most components
- Allowed parents: page root, column, card
- Implementation module: `js/components/registry.js`

### Row
- Category: Layout
- Palette name: Row
- Properties: gutter, align items
- Allowed children: Column
- Allowed parents: page root, container, column, card
- Implementation module: `js/components/registry.js`

### Column
- Category: Layout
- Palette name: Column
- Properties: gap, xs/sm/md/lg/xl/xxl widths
- Allowed children: most components
- Allowed parents: Row
- Implementation module: `js/components/registry.js`

### Button
- Category: Buttons
- Palette name: Button
- Properties: label, variant, outline, size, disabled
- Preview interactions: normal Bootstrap button visual state
- HTML export: `<button>` with computed Bootstrap classes
- Implementation module: `js/components/registry.js`

### Text Input
- Category: Forms
- Palette name: Text Input
- Properties: label, placeholder, value, type, required
- HTML export: labeled `.form-control`
- Implementation module: `js/components/registry.js`

### Card
- Category: Content
- Palette name: Card
- Properties: title, body text, shadow
- Allowed children: yes
- Implementation module: `js/components/registry.js`

### Table
- Category: Content
- Palette name: Table
- Properties: columns, rows, striped, hover
- HTML export: `.table` inside `.table-responsive`
- Implementation module: `js/components/registry.js`

## Bootstrap coverage inventory

### Layout and grid
- Containers: supported
- Grid rows and columns: supported
- Stacks: planned later
- Gutters: partially supported

### Components
- Accordion: planned later
- Alerts: supported
- Badges: supported
- Breadcrumb: planned later
- Buttons: supported
- Button group: planned later
- Card: supported
- Carousel: planned later
- Close button: planned later
- Collapse: planned later
- Dropdowns: planned later
- List group: planned later
- Modal: represented visually later
- Navbar: supported
- Navs and tabs: planned later
- Offcanvas: represented visually later
- Pagination: planned later
- Placeholders: planned later
- Popovers: represented visually later
- Progress: planned later
- Scrollspy: not applicable in editor MVP
- Spinners: planned later
- Toasts: represented visually later
- Tooltips: represented visually later

### Forms
- Text input: supported
- Textarea: supported
- Select: supported
- Checkbox: supported
- Radios: planned later
- Switches: planned later
- Range: planned later
- Floating labels: planned later
- Input groups: planned later
- Validation: planned later

## Upgrade procedure

1. Update vendored Bootstrap assets.
2. Update vendored Bootstrap Icons assets.
3. Update versions in `js/app/constants.js`.
4. Review this file for changed coverage.
5. Adjust registry metadata and renderers.
6. Re-run tests and file-protocol checks.
