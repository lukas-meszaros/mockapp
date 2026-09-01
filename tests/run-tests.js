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
  'js/history/history.js'
].forEach((relativePath) => {
  const filePath = path.join(root, relativePath);
  vm.runInThisContext(fs.readFileSync(filePath, 'utf8'), { filename: filePath });
});

const projectApi = window.MockApp.data.project;
const historyApi = window.MockApp.history.manager;
const registryApi = window.MockApp.components.registry;

const project = projectApi.createProject();
assert.equal(project.format, 'MockApp');
assert.equal(project.version, 1);
assert.equal(project.pages.length, 1);
assert.equal(project.pages[0].layoutMode, 'freeform');

const page = projectApi.getActivePage(project);
const container = projectApi.createComponent('layout.container');
const row = projectApi.createComponent('layout.row');
const column = projectApi.createComponent('layout.column');
const button = projectApi.createComponent('action.button');

projectApi.insertComponent(page, null, container);
projectApi.insertComponent(page, container.id, row);
projectApi.insertComponent(page, row.id, column);
projectApi.insertComponent(page, column.id, button);

assert.equal(typeof container.frame.x, 'number');
assert.equal(typeof container.frame.width, 'number');

let componentCount = 0;
projectApi.walkComponents(page.root, () => {
  componentCount += 1;
});
assert.equal(componentCount, 4);

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
assert.equal(typeof normalized.pages[0].root.children[0].frame.x, 'number');

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

console.log('All MockApp model tests passed.');
