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
        } else if (action === "exit-preview") {
          if (controller.state.ui.preview) {
            controller.actions.togglePreview();
          }
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
        } else if (action === "align-left") {
          controller.actions.alignSelection("left");
        } else if (action === "align-center") {
          controller.actions.alignSelection("center");
        } else if (action === "align-right") {
          controller.actions.alignSelection("right");
        } else if (action === "align-top") {
          controller.actions.alignSelection("top");
        } else if (action === "align-middle") {
          controller.actions.alignSelection("middle");
        } else if (action === "align-bottom") {
          controller.actions.alignSelection("bottom");
        } else if (action === "layer-above") {
          controller.actions.layerSelection("forward");
        } else if (action === "layer-below") {
          controller.actions.layerSelection("backward");
        } else if (action === "layer-top") {
          controller.actions.layerSelection("front");
        } else if (action === "layer-bottom") {
          controller.actions.layerSelection("back");
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
      } else if (primary && event.key.toLowerCase() === "a") {
        event.preventDefault();
        controller.actions.selectAll();
      } else if ((event.key === "Delete" || event.key === "Backspace") && !primary) {
        event.preventDefault();
        controller.actions.removeSelected();
      } else if (event.key === "Escape") {
        if (controller.state.ui.preview) {
          event.preventDefault();
          controller.actions.togglePreview();
          return;
        }
        if (controller.state.selection.ids.length) {
          event.preventDefault();
          controller.actions.selectOnly(null);
        }
      }
    });
  }

  function bindDebugTools(controller) {
    var root = window.MockApp.debug || (window.MockApp.debug = {});
    root.dumpLayerDiagnostics = function () {
      var page = MockApp.data.project.getActivePage(controller.state.project);
      var canvasRoot = controller.refs.canvasRoot;
      var mode = controller.state.ui.preview ? "preview" : "canvas";
      var rows = (page.root.children || []).map(function (component, index) {
        var selector = mode === "preview"
          ? '.canvas-live-item[data-component-id="' + component.id + '"]'
          : '.canvas-node[data-component-id="' + component.id + '"]';
        var domNode = canvasRoot.querySelector(selector);
        var computed = domNode ? window.getComputedStyle(domNode) : null;

        return {
          orderIndex: index,
          id: component.id,
          name: component.name,
          x: component.frame && component.frame.x,
          y: component.frame && component.frame.y,
          width: component.frame && component.frame.width,
          height: component.frame && component.frame.height,
          expectedZ: index + 1,
          domZ: computed ? computed.zIndex : "missing",
          domFound: !!domNode
        };
      });

      console.group("MockApp Layer Diagnostics");
      console.log("Mode:", mode);
      console.log("Root children order is back-to-front. Higher index = front.");
      console.table(rows);
      console.groupEnd();
      return rows;
    };
  }

  function isEditingField(target) {
    return target && /input|textarea|select/i.test(target.tagName);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var refs = MockApp.ui.shell.collectRefs();
    var controller = MockApp.app.createController(refs);
    bindUi(controller);
    bindDebugTools(controller);
    controller.actions.render();
  });
})(window.MockApp);
