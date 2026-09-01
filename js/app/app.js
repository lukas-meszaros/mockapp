(function (MockApp) {
  function bindUi(controller) {
    var refs = controller.refs;

    document.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.dataset.action;
        if (action === "new-project") {
          controller.actions.newProject();
        } else if (action === "open-project") {
          controller.actions.openProject();
        } else if (action === "save-project") {
          controller.actions.saveProject(false);
        } else if (action === "save-project-as") {
          controller.actions.saveProject(true);
        } else if (action === "undo") {
          controller.actions.undo();
        } else if (action === "redo") {
          controller.actions.redo();
        } else if (action === "duplicate") {
          controller.actions.duplicateSelected();
        } else if (action === "delete") {
          controller.actions.removeSelected();
        } else if (action === "preview") {
          controller.actions.togglePreview();
        } else if (action === "show-about") {
          controller.actions.showAbout();
        } else if (action === "export-html") {
          controller.actions.exportHtml();
        } else if (action === "export-png") {
          controller.actions.exportPng();
        } else if (action === "export-svg") {
          controller.actions.exportSvg();
        } else if (action === "copy-json") {
          controller.actions.copyJson();
        } else if (action === "add-page") {
          controller.actions.addPage();
        } else if (action === "duplicate-page") {
          controller.actions.duplicatePage();
        } else if (action === "delete-page") {
          controller.actions.deletePage();
        } else if (action === "zoom-in") {
          controller.actions.setZoom(controller.state.ui.zoom + 0.1);
        } else if (action === "zoom-out") {
          controller.actions.setZoom(controller.state.ui.zoom - 0.1);
        } else if (action === "zoom-reset") {
          controller.actions.setZoom(1);
        }
      });
    });

    refs.tabButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        controller.actions.setTab(button.dataset.tabTarget);
      });
    });

    refs.paletteSearch.addEventListener("input", function () {
      controller.actions.setPaletteFilter(refs.paletteSearch.value);
    });

    refs.viewportSelect.addEventListener("change", function () {
      controller.actions.setViewportPreset(refs.viewportSelect.value);
    });

    refs.fileInput.addEventListener("change", function () {
      controller.actions.importProjectFile(refs.fileInput.files[0]);
      refs.fileInput.value = "";
    });

    MockApp.ui.shell.initSplitters(refs, controller.state, function () {
      controller.actions.render();
    });

    document.addEventListener("keydown", function (event) {
      if (isEditingField(event.target)) {
        return;
      }

      var primary = event.metaKey || event.ctrlKey;
      if (primary && event.key.toLowerCase() === "s") {
        event.preventDefault();
        controller.actions.saveProject(event.shiftKey);
      } else if (primary && event.key.toLowerCase() === "o") {
        event.preventDefault();
        controller.actions.openProject();
      } else if (primary && event.key.toLowerCase() === "n") {
        event.preventDefault();
        controller.actions.newProject();
      } else if (primary && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          controller.actions.redo();
        } else {
          controller.actions.undo();
        }
      } else if (primary && event.key.toLowerCase() === "y") {
        event.preventDefault();
        controller.actions.redo();
      } else if (primary && event.key.toLowerCase() === "c") {
        event.preventDefault();
        controller.actions.copySelection();
      } else if (primary && event.key.toLowerCase() === "v") {
        event.preventDefault();
        controller.actions.pasteSelection();
      } else if (primary && event.key.toLowerCase() === "d") {
        event.preventDefault();
        controller.actions.duplicateSelected();
      } else if ((event.key === "Delete" || event.key === "Backspace") && !primary) {
        event.preventDefault();
        controller.actions.removeSelected();
      } else if (event.key === "Escape") {
        if (controller.state.selection.ids.length) {
          event.preventDefault();
          controller.actions.selectOnly(null);
        }
      }
    });
  }

  function isEditingField(target) {
    return target && /input|textarea|select/i.test(target.tagName);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var refs = MockApp.ui.shell.collectRefs();
    var controller = MockApp.app.createController(refs);
    bindUi(controller);
    controller.actions.render();
  });
})(window.MockApp);
