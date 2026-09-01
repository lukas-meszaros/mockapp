(function (MockApp) {
  var shell = MockApp.ui.shell;
  var registry = MockApp.components.registry;
  var projectData = MockApp.data.project;
  var utils = MockApp.utils;

  function renderInspector(controller) {
    var refs = controller.refs;
    refs.inspectorRoot.innerHTML = "";

    if (controller.state.selection.ids.length !== 1) {
      renderPageInspector(controller);
      return;
    }

    var page = projectData.getActivePage(controller.state.project);
    var context = projectData.findComponentContext(page, controller.state.selection.ids[0]);
    if (!context) {
      renderPageInspector(controller);
      return;
    }

    var component = context.node;
    var schema = registry.getFieldSchema(component.type);

    if (context.parent && context.parent.type === "page-root") {
      refs.inspectorRoot.appendChild(renderFrameSection(controller, component));
    }
    refs.inspectorRoot.appendChild(renderFieldGrid(controller, component, schema));
    refs.inspectorRoot.appendChild(renderComponentActions(controller, component));
  }

  function renderFrameSection(controller, component) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var title = document.createElement("h3");
    title.className = "inspector-title";
    title.textContent = "Canvas Frame";
    section.appendChild(title);

    var grid = document.createElement("div");
    grid.className = "inline-selects";
    grid.appendChild(renderNumberField("X", component.frame.x, 0, 5000, function (value) {
      controller.actions.setComponentFrame(component.id, {
        x: value,
        y: component.frame.y,
        width: component.frame.width,
        height: component.frame.height
      });
    }));
    grid.appendChild(renderNumberField("Y", component.frame.y, 0, 5000, function (value) {
      controller.actions.setComponentFrame(component.id, {
        x: component.frame.x,
        y: value,
        width: component.frame.width,
        height: component.frame.height
      });
    }));
    grid.appendChild(renderNumberField("Width", component.frame.width, 80, 5000, function (value) {
      controller.actions.setComponentFrame(component.id, {
        x: component.frame.x,
        y: component.frame.y,
        width: value,
        height: component.frame.height
      });
    }));
    grid.appendChild(renderNumberField("Height", component.frame.height, 48, 5000, function (value) {
      controller.actions.setComponentFrame(component.id, {
        x: component.frame.x,
        y: component.frame.y,
        width: component.frame.width,
        height: value
      });
    }));
    section.appendChild(grid);
    return section;
  }

  function renderPageInspector(controller) {
    var refs = controller.refs;
    var page = projectData.getActivePage(controller.state.project);

    refs.inspectorRoot.appendChild(sectionHeading("Page", page.name));
    refs.inspectorRoot.appendChild(renderPageFields(controller, page));
    refs.inspectorRoot.appendChild(renderProjectSettings(controller));
  }

  function renderPageFields(controller, page) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var grid = document.createElement("div");
    grid.className = "property-grid";

    grid.appendChild(renderPageField(controller, "Project Name", controller.state.project.metadata.name, function (value) {
      controller.actions.updateProjectName(value);
    }));
    grid.appendChild(renderPageField(controller, "Page Name", page.name, function (value) {
      controller.actions.renameActivePage(value);
    }));
    grid.appendChild(renderPageSelect(controller, "Viewport", page.viewportPreset, Object.keys(MockApp.app.constants.VIEWPORTS), function (value) {
      controller.actions.setViewportPreset(value);
    }));

    section.appendChild(grid);
    return section;
  }

  function renderProjectSettings(controller) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var title = document.createElement("h3");
    title.className = "inspector-title";
    title.textContent = "Canvas Settings";
    section.appendChild(title);

    var grid = document.createElement("div");
    grid.className = "property-grid";
    grid.appendChild(renderCheckboxField("Show grid", controller.state.project.settings.grid.visible, function (checked) {
      controller.actions.setGridVisible(checked);
    }));
    grid.appendChild(renderCheckboxField("Snap enabled", controller.state.project.settings.grid.snap, function (checked) {
      controller.actions.setSnapEnabled(checked);
    }));
    grid.appendChild(renderNumberField("Grid size", controller.state.project.settings.grid.size, 4, 32, function (value) {
      controller.actions.setGridSize(value);
    }));
    section.appendChild(grid);
    return section;
  }

  function renderFieldGrid(controller, component, schema) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var grid = document.createElement("div");
    grid.className = "property-grid";
    schema.forEach(function (field) {
      grid.appendChild(renderField(controller, component, field));
    });
    section.appendChild(grid);
    return section;
  }

  function renderComponentActions(controller, component) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var title = document.createElement("h3");
    title.className = "inspector-title";
    title.textContent = "Actions";
    section.appendChild(title);

    var actions = document.createElement("div");
    actions.className = "inline-selects";
    actions.appendChild(actionButton("Duplicate", "copy", function () {
      controller.actions.duplicateSelected();
    }));
    actions.appendChild(actionButton("Delete", "trash", function () {
      controller.actions.removeSelected();
    }));

    if (component.type === "data.table") {
      actions.appendChild(actionButton("Design Table", "table", function () {
        openTableDesignerModal(controller, component);
      }));
    }

    if (component.type === "nav.navbar") {
      actions.appendChild(actionButton("Design Toolbar", "sliders", function () {
        openToolbarDesignerModal(controller, component);
      }));
    }

    section.appendChild(actions);
    return section;
  }

  function renderField(controller, component, field) {
    if (field.type === "checkbox") {
      return renderCheckboxField(field.label, !!utils.getByPath(component, field.path), function (checked) {
        controller.actions.updateComponentField(component.id, field.path, checked);
      });
    }

    if (field.type === "select") {
      return renderSelectField(field.label, utils.getByPath(component, field.path), field.options, function (value) {
        controller.actions.updateComponentField(component.id, field.path, value);
      });
    }

    if (field.type === "number") {
      return renderNumberField(field.label, utils.getByPath(component, field.path), field.min, field.max, function (value) {
        controller.actions.updateComponentField(component.id, field.path, value);
      });
    }

    if (field.type === "list") {
      return renderListField(field, utils.getByPath(component, field.path), function (value) {
        controller.actions.updateComponentField(component.id, field.path, value);
      });
    }

    return renderTextField(field.label, utils.getByPath(component, field.path), field.type === "textarea", function (value) {
      controller.actions.updateComponentField(component.id, field.path, value);
    });
  }

  function sectionHeading(titleText, meta) {
    var section = document.createElement("section");
    section.className = "inspector-section";
    var heading = document.createElement("div");
    heading.className = "inspector-empty";
    heading.innerHTML = '<strong>' + utils.escapeHtml(titleText) + '</strong><div class="muted">' + utils.escapeHtml(meta || "") + '</div>';
    section.appendChild(heading);
    return section;
  }

  function renderTextField(labelText, value, isTextarea, onChange) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-field";
    var label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);
    var input = document.createElement(isTextarea ? "textarea" : "input");
    input.className = isTextarea ? "inspector-textarea" : "inspector-input";
    input.setAttribute("data-inspector-field", labelText);
    input.value = value == null ? "" : value;
    input.addEventListener("change", function () {
      onChange(input.value);
    });
    if (!isTextarea) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          onChange(input.value);
        }
      });
    }
    wrapper.appendChild(input);
    return wrapper;
  }

  function renderSelectField(labelText, value, options, onChange) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-field";
    var label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);
    var select = document.createElement("select");
    select.className = "inspector-select";
    select.setAttribute("data-inspector-field", labelText);
    options.forEach(function (optionValue) {
      var option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue === "auto" ? "Auto" : optionValue;
      option.selected = String(optionValue) === String(value);
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      onChange(select.value);
    });
    wrapper.appendChild(select);
    return wrapper;
  }

  function renderCheckboxField(labelText, value, onChange) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-field property-field-boolean";
    var row = document.createElement("label");
    row.className = "boolean-row";
    var input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("data-inspector-field", labelText);
    input.checked = !!value;
    input.addEventListener("change", function () {
      onChange(input.checked);
    });
    row.appendChild(input);
    row.appendChild(document.createTextNode(labelText));
    wrapper.appendChild(row);
    return wrapper;
  }

  function renderNumberField(labelText, value, min, max, onChange) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-field";
    var label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);
    var input = document.createElement("input");
    input.type = "number";
    input.className = "inspector-input number-input";
    input.setAttribute("data-inspector-field", labelText);
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.addEventListener("change", function () {
      onChange(Number(input.value));
    });
    wrapper.appendChild(input);
    return wrapper;
  }

  function splitListValue(value, separator) {
    var raw = value == null ? "" : String(value);
    if (separator === ",") {
      return raw.split(",").map(function (item) {
        return item.trim();
      }).filter(Boolean);
    }

    return raw.split(/\r?\n/).map(function (item) {
      return item.trim();
    }).filter(Boolean);
  }

  function joinListValue(items, separator) {
    var compact = (items || []).map(function (item) {
      return String(item || "").trim();
    }).filter(Boolean);

    if (separator === ",") {
      return compact.join(", ");
    }

    return compact.join("\n");
  }

  function renderListField(field, value, onChange) {
    var wrapper = document.createElement("div");
    wrapper.className = "property-field";
    var label = document.createElement("label");
    label.textContent = field.label;
    wrapper.appendChild(label);

    var separator = field.separator || "\n";
    var placeholder = field.itemPlaceholder || "Value";
    var items = splitListValue(value, separator);
    if (!items.length) {
      items = [""];
    }

    var editor = document.createElement("div");
    editor.className = "list-editor";
    var rows = document.createElement("div");
    rows.className = "list-editor-rows";
    editor.appendChild(rows);

    var help = document.createElement("div");
    help.className = "list-editor-help";
    help.textContent = separator === "," ? "Items are saved as comma-separated values." : "One item per line.";
    editor.appendChild(help);

    var toolbar = document.createElement("div");
    toolbar.className = "list-editor-toolbar";
    var addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "tool-button";
    addButton.innerHTML = '<i class="bi bi-plus"></i>Add item';
    toolbar.appendChild(addButton);
    editor.appendChild(toolbar);

    function commit() {
      onChange(joinListValue(items, separator));
    }

    function renderRows() {
      rows.innerHTML = "";
      items.forEach(function (item, index) {
        var row = document.createElement("div");
        row.className = "list-editor-row";
        var input = document.createElement("input");
        input.type = "text";
        input.className = "inspector-input list-editor-input";
        input.placeholder = placeholder;
        input.setAttribute("data-inspector-field", field.label + " " + String(index + 1));
        input.value = item;
        input.addEventListener("change", function () {
          items[index] = input.value;
          commit();
        });
        row.appendChild(input);

        var removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "tool-button list-editor-remove";
        removeButton.setAttribute("aria-label", "Remove item");
        removeButton.innerHTML = '<i class="bi bi-dash"></i>';
        removeButton.addEventListener("click", function () {
          items.splice(index, 1);
          if (!items.length) {
            items.push("");
          }
          renderRows();
          commit();
        });
        row.appendChild(removeButton);
        rows.appendChild(row);
      });
    }

    addButton.addEventListener("click", function () {
      items.push("");
      renderRows();
    });

    renderRows();
    wrapper.appendChild(editor);
    return wrapper;
  }

  function renderPageField(controller, labelText, value, onChange) {
    return renderTextField(labelText, value, false, onChange);
  }

  function renderPageSelect(controller, labelText, value, options, onChange) {
    return renderSelectField(labelText, value, options, onChange);
  }

  function actionButton(labelText, icon, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "tool-button";
    button.innerHTML = '<i class="bi bi-' + icon + '"></i>' + labelText;
    button.addEventListener("click", onClick);
    return button;
  }

  function openTableDesignerModal(controller, component) {
    var model = parseTableModel(component);
    var columns = model.columns.slice();
    var rows = model.rows.map(function (row) {
      return row.join(", ");
    });

    shell.showDialog(controller.refs, {
      title: "Table Designer",
      confirmLabel: "Apply",
      onCancel: function () {},
      renderBody: function (body) {
        body.appendChild(designerHelp("Define table columns and row values. Use comma-separated values inside each row."));
        body.appendChild(createStringListEditor("Columns", "Column", columns));
        body.appendChild(createStringListEditor("Rows", "Value 1, Value 2", rows));
      },
      onConfirm: function (body) {
        var groups = body.querySelectorAll("[data-list-group]");
        var nextColumns = readListGroupValues(groups[0]);
        var nextRows = readListGroupValues(groups[1]);

        if (!nextColumns.length) {
          shell.showToast(controller.refs, "Table requires at least one column.", true);
          return false;
        }

        if (!nextRows.length) {
          nextRows = [nextColumns.map(function () {
            return "";
          }).join(", ")];
        }

        controller.actions.updateComponentData(component.id, function (node) {
          node.props.columnsText = nextColumns.join(", ");
          node.props.rowsText = nextRows.join("\n");
        }, "Table updated");
      }
    });
  }

  function openToolbarDesignerModal(controller, component) {
    var brand = String(component.props.brand || "");
    var links = splitListValue(component.props.linksText || "", "\n");

    shell.showDialog(controller.refs, {
      title: "Toolbar Designer",
      confirmLabel: "Apply",
      onCancel: function () {},
      renderBody: function (body) {
        body.appendChild(designerHelp("Configure brand text and toolbar links for the navigation component."));
        body.appendChild(createDesignerField("Brand", brand, "Brand name"));
        body.appendChild(createStringListEditor("Links", "Navigation item", links));
      },
      onConfirm: function (body) {
        var brandInput = body.querySelector("[data-designer-brand]");
        var linksGroup = body.querySelector("[data-list-group]");
        var nextLinks = readListGroupValues(linksGroup);

        controller.actions.updateComponentData(component.id, function (node) {
          node.props.brand = String((brandInput && brandInput.value) || "").trim() || "MockApp";
          node.props.linksText = nextLinks.join("\n");
        }, "Toolbar updated");
      }
    });
  }

  function parseTableModel(component) {
    var columns = splitListValue(utils.getByPath(component, "props.columnsText") || "", ",");
    var rows = splitListValue(utils.getByPath(component, "props.rowsText") || "", "\n");
    if (!columns.length) {
      columns = ["Column 1"];
    }
    return { columns: columns, rows: rows };
  }

  function designerHelp(text) {
    var note = document.createElement("div");
    note.className = "designer-help";
    note.textContent = text;
    return note;
  }

  function createDesignerField(labelText, value, placeholder) {
    var wrapper = document.createElement("div");
    wrapper.className = "designer-field";
    var label = document.createElement("label");
    label.textContent = labelText;
    wrapper.appendChild(label);
    var input = document.createElement("input");
    input.type = "text";
    input.className = "inspector-input";
    input.setAttribute("data-designer-brand", "true");
    input.placeholder = placeholder || "";
    input.value = value == null ? "" : String(value);
    wrapper.appendChild(input);
    return wrapper;
  }

  function createStringListEditor(labelText, itemPlaceholder, initialItems) {
    var section = document.createElement("section");
    section.className = "designer-list";
    section.setAttribute("data-list-group", "true");

    var heading = document.createElement("h4");
    heading.className = "designer-list-title";
    heading.textContent = labelText;
    section.appendChild(heading);

    var rows = document.createElement("div");
    rows.className = "designer-list-rows";
    section.appendChild(rows);

    var addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "tool-button";
    addButton.innerHTML = '<i class="bi bi-plus"></i>Add';
    section.appendChild(addButton);

    var items = (initialItems || []).slice();
    if (!items.length) {
      items = [""];
    }

    function renderRows() {
      rows.innerHTML = "";
      items.forEach(function (item, index) {
        var row = document.createElement("div");
        row.className = "designer-list-row";

        var input = document.createElement("input");
        input.type = "text";
        input.className = "inspector-input";
        input.placeholder = itemPlaceholder;
        input.value = item;
        input.addEventListener("input", function () {
          items[index] = input.value;
        });
        row.appendChild(input);

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "tool-button designer-list-remove";
        remove.setAttribute("aria-label", "Remove item");
        remove.innerHTML = '<i class="bi bi-dash"></i>';
        remove.addEventListener("click", function () {
          items.splice(index, 1);
          if (!items.length) {
            items.push("");
          }
          renderRows();
        });
        row.appendChild(remove);

        rows.appendChild(row);
      });
    }

    addButton.addEventListener("click", function () {
      items.push("");
      renderRows();
    });

    renderRows();
    return section;
  }

  function readListGroupValues(group) {
    if (!group) {
      return [];
    }
    return Array.prototype.slice.call(group.querySelectorAll("input")).map(function (input) {
      return String(input.value || "").trim();
    }).filter(Boolean);
  }

  MockApp.ui.inspector = {
    renderInspector: renderInspector
  };
})(window.MockApp);
