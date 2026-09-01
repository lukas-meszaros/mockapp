# Dependencies

## Runtime dependencies

### Bootstrap
- Version: 5.3.8
- License: MIT
- Purpose: real Bootstrap layout and component styling, plus preview-time interaction plugins
- Source: `vendor/bootstrap/`
- Update procedure: replace local dist assets, update `js/app/constants.js`, then re-test file launch and exports

### Bootstrap Icons
- Version: 1.13.1
- License: MIT
- Purpose: toolbar and panel icons
- Source: `vendor/bootstrap-icons/`
- Update procedure: replace local font CSS and font files, verify relative font paths, re-test `file://`

### html2canvas
- Version: 1.4.1
- License: MIT
- Purpose: client-side PNG export of the current canvas viewport
- Source: `vendor/html2canvas/`
- Update procedure: replace the vendored file and re-test PNG export in each target browser

### Highlight.js
- Version: 11.10.0
- License: BSD-3-Clause
- Purpose: client-side syntax highlighting for control-level HTML/CSS editors
- Source: `vendor/highlightjs/`
- Update procedure: replace vendored runtime, language packs, and theme CSS; re-test code editing from both inspector actions and canvas code triggers

## Development dependencies

No npm-based development dependency chain is required for the current implementation.
