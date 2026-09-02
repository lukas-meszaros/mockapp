(function (MockApp) {
  var GRID_OPTIONS = MockApp.app.constants.GRID_OPTIONS;
  var BREAKPOINTS = MockApp.app.constants.BREAKPOINTS;
  var MOST_COMMON_TYPES = [
    "action.button",
    "form.input",
    "form.textarea",
    "form.select",
    "form.checkbox",
    "form.radio",
    "form.switch",
    "content.heading",
    "content.paragraph",
    "content.card"
  ];

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
        { path: "props.inputType", label: "Type", type: "select", options: ["text", "email", "password", "number", "search", "tel", "url", "file"] },
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
      type: "feedback.progress",
      name: "Progress",
      icon: "activity",
      category: "Feedback",
      tags: ["progress", "meter", "feedback"],
      allowsChildren: false,
      defaults: { value: 60, label: "60%", showLabel: true, striped: true, animated: false, variant: "primary" },
      fields: [
        { path: "props.value", label: "Value", type: "number", min: 0, max: 100 },
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.showLabel", label: "Show Label", type: "checkbox" },
        { path: "props.striped", label: "Striped", type: "checkbox" },
        { path: "props.animated", label: "Animated", type: "checkbox" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark"] }
      ]
    },
    {
      type: "feedback.spinner",
      name: "Spinner",
      icon: "arrow-repeat",
      category: "Feedback",
      tags: ["spinner", "loading", "feedback"],
      allowsChildren: false,
      defaults: { spinnerType: "border", size: "md", variant: "primary", label: "Loading...", showLabel: true },
      fields: [
        { path: "props.spinnerType", label: "Type", type: "select", options: ["border", "grow"] },
        { path: "props.size", label: "Size", type: "select", options: ["sm", "md", "lg"] },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark"] },
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.showLabel", label: "Show Label", type: "checkbox" }
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
      type: "content.image",
      name: "Image",
      icon: "image",
      category: "Content",
      tags: ["image", "media", "content"],
      allowsChildren: false,
      defaults: {
        src: "",
        alt: "Image",
        fit: "cover",
        placeholderText: "Image Placeholder",
        placeholderColor: "#d9e2f0"
      },
      fields: [
        { path: "props.src", label: "Image Source", type: "text" },
        { path: "props.__upload", label: "Upload Image", type: "image-upload", accept: "image/*" },
        { path: "props.alt", label: "Alt Text", type: "text" },
        { path: "props.fit", label: "Object Fit", type: "select", options: ["cover", "contain", "fill", "scale-down", "none"] },
        { path: "props.placeholderText", label: "Placeholder Text", type: "text" },
        { path: "props.placeholderColor", label: "Placeholder Color", type: "color" }
      ]
    },
    {
      type: "content.figure",
      name: "Figure",
      icon: "card-image",
      category: "Content",
      tags: ["figure", "caption", "content"],
      allowsChildren: false,
      defaults: {
        src: "",
        alt: "Figure image",
        caption: "Figure caption",
        fit: "cover",
        placeholderText: "Figure Placeholder",
        placeholderColor: "#d9e2f0"
      },
      fields: [
        { path: "props.src", label: "Image Source", type: "text" },
        { path: "props.__upload", label: "Upload Image", type: "image-upload", accept: "image/*" },
        { path: "props.alt", label: "Alt Text", type: "text" },
        { path: "props.caption", label: "Caption", type: "text" },
        { path: "props.fit", label: "Object Fit", type: "select", options: ["cover", "contain", "fill", "scale-down", "none"] },
        { path: "props.placeholderText", label: "Placeholder Text", type: "text" },
        { path: "props.placeholderColor", label: "Placeholder Color", type: "color" }
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
      type: "nav.breadcrumb",
      name: "Breadcrumb",
      icon: "chevron-right",
      category: "Navigation",
      tags: ["breadcrumb", "path", "navigation"],
      allowsChildren: false,
      defaults: { itemsText: "Home\nLibrary\nData" },
      fields: [
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Breadcrumb item" }
      ]
    },
    {
      type: "nav.pagination",
      name: "Pagination",
      icon: "arrow-left-right",
      category: "Navigation",
      tags: ["pagination", "pages", "navigation"],
      allowsChildren: false,
      defaults: { itemsText: "Previous\n1\n2\n3\nNext", activeIndex: 3, size: "md", align: "start" },
      fields: [
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Page item" },
        { path: "props.activeIndex", label: "Active Index", type: "number", min: 1, max: 20 },
        { path: "props.size", label: "Size", type: "select", options: ["sm", "md", "lg"] },
        { path: "props.align", label: "Alignment", type: "select", options: ["start", "center", "end"] }
      ]
    },
    {
      type: "nav.tabs",
      name: "Tabs",
      icon: "folder2-open",
      category: "Navigation",
      tags: ["tabs", "nav", "navigation"],
      allowsChildren: false,
      defaults: { itemsText: "Overview\nDetails\nSettings", activeIndex: 1, fill: false, justified: false },
      fields: [
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Tab label" },
        { path: "props.activeIndex", label: "Active Index", type: "number", min: 1, max: 20 },
        { path: "props.fill", label: "Fill Width", type: "checkbox" },
        { path: "props.justified", label: "Justified", type: "checkbox" }
      ]
    },
    {
      type: "nav.pills",
      name: "Pills",
      icon: "capsule",
      category: "Navigation",
      tags: ["pills", "nav", "navigation"],
      allowsChildren: false,
      defaults: { itemsText: "Active\nInactive\nArchived", activeIndex: 1, fill: false, justified: false },
      fields: [
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Pill label" },
        { path: "props.activeIndex", label: "Active Index", type: "number", min: 1, max: 20 },
        { path: "props.fill", label: "Fill Width", type: "checkbox" },
        { path: "props.justified", label: "Justified", type: "checkbox" }
      ]
    },
    {
      type: "nav.dropdown",
      name: "Dropdown",
      icon: "menu-button-wide",
      category: "Navigation",
      tags: ["dropdown", "menu", "navigation"],
      allowsChildren: false,
      defaults: { label: "Dropdown", itemsText: "Action\nAnother action\nSomething else", variant: "secondary" },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Menu item" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark", "light"] }
      ]
    },
    {
      type: "nav.dropdown-button",
      name: "Dropdown Button",
      icon: "menu-button",
      category: "Navigation",
      tags: ["dropdown", "button", "navigation"],
      allowsChildren: false,
      defaults: { label: "Actions", itemsText: "Edit\nDuplicate\nArchive", variant: "primary" },
      fields: [
        { path: "props.label", label: "Label", type: "text" },
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Menu item" },
        { path: "props.variant", label: "Variant", type: "select", options: ["primary", "secondary", "success", "danger", "warning", "info", "dark", "light"] }
      ]
    },
    {
      type: "nav.offcanvas-navigation",
      name: "Offcanvas Navigation",
      icon: "layout-sidebar",
      category: "Navigation",
      tags: ["offcanvas", "sidebar", "navigation"],
      allowsChildren: false,
      defaults: { buttonText: "Open Menu", title: "Menu", itemsText: "Dashboard\nProjects\nSettings", placement: "start" },
      fields: [
        { path: "props.buttonText", label: "Button Text", type: "text" },
        { path: "props.title", label: "Panel Title", type: "text" },
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "Navigation item" },
        { path: "props.placement", label: "Placement", type: "select", options: ["start", "end", "top", "bottom"] }
      ]
    },
    {
      type: "content.list-group",
      name: "List Group",
      icon: "list-ul",
      category: "Content",
      tags: ["list", "group", "content"],
      allowsChildren: false,
      defaults: { itemsText: "First item\nSecond item\nThird item", activeIndex: 1, flush: false, numbered: false },
      fields: [
        { path: "props.itemsText", label: "Items", type: "list", separator: "\n", itemPlaceholder: "List item" },
        { path: "props.activeIndex", label: "Active Index", type: "number", min: 1, max: 20 },
        { path: "props.flush", label: "Flush", type: "checkbox" },
        { path: "props.numbered", label: "Numbered", type: "checkbox" }
      ]
    },
    {
      type: "feedback.toast",
      name: "Toast",
      icon: "chat-square-text",
      category: "Feedback",
      tags: ["toast", "notification", "feedback"],
      allowsChildren: false,
      defaults: { title: "Notification", message: "Task completed successfully.", timestamp: "just now" },
      fields: [
        { path: "props.title", label: "Title", type: "text" },
        { path: "props.message", label: "Message", type: "textarea" },
        { path: "props.timestamp", label: "Timestamp", type: "text" }
      ]
    },
    {
      type: "feedback.placeholder",
      name: "Placeholder",
      icon: "dash-square-dotted",
      category: "Feedback",
      tags: ["placeholder", "skeleton", "feedback"],
      allowsChildren: false,
      defaults: { rows: 3, animated: true },
      fields: [
        { path: "props.rows", label: "Rows", type: "number", min: 1, max: 8 },
        { path: "props.animated", label: "Animated", type: "checkbox" }
      ]
    },
    {
      type: "interactive.accordion",
      name: "Accordion",
      icon: "list-nested",
      category: "Interactive Bootstrap Components",
      tags: ["accordion", "interactive", "bootstrap"],
      allowsChildren: false,
      defaults: { headersText: "Section One\nSection Two\nSection Three", bodiesText: "First body\nSecond body\nThird body", flush: false },
      fields: [
        { path: "props.headersText", label: "Headers", type: "list", separator: "\n", itemPlaceholder: "Accordion header" },
        { path: "props.bodiesText", label: "Bodies", type: "list", separator: "\n", itemPlaceholder: "Accordion body" },
        { path: "props.flush", label: "Flush", type: "checkbox" }
      ]
    },
    {
      type: "interactive.collapse",
      name: "Collapse",
      icon: "arrows-collapse",
      category: "Interactive Bootstrap Components",
      tags: ["collapse", "interactive", "bootstrap"],
      allowsChildren: false,
      defaults: { buttonText: "Toggle details", content: "Hidden content", shown: false },
      fields: [
        { path: "props.buttonText", label: "Button Text", type: "text" },
        { path: "props.content", label: "Content", type: "textarea" },
        { path: "props.shown", label: "Shown by Default", type: "checkbox" }
      ]
    },
    {
      type: "interactive.carousel",
      name: "Carousel",
      icon: "images",
      category: "Interactive Bootstrap Components",
      tags: ["carousel", "interactive", "bootstrap"],
      allowsChildren: false,
      defaults: { slidesText: "Slide One\nSlide Two\nSlide Three", dark: false, autoPlay: false },
      fields: [
        { path: "props.slidesText", label: "Slides", type: "list", separator: "\n", itemPlaceholder: "Slide title" },
        { path: "props.dark", label: "Dark Controls", type: "checkbox" },
        { path: "props.autoPlay", label: "Auto Play", type: "checkbox" }
      ]
    },
    {
      type: "interactive.tooltip",
      name: "Tooltip",
      icon: "info-circle",
      category: "Interactive Bootstrap Components",
      tags: ["tooltip", "interactive", "bootstrap"],
      allowsChildren: false,
      defaults: { buttonText: "Hover me", title: "Tooltip text", placement: "top" },
      fields: [
        { path: "props.buttonText", label: "Button Text", type: "text" },
        { path: "props.title", label: "Tooltip Text", type: "text" },
        { path: "props.placement", label: "Placement", type: "select", options: ["top", "right", "bottom", "left"] }
      ]
    },
    {
      type: "interactive.popover",
      name: "Popover",
      icon: "chat-left-quote",
      category: "Interactive Bootstrap Components",
      tags: ["popover", "interactive", "bootstrap"],
      allowsChildren: false,
      defaults: { buttonText: "Show popover", title: "Popover title", content: "Popover body content.", placement: "right" },
      fields: [
        { path: "props.buttonText", label: "Button Text", type: "text" },
        { path: "props.title", label: "Title", type: "text" },
        { path: "props.content", label: "Content", type: "textarea" },
        { path: "props.placement", label: "Placement", type: "select", options: ["top", "right", "bottom", "left"] }
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
    {
      type: "drawing.rectangle",
      name: "Rectangle",
      icon: "square",
      category: "Drawing",
      tags: ["drawing", "shape", "rectangle"],
      allowsChildren: false,
        defaults: { fillColor: "#dbeafe", borderColor: "#2563eb", lineThickness: 1, lockSides: false, rotation: 0 },
      fields: [
        { path: "props.fillColor", label: "Fill Color", type: "color" },
        { path: "props.borderColor", label: "Border Color", type: "color" },
        { path: "props.lineThickness", label: "Line Thickness", type: "number", min: 0, max: 24 },
        { path: "props.lockSides", label: "Lock Sides", type: "checkbox" },
        { path: "props.rotation", label: "Rotation", type: "number", min: -360, max: 360 }
      ]
    },
    {
      type: "drawing.circle",
      name: "Circle",
      icon: "circle",
      category: "Drawing",
      tags: ["drawing", "shape", "circle", "ellipse"],
      allowsChildren: false,
        defaults: { fillColor: "#dcfce7", borderColor: "#16a34a", lineThickness: 1, lockSides: false, rotation: 0 },
      fields: [
        { path: "props.fillColor", label: "Fill Color", type: "color" },
        { path: "props.borderColor", label: "Border Color", type: "color" },
        { path: "props.lineThickness", label: "Line Thickness", type: "number", min: 0, max: 24 },
        { path: "props.lockSides", label: "Lock Sides", type: "checkbox" },
        { path: "props.rotation", label: "Rotation", type: "number", min: -360, max: 360 }
      ]
    },
    {
      type: "drawing.triangle",
      name: "Triangle",
      icon: "triangle",
      category: "Drawing",
      tags: ["drawing", "shape", "triangle"],
      allowsChildren: false,
        defaults: { fillColor: "#fef3c7", borderColor: "#d97706", lineThickness: 1, lockSides: false, rotation: 0 },
      fields: [
        { path: "props.fillColor", label: "Fill Color", type: "color" },
        { path: "props.borderColor", label: "Border Color", type: "color" },
        { path: "props.lineThickness", label: "Line Thickness", type: "number", min: 0, max: 24 },
        { path: "props.lockSides", label: "Lock Sides", type: "checkbox" },
        { path: "props.rotation", label: "Rotation", type: "number", min: -360, max: 360 }
      ]
    },
    {
      type: "drawing.line",
      name: "Line",
      icon: "dash-lg",
      category: "Drawing",
      tags: ["drawing", "shape", "line", "arrow"],
      allowsChildren: false,
        defaults: { fillColor: "#ffffff", borderColor: "#334155", lineThickness: 1, arrowStart: false, arrowEnd: true, startX: 6, startY: 50, endX: 94, endY: 50, lockSides: false },
      fields: [
        { path: "props.fillColor", label: "Fill Color", type: "color" },
        { path: "props.borderColor", label: "Border Color", type: "color" },
        { path: "props.lineThickness", label: "Line Thickness", type: "number", min: 1, max: 24 },
        { path: "props.arrowStart", label: "Arrow Start", type: "checkbox" },
        { path: "props.arrowEnd", label: "Arrow End", type: "checkbox" },
        { path: "props.startX", label: "Start X", type: "number", min: 0, max: 100 },
        { path: "props.startY", label: "Start Y", type: "number", min: 0, max: 100 },
        { path: "props.endX", label: "End X", type: "number", min: 0, max: 100 },
        { path: "props.endY", label: "End Y", type: "number", min: 0, max: 100 },
        { path: "props.lockSides", label: "Lock Sides", type: "checkbox" }
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
    
    templateEntry("data.responsive-table", "Responsive Table", "table", "Content", ["table", "responsive", "data"], "responsive-table"),
    
    templateEntry("interactive.modal", "Modal", "window-stack", "Interactive Bootstrap Components", ["modal", "interactive", "bootstrap"], "modal"),
    templateEntry("interactive.offcanvas", "Offcanvas", "layout-sidebar-reverse", "Interactive Bootstrap Components", ["offcanvas", "interactive", "bootstrap"], "offcanvas-navigation"),
    
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

  function getMostCommonTypes() {
    return MOST_COMMON_TYPES.slice();
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
      case "content.image":
        return { x: 48, y: 48, width: 320, height: 220 };
      case "content.figure":
        return { x: 48, y: 48, width: 340, height: 260 };
      case "feedback.progress":
        return { x: 48, y: 48, width: 360, height: 88 };
      case "feedback.spinner":
        return { x: 48, y: 48, width: 220, height: 120 };
      case "nav.breadcrumb":
        return { x: 48, y: 48, width: 380, height: 72 };
      case "nav.pagination":
        return { x: 48, y: 48, width: 440, height: 84 };
      case "nav.tabs":
      case "nav.pills":
        return { x: 48, y: 48, width: 460, height: 84 };
      case "nav.dropdown":
      case "nav.dropdown-button":
        return { x: 48, y: 48, width: 240, height: 88 };
      case "nav.offcanvas-navigation":
        return { x: 48, y: 48, width: 300, height: 88 };
      case "content.list-group":
        return { x: 48, y: 48, width: 320, height: 200 };
      case "feedback.toast":
        return { x: 48, y: 48, width: 360, height: 170 };
      case "feedback.placeholder":
        return { x: 48, y: 48, width: 320, height: 150 };
      case "interactive.accordion":
        return { x: 48, y: 48, width: 420, height: 260 };
      case "interactive.collapse":
        return { x: 48, y: 48, width: 360, height: 180 };
      case "interactive.carousel":
        return { x: 48, y: 48, width: 500, height: 260 };
      case "interactive.tooltip":
      case "interactive.popover":
        return { x: 48, y: 48, width: 240, height: 100 };
      case "drawing.rectangle":
      case "drawing.circle":
      case "drawing.triangle":
        return { x: 48, y: 48, width: 220, height: 160 };
      case "drawing.line":
        return { x: 48, y: 48, width: 280, height: 80 };
      default:
        return { x: 48, y: 48, width: 320, height: 160 };
    }
  }

  MockApp.components.registry = {
    getDefinition: getDefinition,
    getPaletteEntries: getPaletteEntries,
    getMostCommonTypes: getMostCommonTypes,
    getFieldSchema: getFieldSchema,
    canAcceptChild: canAcceptChild,
    getDefaultFrame: getDefaultFrame
  };
})(window.MockApp);
