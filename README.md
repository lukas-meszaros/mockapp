# MockApp

MockApp is a small offline-first browser app for sketching Bootstrap-style UI mockups.

## Run

Open `/home/runner/work/mockapp/mockapp/mockapp.html` directly in a desktop browser.

The app is designed to work from `file://` without a server or build step.

## Current capabilities

- Component palette for common Bootstrap-style elements
- Drag a component onto the canvas or click to add it
- Property inspector for editing the selected component
- Viewport presets for desktop, tablet, and phone
- Autosave to `localStorage`
- Save/load project JSON
- Export the current canvas as HTML

## Project layout

- `/home/runner/work/mockapp/mockapp/mockapp.html` — app entry point
- `/home/runner/work/mockapp/mockapp/css/mockapp.css` — app and component styling
- `/home/runner/work/mockapp/mockapp/js/app/app.js` — offline application logic
- `/home/runner/work/mockapp/mockapp/docs/ARCHITECTURE.md` — architecture summary
- `/home/runner/work/mockapp/mockapp/docs/FILE_INDEX.md` — file map for humans and agents