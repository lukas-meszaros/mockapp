(function (MockApp) {
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
    input.addEventListener("input", function () {
      onChange(input.value);
    });
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
    input.addEventListener("input", function () {
      onChange(Number(input.value));
    });
    wrapper.appendChild(input);
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

  MockApp.ui.inspector = {
    renderInspector: renderInspector
  };
})(window.MockApp);
