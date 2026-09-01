(function (MockApp) {
  function collectRefs() {
    return {
      body: document.body,
      leftPanel: document.querySelector(".panel-left"),
      rightPanel: document.querySelector(".panel-right"),
      leftSplitter: document.querySelector(".splitter-left"),
      rightSplitter: document.querySelector(".splitter-right"),
      tabButtons: document.querySelectorAll("[data-tab-target]"),
      tabPanels: document.querySelectorAll("[data-tab-panel]"),
      paletteSearch: document.getElementById("component-search"),
      paletteRoot: document.getElementById("component-palette"),
      pagesRoot: document.getElementById("page-list"),
      layersRoot: document.getElementById("layer-tree"),
      inspectorRoot: document.getElementById("property-inspector"),
      canvasPanel: document.querySelector(".canvas-panel"),
      canvasStage: document.getElementById("canvas-stage"),
      canvasViewport: document.getElementById("canvas-viewport"),
      canvasRoot: document.getElementById("canvas-root"),
      pageTitle: document.getElementById("page-title"),
      viewportSelect: document.getElementById("viewport-select"),
      zoomLabel: document.getElementById("zoom-label"),
      statusProject: document.getElementById("status-project"),
      statusViewport: document.getElementById("status-viewport"),
      statusSelection: document.getElementById("status-selection"),
      statusCount: document.getElementById("status-count"),
      statusSave: document.getElementById("status-save"),
      fileInput: document.getElementById("project-file-input"),
      dialog: document.getElementById("app-dialog"),
      dialogTitle: document.getElementById("dialog-title"),
      dialogBody: document.getElementById("dialog-body"),
      dialogConfirm: document.getElementById("dialog-confirm"),
      dialogCancel: document.getElementById("dialog-cancel"),
      toastRegion: document.getElementById("toast-region")
    };
  }

  function setActiveTab(refs, activeTab) {
    refs.tabButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.tabTarget === activeTab);
    });

    refs.tabPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.tabPanel !== activeTab;
    });
  }

  function updateStatus(refs, state, componentCount, selectedName) {
    var viewport = MockApp.app.constants.VIEWPORTS[state.ui.viewportPreset];
    refs.statusProject.textContent = "Project: " + state.project.metadata.name;
    refs.statusViewport.textContent = "Viewport: " + viewport.label + " " + viewport.width + "x" + viewport.height;
    refs.statusSelection.textContent = "Selection: " + (selectedName || "None");
    refs.statusCount.textContent = "Components: " + componentCount;
    refs.statusSave.textContent = "Autosave: " + state.ui.saveStatus;
    refs.zoomLabel.textContent = Math.round(state.ui.zoom * 100) + "%";
  }

  function setViewportClass(refs, preset, zoom, gridVisible, gridSize) {
    refs.canvasStage.className = "canvas-stage viewport-" + preset + (gridVisible ? "" : " grid-hidden");
    refs.canvasStage.style.backgroundSize = ["auto", gridSize + "px " + gridSize + "px", gridSize + "px " + gridSize + "px", "auto"].join(", ");
    refs.canvasViewport.style.transform = "scale(" + zoom + ")";
  }

  function showToast(refs, message, isError) {
    var toast = document.createElement("div");
    toast.className = "toast" + (isError ? " is-error" : "");
    toast.textContent = message;
    refs.toastRegion.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2800);
  }

  function showDialog(refs, options) {
    refs.dialogTitle.textContent = options.title || "Notice";
    refs.dialogBody.textContent = options.message || "";
    refs.dialogConfirm.textContent = options.confirmLabel || "OK";
    refs.dialogCancel.hidden = !options.onCancel;

    function cleanup() {
      refs.dialogConfirm.onclick = null;
      refs.dialogCancel.onclick = null;
    }

    refs.dialogConfirm.onclick = function () {
      cleanup();
      refs.dialog.close();
      if (options.onConfirm) {
        options.onConfirm();
      }
    };

    refs.dialogCancel.onclick = function () {
      cleanup();
      refs.dialog.close();
      if (options.onCancel) {
        options.onCancel();
      }
    };

    refs.dialog.showModal();
  }

  function initSplitters(refs, state, onResize) {
    [refs.leftSplitter, refs.rightSplitter].forEach(function (splitter) {
      if (!splitter) {
        return;
      }
      splitter.classList.add("is-static");
      splitter.setAttribute("aria-hidden", "true");
    });
  }

  MockApp.ui.shell = {
    collectRefs: collectRefs,
    setActiveTab: setActiveTab,
    updateStatus: updateStatus,
    setViewportClass: setViewportClass,
    showToast: showToast,
    showDialog: showDialog,
    initSplitters: initSplitters
  };
})(window.MockApp);
