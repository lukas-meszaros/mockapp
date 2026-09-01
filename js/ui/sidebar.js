(function (MockApp) {
  var registry = MockApp.components.registry;
  var utils = MockApp.utils;
  var projectData = MockApp.data.project;

  function renderPalette(controller) {
    var refs = controller.refs;
    var filter = controller.state.ui.paletteFilter;
    var entries = registry.getPaletteEntries().filter(function (entry) {
      if (!filter) {
        return true;
      }

      var haystack = [entry.name, entry.category].concat(entry.tags || []).join(" ").toLowerCase();
      return haystack.indexOf(filter) >= 0;
    });

    var groups = entries.reduce(function (result, entry) {
      if (!result[entry.category]) {
        result[entry.category] = [];
      }
      result[entry.category].push(entry);
      return result;
    }, {});

    refs.paletteRoot.innerHTML = "";

    Object.keys(groups).forEach(function (groupName) {
      var group = document.createElement("section");
      group.className = "palette-group";
      var title = document.createElement("h3");
      title.className = "palette-group-title";
      title.textContent = groupName;
      group.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "palette-grid";
      groups[groupName].forEach(function (entry) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "palette-item";
        button.draggable = true;
        button.dataset.componentType = entry.type;
        button.innerHTML = '<span class="palette-item-icon"><i class="bi bi-' + entry.icon + '"></i></span><span class="palette-item-name">' + entry.name + '</span>';
        button.addEventListener("click", function () {
          controller.actions.addComponent(entry.type);
        });
        button.addEventListener("dragstart", function (event) {
          event.dataTransfer.setData("application/mockapp-palette", entry.type);
          event.dataTransfer.effectAllowed = "copy";
        });
        grid.appendChild(button);
      });
      group.appendChild(grid);
      refs.paletteRoot.appendChild(group);
    });

    if (!entries.length) {
      refs.paletteRoot.innerHTML = '<div class="empty-state">No components matched this search.</div>';
    }
  }

  function renderPages(controller) {
    var refs = controller.refs;
    refs.pagesRoot.innerHTML = "";

    controller.state.project.pages.forEach(function (page) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "page-chip" + (page.id === controller.state.project.activePageId ? " is-active" : "");
      button.innerHTML = '<span><i class="bi bi-file-earmark"></i> ' + utils.escapeHtml(page.name) + '</span><span class="tree-meta">' + MockApp.app.constants.VIEWPORTS[page.viewportPreset].label + '</span>';
      button.addEventListener("click", function () {
        controller.actions.setActivePage(page.id);
      });
      refs.pagesRoot.appendChild(button);
    });
  }

  function renderLayers(controller) {
    var refs = controller.refs;
    var page = projectData.getActivePage(controller.state.project);
    refs.layersRoot.innerHTML = "";

    if (!page.root.children.length) {
      refs.layersRoot.innerHTML = '<div class="empty-state">Add components to see the hierarchy.</div>';
      return;
    }

    var list = document.createElement("div");
    list.className = "tree-list";
    refs.layersRoot.appendChild(list);

    page.root.children.forEach(function (component) {
      list.appendChild(renderTreeNode(controller, component));
    });
  }

  function renderTreeNode(controller, component) {
    var node = document.createElement("div");
    node.className = "tree-node" + (controller.state.selection.ids.indexOf(component.id) >= 0 ? " is-selected" : "");

    var row = document.createElement("div");
    row.className = "tree-row";
    var main = document.createElement("div");
    main.className = "tree-main";
    main.innerHTML = '<i class="bi bi-diagram-3"></i><span class="tree-name">' + utils.escapeHtml(component.name) + '</span>';
    row.appendChild(main);

    var actions = document.createElement("div");
    actions.className = "panel-actions";
    var selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "tree-button";
    selectButton.innerHTML = '<i class="bi bi-cursor"></i>';
    selectButton.title = "Select";
    selectButton.addEventListener("click", function () {
      controller.actions.selectOnly(component.id);
    });
    actions.appendChild(selectButton);
    row.appendChild(actions);
    node.appendChild(row);

    if (component.children && component.children.length) {
      var children = document.createElement("div");
      children.className = "tree-children";
      component.children.forEach(function (child) {
        children.appendChild(renderTreeNode(controller, child));
      });
      node.appendChild(children);
    }

    node.draggable = true;
    node.addEventListener("dragstart", function (event) {
      event.dataTransfer.setData("application/mockapp-component", component.id);
      event.dataTransfer.effectAllowed = "move";
    });
    node.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
    node.addEventListener("drop", function (event) {
      event.preventDefault();
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      if (paletteType) {
        controller.actions.addComponent(paletteType, component.id);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, component.id);
      }
    });

    return node;
  }

  MockApp.ui.sidebar = {
    renderPalette: renderPalette,
    renderPages: renderPages,
    renderLayers: renderLayers
  };
})(window.MockApp);
