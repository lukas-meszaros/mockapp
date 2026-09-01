(function () {
  var STORAGE_KEY = "mockapp.project.v1";
  var EXPORT_TITLE = "MockApp Export";
  var state = {
    project: null,
    selectedComponentId: null,
    viewport: "desktop",
    paletteFilter: "",
  };

  var registry = {
    layout: [
      {
        type: "navbar",
        label: "Navbar",
        defaults: { text: "Navbar", className: "navbar navbar-dark bg-dark", width: "" },
      },
      {
        type: "card",
        label: "Card",
        defaults: { text: "Card content", className: "card", width: "" },
      },
    ],
    content: [
      {
        type: "text",
        label: "Text",
        defaults: { text: "Sample text", className: "display-text", width: "" },
      },
      {
        type: "alert",
        label: "Alert",
        defaults: { text: "Helpful message", className: "alert alert-info", variant: "info", width: "" },
      },
    ],
    forms: [
      {
        type: "button",
        label: "Button",
        defaults: { text: "Button", className: "btn btn-primary", variant: "primary", width: "" },
      },
      {
        type: "input",
        label: "Input",
        defaults: { text: "", className: "form-control", placeholder: "Input field", width: "" },
      },
    ],
  };

  var palette = Object.keys(registry).reduce(function (items, section) {
    return items.concat(
      registry[section].map(function (entry) {
        return Object.assign({ section: section }, entry);
      })
    );
  }, []);

  var refs = {
    palette: document.getElementById("component-palette"),
    canvasStage: document.getElementById("canvas-stage"),
    canvasSurface: document.getElementById("canvas-surface"),
    inspector: document.getElementById("property-inspector"),
    search: document.getElementById("component-search"),
    viewport: document.getElementById("viewport-select"),
    pageName: document.getElementById("page-name"),
    statusViewport: document.getElementById("status-viewport"),
    statusSelection: document.getElementById("status-selection"),
    statusCount: document.getElementById("status-count"),
    statusSave: document.getElementById("status-save"),
    fileInput: document.getElementById("project-file-input"),
  };

  function createDefaultProject() {
    return {
      version: 1,
      name: "MockApp Project",
      pages: [
        {
          id: "page-1",
          name: "Page 1",
          components: [],
        },
      ],
    };
  }

  function currentPage() {
    return state.project.pages[0];
  }

  function generateId(prefix) {
    return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
  }

  function loadProject() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return createDefaultProject();
      }

      var parsed = JSON.parse(saved);
      return validateProject(parsed) ? parsed : createDefaultProject();
    } catch (error) {
      return createDefaultProject();
    }
  }

  function validateProject(project) {
    return (
      project &&
      typeof project === "object" &&
      Array.isArray(project.pages) &&
      project.pages.length > 0 &&
      Array.isArray(project.pages[0].components)
    );
  }

  function saveAutosave(label) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.project, null, 2));
      refs.statusSave.textContent = "Autosave: " + label;
    } catch (error) {
      refs.statusSave.textContent = "Autosave: unavailable";
    }
  }

  function renderPalette() {
    var grouped = {};
    palette.forEach(function (item) {
      var matches = !state.paletteFilter || item.label.toLowerCase().indexOf(state.paletteFilter) >= 0;
      if (!matches) {
        return;
      }

      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }

      grouped[item.section].push(item);
    });

    refs.palette.innerHTML = "";

    Object.keys(grouped).forEach(function (section) {
      var group = document.createElement("section");
      group.className = "palette-group";

      var title = document.createElement("h2");
      title.textContent = capitalize(section);
      group.appendChild(title);

      grouped[section].forEach(function (item) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "palette-item";
        button.draggable = true;
        button.dataset.componentType = item.type;
        button.textContent = item.label;
        button.addEventListener("click", function () {
          addComponent(item.type);
        });
        button.addEventListener("dragstart", function (event) {
          event.dataTransfer.setData("text/plain", item.type);
        });
        group.appendChild(button);
      });

      refs.palette.appendChild(group);
    });
  }

  function renderCanvas() {
    var components = currentPage().components;
    refs.canvasSurface.innerHTML = "";
    refs.pageName.textContent = currentPage().name;

    if (!components.length) {
      var empty = document.createElement("div");
      empty.className = "canvas-empty";
      empty.textContent = "Drag a component here or click a component in the left panel.";
      refs.canvasSurface.appendChild(empty);
      updateStatus();
      return;
    }

    components.forEach(function (component) {
      var wrapper = document.createElement("div");
      wrapper.className = "canvas-component";
      if (component.id === state.selectedComponentId) {
        wrapper.classList.add("selected");
      }
      wrapper.dataset.componentId = component.id;

      var label = document.createElement("span");
      label.className = "component-label";
      label.textContent = component.type;
      wrapper.appendChild(label);

      wrapper.appendChild(renderComponentNode(component));
      wrapper.addEventListener("click", function () {
        state.selectedComponentId = component.id;
        renderAll();
      });

      refs.canvasSurface.appendChild(wrapper);
    });

    updateStatus();
  }

  function renderComponentNode(component) {
    var props = component.props || {};
    var node;

    switch (component.type) {
      case "button":
        node = document.createElement("button");
        node.type = "button";
        node.textContent = props.text || "Button";
        break;
      case "input":
        node = document.createElement("input");
        node.type = "text";
        node.placeholder = props.placeholder || "";
        node.value = props.text || "";
        break;
      case "card":
        node = document.createElement("div");
        var body = document.createElement("div");
        body.className = "card-body";
        body.textContent = props.text || "";
        node.appendChild(body);
        break;
      case "alert":
        node = document.createElement("div");
        node.textContent = props.text || "";
        break;
      case "navbar":
        node = document.createElement("nav");
        var brand = document.createElement("span");
        brand.className = "navbar-brand";
        brand.textContent = props.text || "";
        node.appendChild(brand);
        break;
      case "text":
      default:
        node = document.createElement("p");
        node.textContent = props.text || "";
        break;
    }

    node.className = props.className || "";
    if (props.id) {
      node.id = props.id;
    }
    if (props.width) {
      node.style.width = sanitizeWidth(props.width);
    }

    return node;
  }

  function renderInspector() {
    var component = findSelectedComponent();
    refs.inspector.innerHTML = "";

    if (!component) {
      refs.inspector.innerHTML = '<p class="muted">Select a component to edit its properties.</p>';
      return;
    }

    var title = document.createElement("p");
    var strong = document.createElement("strong");
    strong.textContent = "Selected:";
    title.appendChild(strong);
    title.appendChild(document.createTextNode(" " + capitalize(component.type)));
    refs.inspector.appendChild(title);

    refs.inspector.appendChild(createField("Text", "text", component.props.text || ""));
    refs.inspector.appendChild(createField("Element ID", "id", component.props.id || ""));
    refs.inspector.appendChild(createField("CSS classes", "className", component.props.className || ""));
    refs.inspector.appendChild(createField("Width", "width", component.props.width || ""));

    if (component.type === "button") {
      refs.inspector.appendChild(createSelect("Variant", "variant", component.props.variant || "primary", ["primary", "secondary", "success"]));
    }

    if (component.type === "alert") {
      refs.inspector.appendChild(createSelect("Variant", "variant", component.props.variant || "info", ["info", "warning", "danger"]));
    }

    if (component.type === "input") {
      refs.inspector.appendChild(createField("Placeholder", "placeholder", component.props.placeholder || ""));
    }

    var actions = document.createElement("div");
    actions.className = "property-actions";
    var removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove component";
    removeButton.addEventListener("click", function () {
      removeSelectedComponent();
    });
    actions.appendChild(removeButton);
    refs.inspector.appendChild(actions);

    refs.inspector.querySelectorAll("[data-prop]").forEach(function (field) {
      field.addEventListener("input", onPropertyChange);
      field.addEventListener("change", onPropertyChange);
    });
  }

  function createField(labelText, prop, value) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-group";
    var label = document.createElement("label");
    label.textContent = labelText;
    var input = document.createElement("input");
    input.dataset.prop = prop;
    input.value = value;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }

  function createSelect(labelText, prop, value, options) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-group";
    var label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);

    var select = document.createElement("select");
    select.dataset.prop = prop;
    options.forEach(function (option) {
      var element = document.createElement("option");
      element.value = option;
      element.textContent = capitalize(option);
      if (option === value) {
        element.selected = true;
      }
      select.appendChild(element);
    });
    wrapper.appendChild(select);
    return wrapper;
  }

  function onPropertyChange(event) {
    var component = findSelectedComponent();
    if (!component) {
      return;
    }

    var prop = event.target.dataset.prop;
    component.props[prop] = event.target.value;

    if (prop === "variant") {
      if (component.type === "button") {
        component.props.className = "btn btn-" + event.target.value;
      } else if (component.type === "alert") {
        component.props.className = "alert alert-" + event.target.value;
      }
    }

    saveAutosave("saved");
    renderAll();
  }

  function addComponent(type) {
    var definition = palette.find(function (item) {
      return item.type === type;
    });
    if (!definition) {
      return;
    }

    var component = {
      id: generateId(type),
      type: definition.type,
      props: Object.assign({}, definition.defaults),
    };

    currentPage().components.push(component);
    state.selectedComponentId = component.id;
    saveAutosave("saved");
    renderAll();
  }

  function removeSelectedComponent() {
    if (!state.selectedComponentId) {
      return;
    }

    currentPage().components = currentPage().components.filter(function (component) {
      return component.id !== state.selectedComponentId;
    });
    state.selectedComponentId = null;
    saveAutosave("saved");
    renderAll();
  }

  function findSelectedComponent() {
    return currentPage().components.find(function (component) {
      return component.id === state.selectedComponentId;
    });
  }

  function updateStatus() {
    refs.statusViewport.textContent = "Viewport: " + state.viewport;
    refs.statusCount.textContent = "Components: " + currentPage().components.length;

    var selected = findSelectedComponent();
    refs.statusSelection.textContent = selected ? "Selection: " + selected.type : "Selection: none";
  }

  function renderAll() {
    renderPalette();
    renderCanvas();
    renderInspector();
  }

  function setViewport(value) {
    state.viewport = value;
    refs.canvasStage.className = "canvas-stage viewport-" + value;
    updateStatus();
  }

  function exportProjectFile() {
    downloadFile("mockapp-project.json", JSON.stringify(state.project, null, 2), "application/json");
  }

  function exportHtml() {
    var body = currentPage()
      .components.map(function (component) {
        return componentToHtml(component);
      })
      .join("\n");

    var html =
      "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>" +
      EXPORT_TITLE +
      "</title><style>" +
      exportStyles() +
      "</style></head><body><main class=\"container\">" +
      body +
      "</main></body></html>";

    downloadFile("mockapp-export.html", html, "text/html");
  }

  function componentToHtml(component) {
    var props = component.props || {};
    var attributes = [];
    if (props.id) {
      attributes.push('id="' + escapeAttribute(props.id) + '"');
    }
    if (props.className) {
      attributes.push('class="' + escapeAttribute(props.className) + '"');
    }
    if (props.width) {
      var safeWidth = sanitizeWidth(props.width);
      if (safeWidth) {
        attributes.push('style="width:' + escapeAttribute(safeWidth) + '"');
      }
    }

    switch (component.type) {
      case "button":
        return "<button type=\"button\" " + attributes.join(" ") + ">" + escapeHtml(props.text || "") + "</button>";
      case "input":
        attributes.push('type="text"');
        if (props.placeholder) {
          attributes.push('placeholder="' + escapeAttribute(props.placeholder) + '"');
        }
        if (props.text) {
          attributes.push('value="' + escapeAttribute(props.text) + '"');
        }
        return "<input " + attributes.join(" ") + " />";
      case "card":
        return "<div " + attributes.join(" ") + '><div class="card-body">' + escapeHtml(props.text || "") + "</div></div>";
      case "alert":
        return "<div " + attributes.join(" ") + ">" + escapeHtml(props.text || "") + "</div>";
      case "navbar":
        return "<nav " + attributes.join(" ") + '><span class="navbar-brand">' + escapeHtml(props.text || "") + "</span></nav>";
      case "text":
      default:
        return "<p " + attributes.join(" ") + ">" + escapeHtml(props.text || "") + "</p>";
    }
  }

  function exportStyles() {
    return [
      "body{margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#f8f9fa;}",
      ".container{max-width:1200px;margin:0 auto;background:#fff;padding:24px;}",
      ".btn{display:inline-block;padding:.375rem .75rem;border-radius:.375rem;border:1px solid transparent;}",
      ".btn-primary{background:#0d6efd;color:#fff;}",
      ".btn-secondary{background:#6c757d;color:#fff;}",
      ".btn-success{background:#198754;color:#fff;}",
      ".form-control{display:block;width:100%;padding:.375rem .75rem;border:1px solid #ced4da;border-radius:.375rem;}",
      ".card{border:1px solid rgba(0,0,0,.175);border-radius:.5rem;background:#fff;}",
      ".card-body{padding:1rem;}",
      ".alert{padding:1rem;border-radius:.5rem;}",
      ".alert-info{background:rgba(13,202,240,.15);color:#055160;}",
      ".alert-warning{background:rgba(255,193,7,.2);color:#664d03;}",
      ".alert-danger{background:rgba(220,53,69,.15);color:#842029;}",
      ".navbar{display:flex;align-items:center;min-height:56px;padding:.5rem 1rem;border-radius:.5rem;}",
      ".navbar-dark{color:#fff;}",
      ".bg-dark{background:#212529;}",
      ".navbar-brand{font-size:1.1rem;font-weight:600;}",
      ".display-text{margin:0;font-size:1.1rem;}",
    ].join("");
  }

  function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function openProjectFile(file) {
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        if (!validateProject(parsed)) {
          window.alert("Invalid project file.");
          return;
        }

        state.project = parsed;
        state.selectedComponentId = null;
        saveAutosave("loaded");
        renderAll();
      } catch (error) {
        window.alert("Unable to read project JSON.");
      }
    };
    reader.readAsText(file);
  }

  function bindEvents() {
    document.querySelector('[data-action="new-project"]').addEventListener("click", function () {
      state.project = createDefaultProject();
      state.selectedComponentId = null;
      saveAutosave("reset");
      renderAll();
    });

    document.querySelector('[data-action="save-project"]').addEventListener("click", exportProjectFile);
    document.querySelector('[data-action="open-project"]').addEventListener("click", function () {
      refs.fileInput.click();
    });
    document.querySelector('[data-action="export-html"]').addEventListener("click", exportHtml);

    refs.fileInput.addEventListener("change", function (event) {
      openProjectFile(event.target.files[0]);
      event.target.value = "";
    });

    refs.viewport.addEventListener("change", function (event) {
      setViewport(event.target.value);
    });

    refs.search.addEventListener("input", function (event) {
      state.paletteFilter = event.target.value.trim().toLowerCase();
      renderPalette();
    });

    refs.canvasSurface.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    refs.canvasSurface.addEventListener("drop", function (event) {
      event.preventDefault();
      var type = event.dataTransfer.getData("text/plain");
      addComponent(type);
    });

    document.addEventListener("keydown", function (event) {
      if ((event.key === "Delete" || event.key === "Backspace") && !isEditingField(event.target)) {
        removeSelectedComponent();
      }
    });
  }

  function isEditingField(target) {
    return target && /input|textarea|select/i.test(target.tagName);
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function sanitizeWidth(value) {
    var normalized = String(value || "").trim();
    if (!normalized) {
      return "";
    }

    if (/^(auto|fit-content|max-content|min-content|100%)$/.test(normalized)) {
      return normalized;
    }

    if (/^\d+(\.\d+)?(px|%|rem|em|vw|vh)$/.test(normalized)) {
      return normalized;
    }

    return "";
  }

  state.project = loadProject();
  bindEvents();
  setViewport(state.viewport);
  renderAll();
})();
