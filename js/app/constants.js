(function (MockApp) {
  var runtimeVersion = typeof window.MockAppVersion === "string" ? window.MockAppVersion : "0.2.0";

  MockApp.app.constants = {
    APP_VERSION: runtimeVersion,
    PROJECT_FORMAT: "MockApp",
    PROJECT_VERSION: 1,
    BOOTSTRAP_VERSION: "5.3.8",
    BOOTSTRAP_ICONS_VERSION: "1.13.1",
    HIGHLIGHTJS_VERSION: "11.10.0",
    STORAGE_KEYS: {
      AUTOSAVE: "mockapp.autosave.v1",
      PREFERENCES: "mockapp.preferences.v1",
      RECENTS: "mockapp.recents.v1"
    },
    VIEWPORTS: {
      mobile: { label: "Mobile", width: 390, height: 844 },
      "mobile-landscape": { label: "Mobile Landscape", width: 740, height: 390 },
      tablet: { label: "Tablet", width: 820, height: 1180 },
      laptop: { label: "Laptop", width: 1280, height: 800 },
      desktop: { label: "Desktop", width: 1440, height: 900 },
      wide: { label: "Large Desktop", width: 1680, height: 1050 }
    },
    BREAKPOINTS: ["xs", "sm", "md", "lg", "xl", "xxl"],
    GRID_OPTIONS: ["auto", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    DEFAULT_GRID_SIZE: 8,
    HISTORY_LIMIT: 80,
    EVENTS: {
      RENDER: "mockapp:render",
      TOAST: "mockapp:toast"
    }
  };
})(window.MockApp);
