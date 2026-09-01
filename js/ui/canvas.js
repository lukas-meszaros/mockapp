(function (MockApp) {
  var projectData = MockApp.data.project;
  var registry = MockApp.components.registry;
  var exporters = MockApp.exporters.api;
  var utils = MockApp.utils;
  var SNAP_THRESHOLD = 8;
  var MIN_FRAME_WIDTH = 80;
  var MIN_FRAME_HEIGHT = 48;

  function renderCanvas(controller) {
    var refs = controller.refs;
    var page = projectData.getActivePage(controller.state.project);
    refs.pageTitle.textContent = page.name;
    refs.canvasRoot.innerHTML = "";
    refs.canvasRoot.classList.remove("is-dragover");
    bindRootDropSurface(controller, page);

    if (!page.root.children.length) {
      refs.canvasRoot.appendChild(renderEmptyState(controller));
      refs.canvasRoot.appendChild(createRootDropHint("Drop a component anywhere on the canvas to start a layout"));
      return;
    }

    page.root.children.forEach(function (component) {
      refs.canvasRoot.appendChild(renderNode(controller, component, page.root));
    });
    refs.canvasRoot.appendChild(createRootDropHint("Freeform canvas mode. Drag root items to reposition them."));
  }

  function renderEmptyState(controller) {
    var empty = document.createElement("div");
    empty.className = "canvas-empty";
    empty.innerHTML = "<strong>Your page is empty</strong>Add a Bootstrap component from the left panel or drop a template onto the canvas.";
    return empty;
  }

  function renderNode(controller, component, parentNode) {
    var wrapper = document.createElement("div");
    var isSelected = controller.state.selection.ids.indexOf(component.id) >= 0;
    var inlineEditTarget = getPrimaryInlineEditTarget(component);
    wrapper.className = "canvas-node" + (isSelected ? " is-selected" : "");
    var isRootChild = parentNode && parentNode.type === "page-root";
    if (isRootChild && component.frame) {
      wrapper.style.left = component.frame.x + "px";
      wrapper.style.top = component.frame.y + "px";
      wrapper.style.width = component.frame.width + "px";
      wrapper.style.height = component.frame.height + "px";
    }
    var frame = document.createElement("div");
    frame.className = "node-frame" + (isSelected ? " is-selected" : "");
    if (isRootChild) {
      frame.classList.add("is-freeform");
    }
    if (isRootChild && controller.state.selection.ids.indexOf(component.id) >= 0) {
      frame.classList.add("is-root-selected");
    }

    var preview = document.createElement("div");
    preview.className = "node-preview" + (component.meta.hidden ? " is-hidden" : "");
    preview.innerHTML = exporters.renderComponentHtml(previewComponent(component), controller.state.ui.preview, { isRootChild: false, hideLabels: true, preserveLineBreaks: true, inlineEditing: true });
    if (isRootChild && component.frame) {
      preview.style.minHeight = Math.max(42, component.frame.height) + "px";
    }
    preview.addEventListener("click", function (event) {
      event.stopPropagation();
      controller.actions.selectOnly(component.id);
    });
    preview.addEventListener("dblclick", function (event) {
      var target = event.target.closest("[data-inline-edit-field]");
      var editTarget = target ? getInlineEditTarget(component, target.dataset.inlineEditField) : inlineEditTarget;
      if (!editTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      controller.actions.beginInlineEdit(component.id, editTarget.fieldPath, editTarget.multiline);
    });

    frame.appendChild(preview);

    if (inlineEditTarget) {
      frame.appendChild(createInlineEditTrigger(controller, component, inlineEditTarget));
    }

    var inlineEdit = controller.state.ui.inlineEdit;
    if (inlineEdit && inlineEdit.componentId === component.id) {
      frame.classList.add("is-editing");
      frame.appendChild(createInlineEditor(controller, component, inlineEdit));
    }

    if (component.children && component.children.length) {
      var children = document.createElement("div");
      children.className = "node-children";
      children.appendChild(createDropZone(controller, component.id, "Drop into " + component.name));
      component.children.forEach(function (child) {
        children.appendChild(renderNode(controller, child, component));
      });
      frame.appendChild(children);
    } else if (registry.getDefinition(component.type).allowsChildren) {
      var childArea = document.createElement("div");
      childArea.className = "node-children";
      childArea.appendChild(createDropZone(controller, component.id, "Drop child into " + component.name));
      frame.appendChild(childArea);
    }

    frame.draggable = !isRootChild;
    if (!isRootChild) {
      frame.addEventListener("dragstart", function (event) {
        event.dataTransfer.setData("application/mockapp-component", component.id);
        event.dataTransfer.effectAllowed = "move";
      });
    } else {
      enableFreeformDrag(controller, wrapper, frame, component);
      attachResizeHandles(controller, wrapper, frame, preview, component);
    }
    frame.addEventListener("click", function () {
      controller.actions.selectOnly(component.id);
    });

    wrapper.appendChild(frame);
    return wrapper;
  }

  function createDropZone(controller, parentId, labelText) {
    var zone = document.createElement("div");
    zone.className = "drop-zone";
    zone.textContent = labelText;
    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
      zone.classList.add("is-active");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("is-active");
    });
    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("is-active");
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      if (paletteType) {
        controller.actions.addComponent(paletteType, parentId);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, parentId);
      }
    });
    return zone;
  }

  function bindRootDropSurface(controller, page) {
    var root = controller.refs.canvasRoot;
    if (root.dataset.dropBound === "true") {
      return;
    }

    root.dataset.dropBound = "true";
    root.addEventListener("dragover", function (event) {
      event.preventDefault();
      root.classList.add("is-dragover");
    });
    root.addEventListener("dragleave", function (event) {
      if (event.target === root) {
        root.classList.remove("is-dragover");
      }
    });
    root.addEventListener("drop", function (event) {
      event.preventDefault();
      root.classList.remove("is-dragover");
      var point = toCanvasPoint(controller, event.clientX, event.clientY);
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      if (paletteType) {
        controller.actions.addComponentAt(paletteType, point);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, null, point);
      }
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        controller.actions.selectOnly(null);
      }
    });
  }

  function createRootDropHint(text) {
    var hint = document.createElement("div");
    hint.className = "root-drop-hint";
    hint.textContent = text;
    return hint;
  }

  function previewComponent(component) {
    var copy = utils.deepClone(component);
    copy.children = [];
    return copy;
  }

  function getPrimaryInlineEditTarget(component) {
    return getInlineEditTarget(component, null);
  }

  function getInlineEditTarget(component, fieldPath) {
    switch (component.type) {
      case "content.heading":
        return inlineEditTarget("props.text", false);
      case "content.paragraph":
        return inlineEditTarget("props.text", true);
      case "action.button":
        return inlineEditTarget("props.text", false);
      case "form.input":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.textarea":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.select":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.checkbox":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "feedback.alert":
        return inlineEditTarget("props.text", true);
      case "content.badge":
        return inlineEditTarget("props.text", false);
      case "data.table":
        return inlineEditTarget("__table__", true, "table");
      case "content.card":
        if (fieldPath === "props.text") {
          return inlineEditTarget("props.text", true);
        }
        return inlineEditTarget(fieldPath === "props.title" ? "props.title" : "props.title", false);
      case "nav.navbar":
        return inlineEditTarget("props.brand", false);
      default:
        return null;
    }
  }

  function inlineEditTarget(fieldPath, multiline, kind) {
    return { fieldPath: fieldPath, multiline: !!multiline, kind: kind || "field" };
  }

  function createInlineEditTrigger(controller, component, editTarget) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "inline-edit-trigger";
    button.setAttribute("aria-label", editTarget.kind === "table" ? "Edit table" : "Edit text");
    button.innerHTML = '<i class="bi bi-pencil"></i>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      controller.actions.beginInlineEdit(component.id, editTarget.fieldPath, editTarget.multiline);
    });
    return button;
  }

  function createInlineEditor(controller, component, inlineEdit) {
    if (inlineEdit.kind === "table") {
      return createTableInlineEditor(controller, component, inlineEdit);
    }

    var editor = document.createElement("div");
    editor.className = "inline-editor" + (inlineEdit.multiline ? " is-multiline" : "");
    editor.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    editor.addEventListener("click", function (event) {
      event.stopPropagation();
    });
    var input = document.createElement(inlineEdit.multiline ? "textarea" : "input");
    input.className = "inline-editor-input" + (inlineEdit.multiline ? " is-multiline" : "");
    input.value = inlineEdit.value == null ? "" : String(inlineEdit.value);
    if (inlineEdit.multiline) {
      input.rows = Math.max(3, Math.min(8, String(input.value || "").split(/\r?\n/).length + 1));
    }

    input.addEventListener("input", function () {
      controller.actions.updateInlineEditValue(input.value);
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        controller.actions.cancelInlineEdit();
      } else if (!inlineEdit.multiline && event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        controller.actions.commitInlineEdit();
      } else if (inlineEdit.multiline && (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        event.stopPropagation();
        controller.actions.commitInlineEdit();
      }
    });
    input.addEventListener("blur", function () {
      controller.actions.commitInlineEdit();
    });

    editor.appendChild(input);
    window.requestAnimationFrame(function () {
      input.focus();
      input.select();
    });
    return editor;
  }

  function createTableInlineEditor(controller, component, inlineEdit) {
    var editor = document.createElement("div");
    editor.className = "inline-editor table-inline-editor";
    editor.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    editor.addEventListener("click", function (event) {
      event.stopPropagation();
    });
    editor.addEventListener("focusout", function (event) {
      if (!editor.contains(event.relatedTarget)) {
        controller.actions.commitInlineEdit();
      }
    });

    var model = inlineEdit.value || parseTableModel(component);

    var table = document.createElement("table");
    table.className = "table table-sm table-bordered table-inline-table align-middle";
    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");
    model.columns.forEach(function (column, columnIndex) {
      headRow.appendChild(createEditableTableCell(controller, "th", "table:" + component.id + ":column:" + columnIndex, column, function (value) {
        model.columns[columnIndex] = value;
        controller.actions.updateInlineEditValue(model);
      }));
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    model.rows.forEach(function (cells, rowIndex) {
      var row = document.createElement("tr");
      cells.forEach(function (cellValue, colIndex) {
        row.appendChild(createEditableTableCell(controller, "td", "table:" + component.id + ":cell:" + rowIndex + ":" + colIndex, cellValue, function (value) {
          model.rows[rowIndex][colIndex] = value;
          controller.actions.updateInlineEditValue(model);
        }));
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    editor.appendChild(table);

    window.requestAnimationFrame(function () {
      var firstCell = editor.querySelector("[contenteditable='true']");
      if (firstCell) {
        firstCell.focus();
      }
    });
    return editor;
  }

  function createEditableTableCell(controller, tagName, fieldKey, value, onChange) {
    var cell = document.createElement(tagName);
    cell.className = "table-inline-cell";
    cell.setAttribute("contenteditable", "true");
    cell.setAttribute("data-inspector-field", fieldKey);
    cell.textContent = value == null ? "" : String(value);
    cell.addEventListener("input", function () {
      onChange(cell.textContent);
    });
    cell.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        controller.actions.cancelInlineEdit();
      } else if (event.key === "Enter") {
        event.preventDefault();
      }
    });
    return cell;
  }

  function createDropZone(controller, parentId, labelText) {
    var zone = document.createElement("div");
    zone.className = "drop-zone";
    zone.textContent = labelText;
    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
      zone.classList.add("is-active");
    });
    zone.addEventListener("dragleave", function () {
      zone.classList.remove("is-active");
    });
    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("is-active");
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      if (paletteType) {
        controller.actions.addComponent(paletteType, parentId);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, parentId);
      }
    });
    return zone;
  }

  function bindRootDropSurface(controller, page) {
    var root = controller.refs.canvasRoot;
    if (root.dataset.dropBound === "true") {
      return;
    }

    root.dataset.dropBound = "true";
    root.addEventListener("dragover", function (event) {
      event.preventDefault();
      root.classList.add("is-dragover");
    });
    root.addEventListener("dragleave", function (event) {
      if (event.target === root) {
        root.classList.remove("is-dragover");
      }
    });
    root.addEventListener("drop", function (event) {
      event.preventDefault();
      root.classList.remove("is-dragover");
      var point = toCanvasPoint(controller, event.clientX, event.clientY);
      var paletteType = event.dataTransfer.getData("application/mockapp-palette");
      var componentId = event.dataTransfer.getData("application/mockapp-component");
      if (paletteType) {
        controller.actions.addComponentAt(paletteType, point);
      } else if (componentId) {
        controller.actions.moveComponent(componentId, null, point);
      }
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        controller.actions.selectOnly(null);
      }
    });
  }

  function createRootDropHint(text) {
    var hint = document.createElement("div");
    hint.className = "root-drop-hint";
    hint.textContent = text;
    return hint;
  }

  function previewComponent(component) {
    var copy = utils.deepClone(component);
    copy.children = [];
    return copy;
  }

  function getPrimaryInlineEditTarget(component) {
    return getInlineEditTarget(component, null);
  }

  function getInlineEditTarget(component, fieldPath) {
    switch (component.type) {
      case "content.heading":
        return inlineEditTarget("props.text", false);
      case "content.paragraph":
        return inlineEditTarget("props.text", true);
      case "action.button":
        return inlineEditTarget("props.text", false);
      case "form.input":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.textarea":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.select":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.checkbox":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "feedback.alert":
        return inlineEditTarget("props.text", true);
      case "content.badge":
        return inlineEditTarget("props.text", false);
      case "data.table":
        return inlineEditTarget("__table__", true, "table");
      case "content.card":
        if (fieldPath === "props.text") {
          return inlineEditTarget("props.text", true);
        }
        return inlineEditTarget(fieldPath === "props.title" ? "props.title" : "props.title", false);
      case "nav.navbar":
        return inlineEditTarget("props.brand", false);
      default:
        return null;
    }
  }

  function inlineEditTarget(fieldPath, multiline, kind) {
    return { fieldPath: fieldPath, multiline: !!multiline, kind: kind || "field" };
  }

  function parseTableModel(component) {
    var columns = splitCsvLine(utils.getByPath(component, "props.columnsText") || "");
    var rows = splitTableRows(utils.getByPath(component, "props.rowsText") || "");
    var maxColumns = Math.max(columns.length, rows.reduce(function (max, row) {
      return Math.max(max, row.length);
    }, 0), 1);

    while (columns.length < maxColumns) {
      columns.push("Column " + (columns.length + 1));
    }

    if (!rows.length) {
      rows = [columns.map(function () {
        return "";
      })];
    }

    rows = rows.map(function (row) {
      var copy = row.slice();
      while (copy.length < maxColumns) {
        copy.push("");
      }
      return copy;
    });

    return { columns: columns, rows: rows };
  }

  function splitCsvLine(text) {
    return String(text || "").split(",").map(function (entry) {
      return entry.trim();
    }).filter(Boolean);
  }

  function splitTableRows(text) {
    return String(text || "").split(/\r?\n/).map(function (line) {
      return line.split(",").map(function (entry) {
        return entry.trim();
      });
    }).filter(function (row) {
      return row.length && !(row.length === 1 && row[0] === "");
    });
  }

  function enableFreeformDrag(controller, wrapper, frame, component) {
    if (component.meta.locked) {
      return;
    }

    frame.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }

      if (isInteractiveTarget(event.target)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      controller.actions.selectOnly(component.id);
      frame.classList.add("is-dragging");

      var startPoint = toCanvasPoint(controller, event.clientX, event.clientY);
      var startFrame = utils.deepClone(component.frame);
      var guides = createGuides(controller.refs.canvasRoot);

      function onMove(moveEvent) {
        var point = toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY);
        var nextFrame = {
          x: startFrame.x + (point.x - startPoint.x),
          y: startFrame.y + (point.y - startPoint.y),
          width: startFrame.width,
          height: startFrame.height
        };
        nextFrame = applyCanvasSnap(controller, component.id, nextFrame, guides);
        wrapper.style.left = nextFrame.x + "px";
        wrapper.style.top = nextFrame.y + "px";
        wrapper.style.width = nextFrame.width + "px";
        wrapper.style.height = nextFrame.height + "px";
      }

      function onUp(upEvent) {
        frame.classList.remove("is-dragging");
        destroyGuides(guides);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        var point = toCanvasPoint(controller, upEvent.clientX, upEvent.clientY);
        var endFrame = {
          x: startFrame.x + (point.x - startPoint.x),
          y: startFrame.y + (point.y - startPoint.y),
          width: startFrame.width,
          height: startFrame.height
        };
        endFrame = applyCanvasSnap(controller, component.id, endFrame);
        controller.actions.setComponentFrame(component.id, endFrame);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function isInteractiveTarget(target) {
    return !!(target && target.closest("button, input, textarea, select, option, a, label, .resize-handle, .inline-edit-trigger, .inline-editor"));
  }

  function attachResizeHandles(controller, wrapper, frame, preview, component) {
    ["nw", "ne", "sw", "se"].forEach(function (direction) {
      var handle = document.createElement("button");
      handle.type = "button";
      handle.className = "resize-handle resize-handle-" + direction;
      handle.setAttribute("aria-label", "Resize " + direction);
      handle.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        event.stopPropagation();
        controller.actions.selectOnly(component.id);
        frame.classList.add("is-resizing");

        var startPoint = toCanvasPoint(controller, event.clientX, event.clientY);
        var startFrame = utils.deepClone(component.frame);

        function onMove(moveEvent) {
          var point = toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY);
          var nextFrame = resizeFromDirection(startFrame, direction, point.x - startPoint.x, point.y - startPoint.y);
          nextFrame = snapFrameToGrid(controller, nextFrame);
          nextFrame = snapFrameToNearbyEdges(controller, component.id, nextFrame, direction);
          applyLiveFrame(wrapper, preview, nextFrame);
        }

        function onUp(upEvent) {
          frame.classList.remove("is-resizing");
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          var point = toCanvasPoint(controller, upEvent.clientX, upEvent.clientY);
          var nextFrame = resizeFromDirection(startFrame, direction, point.x - startPoint.x, point.y - startPoint.y);
          nextFrame = snapFrameToGrid(controller, nextFrame);
          nextFrame = snapFrameToNearbyEdges(controller, component.id, nextFrame, direction);
          controller.actions.setComponentFrame(component.id, nextFrame);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
      frame.appendChild(handle);
    });
  }

  function resizeFromDirection(startFrame, direction, deltaX, deltaY) {
    var nextFrame = {
      x: startFrame.x,
      y: startFrame.y,
      width: startFrame.width,
      height: startFrame.height
    };

    if (direction.indexOf("e") >= 0) {
      nextFrame.width = Math.max(MIN_FRAME_WIDTH, startFrame.width + deltaX);
    }
    if (direction.indexOf("s") >= 0) {
      nextFrame.height = Math.max(MIN_FRAME_HEIGHT, startFrame.height + deltaY);
    }
    if (direction.indexOf("w") >= 0) {
      nextFrame.x = startFrame.x + deltaX;
      nextFrame.width = Math.max(MIN_FRAME_WIDTH, startFrame.width - deltaX);
      nextFrame.x = startFrame.x + (startFrame.width - nextFrame.width);
    }
    if (direction.indexOf("n") >= 0) {
      nextFrame.y = startFrame.y + deltaY;
      nextFrame.height = Math.max(MIN_FRAME_HEIGHT, startFrame.height - deltaY);
      nextFrame.y = startFrame.y + (startFrame.height - nextFrame.height);
    }

    nextFrame.x = Math.max(0, nextFrame.x);
    nextFrame.y = Math.max(0, nextFrame.y);
    return nextFrame;
  }

  function snapFrameToGrid(controller, frame) {
    var nextFrame = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    if (!controller.state.project.settings.grid.snap) {
      return nextFrame;
    }
    var grid = controller.state.project.settings.grid.size;
    nextFrame.x = Math.round(nextFrame.x / grid) * grid;
    nextFrame.y = Math.round(nextFrame.y / grid) * grid;
    nextFrame.width = Math.max(MIN_FRAME_WIDTH, Math.round(nextFrame.width / grid) * grid);
    nextFrame.height = Math.max(MIN_FRAME_HEIGHT, Math.round(nextFrame.height / grid) * grid);
    return nextFrame;
  }

  function snapFrameToNearbyEdges(controller, componentId, frame, direction) {
    var page = projectData.getActivePage(controller.state.project);
    var snapped = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    var siblings = (page.root.children || []).filter(function (entry) {
      return entry.id !== componentId && entry.frame;
    });

    if (!siblings.length) {
      return snapped;
    }

    if (direction.indexOf("w") >= 0 || direction.indexOf("e") >= 0) {
      var horizontalEdge = direction.indexOf("w") >= 0 ? snapped.x : snapped.x + snapped.width;
      var bestHorizontal = findClosestEdge(horizontalEdge, siblings, true);
      if (bestHorizontal) {
        if (direction.indexOf("w") >= 0) {
          var maxLeft = frame.x + frame.width - MIN_FRAME_WIDTH;
          snapped.x = Math.max(0, Math.min(Math.round(bestHorizontal.target), maxLeft));
          snapped.width = Math.max(MIN_FRAME_WIDTH, Math.round((frame.x + frame.width) - snapped.x));
        } else {
          snapped.width = Math.max(MIN_FRAME_WIDTH, Math.round(bestHorizontal.target - snapped.x));
        }
      }
    }

    if (direction.indexOf("n") >= 0 || direction.indexOf("s") >= 0) {
      var verticalEdge = direction.indexOf("n") >= 0 ? snapped.y : snapped.y + snapped.height;
      var bestVertical = findClosestEdge(verticalEdge, siblings, false);
      if (bestVertical) {
        if (direction.indexOf("n") >= 0) {
          var maxTop = frame.y + frame.height - MIN_FRAME_HEIGHT;
          snapped.y = Math.max(0, Math.min(Math.round(bestVertical.target), maxTop));
          snapped.height = Math.max(MIN_FRAME_HEIGHT, Math.round((frame.y + frame.height) - snapped.y));
        } else {
          snapped.height = Math.max(MIN_FRAME_HEIGHT, Math.round(bestVertical.target - snapped.y));
        }
      }
    }

    return snapped;
  }

  function findClosestEdge(sourceValue, siblings, horizontal) {
    var bestMatch = null;
    siblings.forEach(function (sibling) {
      var frame = sibling.frame;
      var targets = horizontal ? [frame.x, frame.x + frame.width / 2, frame.x + frame.width] : [frame.y, frame.y + frame.height / 2, frame.y + frame.height];
      targets.forEach(function (target) {
        var delta = Math.abs(target - sourceValue);
        if (delta <= SNAP_THRESHOLD && (!bestMatch || delta < bestMatch.delta)) {
          bestMatch = { delta: delta, target: target, sibling: sibling };
        }
      });
    });
    return bestMatch;
  }

  function applyLiveFrame(wrapper, preview, frame) {
    wrapper.style.left = frame.x + "px";
    wrapper.style.top = frame.y + "px";
    wrapper.style.width = frame.width + "px";
    wrapper.style.height = frame.height + "px";
    preview.style.minHeight = Math.max(42, frame.height) + "px";
  }

  function toCanvasPoint(controller, clientX, clientY) {
    var rect = controller.refs.canvasRoot.getBoundingClientRect();
    var zoom = controller.state.ui.zoom || 1;
    return {
      x: Math.max(0, Math.round((clientX - rect.left) / zoom)),
      y: Math.max(0, Math.round((clientY - rect.top) / zoom))
    };
  }

  function applyCanvasSnap(controller, componentId, frame, guides) {
    var page = projectData.getActivePage(controller.state.project);
    var snapped = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    var bestVertical = null;
    var bestHorizontal = null;
    var siblings = (page.root.children || []).filter(function (entry) {
      return entry.id !== componentId && entry.frame;
    });
    var snapEnabled = controller.state.project.settings.grid.snap;
    var grid = controller.state.project.settings.grid.size;

    if (snapEnabled) {
      snapped.x = Math.round(snapped.x / grid) * grid;
      snapped.y = Math.round(snapped.y / grid) * grid;
    }

    siblings.forEach(function (sibling) {
      [sibling.frame.x, sibling.frame.x + sibling.frame.width / 2, sibling.frame.x + sibling.frame.width].forEach(function (targetX) {
        [snapped.x, snapped.x + snapped.width / 2, snapped.x + snapped.width].forEach(function (sourceX, index) {
          var deltaX = Math.abs(targetX - sourceX);
          if (deltaX <= SNAP_THRESHOLD && (!bestVertical || deltaX < bestVertical.delta)) {
            bestVertical = { delta: deltaX, target: targetX, sourceIndex: index, sibling: sibling };
          }
        });
      });

      [sibling.frame.y, sibling.frame.y + sibling.frame.height / 2, sibling.frame.y + sibling.frame.height].forEach(function (targetY) {
        [snapped.y, snapped.y + snapped.height / 2, snapped.y + snapped.height].forEach(function (sourceY, index) {
          var deltaY = Math.abs(targetY - sourceY);
          if (deltaY <= SNAP_THRESHOLD && (!bestHorizontal || deltaY < bestHorizontal.delta)) {
            bestHorizontal = { delta: deltaY, target: targetY, sourceIndex: index, sibling: sibling };
          }
        });
      });
    });

    if (bestVertical) {
      if (bestVertical.sourceIndex === 0) {
        snapped.x = Math.round(bestVertical.target);
      } else if (bestVertical.sourceIndex === 1) {
        snapped.x = Math.round(bestVertical.target - snapped.width / 2);
      } else {
        snapped.x = Math.round(bestVertical.target - snapped.width);
      }
    }

    if (bestHorizontal) {
      if (bestHorizontal.sourceIndex === 0) {
        snapped.y = Math.round(bestHorizontal.target);
      } else if (bestHorizontal.sourceIndex === 1) {
        snapped.y = Math.round(bestHorizontal.target - snapped.height / 2);
      } else {
        snapped.y = Math.round(bestHorizontal.target - snapped.height);
      }
    }

    if (guides) {
      showGuides(guides, bestVertical, bestHorizontal, page, snapped);
    }

    return snapped;
  }

  function createGuides(root) {
    var vertical = document.createElement("div");
    vertical.className = "alignment-guide is-vertical";
    vertical.hidden = true;
    var horizontal = document.createElement("div");
    horizontal.className = "alignment-guide is-horizontal";
    horizontal.hidden = true;
    root.appendChild(vertical);
    root.appendChild(horizontal);
    return { vertical: vertical, horizontal: horizontal };
  }

  function showGuides(guides, verticalMatch, horizontalMatch, page, frame) {
    if (verticalMatch) {
      guides.vertical.hidden = false;
      guides.vertical.style.left = Math.round(verticalMatch.target) + "px";
      guides.vertical.style.top = Math.min(frame.y, verticalMatch.sibling.frame.y) + "px";
      guides.vertical.style.height = Math.abs((frame.y + frame.height) - verticalMatch.sibling.frame.y) + verticalMatch.sibling.frame.height + "px";
    } else {
      guides.vertical.hidden = true;
    }

    if (horizontalMatch) {
      guides.horizontal.hidden = false;
      guides.horizontal.style.top = Math.round(horizontalMatch.target) + "px";
      guides.horizontal.style.left = Math.min(frame.x, horizontalMatch.sibling.frame.x) + "px";
      guides.horizontal.style.width = Math.abs((frame.x + frame.width) - horizontalMatch.sibling.frame.x) + horizontalMatch.sibling.frame.width + "px";
    } else {
      guides.horizontal.hidden = true;
    }
  }

  function destroyGuides(guides) {
    if (!guides) {
      return;
    }
    guides.vertical.remove();
    guides.horizontal.remove();
  }

  MockApp.ui.canvas = {
    renderCanvas: renderCanvas
  };
})(window.MockApp);
