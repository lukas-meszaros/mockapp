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
      previewSurfaceTitle: "Responsive Bootstrap preview surface",
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
      code: {
        html: "",
        css: ""
      },
      frame: utils.deepClone(registry.getDefaultFrame(type)),
      meta: { locked: false, hidden: false },
      children: []
    });
  }

  function createTemplate(kind) {
    function makeInput(label, inputType, placeholder) {
      var input = createComponent("form.input");
      input.name = label;
      input.props.label = label;
      input.props.inputType = inputType || "text";
      if (placeholder) {
        input.props.placeholder = placeholder;
      }
      return input;
    }

    function makeHeading(text, level, name) {
      var heading = createComponent("content.heading");
      heading.name = name || "Heading";
      heading.props.text = text || "Section Title";
      heading.props.level = String(level || "2");
      return heading;
    }

    function makeParagraph(name, text, lead) {
      var paragraph = createComponent("content.paragraph");
      paragraph.name = name || "Paragraph";
      paragraph.props.text = text || "Describe this section.";
      paragraph.props.lead = !!lead;
      return paragraph;
    }

    function makeButton(name, text, outline) {
      var button = createComponent("action.button");
      button.name = name || "Button";
      button.props.text = text || "Button";
      button.props.outline = !!outline;
      return button;
    }

    function makeCard(name, title, body) {
      var card = createComponent("content.card");
      card.name = name || "Card";
      card.props.title = title || "Card title";
      card.props.text = body || "Card body text";
      return card;
    }

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

    switch (kind) {
      case "container-fluid": {
        var fluid = createComponent("layout.container");
        fluid.name = "Fluid Container";
        fluid.props.fluid = true;
        return fluid;
      }
      case "stack": {
        var stack = createComponent("layout.container");
        stack.name = "Stack";
        stack.props.gap = "2";
        stack.children.push(makeParagraph("Stack Item", "Stack item", false));
        stack.children.push(makeParagraph("Stack Item", "Stack item", false));
        return stack;
      }
      case "horizontal-stack": {
        var hRow = createComponent("layout.row");
        hRow.name = "Horizontal Stack";
        var hLeft = createComponent("layout.column");
        var hRight = createComponent("layout.column");
        hLeft.children.push(makeParagraph("Stack Item", "Item A", false));
        hRight.children.push(makeParagraph("Stack Item", "Item B", false));
        hRow.children.push(hLeft, hRight);
        return hRow;
      }
      case "divider":
        return makeParagraph("Divider", "------------------------------", false);
      case "spacer": {
        var spacer = makeParagraph("Spacer", " ", false);
        spacer.props.marginBottom = "5";
        return spacer;
      }
      case "heading-h1":
        return makeHeading("Heading 1", 1, "Heading H1");
      case "heading-h2":
        return makeHeading("Heading 2", 2, "Heading H2");
      case "heading-h3":
        return makeHeading("Heading 3", 3, "Heading H3");
      case "heading-h4":
        return makeHeading("Heading 4", 4, "Heading H4");
      case "heading-h5":
        return makeHeading("Heading 5", 5, "Heading H5");
      case "heading-h6":
        return makeHeading("Heading 6", 6, "Heading H6");
      case "lead-paragraph":
        return makeParagraph("Lead Paragraph", "Lead paragraph text", true);
      case "small-text":
        return makeParagraph("Small Text", "Small helper text", false);
      case "blockquote":
        return makeParagraph("Blockquote", '"Meaningful quote text"', false);
      case "code-text":
        return makeParagraph("Code", "const value = true;", false);
      case "preformatted":
        return makeParagraph("Preformatted", "line 1\nline 2\nline 3", false);
      case "outline-button":
        return makeButton("Outline Button", "Outline", true);
      case "button-group": {
        var group = createComponent("layout.row");
        group.name = "Button Group";
        group.children.push(createComponent("layout.column"));
        group.children[0].children.push(makeButton("Button", "Left", false));
        group.children[0].children.push(makeButton("Button", "Middle", false));
        group.children[0].children.push(makeButton("Button", "Right", false));
        return group;
      }
      case "button-toolbar": {
        var toolbar = createComponent("layout.container");
        toolbar.name = "Button Toolbar";
        toolbar.children.push(makeButton("Button", "Save", false));
        toolbar.children.push(makeButton("Button", "Export", true));
        return toolbar;
      }
      case "close-button":
        return makeButton("Close Button", "x", false);
      case "input-email":
        return makeInput("Email", "email", "name@example.com");
      case "input-password":
        return makeInput("Password", "password", "Password");
      case "input-number":
        return makeInput("Number", "number", "0");
      case "input-search":
        return makeInput("Search", "search", "Search");
      case "input-tel":
        return makeInput("Telephone", "tel", "+1 555 0100");
      case "input-url":
        return makeInput("URL", "url", "https://example.com");
      case "multi-select": {
        var multi = createComponent("form.select");
        multi.name = "Multi-select";
        multi.props.multiple = true;
        return multi;
      }
      case "radio-button": {
        var radio = createComponent("form.radio");
        radio.name = "Radio Button";
        radio.props.label = "Choice";
        return radio;
      }
      case "switch": {
        var sw = createComponent("form.switch");
        sw.name = "Switch";
        sw.props.label = "Enable option";
        return sw;
      }
      case "range":
        return makeInput("Range", "number", "50");
      case "file-input":
        return makeInput("File", "file", "");
      case "input-group": {
        var inputGroup = createComponent("layout.row");
        inputGroup.name = "Input Group";
        var inputCol = createComponent("layout.column");
        var actionCol = createComponent("layout.column");
        inputCol.props.widths = { xs: "8", sm: "8", md: "9", lg: "9", xl: "9", xxl: "9" };
        actionCol.props.widths = { xs: "4", sm: "4", md: "3", lg: "3", xl: "3", xxl: "3" };
        inputCol.children.push(makeInput("Input", "text", "Value"));
        actionCol.children.push(makeButton("Button", "Go", false));
        inputGroup.children.push(inputCol, actionCol);
        return inputGroup;
      }
      case "floating-label": {
        var floating = makeInput("Floating Label", "text", "Floating Label");
        floating.name = "Floating Label";
        return floating;
      }
      case "form-group": {
        var formGroup = makeCard("Form Group", "Form Group", "Grouped form controls");
        formGroup.children.push(makeInput("First Name", "text", "Jane"));
        formGroup.children.push(makeInput("Email", "email", "name@example.com"));
        return formGroup;
      }
      case "validation-state": {
        var validation = makeInput("Validated Input", "text", "Required field");
        validation.props.required = true;
        return validation;
      }
      case "nav": {
        var nav = createComponent("nav.navbar");
        nav.name = "Nav";
        nav.props.brand = "Navigation";
        nav.props.linksText = "Home\nProducts\nContact";
        return nav;
      }
      case "tabs": {
        return createComponent("nav.tabs");
      }
      case "pills": {
        return createComponent("nav.pills");
      }
      case "breadcrumb":
        return createComponent("nav.breadcrumb");
      case "pagination":
        return createComponent("nav.pagination");
      case "dropdown":
        return createComponent("nav.dropdown");
      case "dropdown-button":
        return createComponent("nav.dropdown-button");
      case "offcanvas-navigation":
        return createComponent("nav.offcanvas-navigation");
      case "list-group":
        return createComponent("content.list-group");
      case "responsive-table": {
        var responsiveTable = createComponent("data.table");
        responsiveTable.name = "Responsive Table";
        return responsiveTable;
      }
      case "image":
        return createComponent("content.image");
      case "figure":
        return createComponent("content.figure");
      case "progress":
        return createComponent("feedback.progress");
      case "spinner":
        return createComponent("feedback.spinner");
      case "toast":
        return createComponent("feedback.toast");
      case "placeholder":
        return createComponent("feedback.placeholder");
      case "modal":
        return makeCard("Modal", "Modal Title", "Modal body content");
      case "accordion":
        return createComponent("interactive.accordion");
      case "collapse":
        return createComponent("interactive.collapse");
      case "carousel":
        return createComponent("interactive.carousel");
      case "tooltip":
        return createComponent("interactive.tooltip");
      case "popover":
        return createComponent("interactive.popover");
      case "registration-form": {
        var registration = makeCard("Registration Form", "Create account", "Join MockApp");
        registration.children.push(makeInput("Full Name", "text", "Alex Doe"));
        registration.children.push(makeInput("Email", "email", "alex@example.com"));
        registration.children.push(makeInput("Password", "password", "Password"));
        registration.children.push(makeButton("Button", "Register", false));
        return registration;
      }
      case "search-bar":
        return createTemplate("input-group");
      case "header": {
        var header = createComponent("nav.navbar");
        header.name = "Header";
        header.props.brand = "Page Header";
        header.props.linksText = "Overview\nFeatures\nContact";
        return header;
      }
      case "footer":
        return makeParagraph("Footer", "Footer content", false);
      case "sidebar-navigation":
        return createTemplate("offcanvas-navigation");
      case "metric-card":
        return makeCard("Dashboard Metric Card", "Visitors", "24,918");
      case "toolbar-template":
        return createTemplate("button-toolbar");
      case "filter-bar":
        return createTemplate("input-group");
      case "data-table-template":
        return createTemplate("responsive-table");
      case "settings-form": {
        var settings = makeCard("Settings Form", "Settings", "Configure options");
        settings.children.push(makeInput("Site Name", "text", "MockApp"));
        settings.children.push(createComponent("form.checkbox"));
        return settings;
      }
      case "contact-form": {
        var contact = makeCard("Contact Form", "Contact Us", "Send us a message");
        contact.children.push(makeInput("Email", "email", "name@example.com"));
        contact.children.push(createComponent("form.textarea"));
        contact.children.push(makeButton("Button", "Send", false));
        return contact;
      }
      case "profile-card":
        return makeCard("Profile Card", "User Name", "Role and short bio");
      case "empty-state":
        return makeCard("Empty State", "No results", "Try adjusting your filters.");
      case "confirmation-dialog":
        return makeCard("Confirmation Dialog", "Confirm Action", "Are you sure you want to continue?");
      case "hero-section": {
        var hero = makeCard("Hero Section", "Build faster with MockApp", "Design responsive UI mockups offline.");
        hero.children.push(makeButton("Button", "Get Started", false));
        return hero;
      }
      case "admin-layout":
        return createTemplate("dashboard");
      default:
        break;
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
    component.code = normalizeCode(component.code);
    component.frame = normalizeFrame(component.frame, component.type);
    component.name = component.name || (registry.getDefinition(component.type) || {}).name || component.type;
    return component;
  }

  function normalizeCode(code) {
    var source = code && typeof code === "object" ? code : {};
    return {
      html: String(source.html || ""),
      css: String(source.css || "")
    };
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
      page.previewSurfaceTitle = page.previewSurfaceTitle || "Responsive Bootstrap preview surface";
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

  function buildContextIndex(page) {
    var index = Object.create(null);

    function visit(node, parent, childIndex) {
      index[node.id] = { node: node, parent: parent, index: childIndex };
      (node.children || []).forEach(function (child, nextIndex) {
        visit(child, node, nextIndex);
      });
    }

    visit(page.root, null, -1);
    return index;
  }

  function findComponentContext(page, componentId, contextIndex) {
    if (contextIndex && contextIndex[componentId]) {
      return contextIndex[componentId];
    }

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

  function insertComponent(page, parentId, component, index, placement, contextIndex) {
    var parentContext = parentId ? findComponentContext(page, parentId, contextIndex) : null;
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

  function removeComponent(page, componentId, contextIndex) {
    var context = findComponentContext(page, componentId, contextIndex);
    if (!context || !context.parent) {
      return null;
    }

    return context.parent.children.splice(context.index, 1)[0] || null;
  }

  function updateComponent(page, componentId, updater, contextIndex) {
    var context = findComponentContext(page, componentId, contextIndex);
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

  function moveComponent(page, componentId, targetParentId, placement, contextIndex) {
    var context = findComponentContext(page, componentId, contextIndex);
    if (!context || !context.parent) {
      return false;
    }

    var targetContext = targetParentId ? findComponentContext(page, targetParentId, contextIndex) : null;
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

  function updateComponentFrame(page, componentId, frame, contextIndex) {
    var context = findComponentContext(page, componentId, contextIndex);
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
    buildContextIndex: buildContextIndex,
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
