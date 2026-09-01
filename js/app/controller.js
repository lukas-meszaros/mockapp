(function (MockApp) {
  var shell = MockApp.ui.shell;
  var sidebar = MockApp.ui.sidebar;
  var canvas = MockApp.ui.canvas;
  var inspector = MockApp.ui.inspector;
  var projectData = MockApp.data.project;
  var historyManager = MockApp.history.manager;
  var persistence = MockApp.persistence.store;
  var exporters = MockApp.exporters.api;
  var utils = MockApp.utils;

  function createController(refs) {
    var autosaved = persistence.loadAutosave();
    var project = autosaved ? projectData.normalizeProject(autosaved) : projectData.createProject();
    var activePage = projectData.getActivePage(project);
    var preferences = persistence.loadPreferences();

    var controller = {
      refs: refs,
      state: {
        project: project,
        history: historyManager.createHistory(project),
        selection: { ids: [] },
        clipboard: null,
        fileHandle: null,
        ui: {
          activeTab: "palette",
          paletteFilter: "",
          preview: false,
          inlineEdit: null,
          zoom: preferences.zoom || 1,
          viewportPreset: activePage.viewportPreset || "desktop",
          saveStatus: autosaved ? "recovered" : "ready",
          panelWidths: {
            left: preferences.panelWidths && preferences.panelWidths.left || 300,
            right: preferences.panelWidths && preferences.panelWidths.right || 340
          }
        }
      },
      actions: {}
    };

    bindActions(controller);
    return controller;
  }

  function bindActions(controller) {
    controller.actions.render = function () {
      var inspectorFocus = captureInspectorFocus(controller);
      var activePage = projectData.getActivePage(controller.state.project);
      controller.state.ui.viewportPreset = activePage.viewportPreset;
      controller.refs.leftPanel.style.width = controller.state.ui.panelWidths.left + "px";
      controller.refs.rightPanel.style.width = controller.state.ui.panelWidths.right + "px";
      shell.setActiveTab(controller.refs, controller.state.ui.activeTab);
      shell.setViewportClass(
        controller.refs,
        controller.state.ui.viewportPreset,
        controller.state.ui.zoom,
        controller.state.project.settings.grid.visible,
        controller.state.project.settings.grid.size
      );
      controller.refs.viewportSelect.value = controller.state.ui.viewportPreset;
      sidebar.renderPalette(controller);
      sidebar.renderPages(controller);
      sidebar.renderLayers(controller);
      canvas.renderCanvas(controller);
      inspector.renderInspector(controller);
      restoreInspectorFocus(controller, inspectorFocus);
      shell.updateStatus(controller.refs, controller.state, countComponents(activePage.root), selectionLabel(controller));
      persistence.savePreferences({ zoom: controller.state.ui.zoom, panelWidths: controller.state.ui.panelWidths });
    };

    controller.actions.selectOnly = function (componentId) {
      controller.state.selection.ids = componentId ? [componentId] : [];
      controller.actions.render();
    };

    controller.actions.addComponent = function (type, parentId) {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var component = projectData.createComponent(type);
        projectData.insertComponent(page, parentId, component);
        controller.state.selection.ids = [component.id];
      }, "Component added");
    };

    controller.actions.addComponentAt = function (type, placement) {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var component = projectData.createComponent(type);
        projectData.insertComponent(page, null, component, null, placement);
        controller.state.selection.ids = [component.id];
      }, "Component added");
    };

    controller.actions.moveComponent = function (componentId, targetParentId, placement) {
      if (!componentId) {
        return;
      }
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var moved = projectData.moveComponent(page, componentId, targetParentId, placement);
        if (!moved) {
          throw new Error("That component cannot be dropped there.");
        }
        controller.state.selection.ids = [componentId];
      }, "Component moved");
    };

    controller.actions.setComponentFrame = function (componentId, frame) {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var updated = projectData.updateComponentFrame(page, componentId, frame);
        if (!updated) {
          throw new Error("Unable to position component.");
        }
        controller.state.selection.ids = [componentId];
      }, "Component positioned", true);
    };

    controller.actions.updateComponentField = function (componentId, path, value) {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        projectData.updateComponent(page, componentId, function (component) {
          utils.setByPath(component, path, value);
        });
        controller.state.selection.ids = [componentId];
      }, "Component updated", true);
    };

    controller.actions.updateComponentData = function (componentId, updater, successLabel) {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        projectData.updateComponent(page, componentId, function (component) {
          updater(component);
        });
        controller.state.selection.ids = [componentId];
      }, successLabel || "Component updated", true);
    };

    controller.actions.removeSelected = function () {
      if (!controller.state.selection.ids.length) {
        return;
      }
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        controller.state.selection.ids.slice().forEach(function (componentId) {
          projectData.removeComponent(page, componentId);
        });
        controller.state.selection.ids = [];
      }, "Component removed");
    };

    controller.actions.duplicateSelected = function () {
      if (controller.state.selection.ids.length !== 1) {
        return;
      }
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var context = projectData.findComponentContext(page, controller.state.selection.ids[0]);
        if (!context || !context.parent) {
          return;
        }
        var duplicate = projectData.cloneComponentTree(context.node);
        if (context.parent.type === "page-root" && duplicate.frame) {
          duplicate.frame.x += 24;
          duplicate.frame.y += 24;
        }
        context.parent.children.splice(context.index + 1, 0, duplicate);
        controller.state.selection.ids = [duplicate.id];
      }, "Component duplicated");
    };

    controller.actions.copySelection = function () {
      if (controller.state.selection.ids.length !== 1) {
        return;
      }
      var page = projectData.getActivePage(controller.state.project);
      var context = projectData.findComponentContext(page, controller.state.selection.ids[0]);
      if (!context) {
        return;
      }
      controller.state.clipboard = projectData.cloneComponentTree(context.node);
      shell.showToast(controller.refs, "Component copied", false);
    };

    controller.actions.pasteSelection = function () {
      if (!controller.state.clipboard) {
        shell.showToast(controller.refs, "Clipboard is empty", true);
        return;
      }
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var pasted = projectData.cloneComponentTree(controller.state.clipboard);
        var selectedId = controller.state.selection.ids[0] || null;
        projectData.insertComponent(page, selectedId, pasted);
        controller.state.selection.ids = [pasted.id];
      }, "Component pasted");
    };

    controller.actions.undo = function () {
      var next = historyManager.undo(controller.state.history);
      if (!next) {
        return;
      }
      controller.state.project = next;
      reconcileSelection(controller);
      controller.state.ui.saveStatus = "reverted";
      controller.actions.render();
    };

    controller.actions.redo = function () {
      var next = historyManager.redo(controller.state.history);
      if (!next) {
        return;
      }
      controller.state.project = next;
      reconcileSelection(controller);
      controller.state.ui.saveStatus = "restored";
      controller.actions.render();
    };

    controller.actions.setActivePage = function (pageId) {
      controller.state.project.activePageId = pageId;
      controller.state.selection.ids = [];
      controller.actions.render();
    };

    controller.actions.addPage = function () {
      commitProjectChange(controller, function (project) {
        var page = projectData.createPage("Page " + (project.pages.length + 1));
        project.pages.push(page);
        project.activePageId = page.id;
        controller.state.selection.ids = [];
      }, "Page added");
    };

    controller.actions.duplicatePage = function () {
      commitProjectChange(controller, function (project) {
        var page = projectData.getActivePage(project);
        var duplicate = utils.deepClone(page);
        duplicate.id = utils.uid("page");
        duplicate.name = page.name + " Copy";
        project.pages.push(duplicate);
        project.activePageId = duplicate.id;
        controller.state.selection.ids = [];
      }, "Page duplicated");
    };

    controller.actions.deletePage = function () {
      if (controller.state.project.pages.length === 1) {
        shell.showToast(controller.refs, "A project must keep at least one page", true);
        return;
      }
      commitProjectChange(controller, function (project) {
        project.pages = project.pages.filter(function (page) {
          return page.id !== project.activePageId;
        });
        project.activePageId = project.pages[0].id;
        controller.state.selection.ids = [];
      }, "Page deleted");
    };

    controller.actions.renameActivePage = function (name) {
      commitProjectChange(controller, function (project) {
        projectData.getActivePage(project).name = name || "Untitled Page";
      }, "Page renamed", true);
    };

    controller.actions.updateProjectName = function (name) {
      commitProjectChange(controller, function (project) {
        project.metadata.name = name || "MockApp Project";
      }, "Project renamed", true);
    };

    controller.actions.setViewportPreset = function (preset) {
      commitProjectChange(controller, function (project) {
        projectData.getActivePage(project).viewportPreset = preset;
      }, "Viewport changed", true);
    };

    controller.actions.setZoom = function (value) {
      controller.state.ui.zoom = Math.max(0.6, Math.min(1.6, value));
      controller.actions.render();
    };

    controller.actions.togglePreview = function () {
      controller.state.ui.preview = !controller.state.ui.preview;
      controller.refs.body.classList.toggle("preview-mode", controller.state.ui.preview);
      controller.actions.render();
    };

    controller.actions.showAbout = function () {
      shell.showDialog(controller.refs, {
        title: "About MockApp",
        message: "MockApp is an offline Bootstrap mockup editor built to run from file:// with local assets.",
        confirmLabel: "Close"
      });
    };

    controller.actions.setGridVisible = function (visible) {
      commitProjectChange(controller, function (project) {
        project.settings.grid.visible = visible;
      }, "Grid updated", true);
    };

    controller.actions.setSnapEnabled = function (enabled) {
      commitProjectChange(controller, function (project) {
        project.settings.grid.snap = enabled;
      }, "Snap updated", true);
    };

    controller.actions.setGridSize = function (size) {
      commitProjectChange(controller, function (project) {
        project.settings.grid.size = Math.max(4, Math.min(32, Number(size) || 8));
      }, "Grid size updated", true);
    };

    controller.actions.newProject = function () {
      shell.showDialog(controller.refs, {
        title: "Create new project?",
        message: "Unsaved work in the current session will be replaced.",
        confirmLabel: "Create",
        onCancel: function () {},
        onConfirm: function () {
          controller.state.project = projectData.createProject();
          controller.state.history = historyManager.createHistory(controller.state.project);
          controller.state.selection.ids = [];
          controller.state.ui.saveStatus = "reset";
          persistence.saveAutosave(controller.state.project);
          controller.actions.render();
        }
      });
    };

    controller.actions.openProject = function () {
      controller.refs.fileInput.click();
    };

    controller.actions.importProjectFile = function (file) {
      if (!file) {
        return;
      }
      persistence.readProjectFile(file).then(function (project) {
        controller.state.project = project;
        controller.state.history = historyManager.createHistory(project);
        controller.state.selection.ids = [];
        controller.state.ui.saveStatus = "loaded";
        persistence.saveAutosave(project);
        persistence.saveRecentProject(project, file.name);
        controller.actions.render();
        shell.showToast(controller.refs, "Project opened", false);
      }).catch(function (error) {
        shell.showToast(controller.refs, error.message, true);
      });
    };

    controller.actions.saveProject = function (saveAs) {
      persistence.saveProject(controller, !!saveAs).then(function (result) {
        if (result.method === "cancelled") {
          return;
        }
        controller.state.ui.saveStatus = "saved";
        persistence.saveRecentProject(controller.state.project, result.fileName);
        shell.showToast(controller.refs, "Project saved", false);
        controller.actions.render();
      }).catch(function (error) {
        shell.showToast(controller.refs, error.message || "Unable to save project", true);
      });
    };

    controller.actions.exportHtml = function () {
      exporters.exportHtml(controller.state.project);
      shell.showToast(controller.refs, "HTML exported", false);
    };

    controller.actions.exportPng = function () {
      exporters.exportPng(controller.refs.canvasViewport, controller.state.project).then(function () {
        shell.showToast(controller.refs, "PNG exported", false);
      }).catch(function (error) {
        shell.showToast(controller.refs, error.message || "Unable to export PNG", true);
      });
    };

    controller.actions.exportSvg = function () {
      exporters.exportSvg(controller.state.project);
      shell.showToast(controller.refs, "SVG exported", false);
    };

    controller.actions.copyJson = function () {
      exporters.copyProjectJson(controller.state.project).then(function () {
        shell.showToast(controller.refs, "Project JSON copied", false);
      }).catch(function (error) {
        shell.showToast(controller.refs, error.message, true);
      });
    };

    controller.actions.setTab = function (tab) {
      controller.state.ui.activeTab = tab;
      controller.actions.render();
    };

    controller.actions.setPaletteFilter = function (value) {
      controller.state.ui.paletteFilter = String(value || "").trim().toLowerCase();
      controller.actions.render();
    };

    controller.actions.beginInlineEdit = function (componentId, fieldPath, multiline) {
      var page = projectData.getActivePage(controller.state.project);
      var context = projectData.findComponentContext(page, componentId);
      if (!context) {
        return;
      }

      controller.state.selection.ids = [componentId];
      controller.state.ui.inlineEdit = {
        componentId: componentId,
        fieldPath: fieldPath,
        kind: fieldPath === "__table__" ? "table" : "field",
        multiline: !!multiline,
        value: fieldPath === "__table__" ? null : utils.getByPath(context.node, fieldPath)
      };
      controller.actions.render();
    };

    controller.actions.updateInlineEditValue = function (value) {
      if (!controller.state.ui.inlineEdit) {
        return;
      }
      controller.state.ui.inlineEdit.value = value;
    };

    controller.actions.commitInlineEdit = function () {
      var inlineEdit = controller.state.ui.inlineEdit;
      if (!inlineEdit) {
        return;
      }

      controller.state.ui.inlineEdit = null;
      if (inlineEdit.kind === "table") {
        controller.actions.updateComponentData(inlineEdit.componentId, function (component) {
          var model = inlineEdit.value || { columns: [], rows: [] };
          utils.setByPath(component, "props.columnsText", (model.columns || []).map(function (value) {
            return String(value || "").trim();
          }).join(", "));
          utils.setByPath(component, "props.rowsText", (model.rows || []).map(function (row) {
            return (row || []).map(function (value) {
              return String(value || "").trim();
            }).join(", ");
          }).join("\n"));
        }, "Component updated");
        return;
      }
      controller.actions.updateComponentField(inlineEdit.componentId, inlineEdit.fieldPath, inlineEdit.value);
    };

    controller.actions.cancelInlineEdit = function () {
      if (!controller.state.ui.inlineEdit) {
        return;
      }
      controller.state.ui.inlineEdit = null;
      controller.actions.render();
    };
  }

  function commitProjectChange(controller, changeFn, successLabel, silent) {
    try {
      changeFn(controller.state.project);
      projectData.touchProject(controller.state.project);
      controller.state.history = historyManager.push(controller.state.history, controller.state.project);
      controller.state.ui.saveStatus = "saved";
      persistence.saveAutosave(controller.state.project);
      controller.actions.render();
      if (!silent) {
        shell.showToast(controller.refs, successLabel, false);
      }
    } catch (error) {
      shell.showToast(controller.refs, error.message || "Unable to apply change", true);
    }
  }

  function countComponents(root) {
    var count = 0;
    projectData.walkComponents(root, function () {
      count += 1;
    });
    return count;
  }

  function selectionLabel(controller) {
    if (controller.state.selection.ids.length !== 1) {
      return controller.state.selection.ids.length ? controller.state.selection.ids.length + " items" : "None";
    }
    var page = projectData.getActivePage(controller.state.project);
    var context = projectData.findComponentContext(page, controller.state.selection.ids[0]);
    return context ? context.node.name : "None";
  }

  function reconcileSelection(controller) {
    if (!controller.state.selection.ids.length) {
      return;
    }
    var page = projectData.getActivePage(controller.state.project);
    controller.state.selection.ids = controller.state.selection.ids.filter(function (id) {
      return !!projectData.findComponentContext(page, id);
    });
  }

  function captureInspectorFocus(controller) {
    var activeElement = document.activeElement;
    if (!activeElement || !controller.refs.inspectorRoot.contains(activeElement)) {
      return null;
    }

    var fieldKey = activeElement.getAttribute("data-inspector-field");
    if (!fieldKey) {
      return null;
    }

    return {
      fieldKey: fieldKey,
      selectionStart: typeof activeElement.selectionStart === "number" ? activeElement.selectionStart : null,
      selectionEnd: typeof activeElement.selectionEnd === "number" ? activeElement.selectionEnd : null
    };
  }

  function restoreInspectorFocus(controller, inspectorFocus) {
    if (!inspectorFocus) {
      return;
    }

    var field = controller.refs.inspectorRoot.querySelector('[data-inspector-field="' + inspectorFocus.fieldKey + '"]');
    if (!field) {
      return;
    }

    field.focus();
    if (typeof field.setSelectionRange === "function" && inspectorFocus.selectionStart != null && inspectorFocus.selectionEnd != null) {
      try {
        field.setSelectionRange(inspectorFocus.selectionStart, inspectorFocus.selectionEnd);
      } catch (error) {
        // Ignore selection restore failures for fields that do not support it.
      }
    }
  }

  MockApp.app.createController = createController;
})(window.MockApp);
