(function (MockApp) {
  function uid(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return (prefix ? prefix + "-" : "") + window.crypto.randomUUID();
    }

    return (prefix ? prefix + "-" : "") + Date.now().toString(36) + "-" + Math.random().toString(16).slice(2, 10);
  }

  function deepClone(value) {
    if (typeof window.structuredClone === "function") {
      return window.structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
  }

  function downloadFile(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function capitalize(value) {
    if (!value) {
      return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(null, args);
      }, wait);
    };
  }

  function getByPath(target, path) {
    return path.split(".").reduce(function (current, part) {
      if (current == null) {
        return undefined;
      }
      return current[part];
    }, target);
  }

  function setByPath(target, path, value) {
    var parts = path.split(".");
    var current = target;

    parts.slice(0, -1).forEach(function (part) {
      if (!current[part] || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    });

    current[parts[parts.length - 1]] = value;
  }

  function toSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  MockApp.utils.uid = uid;
  MockApp.utils.deepClone = deepClone;
  MockApp.utils.downloadFile = downloadFile;
  MockApp.utils.escapeHtml = escapeHtml;
  MockApp.utils.capitalize = capitalize;
  MockApp.utils.debounce = debounce;
  MockApp.utils.getByPath = getByPath;
  MockApp.utils.setByPath = setByPath;
  MockApp.utils.toSlug = toSlug;
})(window.MockApp);
