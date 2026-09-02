const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');

const root = path.resolve(__dirname, '..');

global.window = global;
global.crypto = webcrypto;
global.document = {};
global.navigator = {};
global.localStorage = {
  store: {},
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  }
};

[
  'js/app/namespace.js',
  'js/app/constants.js',
  'js/app/utils.js',
  'js/components/registry.js',
  'js/data/project.js',
  'js/history/history.js',
  'js/ui/canvas.js'
].forEach((relativePath) => {
  const filePath = path.join(root, relativePath);
  vm.runInThisContext(fs.readFileSync(filePath, 'utf8'), { filename: filePath });
});

const projectApi = window.MockApp.data.project;
const historyApi = window.MockApp.history.manager;
const registryApi = window.MockApp.components.registry;
const canvasTestApi = window.MockApp.ui.canvas.__test;

const project = projectApi.createProject();
assert.equal(project.format, 'MockApp');
assert.equal(project.version, 1);
assert.equal(project.pages.length, 1);
assert.equal(project.pages[0].layoutMode, 'freeform');
assert.equal(project.pages[0].previewSurfaceTitle, 'Responsive Bootstrap preview surface');

const page = projectApi.getActivePage(project);
const container = projectApi.createComponent('layout.container');
const row = projectApi.createComponent('layout.row');
const column = projectApi.createComponent('layout.column');
const button = projectApi.createComponent('action.button');
const radio = projectApi.createComponent('form.radio');
const appSwitch = projectApi.createComponent('form.switch');
const fileInput = projectApi.createComponent('form.file-input');
const image = projectApi.createComponent('content.image');
const figure = projectApi.createComponent('content.figure');
const breadcrumb = projectApi.createComponent('nav.breadcrumb');
const pagination = projectApi.createComponent('nav.pagination');
const tabs = projectApi.createComponent('nav.tabs');
const pills = projectApi.createComponent('nav.pills');
const dropdown = projectApi.createComponent('nav.dropdown');
const dropdownButton = projectApi.createComponent('nav.dropdown-button');
const offcanvasNavigation = projectApi.createComponent('nav.offcanvas-navigation');
const listGroup = projectApi.createComponent('content.list-group');
const progress = projectApi.createComponent('feedback.progress');
const spinner = projectApi.createComponent('feedback.spinner');
const toast = projectApi.createComponent('feedback.toast');
const placeholder = projectApi.createComponent('feedback.placeholder');
const accordion = projectApi.createComponent('interactive.accordion');
const collapse = projectApi.createComponent('interactive.collapse');
const carousel = projectApi.createComponent('interactive.carousel');
const tooltip = projectApi.createComponent('interactive.tooltip');
const popover = projectApi.createComponent('interactive.popover');
const rectangle = projectApi.createComponent('drawing.rectangle');
const circle = projectApi.createComponent('drawing.circle');
const triangle = projectApi.createComponent('drawing.triangle');
const line = projectApi.createComponent('drawing.line');

projectApi.insertComponent(page, null, container);
projectApi.insertComponent(page, container.id, row);
projectApi.insertComponent(page, row.id, column);
projectApi.insertComponent(page, column.id, button);
projectApi.insertComponent(page, column.id, radio);
projectApi.insertComponent(page, column.id, appSwitch);

assert.equal(typeof container.frame.x, 'number');
assert.equal(typeof container.frame.width, 'number');
assert.equal(radio.type, 'form.radio');
assert.equal(appSwitch.type, 'form.switch');
assert.equal(fileInput.type, 'form.input');
assert.equal(fileInput.props.inputType, 'file');
assert.equal(image.type, 'content.image');
assert.equal(image.props.src, '');
assert.equal(image.props.placeholderColor, '#d9e2f0');
assert.equal(figure.type, 'content.figure');
assert.equal(figure.props.caption, 'Figure caption');
assert.equal(breadcrumb.type, 'nav.breadcrumb');
assert.equal(typeof breadcrumb.props.itemsText, 'string');
assert.equal(pagination.type, 'nav.pagination');
assert.equal(pagination.props.activeIndex, 3);
assert.equal(tabs.type, 'nav.tabs');
assert.equal(pills.type, 'nav.pills');
assert.equal(dropdown.type, 'nav.dropdown');
assert.equal(dropdownButton.type, 'nav.dropdown-button');
assert.equal(offcanvasNavigation.type, 'nav.offcanvas-navigation');
assert.equal(listGroup.type, 'content.list-group');
assert.equal(progress.type, 'feedback.progress');
assert.equal(progress.props.value, 60);
assert.equal(spinner.type, 'feedback.spinner');
assert.equal(spinner.props.spinnerType, 'border');
assert.equal(toast.type, 'feedback.toast');
assert.equal(placeholder.type, 'feedback.placeholder');
assert.equal(accordion.type, 'interactive.accordion');
assert.equal(collapse.type, 'interactive.collapse');
assert.equal(carousel.type, 'interactive.carousel');
assert.equal(tooltip.type, 'interactive.tooltip');
assert.equal(popover.type, 'interactive.popover');
assert.equal(rectangle.type, 'drawing.rectangle');
assert.equal(rectangle.props.fillColor, '#dbeafe');
assert.equal(rectangle.props.lineThickness, 1);
assert.equal(rectangle.props.lockSides, false);
assert.equal(rectangle.props.rotation, 0);
assert.equal(circle.type, 'drawing.circle');
assert.equal(circle.props.borderColor, '#16a34a');
assert.equal(circle.props.lineThickness, 1);
assert.equal(circle.props.rotation, 0);
assert.equal(triangle.type, 'drawing.triangle');
assert.equal(triangle.props.lineThickness, 1);
assert.equal(triangle.props.lockSides, false);
assert.equal(line.type, 'drawing.line');
assert.equal(line.props.lineThickness, 1);
assert.equal(line.props.arrowEnd, true);
assert.equal(line.props.startX, 6);
assert.equal(line.props.startY, 50);
assert.equal(line.props.endX, 94);
assert.equal(line.props.endY, 50);
assert.equal(typeof button.code, 'object');
assert.equal(button.code.html, '');
assert.equal(button.code.css, '');

let componentCount = 0;
projectApi.walkComponents(page.root, () => {
  componentCount += 1;
});
assert.equal(componentCount, 6);

assert.equal(registryApi.canAcceptChild('layout.row', 'layout.column'), true);
assert.equal(registryApi.canAcceptChild('layout.row', 'action.button'), false);

const movedButton = projectApi.moveComponent(page, button.id, container.id);
assert.equal(movedButton, true);

projectApi.updateComponentFrame(page, container.id, { x: 120, y: 160, width: 700, height: 440 });
assert.equal(projectApi.findComponentContext(page, container.id).node.frame.x, 120);

const normalized = projectApi.normalizeProject({
  format: 'MockApp',
  version: 1,
  metadata: project.metadata,
  settings: project.settings,
  pages: [{ id: 'p1', name: 'Page', viewportPreset: 'desktop', root: { id: 'r1', type: 'page-root', children: [{ id: 'c1', type: 'action.button', name: 'Button', props: { text: 'X' }, meta: { locked: false, hidden: false }, children: [] }] } }],
  activePageId: 'p1'
});
assert.equal(normalized.pages[0].layoutMode, 'freeform');
assert.equal(normalized.pages[0].previewSurfaceTitle, 'Responsive Bootstrap preview surface');
assert.equal(typeof normalized.pages[0].root.children[0].frame.x, 'number');
assert.equal(typeof normalized.pages[0].root.children[0].code, 'object');
assert.equal(normalized.pages[0].root.children[0].code.html, '');
assert.equal(normalized.pages[0].root.children[0].code.css, '');

const validation = projectApi.validateProject(project);
assert.equal(validation.valid, true);

const history = historyApi.createHistory(project);
const snapshotA = JSON.parse(JSON.stringify(project));
snapshotA.metadata.name = 'Changed';
historyApi.push(history, snapshotA);
assert.equal(historyApi.canUndo(history), true);
const undone = historyApi.undo(history);
assert.equal(undone.metadata.name, 'MockApp Project');
const redone = historyApi.redo(history);
assert.equal(redone.metadata.name, 'Changed');

const horizontal = canvasTestApi.lineGeometryFromPoints({ x: 10, y: 20 }, { x: 110, y: 20 });
assert.equal(horizontal.frame.height, 16);
assert.ok(Math.abs(horizontal.frame.y - 12) < 1e-9);
let horizontalEndpoints = canvasTestApi.lineEndpointsToCanvas(horizontal.frame, horizontal.props);
assert.ok(Math.abs(horizontalEndpoints.start.x - 10) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.start.y - 20) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.end.x - 110) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.end.y - 20) < 1e-9);

const nearHorizontal = canvasTestApi.lineGeometryFromPoints({ x: 10, y: 20 }, { x: 110, y: 21 });
assert.equal(nearHorizontal.frame.height, 16);
horizontalEndpoints = canvasTestApi.lineEndpointsToCanvas(nearHorizontal.frame, nearHorizontal.props);
assert.ok(Math.abs(horizontalEndpoints.start.x - 10) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.start.y - 20) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.end.x - 110) < 1e-9);
assert.ok(Math.abs(horizontalEndpoints.end.y - 21) < 1e-9);

const vertical = canvasTestApi.lineGeometryFromPoints({ x: 40, y: 15 }, { x: 40, y: 215 });
assert.equal(vertical.frame.width, 16);
assert.ok(Math.abs(vertical.frame.x - 32) < 1e-9);
let verticalEndpoints = canvasTestApi.lineEndpointsToCanvas(vertical.frame, vertical.props);
assert.ok(Math.abs(verticalEndpoints.start.x - 40) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.start.y - 15) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.end.x - 40) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.end.y - 215) < 1e-9);

const nearVertical = canvasTestApi.lineGeometryFromPoints({ x: 40, y: 15 }, { x: 41, y: 215 });
assert.equal(nearVertical.frame.width, 16);
verticalEndpoints = canvasTestApi.lineEndpointsToCanvas(nearVertical.frame, nearVertical.props);
assert.ok(Math.abs(verticalEndpoints.start.x - 40) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.start.y - 15) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.end.x - 41) < 1e-9);
assert.ok(Math.abs(verticalEndpoints.end.y - 215) < 1e-9);

for (let deltaY = 0; deltaY <= 20; deltaY += 1) {
  const sample = canvasTestApi.lineGeometryFromPoints({ x: 10, y: 20 }, { x: 110, y: 20 + deltaY });
  const endpoints = canvasTestApi.lineEndpointsToCanvas(sample.frame, sample.props);
  assert.ok(Math.abs(endpoints.start.x - 10) < 1e-9);
  assert.ok(Math.abs(endpoints.start.y - 20) < 1e-9);
  assert.ok(Math.abs(endpoints.end.x - 110) < 1e-9);
  assert.ok(Math.abs(endpoints.end.y - (20 + deltaY)) < 1e-9);
}

for (let deltaX = 0; deltaX <= 20; deltaX += 1) {
  const sample = canvasTestApi.lineGeometryFromPoints({ x: 40, y: 15 }, { x: 40 + deltaX, y: 215 });
  const endpoints = canvasTestApi.lineEndpointsToCanvas(sample.frame, sample.props);
  assert.ok(Math.abs(endpoints.start.x - 40) < 1e-9);
  assert.ok(Math.abs(endpoints.start.y - 15) < 1e-9);
  assert.ok(Math.abs(endpoints.end.x - (40 + deltaX)) < 1e-9);
  assert.ok(Math.abs(endpoints.end.y - 215) < 1e-9);
}

console.log('All MockApp model tests passed.');
