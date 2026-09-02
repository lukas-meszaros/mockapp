(function (MockApp) {
  var projectData = MockApp.data.project;
  var registry = MockApp.components.registry;
  var exporters = MockApp.exporters.api;
  var inspectorUi = MockApp.ui.inspector;
  var utils = MockApp.utils;
  var SNAP_THRESHOLD = 8;
  var MIN_FRAME_WIDTH = 80;
  var MIN_FRAME_HEIGHT = 48;
  var MIN_LINE_FRAME_SIZE = 16;
  var GHOST_DRAG_THRESHOLD = 20;

  function usesContentSelectionChrome(component) {
    switch (component.type) {
      case "form.input":
      case "form.textarea":
      case "form.select":
      case "form.checkbox":
      case "form.radio":
      case "form.switch":
        return true;
      default:
        return false;
    }
  }

  function renderCanvas(controller) {
    var refs = controller.refs;
    var page = projectData.getActivePage(controller.state.project);
    refs.pageTitle.textContent = page.name;
    if (refs.viewportRuler) {
      refs.viewportRuler.textContent = page.previewSurfaceTitle || "Responsive Bootstrap preview surface";
    }
    refs.canvasRoot.innerHTML = "";
    refs.canvasRoot.classList.remove("is-dragover");

    if (controller.state.ui.preview) {
      renderLivePreview(controller, page);
      return;
    }

    bindRootDropSurface(controller, page);
    bindMarqueeSelection(controller, page);

    if (!page.root.children.length) {
      refs.canvasRoot.appendChild(renderEmptyState(controller));
      refs.canvasRoot.appendChild(createRootDropHint("Drop a component anywhere on the canvas to start a layout"));
      return;
    }

    page.root.children.forEach(function (component, rootLayerIndex) {
      refs.canvasRoot.appendChild(renderNode(controller, component, page.root, rootLayerIndex));
    });
    refs.canvasRoot.appendChild(createRootDropHint("Freeform canvas mode. Drag root items to reposition them."));
  }

  function renderLivePreview(controller, page) {
    var preview = document.createElement("div");
    preview.className = "canvas-live-preview";
    preview.innerHTML = (page.root.children || []).map(function (component, rootLayerIndex) {
      var html = exporters.renderComponentHtml(component, true, {
        isRootChild: false,
        hideLabels: true,
        preserveLineBreaks: true,
        inlineEditing: false
      });
      return '<div class="canvas-live-item" data-component-id="' + component.id + '" style="' + liveFrameStyle(component.frame, rootLayerIndex) + '">' + html + '</div>';
    }).join("\n");

    controller.refs.canvasRoot.appendChild(preview);
    initializePreviewBootstrapWidgets(preview);
  }

  function initializePreviewBootstrapWidgets(root) {
    if (!window.bootstrap || !root) {
      return;
    }

    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (node) {
      try {
        new window.bootstrap.Tooltip(node);
      } catch (error) {
        // Ignore invalid tooltip initialization in preview.
      }
    });

    root.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (node) {
      try {
        new window.bootstrap.Popover(node);
      } catch (error) {
        // Ignore invalid popover initialization in preview.
      }
    });
  }

  function liveFrameStyle(frame, rootLayerIndex) {
    if (!frame) {
      return "";
    }

    return [
      "left:" + frame.x + "px",
      "top:" + frame.y + "px",
      "width:" + frame.width + "px",
      "min-height:" + frame.height + "px",
      "z-index:" + String((rootLayerIndex || 0) + 1)
    ].join(";");
  }

  function renderEmptyState(controller) {
    var empty = document.createElement("div");
    empty.className = "canvas-empty";
    empty.innerHTML = "<strong>Your page is empty</strong>Add a Bootstrap component from the left panel or drop a template onto the canvas.";
    return empty;
  }

  function renderNode(controller, component, parentNode, rootLayerIndex) {
    var wrapper = document.createElement("div");
    var isSelected = controller.state.selection.ids.indexOf(component.id) >= 0;
    var inlineEditTarget = getPrimaryInlineEditTarget(component);
    wrapper.className = "canvas-node" + (isSelected ? " is-selected" : "");
    wrapper.dataset.componentId = component.id;
    var isRootChild = parentNode && parentNode.type === "page-root";
    if (isRootChild && component.frame) {
      wrapper.style.left = component.frame.x + "px";
      wrapper.style.top = component.frame.y + "px";
      wrapper.style.width = component.frame.width + "px";
      wrapper.style.height = component.frame.height + "px";
      wrapper.style.zIndex = String((rootLayerIndex || 0) + 1);
      applyWrapperRotation(wrapper, component);
    }
    var frame = document.createElement("div");
    frame.className = "node-frame" + (isSelected ? " is-selected" : "");
    if (component.type === "drawing.line") {
      frame.classList.add("line-frame");
    }
    if (usesContentSelectionChrome(component)) {
      frame.classList.add("selection-follows-control");
    }
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
      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        controller.actions.toggleSelection(component.id);
      } else {
        controller.actions.selectOnly(component.id);
      }
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
    frame.appendChild(createCodeEditTrigger(controller, component));

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
        children.appendChild(renderNode(controller, child, component, null));
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
      enableFreeformDrag(controller, wrapper, frame, preview, component);
      if (component.type === "drawing.line") {
        attachLineEndpointHandles(controller, wrapper, frame, preview, component);
      } else {
        attachResizeHandles(controller, wrapper, frame, preview, component);
      }
    }
    frame.addEventListener("click", function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        controller.actions.toggleSelection(component.id);
      } else {
        controller.actions.selectOnly(component.id);
      }
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
      if (root.dataset.skipClearClick === "true") {
        root.dataset.skipClearClick = "false";
        return;
      }
      if (event.target === root) {
        controller.actions.selectOnly(null);
      }
    });
  }

  function bindMarqueeSelection(controller, page) {
    var root = controller.refs.canvasRoot;
    if (root.dataset.marqueeBound === "true") {
      return;
    }

    root.dataset.marqueeBound = "true";
    root.addEventListener("pointerdown", function (event) {
      if (beginPendingLinePlacement(controller, root, event)) {
        return;
      }

      if (controller.state.ui.preview || event.button !== 0 || event.target !== root) {
        return;
      }

      var startPoint = toCanvasPoint(controller, event.clientX, event.clientY);
      var box = document.createElement("div");
      box.className = "selection-marquee";
      root.appendChild(box);

      function updateBox(point) {
        var x = Math.min(startPoint.x, point.x);
        var y = Math.min(startPoint.y, point.y);
        var width = Math.abs(point.x - startPoint.x);
        var height = Math.abs(point.y - startPoint.y);
        box.style.left = x + "px";
        box.style.top = y + "px";
        box.style.width = width + "px";
        box.style.height = height + "px";
      }

      function onMove(moveEvent) {
        updateBox(toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY));
      }

      function onUp(upEvent) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        var endPoint = toCanvasPoint(controller, upEvent.clientX, upEvent.clientY);
        var rect = {
          left: Math.min(startPoint.x, endPoint.x),
          top: Math.min(startPoint.y, endPoint.y),
          right: Math.max(startPoint.x, endPoint.x),
          bottom: Math.max(startPoint.y, endPoint.y)
        };

        var selectedIds = (page.root.children || []).filter(function (component) {
          return component.frame && intersects(component.frame, rect);
        }).map(function (component) {
          return component.id;
        });

        box.remove();
        root.dataset.skipClearClick = "true";
        if (selectedIds.length) {
          controller.actions.setSelection(selectedIds, upEvent.metaKey || upEvent.ctrlKey || upEvent.shiftKey);
        } else if (!(upEvent.metaKey || upEvent.ctrlKey || upEvent.shiftKey)) {
          controller.actions.selectOnly(null);
        }
      }

      updateBox(startPoint);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function intersects(frame, rect) {
    var left = frame.x;
    var top = frame.y;
    var right = frame.x + frame.width;
    var bottom = frame.y + frame.height;
    return !(right < rect.left || left > rect.right || bottom < rect.top || top > rect.bottom);
  }

  function beginPendingLinePlacement(controller, root, event) {
    var pending = controller.state.ui.pendingCanvasInsert;
    if (!pending || pending.type !== "drawing.line" || controller.state.ui.preview || event.button !== 0 || event.target !== root) {
      return false;
    }

    event.preventDefault();
    root.dataset.skipClearClick = "true";
    var startPoint = toCanvasPoint(controller, event.clientX, event.clientY);
    var preview = createLinePlacementPreview();
    root.appendChild(preview);

    function updatePreview(point) {
      var geometry = lineGeometryFromPoints(startPoint, point);
      preview.style.left = geometry.frame.x + "px";
      preview.style.top = geometry.frame.y + "px";
      preview.style.width = geometry.frame.width + "px";
      preview.style.height = geometry.frame.height + "px";
      var line = preview.querySelector("line");
      line.setAttribute("x1", String(geometry.startX));
      line.setAttribute("y1", String(geometry.startY));
      line.setAttribute("x2", String(geometry.endX));
      line.setAttribute("y2", String(geometry.endY));
    }

    function onMove(moveEvent) {
      updatePreview(toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY));
    }

    function onUp(upEvent) {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      preview.remove();
      controller.actions.addLineFromGeometry(lineGeometryFromPoints(startPoint, toCanvasPoint(controller, upEvent.clientX, upEvent.clientY)));
    }

    updatePreview(startPoint);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return true;
  }

  function createLinePlacementPreview() {
    var preview = document.createElement("div");
    preview.className = "line-placement-preview";
    preview.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100" height="100"><line x1="0" y1="0" x2="100" y2="100" stroke="#334155" stroke-width="1" stroke-linecap="round" /></svg>';
    return preview;
  }

  function lineGeometryFromPoints(startPoint, endPoint) {
    var rawWidth = Math.abs(endPoint.x - startPoint.x);
    var rawHeight = Math.abs(endPoint.y - startPoint.y);
    var minX = Math.min(startPoint.x, endPoint.x);
    var minY = Math.min(startPoint.y, endPoint.y);
    var width = Math.max(MIN_LINE_FRAME_SIZE, rawWidth);
    var height = Math.max(MIN_LINE_FRAME_SIZE, rawHeight);
    var frameX = rawWidth < MIN_LINE_FRAME_SIZE ? minX - (MIN_LINE_FRAME_SIZE - rawWidth) / 2 : minX;
    var frameY = rawHeight < MIN_LINE_FRAME_SIZE ? minY - (MIN_LINE_FRAME_SIZE - rawHeight) / 2 : minY;
    var startX = ((startPoint.x - frameX) / width) * 100;
    var startY = ((startPoint.y - frameY) / height) * 100;
    var endX = ((endPoint.x - frameX) / width) * 100;
    var endY = ((endPoint.y - frameY) / height) * 100;

    return {
      frame: {
        x: Math.max(0, frameX),
        y: Math.max(0, frameY),
        width: width,
        height: height
      },
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      props: {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY
      }
    };
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
      case "content.label":
        return inlineEditTarget("props.text", false);
      case "action.button":
        return inlineEditTarget("props.text", false);
      case "form.input":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.textarea":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.select":
        return inlineEditTarget(fieldPath || "props.label", false);
      case "form.checkbox":
      case "form.radio":
      case "form.switch":
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

  function createCodeEditTrigger(controller, component) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "inline-edit-trigger code-edit-trigger";
    button.setAttribute("aria-label", "Edit HTML/CSS");
    button.innerHTML = '<i class="bi bi-code-slash"></i>';
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      controller.actions.selectOnly(component.id);
      if (inspectorUi && typeof inspectorUi.openComponentCodeEditor === "function") {
        inspectorUi.openComponentCodeEditor(controller, component.id);
      }
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

  function enableFreeformDrag(controller, wrapper, frame, preview, component) {
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
      var isSelected = controller.state.selection.ids.indexOf(component.id) >= 0;
      if (!isSelected) {
        controller.actions.selectOnly(component.id);
      }

      var dragTargets = resolveDragTargets(controller, component.id, wrapper, preview, component.frame);
      if (!dragTargets.length) {
        return;
      }

      frame.classList.add("is-dragging");

      var startPoint = toCanvasPoint(controller, event.clientX, event.clientY);
      var anchorTarget = findDragTarget(dragTargets, component.id) || dragTargets[0];
      var startFrame = utils.deepClone(anchorTarget.startFrame);
      var dragTargetIds = dragTargets.map(function (entry) {
        return entry.id;
      });
      var useGhostDrag = dragTargets.length > GHOST_DRAG_THRESHOLD;
      var ghostSession = useGhostDrag ? createGroupDragGhosts(controller.refs.canvasRoot, dragTargets) : null;
      if (useGhostDrag) {
        dragTargets.forEach(function (entry) {
          entry.wrapper.classList.add("is-ghost-drag-source");
        });
      }
      var guides = createGuides(controller.refs.canvasRoot);
      var frameScheduler = createFrameScheduler(function (moveState) {
        if (ghostSession) {
          applyGroupDragGhostFrames(ghostSession, moveState.framesById);
          return;
        }
        dragTargets.forEach(function (entry) {
          var nextFrame = moveState.framesById[entry.id];
          if (nextFrame) {
            applyLiveFrame(entry.wrapper, entry.preview, nextFrame);
          }
        });
      });

      function onMove(moveEvent) {
        var point = toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY);
        var anchorFrame = {
          x: startFrame.x + (point.x - startPoint.x),
          y: startFrame.y + (point.y - startPoint.y),
          width: startFrame.width,
          height: startFrame.height
        };
        anchorFrame = applyCanvasSnap(controller, dragTargetIds, anchorFrame, guides, moveEvent.altKey);
        frameScheduler.schedule(buildGroupMoveState(dragTargets, startFrame, anchorFrame));
      }

      function onUp(upEvent) {
        frame.classList.remove("is-dragging");
        if (useGhostDrag) {
          dragTargets.forEach(function (entry) {
            entry.wrapper.classList.remove("is-ghost-drag-source");
          });
        }
        destroyGuides(guides);
        destroyGroupDragGhosts(ghostSession);
        frameScheduler.flush();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        var point = toCanvasPoint(controller, upEvent.clientX, upEvent.clientY);
        var anchorEndFrame = {
          x: startFrame.x + (point.x - startPoint.x),
          y: startFrame.y + (point.y - startPoint.y),
          width: startFrame.width,
          height: startFrame.height
        };
        anchorEndFrame = applyCanvasSnap(controller, dragTargetIds, anchorEndFrame, null, upEvent.altKey);

        var finalState = buildGroupMoveState(dragTargets, startFrame, anchorEndFrame);
        if (dragTargets.length === 1) {
          controller.actions.setComponentFrame(component.id, finalState.framesById[component.id]);
          return;
        }
        controller.actions.setComponentFrames(finalState.framesById);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function resolveDragTargets(controller, draggedId, draggedWrapper, draggedPreview, draggedFrame) {
    var page = projectData.getActivePage(controller.state.project);
    var selectedMap = Object.create(null);
    (controller.state.selection.ids || []).forEach(function (id) {
      selectedMap[id] = true;
    });

    var targets = (page.root.children || []).filter(function (entry) {
      return !!selectedMap[entry.id] && entry.frame && !entry.meta.locked;
    }).map(function (entry) {
      return createDragTarget(controller, entry.id, entry.frame, draggedId, draggedWrapper, draggedPreview);
    }).filter(Boolean);

    if (!targets.length) {
      if (!draggedFrame) {
        return [];
      }
      return [createDragTarget(controller, draggedId, draggedFrame, draggedId, draggedWrapper, draggedPreview)].filter(Boolean);
    }

    return targets;
  }

  function createDragTarget(controller, componentId, componentFrame, draggedId, draggedWrapper, draggedPreview) {
    var wrapper = null;
    var preview = null;
    if (componentId === draggedId) {
      wrapper = draggedWrapper;
      preview = draggedPreview;
    } else {
      wrapper = controller.refs.canvasRoot.querySelector('.canvas-node[data-component-id="' + componentId + '"]');
      preview = wrapper ? wrapper.querySelector(".node-preview") : null;
    }

    if (!wrapper || !preview) {
      return null;
    }

    return {
      id: componentId,
      wrapper: wrapper,
      preview: preview,
      startFrame: utils.deepClone(componentFrame)
    };
  }

  function findDragTarget(dragTargets, componentId) {
    for (var i = 0; i < dragTargets.length; i += 1) {
      if (dragTargets[i].id === componentId) {
        return dragTargets[i];
      }
    }
    return null;
  }

  function buildGroupMoveState(dragTargets, anchorStartFrame, anchorNextFrame) {
    var deltaX = anchorNextFrame.x - anchorStartFrame.x;
    var deltaY = anchorNextFrame.y - anchorStartFrame.y;
    var framesById = Object.create(null);

    dragTargets.forEach(function (entry) {
      framesById[entry.id] = {
        x: entry.startFrame.x + deltaX,
        y: entry.startFrame.y + deltaY,
        width: entry.startFrame.width,
        height: entry.startFrame.height
      };
    });

    return {
      framesById: framesById
    };
  }

  function createGroupDragGhosts(root, dragTargets) {
    if (!root || !dragTargets.length) {
      return null;
    }

    var layer = document.createElement("div");
    layer.className = "drag-ghost-layer";
    var ghostsById = Object.create(null);

    dragTargets.forEach(function (entry) {
      var ghost = document.createElement("div");
      ghost.className = "drag-ghost-item";
      ghost.style.left = entry.startFrame.x + "px";
      ghost.style.top = entry.startFrame.y + "px";
      ghost.style.width = entry.startFrame.width + "px";
      ghost.style.height = entry.startFrame.height + "px";
      layer.appendChild(ghost);
      ghostsById[entry.id] = ghost;
    });

    root.appendChild(layer);
    return {
      layer: layer,
      ghostsById: ghostsById
    };
  }

  function applyGroupDragGhostFrames(session, framesById) {
    if (!session || !framesById) {
      return;
    }

    Object.keys(framesById).forEach(function (componentId) {
      var frame = framesById[componentId];
      var ghost = session.ghostsById[componentId];
      if (!frame || !ghost) {
        return;
      }
      ghost.style.left = frame.x + "px";
      ghost.style.top = frame.y + "px";
      ghost.style.width = frame.width + "px";
      ghost.style.height = frame.height + "px";
    });
  }

  function destroyGroupDragGhosts(session) {
    if (!session || !session.layer) {
      return;
    }
    session.layer.remove();
  }

  function isInteractiveTarget(target) {
    return !!(target && target.closest("button, input, textarea, select, option, a, label, .resize-handle, .line-point-handle, .inline-edit-trigger, .inline-editor"));
  }

  function attachLineEndpointHandles(controller, wrapper, frame, preview, component) {
    var startHandle = createLinePointHandle("start");
    var endHandle = createLinePointHandle("end");
    frame.appendChild(startHandle);
    frame.appendChild(endHandle);
    updateLinePointHandlePositions(startHandle, endHandle, component.props);

    bindLinePointHandle(controller, wrapper, frame, preview, component, startHandle, endHandle, "start");
    bindLinePointHandle(controller, wrapper, frame, preview, component, startHandle, endHandle, "end");
  }

  function createLinePointHandle(role) {
    var handle = document.createElement("button");
    handle.type = "button";
    handle.className = "line-point-handle line-point-handle-" + role;
    handle.setAttribute("aria-label", role === "start" ? "Move line start" : "Move line end");
    return handle;
  }

  function bindLinePointHandle(controller, wrapper, frame, preview, component, startHandle, endHandle, role) {
    var handle = role === "start" ? startHandle : endHandle;
    handle.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      event.stopPropagation();
      frame.classList.add("is-resizing");
      var initial = lineEndpointsToCanvas(component.frame, component.props);
      var scheduler = createFrameScheduler(function (nextState) {
        applyLiveFrame(wrapper, preview, nextState.frame);
        applyLiveLineProps(preview, nextState.frame, nextState.props);
        updateLinePointHandlePositions(startHandle, endHandle, nextState.props);
      });

      function onMove(moveEvent) {
        scheduler.schedule(nextLineStateFromPointer(controller, initial, role, moveEvent.clientX, moveEvent.clientY));
      }

      function onUp(upEvent) {
        frame.classList.remove("is-resizing");
        scheduler.flush();
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        var finalState = nextLineStateFromPointer(controller, initial, role, upEvent.clientX, upEvent.clientY);
        controller.actions.updateComponentData(component.id, function (node) {
          node.frame = finalState.frame;
          node.props.startX = finalState.props.startX;
          node.props.startY = finalState.props.startY;
          node.props.endX = finalState.props.endX;
          node.props.endY = finalState.props.endY;
        }, "Line updated");
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function linePropsSnapshot(props) {
    return {
      startX: clampPercentValue(props.startX, 6),
      startY: clampPercentValue(props.startY, 50),
      endX: clampPercentValue(props.endX, 94),
      endY: clampPercentValue(props.endY, 50)
    };
  }

  function lineEndpointsToCanvas(frame, props) {
    return {
      start: {
        x: frame.x + (frame.width * clampPercentValue(props.startX, 6) / 100),
        y: frame.y + (frame.height * clampPercentValue(props.startY, 50) / 100)
      },
      end: {
        x: frame.x + (frame.width * clampPercentValue(props.endX, 94) / 100),
        y: frame.y + (frame.height * clampPercentValue(props.endY, 50) / 100)
      }
    };
  }

  function nextLineStateFromPointer(controller, endpoints, role, clientX, clientY) {
    var point = toCanvasPoint(controller, clientX, clientY);
    var start = role === "start" ? point : endpoints.start;
    var end = role === "end" ? point : endpoints.end;
    var geometry = lineGeometryFromPoints(start, end);
    return {
      frame: geometry.frame,
      props: geometry.props
    };
  }

  function applyLiveLineProps(preview, frame, props) {
    var svg = preview && preview.querySelector("svg");
    var line = preview && preview.querySelector("line");
    if (!svg || !line || !frame) {
      return;
    }
    var width = Math.max(1, Math.round(frame.width));
    var height = Math.max(1, Math.round(frame.height));
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    line.setAttribute("x1", String(percentToViewport(clampPercentValue(props.startX, 6), width)));
    line.setAttribute("y1", String(percentToViewport(clampPercentValue(props.startY, 50), height)));
    line.setAttribute("x2", String(percentToViewport(clampPercentValue(props.endX, 94), width)));
    line.setAttribute("y2", String(percentToViewport(clampPercentValue(props.endY, 50), height)));
  }

  function updateLinePointHandlePositions(startHandle, endHandle, props) {
    positionLinePointHandle(startHandle, clampPercentValue(props.startX, 6), clampPercentValue(props.startY, 50));
    positionLinePointHandle(endHandle, clampPercentValue(props.endX, 94), clampPercentValue(props.endY, 50));
  }

  function positionLinePointHandle(handle, percentX, percentY) {
    handle.style.left = "calc(" + percentX + "% - 6px)";
    handle.style.top = "calc(" + percentY + "% - 6px)";
  }

  function clampPercentValue(value, fallback) {
    var next = Number(value);
    if (!Number.isFinite(next)) {
      next = fallback;
    }
    return Math.max(0, Math.min(100, next));
  }

  function percentToViewport(percent, size) {
    return (Math.max(0, Math.min(100, percent)) / 100) * Math.max(1, Number(size) || 1);
  }

  function linePointToPercent(offset, size) {
    var denominator = Math.max(1, Number(size) || 1);
    return Math.max(0, Math.min(100, Math.round((offset / denominator) * 100)));
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
        var frameScheduler = createFrameScheduler(function (nextFrame) {
          applyLiveFrame(wrapper, preview, nextFrame);
        });

        function onMove(moveEvent) {
          var point = toCanvasPoint(controller, moveEvent.clientX, moveEvent.clientY);
          var nextFrame = resizeFromDirection(startFrame, direction, point.x - startPoint.x, point.y - startPoint.y, shouldLockSides(component));
          nextFrame = snapFrameToGrid(controller, nextFrame, moveEvent.altKey);
          nextFrame = snapFrameToNearbyEdges(controller, component.id, nextFrame, direction, moveEvent.altKey);
          frameScheduler.schedule(nextFrame);
        }

        function onUp(upEvent) {
          frame.classList.remove("is-resizing");
          frameScheduler.flush();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
          var point = toCanvasPoint(controller, upEvent.clientX, upEvent.clientY);
          var nextFrame = resizeFromDirection(startFrame, direction, point.x - startPoint.x, point.y - startPoint.y, shouldLockSides(component));
          nextFrame = snapFrameToGrid(controller, nextFrame, upEvent.altKey);
          nextFrame = snapFrameToNearbyEdges(controller, component.id, nextFrame, direction, upEvent.altKey);
          controller.actions.setComponentFrame(component.id, nextFrame);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });
      frame.appendChild(handle);
    });
  }

  function resizeFromDirectionWithLock(startFrame, direction, deltaX, deltaY, lockSides) {
    var nextFrame = {
      x: startFrame.x,
      y: startFrame.y,
      width: startFrame.width,
      height: startFrame.height
    };

    if (lockSides) {
      return proportionalResize(startFrame, direction, deltaX, deltaY);
    }

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

  function resizeFromDirection(startFrame, direction, deltaX, deltaY, lockSides) {
    return resizeFromDirectionWithLock(startFrame, direction, deltaX, deltaY, !!lockSides);
  }

  function proportionalResize(startFrame, direction, deltaX, deltaY) {
    var startWidth = Math.max(MIN_FRAME_WIDTH, startFrame.width);
    var startHeight = Math.max(MIN_FRAME_HEIGHT, startFrame.height);
    var ratio = startWidth / startHeight;
    var widthDelta = direction.indexOf("w") >= 0 ? -deltaX : deltaX;
    var heightDelta = direction.indexOf("n") >= 0 ? -deltaY : deltaY;
    var useWidth = Math.abs(widthDelta / startWidth) >= Math.abs(heightDelta / startHeight);

    var nextWidth = startWidth;
    var nextHeight = startHeight;
    if (useWidth) {
      nextWidth = Math.max(MIN_FRAME_WIDTH, startWidth + widthDelta);
      nextHeight = Math.max(MIN_FRAME_HEIGHT, Math.round(nextWidth / ratio));
      nextWidth = Math.max(MIN_FRAME_WIDTH, Math.round(nextHeight * ratio));
    } else {
      nextHeight = Math.max(MIN_FRAME_HEIGHT, startHeight + heightDelta);
      nextWidth = Math.max(MIN_FRAME_WIDTH, Math.round(nextHeight * ratio));
      nextHeight = Math.max(MIN_FRAME_HEIGHT, Math.round(nextWidth / ratio));
    }

    var nextX = startFrame.x;
    var nextY = startFrame.y;
    if (direction.indexOf("w") >= 0) {
      nextX = startFrame.x + (startWidth - nextWidth);
    }
    if (direction.indexOf("n") >= 0) {
      nextY = startFrame.y + (startHeight - nextHeight);
    }

    return {
      x: Math.max(0, Math.round(nextX)),
      y: Math.max(0, Math.round(nextY)),
      width: Math.max(MIN_FRAME_WIDTH, Math.round(nextWidth)),
      height: Math.max(MIN_FRAME_HEIGHT, Math.round(nextHeight))
    };
  }

  function shouldLockSides(component) {
    if (!component || !component.props) {
      return false;
    }
    var value = component.props.lockSides;
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return value === true;
  }

  function applyWrapperRotation(wrapper, component) {
    if (!wrapper || !isDrawingComponent(component)) {
      return;
    }
    var rotation = Number(component.props && component.props.rotation);
    if (!Number.isFinite(rotation) || rotation === 0) {
      wrapper.style.transform = "";
      wrapper.style.transformOrigin = "";
      return;
    }
    wrapper.style.transform = "rotate(" + rotation + "deg)";
    wrapper.style.transformOrigin = "50% 50%";
  }

  function isDrawingComponent(component) {
    return !!(component && typeof component.type === "string" && component.type.indexOf("drawing.") === 0);
  }

  function snapFrameToGrid(controller, frame, disableSnap) {
    var nextFrame = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    if (!controller.state.project.settings.grid.snap || disableSnap) {
      return nextFrame;
    }
    var grid = controller.state.project.settings.grid.size;
    nextFrame.x = Math.round(nextFrame.x / grid) * grid;
    nextFrame.y = Math.round(nextFrame.y / grid) * grid;
    nextFrame.width = Math.max(MIN_FRAME_WIDTH, Math.round(nextFrame.width / grid) * grid);
    nextFrame.height = Math.max(MIN_FRAME_HEIGHT, Math.round(nextFrame.height / grid) * grid);
    return nextFrame;
  }

  function snapFrameToNearbyEdges(controller, componentId, frame, direction, disableSnap) {
    var page = projectData.getActivePage(controller.state.project);
    var snapped = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    if (disableSnap) {
      return snapped;
    }

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

  function applyCanvasSnap(controller, componentId, frame, guides, disableSnap) {
    var page = projectData.getActivePage(controller.state.project);
    var snapped = {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height
    };
    var bestVertical = null;
    var bestHorizontal = null;
    var excludedIds = Array.isArray(componentId) ? componentId : [componentId];
    var excludedMap = Object.create(null);
    excludedIds.forEach(function (id) {
      if (id) {
        excludedMap[id] = true;
      }
    });
    var siblings = (page.root.children || []).filter(function (entry) {
      return !excludedMap[entry.id] && entry.frame;
    });
    var snapEnabled = controller.state.project.settings.grid.snap && !disableSnap;
    var grid = controller.state.project.settings.grid.size;

    if (snapEnabled) {
      snapped.x = Math.round(snapped.x / grid) * grid;
      snapped.y = Math.round(snapped.y / grid) * grid;
    }

    if (!disableSnap) {
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
    }

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

  function createFrameScheduler(onApply) {
    var rafId = 0;
    var pending = null;

    function apply() {
      rafId = 0;
      if (!pending) {
        return;
      }
      onApply(pending);
      pending = null;
    }

    return {
      schedule: function (frame) {
        pending = frame;
        if (rafId) {
          return;
        }
        rafId = window.requestAnimationFrame(apply);
      },
      flush: function () {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        if (pending) {
          onApply(pending);
          pending = null;
        }
      }
    };
  }

  MockApp.ui.canvas = {
    renderCanvas: renderCanvas,
    __test: {
      lineGeometryFromPoints: lineGeometryFromPoints,
      lineEndpointsToCanvas: lineEndpointsToCanvas
    }
  };
})(window.MockApp);
