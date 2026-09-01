(function (MockApp) {
  var constants = MockApp.app.constants;
  var utils = MockApp.utils;
  var projectData = MockApp.data.project;

  function loadAutosave() {
    try {
      var raw = localStorage.getItem(constants.STORAGE_KEYS.AUTOSAVE);
      if (!raw) {
        return null;
      }

      var project = JSON.parse(raw);
      var validation = projectData.validateProject(project);
      return validation.valid ? projectData.normalizeProject(project) : null;
    } catch (error) {
      return null;
    }
  }

  function saveAutosave(project) {
    localStorage.setItem(constants.STORAGE_KEYS.AUTOSAVE, JSON.stringify(project, null, 2));
  }

  function clearAutosave() {
    localStorage.removeItem(constants.STORAGE_KEYS.AUTOSAVE);
  }

  function loadPreferences() {
    try {
      return JSON.parse(localStorage.getItem(constants.STORAGE_KEYS.PREFERENCES) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function savePreferences(preferences) {
    localStorage.setItem(constants.STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences, null, 2));
  }

  function loadRecents() {
    try {
      return JSON.parse(localStorage.getItem(constants.STORAGE_KEYS.RECENTS) || "[]") || [];
    } catch (error) {
      return [];
    }
  }

  function saveRecentProject(project, fileName) {
    var recents = loadRecents().filter(function (entry) {
      return entry.name !== project.metadata.name;
    });

    recents.unshift({
      name: project.metadata.name,
      fileName: fileName || null,
      updatedAt: new Date().toISOString()
    });

    localStorage.setItem(constants.STORAGE_KEYS.RECENTS, JSON.stringify(recents.slice(0, 8), null, 2));
  }

  function saveProject(controller, saveAs) {
    var fileName = (projectFileName(controller.state.project) || "mockapp-project") + ".mockapp.json";
    var serialized = JSON.stringify(controller.state.project, null, 2);

    if (!saveAs && controller.state.fileHandle && window.showSaveFilePicker) {
      return writeToHandle(controller.state.fileHandle, serialized).then(function () {
        return { method: "handle", fileName: fileName };
      });
    }

    if (window.showSaveFilePicker) {
      return window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: "MockApp Project",
          accept: { "application/json": [".mockapp.json"] }
        }]
      }).then(function (handle) {
        controller.state.fileHandle = handle;
        return writeToHandle(handle, serialized).then(function () {
          return { method: "handle", fileName: handle.name || fileName };
        });
      }).catch(function (error) {
        if (error && error.name === "AbortError") {
          return { method: "cancelled" };
        }
        utils.downloadFile(fileName, serialized, "application/json");
        return { method: "download", fileName: fileName };
      });
    }

    utils.downloadFile(fileName, serialized, "application/json");
    return Promise.resolve({ method: "download", fileName: fileName });
  }

  function writeToHandle(handle, text) {
    return handle.createWritable().then(function (writable) {
      return writable.write(text).then(function () {
        return writable.close();
      });
    });
  }

  function readProjectFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(reader.result);
          var validation = projectData.validateProject(parsed);
          if (!validation.valid) {
            reject(new Error(validation.reason));
            return;
          }
          resolve(projectData.normalizeProject(parsed));
        } catch (error) {
          reject(new Error("Unable to parse project JSON."));
        }
      };
      reader.onerror = function () {
        reject(new Error("Unable to read selected file."));
      };
      reader.readAsText(file);
    });
  }

  function projectFileName(project) {
    return MockApp.utils.toSlug(project.metadata.name || "mockapp-project") || "mockapp-project";
  }

  MockApp.persistence.store = {
    loadAutosave: loadAutosave,
    saveAutosave: saveAutosave,
    clearAutosave: clearAutosave,
    loadPreferences: loadPreferences,
    savePreferences: savePreferences,
    loadRecents: loadRecents,
    saveRecentProject: saveRecentProject,
    saveProject: saveProject,
    readProjectFile: readProjectFile,
    projectFileName: projectFileName
  };
})(window.MockApp);
