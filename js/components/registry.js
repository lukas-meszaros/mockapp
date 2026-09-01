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
        { path: "props.optionsText", label: "Options", type: "textarea" },
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
      defaults: { brand: "MockApp", theme: "dark", background: "dark" },
      fields: [
        { path: "props.brand", label: "Brand", type: "text" },
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
        { path: "props.columnsText", label: "Columns", type: "textarea" },
        { path: "props.rowsText", label: "Rows", type: "textarea" },
        { path: "props.striped", label: "Striped", type: "checkbox" },
        { path: "props.hover", label: "Hover", type: "checkbox" }
      ]
    },
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
    }
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
