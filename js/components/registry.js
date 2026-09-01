(function (MockApp) {
  var GRID_OPTIONS = MockApp.app.constants.GRID_OPTIONS;
  var BREAKPOINTS = MockApp.app.constants.BREAKPOINTS;

  function breakpointFields(prefix, labelPrefix) {
    return BREAKPOINTS.map(function (breakpoint) {
      return {
        path: prefix + "." + breakpoint,
        label: labelPrefix + " " + breakpoint.toUpperCase(),
        type: "select",
        options: GRID_OPTIONS,
        defaultValue: breakpoint === "md" ? "12" : "auto"
      };
    });
  }

  function templateEntry(type, name, icon, category, tags, templateFactory) {
    return {
      type: type,
      name: name,
      icon: icon,
      category: category,
      tags: tags || [],
      allowsChildren: true,
      templateFactory: templateFactory
    };
  }

  var definitions = [
    {
      type: "layout.container",
      name: "Container",
      icon: "bounding-box",
      category: "Layout",
      tags: ["container", "layout", "bootstrap"],
      allowsChildren: true,
      defaults: { fluid: false, padding: "3", gap: "3" },
      fields: [
        { path: "props.fluid", label: "Fluid", type: "checkbox" },
        { path: "props.padding", label: "Padding", type: "select", options: ["0", "1", "2", "3", "4", "5"] },
        { path: "props.gap", label: "Gap", type: "select", options: ["0", "1", "2", "3", "4", "5"] }
      ]
    },
    {
      type: "layout.row",
      name: "Row",
      icon: "layout-three-columns",
      category: "Layout",
      tags: ["row", "grid", "bootstrap"],
      allowsChildren: true,
      allowedChildTypes: ["layout.column"],
      defaults: { gap: "3", alignItems: "stretch" },
      fields: [
        { path: "props.gap", label: "Gutter", type: "select", options: ["0", "1", "2", "3", "4", "5"] },
        { path: "props.alignItems", label: "Align Items", type: "select", options: ["stretch", "start", "center", "end"] }
      ]
    },
    {
      type: "layout.column",
      name: "Column",
      icon: "columns-gap",
      category: "Layout",
      tags: ["column", "col", "grid"],
      allowsChildren: true,
      defaults: { gap: "3", widths: { xs: "12", sm: "auto", md: "6", lg: "6", xl: "auto", xxl: "auto" } },
      fields: [{ path: "props.gap", label: "Gap", type: "select", options: ["0", "1", "2", "3", "4", "5"] }].concat(breakpointFields("props.widths", "Width"))
    },
    {
      type: "content.heading",
      name: "Heading",
      icon: "type-h1",
      category: "Typography",
      tags: ["heading", "title", "text"],
      allowsChildren: false,
      defaults: { text: "Section Title", level: "2", marginBottom: "3" },
      fields: [
        { path: "props.text", label: "Text", type: "text" },
        { path: "props.level", label: "Level", type: "select", options: ["1", "2", "3", "4", "5", "6"] },
        { path: "props.marginBottom", label: "Bottom Margin", type: "select", options: ["0", "1", "2", "3", "4", "5"] }
      ]
    },
    {
      type: "content.paragraph",
      name: "Paragraph",
      icon: "text-paragraph",
      category: "Typography",
      tags: ["text", "paragraph", "copy"],
      allowsChildren: false,
      defaults: { text: "Describe the purpose of this section.", lead: false, align: "start" },
      fields: [
        { path: "props.text", label: "Text", type: "textarea" },
        { path: "props.lead", label: "Lead Style", type: "checkbox" },
        { path: "props.align", label: "Alignment", type: "select", options: ["start", "center", "end"] }
      ]
    },
    {
      type: "action.button",
      name: "Button",
      icon: "cursor-fill",
      category: "Buttons",
      tags: ["button", "cta", "action"],
      allowsChildren: false,
      defaults: { text: "Button", variant: "primary", outline: false, size: "md", disabled: false },
      fields: [
        { path: "props.text", label: "Label", type: "text" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark"] },
        { path: "props.outline", label: "Outline", type: "checkbox" },
        { path: "props.size", label: "Size", type: "select", options: ["sm", "md", "lg"] },
        { path: "props.disabled", label: "Disabled", type: "checkbox" }
      ]
    },
    {
      type: "form.input",
      name: "Text Input",
      icon: "input-cursor-text",
      category: "Forms",
      tags: ["input", "field", "text", "form"],
      allowsChildren: false,
      defaults: { label: "Field Label", placeholder: "Enter value", value: "", inputType: "text", required: false },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.placeholder", label: "Placeholder", type: "text" },
        { path: "props.value", label: "Value", type: "text" },
        { path: "props.inputType", label: "Type", type: "select", options: ["text", "email", "password", "number", "search", "tel", "url"] },
        { path: "props.required", label: "Required", type: "checkbox" }
      ]
    },
    {
      type: "form.textarea",
      name: "Textarea",
      icon: "textarea-t",
      category: "Forms",
      tags: ["textarea", "form", "input"],
      allowsChildren: false,
      defaults: { label: "Message", placeholder: "Write here", rows: 4 },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.placeholder", label: "Placeholder", type: "text" },
        { path: "props.rows", label: "Rows", type: "number", min: 2, max: 12 }
      ]
    },
    {
      type: "form.select",
      name: "Select",
      icon: "menu-button-wide",
      category: "Forms",
      tags: ["select", "options", "dropdown", "form"],
      allowsChildren: false,
      defaults: { label: "Select Option", optionsText: "Option 1\nOption 2\nOption 3", multiple: false },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.optionsText", label: "Options", type: "list", separator: "\n", itemPlaceholder: "Option label" },
        { path: "props.multiple", label: "Multiple", type: "checkbox" }
      ]
    },
    {
      type: "form.checkbox",
      name: "Checkbox",
      icon: "ui-checks",
      category: "Forms",
      tags: ["checkbox", "toggle", "form"],
      allowsChildren: false,
      defaults: { label: "Accept terms", checked: false },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.checked", label: "Checked", type: "checkbox" }
      ]
    },
    {
      type: "form.radio",
      name: "Radio",
      icon: "record-circle",
      category: "Forms",
      tags: ["radio", "choice", "form"],
      allowsChildren: false,
      defaults: { label: "Choice", checked: false, groupName: "group-1" },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.groupName", label: "Group Name", type: "text" },
        { path: "props.checked", label: "Checked", type: "checkbox" }
      ]
    },
    {
      type: "form.switch",
      name: "Switch",
      icon: "toggles2",
      category: "Forms",
      tags: ["switch", "toggle", "form"],
      allowsChildren: false,
      defaults: { label: "Enable option", checked: false },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.checked", label: "Checked", type: "checkbox" }
      ]
    },
    {
      type: "feedback.alert",
      name: "Alert",
      icon: "exclamation-triangle",
      category: "Feedback",
      tags: ["alert", "message", "feedback"],
      allowsChildren: false,
      defaults: { text: "Helpful status message", variant: "info" },
      fields: [
        { path: "props.text", label: "Text", type: "textarea" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"] }
      ]
    },
    {
      type: "content.badge",
      name: "Badge",
      icon: "bookmark-fill",
      category: "Content",
      tags: ["badge", "label", "status"],
      allowsChildren: false,
      defaults: { text: "New", variant: "primary", pill: true },
      fields: [
        { path: "props.text", label: "Text", type: "text" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark"] },
        { path: "props.pill", label: "Pill", type: "checkbox" }
      ]
    },
    {
      type: "content.card",
      name: "Card",
      icon: "card-text",
      category: "Content",
      tags: ["card", "panel", "content"],
      allowsChildren: true,
      defaults: { title: "Card title", text: "Card text", shadow: "sm" },
      fields: [
        { path: "props.title", label: "Title", type: "text" },
        { path: "props.text", label: "Body", type: "textarea" },
        { path: "props.shadow", label: "Shadow", type: "select", options: ["none", "sm", "regular", "lg"] }
      ]
    },
    {
      type: "nav.navbar",
      name: "Navbar",
      icon: "menu-app",
      category: "Navigation",
      tags: ["navbar", "nav", "header"],
      allowsChildren: true,
      defaults: { brand: "MockApp", theme: "dark", background: "dark", linksText: "Home\nFeatures\nPricing" },
      fields: [
        { path: "props.brand", label: "Brand", type: "text" },
        { path: "props.linksText", label: "Links", type: "list", separator: "\n", itemPlaceholder: "Navigation item" },
        { path: "props.theme", label: "Theme", type: "select", options: ["light", "dark"] },
        { path: "props.background", label: "Background", type: "select", options: ["light", "dark", "primary", "body-tertiary"] }
      ]
    },
    {
      type: "data.table",
      name: "Table",
      icon: "table",
      category: "Content",
      tags: ["table", "data", "grid"],
      allowsChildren: false,
      defaults: { columnsText: "Name, Role, Status", rowsText: "Avery, Admin, Active\nRiley, Editor, Pending\nJordan, Viewer, Disabled", striped: true, hover: true },
      fields: [
        { path: "props.columnsText", label: "Columns", type: "list", separator: ",", itemPlaceholder: "Column name" },
        { path: "props.rowsText", label: "Rows", type: "list", separator: "\n", itemPlaceholder: "Value 1, Value 2" },
        { path: "props.striped", label: "Striped", type: "checkbox" },
        { path: "props.hover", label: "Hover", type: "checkbox" }
      ]
    },
    templateEntry("layout.container-fluid", "Fluid Container", "bounding-box-circles", "Layout", ["layout", "container", "fluid"], "container-fluid"),
    templateEntry("layout.stack", "Stack", "distribute-vertical", "Layout", ["layout", "stack", "vertical"], "stack"),
    templateEntry("layout.hstack", "Horizontal Stack", "distribute-horizontal", "Layout", ["layout", "stack", "horizontal"], "horizontal-stack"),
    templateEntry("layout.grid-pattern", "Grid Pattern", "grid-3x3-gap", "Layout", ["layout", "grid", "pattern"], "dashboard"),
    templateEntry("layout.divider", "Divider", "dash-lg", "Layout", ["layout", "divider", "separator"], "divider"),
    templateEntry("layout.spacer", "Spacer", "arrows-collapse-vertical", "Layout", ["layout", "spacer", "gap"], "spacer"),
    templateEntry("content.heading-h1", "Heading H1", "type-h1", "Typography", ["heading", "h1", "title"], "heading-h1"),
    templateEntry("content.heading-h2", "Heading H2", "type-h2", "Typography", ["heading", "h2", "title"], "heading-h2"),
    templateEntry("content.heading-h3", "Heading H3", "type-h3", "Typography", ["heading", "h3", "title"], "heading-h3"),
    templateEntry("content.heading-h4", "Heading H4", "type-h4", "Typography", ["heading", "h4", "title"], "heading-h4"),
    templateEntry("content.heading-h5", "Heading H5", "type-h5", "Typography", ["heading", "h5", "title"], "heading-h5"),
    templateEntry("content.heading-h6", "Heading H6", "type-h6", "Typography", ["heading", "h6", "title"], "heading-h6"),
    templateEntry("content.lead-paragraph", "Lead Paragraph", "paragraph", "Typography", ["lead", "paragraph", "text"], "lead-paragraph"),
    templateEntry("content.small-text", "Small Text", "type", "Typography", ["small", "text", "helper"], "small-text"),
    templateEntry("content.blockquote", "Blockquote", "blockquote-left", "Typography", ["blockquote", "quote", "text"], "blockquote"),
    templateEntry("content.code", "Code", "code-slash", "Typography", ["code", "inline", "text"], "code-text"),
    templateEntry("content.preformatted", "Preformatted Text", "braces", "Typography", ["pre", "code", "text"], "preformatted"),
    templateEntry("action.outline-button", "Outline Button", "cursor", "Buttons", ["button", "outline", "action"], "outline-button"),
    templateEntry("action.button-group", "Button Group", "collection", "Buttons", ["button", "group", "actions"], "button-group"),
    templateEntry("action.button-toolbar", "Button Toolbar", "kanban", "Buttons", ["button", "toolbar", "actions"], "button-toolbar"),
    templateEntry("action.close-button", "Close Button", "x-lg", "Buttons", ["button", "close", "dismiss"], "close-button"),
    templateEntry("form.email-input", "Email Input", "envelope", "Forms", ["input", "email", "form"], "input-email"),
    templateEntry("form.password-input", "Password Input", "key", "Forms", ["input", "password", "form"], "input-password"),
    templateEntry("form.number-input", "Number Input", "123", "Forms", ["input", "number", "form"], "input-number"),
    templateEntry("form.search-input", "Search Input", "search", "Forms", ["input", "search", "form"], "input-search"),
    templateEntry("form.telephone-input", "Telephone Input", "telephone", "Forms", ["input", "telephone", "tel", "form"], "input-tel"),
    templateEntry("form.url-input", "URL Input", "link-45deg", "Forms", ["input", "url", "link", "form"], "input-url"),
    templateEntry("form.multi-select", "Multi-select", "list-check", "Forms", ["select", "multiple", "form"], "multi-select"),
    templateEntry("form.radio-button", "Radio Button", "record-circle", "Forms", ["radio", "choice", "form"], "radio-button"),
    templateEntry("form.range", "Range", "sliders", "Forms", ["range", "slider", "form"], "range"),
    templateEntry("form.file-input", "File Input", "file-earmark-arrow-up", "Forms", ["file", "upload", "form"], "file-input"),
    templateEntry("form.input-group", "Input Group", "layout-sidebar-inset", "Forms", ["input", "group", "form"], "input-group"),
    templateEntry("form.floating-label", "Floating Label", "badge-tm", "Forms", ["floating", "label", "form"], "floating-label"),
    templateEntry("form.form-group", "Form Group", "ui-radios-grid", "Forms", ["form", "group", "controls"], "form-group"),
    templateEntry("form.validation-state", "Validation State", "check2-circle", "Forms", ["validation", "state", "form"], "validation-state"),
    templateEntry("nav.nav", "Nav", "list", "Navigation", ["nav", "navigation", "links"], "nav"),
    templateEntry("nav.tabs", "Tabs", "folder2-open", "Navigation", ["tabs", "nav", "navigation"], "tabs"),
    templateEntry("nav.pills", "Pills", "capsule", "Navigation", ["pills", "nav", "navigation"], "pills"),
    templateEntry("nav.breadcrumb", "Breadcrumb", "chevron-right", "Navigation", ["breadcrumb", "path", "navigation"], "breadcrumb"),
    templateEntry("nav.pagination", "Pagination", "arrow-left-right", "Navigation", ["pagination", "pages", "navigation"], "pagination"),
    templateEntry("nav.dropdown", "Dropdown", "menu-button-wide", "Navigation", ["dropdown", "menu", "navigation"], "dropdown"),
    templateEntry("nav.dropdown-button", "Dropdown Button", "menu-button", "Navigation", ["dropdown", "button", "navigation"], "dropdown-button"),
    templateEntry("nav.offcanvas-navigation", "Offcanvas Navigation", "layout-sidebar", "Navigation", ["offcanvas", "sidebar", "navigation"], "offcanvas-navigation"),
    templateEntry("content.list-group", "List Group", "list-ul", "Content", ["list", "group", "content"], "list-group"),
    templateEntry("data.responsive-table", "Responsive Table", "table", "Content", ["table", "responsive", "data"], "responsive-table"),
    templateEntry("content.image", "Image", "image", "Content", ["image", "media", "content"], "image"),
    templateEntry("content.figure", "Figure", "card-image", "Content", ["figure", "caption", "content"], "figure"),
    templateEntry("feedback.progress", "Progress", "activity", "Feedback", ["progress", "meter", "feedback"], "progress"),
    templateEntry("feedback.spinner", "Spinner", "arrow-repeat", "Feedback", ["spinner", "loading", "feedback"], "spinner"),
    templateEntry("feedback.toast", "Toast", "chat-square-text", "Feedback", ["toast", "notification", "feedback"], "toast"),
    templateEntry("feedback.placeholder", "Placeholder", "dash-square-dotted", "Feedback", ["placeholder", "skeleton", "feedback"], "placeholder"),
    templateEntry("interactive.accordion", "Accordion", "list-nested", "Interactive Bootstrap Components", ["accordion", "interactive", "bootstrap"], "accordion"),
    templateEntry("interactive.collapse", "Collapse", "arrows-collapse", "Interactive Bootstrap Components", ["collapse", "interactive", "bootstrap"], "collapse"),
    templateEntry("interactive.carousel", "Carousel", "images", "Interactive Bootstrap Components", ["carousel", "interactive", "bootstrap"], "carousel"),
    templateEntry("interactive.modal", "Modal", "window-stack", "Interactive Bootstrap Components", ["modal", "interactive", "bootstrap"], "modal"),
    templateEntry("interactive.offcanvas", "Offcanvas", "layout-sidebar-reverse", "Interactive Bootstrap Components", ["offcanvas", "interactive", "bootstrap"], "offcanvas-navigation"),
    templateEntry("interactive.tooltip", "Tooltip Representation", "info-circle", "Interactive Bootstrap Components", ["tooltip", "interactive", "bootstrap"], "tooltip"),
    templateEntry("interactive.popover", "Popover Representation", "chat-left-quote", "Interactive Bootstrap Components", ["popover", "interactive", "bootstrap"], "popover"),
    {
      type: "template.login",
      name: "Login Form",
      icon: "person-bounding-box",
      category: "Templates",
      tags: ["template", "login", "form"],
      allowsChildren: true,
      templateFactory: "login"
    },
    {
      type: "template.dashboard",
      name: "Dashboard Grid",
      icon: "grid-3x3-gap",
      category: "Templates",
      tags: ["template", "dashboard", "grid"],
      allowsChildren: true,
      templateFactory: "dashboard"
    },
    templateEntry("template.registration", "Registration Form", "person-plus", "Templates", ["template", "registration", "form"], "registration-form"),
    templateEntry("template.search-bar", "Search Bar", "search", "Templates", ["template", "search", "input"], "search-bar"),
    templateEntry("template.header", "Header", "layout-text-window", "Templates", ["template", "header", "navigation"], "header"),
    templateEntry("template.footer", "Footer", "layout-text-window-reverse", "Templates", ["template", "footer", "navigation"], "footer"),
    templateEntry("template.sidebar-navigation", "Sidebar Navigation", "layout-sidebar", "Templates", ["template", "sidebar", "navigation"], "sidebar-navigation"),
    templateEntry("template.metric-card", "Dashboard Metric Card", "graph-up-arrow", "Templates", ["template", "dashboard", "metric"], "metric-card"),
    templateEntry("template.toolbar", "Toolbar", "tools", "Templates", ["template", "toolbar", "actions"], "toolbar-template"),
    templateEntry("template.filter-bar", "Filter Bar", "funnel", "Templates", ["template", "filter", "search"], "filter-bar"),
    templateEntry("template.data-table", "Data Table", "table", "Templates", ["template", "table", "data"], "data-table-template"),
    templateEntry("template.settings-form", "Settings Form", "gear", "Templates", ["template", "settings", "form"], "settings-form"),
    templateEntry("template.contact-form", "Contact Form", "envelope-open", "Templates", ["template", "contact", "form"], "contact-form"),
    templateEntry("template.profile-card", "Profile Card", "person-vcard", "Templates", ["template", "profile", "card"], "profile-card"),
    templateEntry("template.empty-state", "Empty State", "inbox", "Templates", ["template", "empty", "state"], "empty-state"),
    templateEntry("template.confirmation-dialog", "Confirmation Dialog", "question-circle", "Templates", ["template", "confirmation", "dialog"], "confirmation-dialog"),
    templateEntry("template.hero", "Hero Section", "stars", "Templates", ["template", "hero", "marketing"], "hero-section"),
    templateEntry("template.admin-layout", "Basic Admin Layout", "window-sidebar", "Templates", ["template", "admin", "dashboard"], "admin-layout")
  ];

  var byType = definitions.reduce(function (result, definition) {
    result[definition.type] = definition;
    return result;
  }, {});

  var sharedFields = [
    { path: "name", label: "Name", type: "text" },
    { path: "meta.locked", label: "Locked", type: "checkbox" },
    { path: "meta.hidden", label: "Hidden in Editor", type: "checkbox" }
  ];

  function getDefinition(type) {
    return byType[type];
  }

  function getPaletteEntries() {
    return definitions.slice();
  }

  function getFieldSchema(type) {
    var definition = getDefinition(type);
    return definition ? sharedFields.concat(definition.fields || []) : sharedFields.slice();
  }

  function canAcceptChild(parentType, childType) {
    if (!childType) {
      return false;
    }

    if (parentType === "page-root") {
      return true;
    }

    var definition = getDefinition(parentType);
    if (!definition || !definition.allowsChildren) {
      return false;
    }

    if (!definition.allowedChildTypes) {
      return true;
    }

    return definition.allowedChildTypes.indexOf(childType) >= 0;
  }

  function getDefaultFrame(type) {
    switch (type) {
      case "layout.container":
        return { x: 48, y: 48, width: 680, height: 420 };
      case "layout.row":
        return { x: 48, y: 48, width: 620, height: 240 };
      case "layout.column":
        return { x: 48, y: 48, width: 300, height: 240 };
      case "nav.navbar":
        return { x: 40, y: 32, width: 900, height: 88 };
      case "content.card":
        return { x: 48, y: 48, width: 320, height: 220 };
      case "data.table":
        return { x: 48, y: 48, width: 520, height: 280 };
      case "feedback.alert":
        return { x: 48, y: 48, width: 360, height: 92 };
      case "content.heading":
        return { x: 48, y: 48, width: 360, height: 92 };
      case "content.paragraph":
        return { x: 48, y: 48, width: 420, height: 132 };
      case "form.input":
      case "form.select":
      case "form.textarea":
        return { x: 48, y: 48, width: 320, height: 110 };
      case "form.checkbox":
      case "form.radio":
      case "form.switch":
        return { x: 48, y: 48, width: 280, height: 76 };
      case "action.button":
        return { x: 48, y: 48, width: 180, height: 72 };
      case "content.badge":
        return { x: 48, y: 48, width: 140, height: 64 };
      default:
        return { x: 48, y: 48, width: 320, height: 160 };
    }
  }

  MockApp.components.registry = {
    getDefinition: getDefinition,
    getPaletteEntries: getPaletteEntries,
    getFieldSchema: getFieldSchema,
    canAcceptChild: canAcceptChild,
    getDefaultFrame: getDefaultFrame
  };
})(window.MockApp);
