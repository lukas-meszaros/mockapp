(function (MockApp) {
  var constants = MockApp.app.constants;
  var registry = MockApp.components.registry;
  var utils = MockApp.utils;

  function createProject() {
    var createdAt = new Date().toISOString();
    var page = createPage("Page 1");

    return {
      format: constants.PROJECT_FORMAT,
      version: constants.PROJECT_VERSION,
      metadata: {
        name: "MockApp Project",
        createdAt: createdAt,
        updatedAt: createdAt,
        appVersion: constants.APP_VERSION,
        bootstrapVersion: constants.BOOTSTRAP_VERSION,
        bootstrapIconsVersion: constants.BOOTSTRAP_ICONS_VERSION
      },
      settings: {
        grid: { visible: true, snap: true, size: constants.DEFAULT_GRID_SIZE },
        showGuides: true,
        autosaveIntervalMs: 1500
      },
      pages: [page],
      activePageId: page.id
    };
  }

  function createPage(name) {
    return {
      id: utils.uid("page"),
      name: name || "Page",
      viewportPreset: "desktop",
      layoutMode: "freeform",
      root: {
        id: utils.uid("root"),
        type: "page-root",
        name: "Canvas Root",
        props: {},
        meta: { locked: false, hidden: false },
        children: []
      }
    };
  }

  function createComponent(type) {
    var definition = registry.getDefinition(type);
    if (!definition) {
      throw new Error("Unknown component type: " + type);
    }

    if (definition.templateFactory) {
      return createTemplate(definition.templateFactory);
    }

    return normalizeComponent({
      id: utils.uid("cmp"),
      type: type,
      name: definition.name,
      props: utils.deepClone(definition.defaults || {}),
      frame: utils.deepClone(registry.getDefaultFrame(type)),
      meta: { locked: false, hidden: false },
      children: []
    });
  }

  function createTemplate(kind) {
    if (kind === "login") {
      var container = createComponent("layout.container");
      container.name = "Login Layout";
      var row = createComponent("layout.row");
      var column = createComponent("layout.column");
      column.props.widths = { xs: "12", sm: "12", md: "6", lg: "4", xl: "4", xxl: "4" };
      var card = createComponent("content.card");
      card.props.title = "Welcome back";
      card.props.text = "Sign in to continue to your workspace.";
      var email = createComponent("form.input");
      email.props.label = "Email";
      email.props.inputType = "email";
      var password = createComponent("form.input");
      password.props.label = "Password";
      password.props.inputType = "password";
      var button = createComponent("action.button");
      button.props.text = "Sign in";
      card.children.push(email, password, button);
      column.children.push(card);
      row.children.push(column);
      container.children.push(row);
      return container;
    }

    var dashboard = createComponent("layout.container");
    dashboard.name = "Dashboard Layout";
    var gridRow = createComponent("layout.row");
    var left = createComponent("layout.column");
    var right = createComponent("layout.column");
    left.props.widths = { xs: "12", sm: "12", md: "4", lg: "4", xl: "3", xxl: "3" };
    right.props.widths = { xs: "12", sm: "12", md: "8", lg: "8", xl: "9", xxl: "9" };
    var card = createComponent("content.card");
    card.props.title = "Revenue";
    card.props.text = "$128,400 this month";
    var table = createComponent("data.table");
    left.children.push(card);
    right.children.push(table);
    gridRow.children.push(left, right);
    dashboard.children.push(gridRow);
    return dashboard;
  }

  function normalizeComponent(component) {
    component.children = Array.isArray(component.children) ? component.children.map(normalizeComponent) : [];
    component.meta = component.meta || { locked: false, hidden: false };
    component.props = component.props || {};
    component.frame = normalizeFrame(component.frame, component.type);
    component.name = component.name || (registry.getDefinition(component.type) || {}).name || component.type;
    return component;
  }

  function normalizeFrame(frame, type) {
    var fallback = utils.deepClone(registry.getDefaultFrame(type));
    var source = frame || {};
    return {
      x: toNumber(source.x, fallback.x),
      y: toNumber(source.y, fallback.y),
      width: Math.max(80, toNumber(source.width, fallback.width)),
      height: Math.max(48, toNumber(source.height, fallback.height))
    };
  }

  function toNumber(value, fallback) {
    return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
  }

  function touchProject(project) {
    project.metadata.updatedAt = new Date().toISOString();
  }

  function getActivePage(project) {
    return project.pages.find(function (page) {
      return page.id === project.activePageId;
    }) || project.pages[0];
  }

  function normalizeProject(project) {
    var normalized = utils.deepClone(project);
    normalized.pages = Array.isArray(normalized.pages) ? normalized.pages : [];
    normalized.pages = normalized.pages.map(function (page) {
      page.layoutMode = page.layoutMode || "freeform";
      page.root = page.root || {
        id: utils.uid("root"),
        type: "page-root",
        name: "Canvas Root",
        props: {},
        meta: { locked: false, hidden: false },
        children: []
      };
      page.root.children = Array.isArray(page.root.children) ? page.root.children.map(normalizeComponent) : [];
      return page;
    });
    return normalized;
  }

  function walkComponents(node, visitor, parent) {
    if (!node) {
      return;
    }

    if (node.type !== "page-root") {
      visitor(node, parent);
    }

    (node.children || []).forEach(function (child) {
      walkComponents(child, visitor, node);
    });
  }

  function findComponentContext(page, componentId) {
    var context = null;

    function visit(node, parent, index) {
      if (context) {
        return;
      }
      if (node.id === componentId) {
        context = { node: node, parent: parent, index: index };
        return;
      }

      (node.children || []).forEach(function (child, childIndex) {
        visit(child, node, childIndex);
      });
    }

    visit(page.root, null, -1);
    return context;
  }

  function insertComponent(page, parentId, component, index, placement) {
    var parentContext = parentId ? findComponentContext(page, parentId) : null;
    var parentNode = parentContext ? parentContext.node : page.root;

    if (!registry.canAcceptChild(parentNode.type, component.type)) {
      parentNode = page.root;
    }

    if (parentNode.type === "page-root") {
      component.frame = placement ? normalizePlacement(component.type, placement) : nextRootFrame(page, component.type);
    }

    var children = parentNode.children || (parentNode.children = []);
    if (typeof index === "number" && index >= 0 && index <= children.length) {
      children.splice(index, 0, component);
    } else {
      children.push(component);
    }

    return component;
  }

  function normalizePlacement(type, placement) {
    var fallback = registry.getDefaultFrame(type);
    return {
      x: Math.max(0, toNumber(placement.x, fallback.x)),
      y: Math.max(0, toNumber(placement.y, fallback.y)),
      width: Math.max(80, toNumber(placement.width, fallback.width)),
      height: Math.max(48, toNumber(placement.height, fallback.height))
    };
  }

  function nextRootFrame(page, type) {
    var base = utils.deepClone(registry.getDefaultFrame(type));
    var siblings = page.root.children || [];
    var offset = siblings.length % 10;
    base.x += offset * 28;
    base.y += offset * 24;
    return base;
  }

  function removeComponent(page, componentId) {
    var context = findComponentContext(page, componentId);
    if (!context || !context.parent) {
      return null;
    }

    return context.parent.children.splice(context.index, 1)[0] || null;
  }

  function updateComponent(page, componentId, updater) {
    var context = findComponentContext(page, componentId);
    if (!context) {
      return null;
    }

    updater(context.node);
    return context.node;
  }

  function cloneComponentTree(component) {
    var clone = utils.deepClone(component);

    function reassign(node) {
      node.id = utils.uid("cmp");
      node.children.forEach(reassign);
    }

    reassign(clone);
    return clone;
  }

  function moveComponent(page, componentId, targetParentId, placement) {
    var context = findComponentContext(page, componentId);
    if (!context || !context.parent) {
      return false;
    }

    var targetContext = targetParentId ? findComponentContext(page, targetParentId) : null;
    var targetNode = targetContext ? targetContext.node : page.root;

    if (componentId === targetNode.id || containsDescendant(context.node, targetNode.id)) {
      return false;
    }

    if (!registry.canAcceptChild(targetNode.type, context.node.type)) {
      return false;
    }

    if (context.parent.id === targetNode.id) {
      if (targetNode.type === "page-root" && placement) {
        context.node.frame = normalizePlacement(context.node.type, placement);
      }
      return true;
    }

    var removed = context.parent.children.splice(context.index, 1)[0];
    if (targetNode.type === "page-root" && placement) {
      removed.frame = normalizePlacement(removed.type, placement);
    }
    targetNode.children.push(removed);
    return true;
  }

  function updateComponentFrame(page, componentId, frame) {
    var context = findComponentContext(page, componentId);
    if (!context) {
      return null;
    }

    context.node.frame = normalizePlacement(context.node.type, frame);
    return context.node;
  }

  function containsDescendant(node, potentialDescendantId) {
    var found = false;
    (node.children || []).forEach(function (child) {
      if (child.id === potentialDescendantId || containsDescendant(child, potentialDescendantId)) {
        found = true;
      }
    });
    return found;
  }

  function validateProject(project) {
    if (!project || project.format !== constants.PROJECT_FORMAT || project.version !== constants.PROJECT_VERSION) {
      return { valid: false, reason: "Unsupported project format or version." };
    }

    if (!Array.isArray(project.pages) || !project.pages.length) {
      return { valid: false, reason: "Project has no pages." };
    }

    var ids = {};
    var invalid = null;

    project.pages.forEach(function (page) {
      if (!page.id || !page.root) {
        invalid = invalid || "Page is missing required fields.";
        return;
      }

      walkComponents(page.root, function (component) {
        if (ids[component.id]) {
          invalid = invalid || "Duplicate component id detected.";
          return;
        }
        ids[component.id] = true;

        if (!registry.getDefinition(component.type)) {
          invalid = invalid || "Unknown component type: " + component.type;
        }
      });
    });

    return invalid ? { valid: false, reason: invalid } : { valid: true };
  }

  MockApp.data.project = {
    createProject: createProject,
    createPage: createPage,
    createComponent: createComponent,
    getActivePage: getActivePage,
    normalizeProject: normalizeProject,
    walkComponents: walkComponents,
    findComponentContext: findComponentContext,
    insertComponent: insertComponent,
    removeComponent: removeComponent,
    updateComponent: updateComponent,
    cloneComponentTree: cloneComponentTree,
    moveComponent: moveComponent,
    updateComponentFrame: updateComponentFrame,
    touchProject: touchProject,
    validateProject: validateProject
  };
})(window.MockApp);
