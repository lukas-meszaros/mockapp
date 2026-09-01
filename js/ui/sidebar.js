(function (MockApp) {
  var registry = MockApp.components.registry;
  var utils = MockApp.utils;
  var projectData = MockApp.data.project;

  function ensureSidebarBindings(controller) {
    bindPaletteEvents(controller);
    bindPagesEvents(controller);
    bindLayersEvents(controller);
  }

  function bindPaletteEvents(controller) {
    var root = controller.refs.paletteRoot;
    if (!root || root.dataset.boundPalette === "true") {
      return;
    }

    root.dataset.boundPalette = "true";
    root.addEventListener("click", function (event) {
      var toggle = event.target.closest(".palette-group-toggle");
      if (toggle && root.contains(toggle)) {
        controller.actions.togglePaletteGroup(toggle.dataset.paletteGroup);
        return;
      }

      var button = event.target.closest(".palette-item");
      if (!button || !root.contains(button)) {
        return;
      }
      controller.actions.addComponent(button.dataset.componentType);
    });
    root.addEventListener("dragstart", function (event) {
      var button = event.target.closest(".palette-item");
      if (!button || !root.contains(button)) {
        return;
      }
      event.dataTransfer.setData("application/mockapp-palette", button.dataset.componentType);
      event.dataTransfer.effectAllowed = "copy";
    });
  }

  function bindPagesEvents(controller) {
    var root = controller.refs.pagesRoot;
    if (!root || root.dataset.boundPages === "true") {
      return;
    }

    root.dataset.boundPages = "true";
    root.addEventListener("click", function (event) {
      var button = event.target.closest(".page-chip");
      if (!button || !root.contains(button)) {
        return;
      }
      controller.actions.setActivePage(button.dataset.pageId);
    });
  }

  function bindLayersEvents(controller) {
    var root = controller.refs.layersRoot;
    if (!root || root.dataset.boundLayers === "true") {
      return;
    }

    root.dataset.boundLayers = "true";
    root.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-tree-action='select-component']");
      if (trigger && root.contains(trigger)) {
        controller.actions.selectOnly(trigger.dataset.componentId);
        return;
      }

      var layerAction = event.target.closest("[data-tree-action='layer-action']");
      if (!layerAction || !root.contains(layerAction)) {
        return;
      }

      controller.actions.selectOnly(layerAction.dataset.componentId);
      controller.actions.layerSelection(layerAction.dataset.layerDirection);
    });

    root.addEventListener("dragstart", function (event) {
      if (controller.state.ui.preview) {
        event.preventDefault();
        return;
      }
      var node = event.target.closest(".tree-node");
      if (!node || !root.contains(node)) {
        return;
      }
      event.dataTransfer.setData("application/mockapp-component", node.dataset.componentId);
      event.dataTransfer.effectAllowed = "move";
    });

    root.addEventListener("dragover", function (event) {
      if (controller.state.ui.preview) {
        return;
      }
      if (event.target.closest(".tree-node")) {
        event.preventDefault();
      }
    });

    root.addEventListener("drop", function (event) {
      if (controller.state.ui.preview) {
        return;
      }
      var node = event.target.closest(".tree-node");
      if (!node || !root.contains(node)) {
        return;
      }
      event.preventDefault();
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      if (paletteType) {
        controller.actions.addComponent(paletteType, node.dataset.componentId);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, node.dataset.componentId);
      }
    });
  }

  function renderPalette(controller) {
    ensureSidebarBindings(controller);
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
      var isCollapsed = !filter && !!controller.state.ui.paletteCollapsed[groupName];
      var group = document.createElement("section");
      group.className = "palette-group" + (isCollapsed ? " is-collapsed" : "");
      var titleRow = document.createElement("div");
      titleRow.className = "palette-group-header";
      var title = document.createElement("h3");
      title.className = "palette-group-title";
      title.textContent = groupName;
      titleRow.appendChild(title);
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "palette-group-toggle";
      toggle.dataset.paletteGroup = groupName;
      toggle.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      toggle.innerHTML = '<i class="bi bi-chevron-' + (isCollapsed ? "down" : "up") + '"></i><span>' + groups[groupName].length + '</span>';
      titleRow.appendChild(toggle);
      group.appendChild(titleRow);

      var grid = document.createElement("div");
      grid.className = "palette-grid";
      grid.hidden = isCollapsed;
      groups[groupName].forEach(function (entry) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "palette-item";
        button.draggable = true;
        button.dataset.componentType = entry.type;
        button.innerHTML = '<span class="palette-item-icon"><i class="bi bi-' + entry.icon + '"></i></span><span class="palette-item-name">' + entry.name + '</span>';
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
    ensureSidebarBindings(controller);
    var refs = controller.refs;
    refs.pagesRoot.innerHTML = "";

    controller.state.project.pages.forEach(function (page) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "page-chip" + (page.id === controller.state.project.activePageId ? " is-active" : "");
      button.dataset.pageId = page.id;
      button.innerHTML = '<span><i class="bi bi-file-earmark"></i> ' + utils.escapeHtml(page.name) + '</span><span class="tree-meta">' + MockApp.app.constants.VIEWPORTS[page.viewportPreset].label + '</span>';
      refs.pagesRoot.appendChild(button);
    });
  }

  function renderLayers(controller) {
    ensureSidebarBindings(controller);
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

    for (var i = page.root.children.length - 1; i >= 0; i -= 1) {
      list.appendChild(renderTreeNode(controller, page.root.children[i], true));
    }
  }

  function renderTreeNode(controller, component, isRootChild) {
    var node = document.createElement("div");
    var isSelected = !controller.state.ui.preview && controller.state.selection.ids.indexOf(component.id) >= 0;
    node.className = "tree-node" + (isSelected ? " is-selected" : "");
    node.dataset.componentId = component.id;

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
    selectButton.dataset.treeAction = "select-component";
    selectButton.dataset.componentId = component.id;
    actions.appendChild(selectButton);

    if (isRootChild) {
      actions.appendChild(layerTreeButton(component.id, "forward", "arrow-up", "Move above"));
      actions.appendChild(layerTreeButton(component.id, "backward", "arrow-down", "Move below"));
      actions.appendChild(layerTreeButton(component.id, "front", "chevron-double-up", "Move to top"));
      actions.appendChild(layerTreeButton(component.id, "back", "chevron-double-down", "Move to bottom"));
    }

    row.appendChild(actions);
    node.appendChild(row);

    if (component.children && component.children.length) {
      var children = document.createElement("div");
      children.className = "tree-children";
      component.children.forEach(function (child) {
        children.appendChild(renderTreeNode(controller, child, false));
      });
      node.appendChild(children);
    }

    node.draggable = true;

    return node;
  }

  function layerTreeButton(componentId, direction, icon, title) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "tree-button";
    button.innerHTML = '<i class="bi bi-' + icon + '"></i>';
    button.title = title;
    button.dataset.treeAction = "layer-action";
    button.dataset.componentId = componentId;
    button.dataset.layerDirection = direction;
    return button;
  }

  MockApp.ui.sidebar = {
    renderPalette: renderPalette,
    renderPages: renderPages,
    renderLayers: renderLayers
  };
})(window.MockApp);
