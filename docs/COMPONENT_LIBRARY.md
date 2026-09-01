# Component Library

Bootstrap version reference: 5.3.8

## Current implementation status

### Supported

- Layout: Container, Row, Column
- Typography: Heading, Paragraph
- Buttons: Button
- Forms: Text Input, Textarea, Select, Checkbox, Radio, Switch
- Navigation: Navbar
- Navigation: Navbar, Breadcrumb, Pagination, Tabs, Pills, Dropdown, Dropdown Button, Offcanvas Navigation
- Content: Card, Badge, Table, Image, Figure, List Group
- Feedback: Alert, Progress, Spinner, Toast, Placeholder
- Interactive Bootstrap Components: Accordion, Collapse, Carousel, Tooltip, Popover
- Templates: Login Form, Dashboard Grid

### Supported as composite

- Most additional palette entries are currently implemented as template/composite aliases built from stable primitives
- Input variants (email/password/number/search/tel/url) map to configured `form.input`
- Responsive Table maps to `data.table`
- Many interactive Bootstrap entries are represented as editable visual composites in MVP

### Represented visually later

- Modal
- Offcanvas (generic interactive variant)

### Planned later

- Native per-component renderers for palette aliases that are currently represented via composites
- True semantic implementations for radio/switch/range/file/floating-label/input-group
- Dedicated renderer for modal and generic offcanvas interactive variant

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
- Accordion: supported
- Alerts: supported
- Badges: supported
- Breadcrumb: supported
- Buttons: supported
- Button group: represented visually later (palette entry available)
- Card: supported
- Carousel: supported
- Close button: represented visually later (palette entry available)
- Collapse: supported
- Dropdowns: supported
- List group: supported
- Modal: represented visually later
- Navbar: supported
- Navs and tabs: supported
- Offcanvas: partially supported (navigation variant)
- Pagination: supported
- Placeholders: supported
- Popovers: supported
- Progress: supported
- Scrollspy: not applicable in editor MVP
- Spinners: supported
- Toasts: supported
- Tooltips: supported

### Forms
- Text input: supported
- Textarea: supported
- Select: supported
- Checkbox: supported
- Radios: supported
- Switches: supported
- Range: represented visually later (palette entry available)
- Floating labels: represented visually later (palette entry available)
- Input groups: represented visually later (palette entry available)
- Validation: represented visually later (palette entry available)

## Upgrade procedure

1. Update vendored Bootstrap assets.
2. Update vendored Bootstrap Icons assets.
3. Update versions in `js/app/constants.js`.
4. Review this file for changed coverage.
5. Adjust registry metadata and renderers.
6. Re-run tests and file-protocol checks.
