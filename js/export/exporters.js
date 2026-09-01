(function (MockApp) {
  var registry = MockApp.components.registry;
  var projectData = MockApp.data.project;
  var utils = MockApp.utils;

  function classListFromComponent(component) {
    var props = component.props || {};

    switch (component.type) {
      case "layout.container":
        return [(props.fluid ? "container-fluid" : "container"), props.padding ? "p-" + props.padding : "", props.gap ? "d-grid gap-" + props.gap : ""].join(" ").trim();
      case "layout.row":
        return ["row", props.gap ? "g-" + props.gap : "", props.alignItems ? "align-items-" + props.alignItems : ""].join(" ").trim();
      case "layout.column":
        return [columnClasses(props.widths), props.gap ? "d-grid gap-" + props.gap : ""].join(" ").trim();
      case "content.heading":
        return props.marginBottom ? "mb-" + props.marginBottom : "";
      case "content.paragraph":
        return [(props.lead ? "lead" : ""), props.align ? "text-" + props.align : ""].join(" ").trim();
      case "action.button":
        return [buttonVariant(props), buttonSize(props.size)].join(" ").trim();
      case "feedback.alert":
        return "alert alert-" + (props.variant || "info");
      case "content.badge":
        return ["badge text-bg-" + (props.variant || "primary"), props.pill ? "rounded-pill" : ""].join(" ").trim();
      case "content.card":
        return ["card", cardShadow(props.shadow)].join(" ").trim();
      case "nav.navbar":
        return ["navbar navbar-expand-lg", navbarTheme(props), navbarBackground(props)].join(" ").trim();
      case "data.table":
        return ["table", props.striped ? "table-striped" : "", props.hover ? "table-hover" : ""].join(" ").trim();
      default:
        return "";
    }
  }

  function buttonVariant(props) {
    return "btn btn-" + ((props.outline ? "outline-" : "") + (props.variant || "primary"));
  }

  function buttonSize(size) {
    if (size === "sm") {
      return "btn-sm";
    }
    if (size === "lg") {
      return "btn-lg";
    }
    return "";
  }

  function cardShadow(shadow) {
    if (shadow === "sm") {
      return "shadow-sm";
    }
    if (shadow === "regular") {
      return "shadow";
    }
    if (shadow === "lg") {
      return "shadow-lg";
    }
    return "";
  }

  function navbarTheme(props) {
    return props.theme === "light" ? "navbar-light" : "navbar-dark";
  }

  function navbarBackground(props) {
    if (!props.background) {
      return "bg-dark";
    }
    if (props.background === "body-tertiary") {
      return "bg-body-tertiary";
    }
    return "bg-" + props.background;
  }

  function columnClasses(widths) {
    var resolved = widths || {};
    return MockApp.app.constants.BREAKPOINTS.map(function (breakpoint) {
      var value = resolved[breakpoint];
      if (!value || value === "auto") {
        return breakpoint === "xs" ? "col" : "col-" + breakpoint;
      }
      return breakpoint === "xs" ? "col-" + value : "col-" + breakpoint + "-" + value;
    }).join(" ");
  }

  function renderComponentHtml(component, isPreview, options) {
    var props = component.props || {};
    var renderOptions = options || {};
    var childrenHtml = (component.children || []).map(function (child) {
      return renderComponentHtml(child, isPreview, { isRootChild: false });
    }).join("\n");
    var classes = classListFromComponent(component);
    var rootStyle = renderOptions.isRootChild ? rootPlacementStyle(component.frame) : "";

    switch (component.type) {
      case "layout.container":
      case "layout.row":
      case "layout.column":
        return '<div class="' + classes + '"' + rootStyle + '>' + childrenHtml + '</div>';
      case "content.heading":
        return '<h' + props.level + ' class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", false) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</h' + props.level + '>';
      case "content.paragraph":
        return '<p class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", true) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</p>';
      case "action.button":
        return '<button type="button" class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", false) + textStyle(renderOptions) + (props.disabled ? ' disabled="disabled"' : '') + '>' + textHtml(props.text || "", renderOptions) + '</button>';
      case "form.input":
        if (renderOptions.hideLabels) {
          return '<div class="mb-3"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><input class="form-control" type="' + utils.escapeHtml(props.inputType || "text") + '" placeholder="' + utils.escapeHtml(props.placeholder || "") + '" value="' + utils.escapeHtml(props.value || "") + '"' + (props.required ? ' required="required"' : '') + ' /></div>';
        }
        return '<div class="mb-3"' + rootStyle + '><label class="form-label">' + utils.escapeHtml(props.label || "") + '</label><input class="form-control" type="' + utils.escapeHtml(props.inputType || "text") + '" placeholder="' + utils.escapeHtml(props.placeholder || "") + '" value="' + utils.escapeHtml(props.value || "") + '"' + (props.required ? ' required="required"' : '') + ' /></div>';
      case "form.textarea":
        if (renderOptions.hideLabels) {
          return '<div class="mb-3"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><textarea class="form-control" rows="' + utils.escapeHtml(props.rows || 4) + '" placeholder="' + utils.escapeHtml(props.placeholder || "") + '"></textarea></div>';
        }
        return '<div class="mb-3"' + rootStyle + '><label class="form-label">' + utils.escapeHtml(props.label || "") + '</label><textarea class="form-control" rows="' + utils.escapeHtml(props.rows || 4) + '" placeholder="' + utils.escapeHtml(props.placeholder || "") + '"></textarea></div>';
      case "form.select":
        if (renderOptions.hideLabels) {
          return '<div class="mb-3"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><select class="form-select"' + (props.multiple ? ' multiple="multiple"' : '') + '>' + optionsHtml(props.optionsText) + '</select></div>';
        }
        return '<div class="mb-3"' + rootStyle + '><label class="form-label">' + utils.escapeHtml(props.label || "") + '</label><select class="form-select"' + (props.multiple ? ' multiple="multiple"' : '') + '>' + optionsHtml(props.optionsText) + '</select></div>';
      case "form.checkbox":
        if (renderOptions.hideLabels) {
          return '<div class="form-check"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><input class="form-check-input" type="checkbox"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
        }
        return '<div class="form-check"' + rootStyle + '><input class="form-check-input" type="checkbox"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
      case "feedback.alert":
        return '<div class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", true) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</div>';
      case "content.badge":
        return '<span class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", false) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</span>';
      case "content.card":
        return '<div class="' + classes + '"' + rootStyle + '><div class="card-body"><h5 class="card-title"' + inlineEditAttrs(renderOptions, "props.title", false) + textStyle(renderOptions) + '>' + textHtml(props.title || "", renderOptions) + '</h5><p class="card-text"' + inlineEditAttrs(renderOptions, "props.text", true) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</p>' + childrenHtml + '</div></div>';
      case "nav.navbar":
        return '<nav class="' + classes + '"' + rootStyle + '><div class="container-fluid"><span class="navbar-brand"' + inlineEditAttrs(renderOptions, "props.brand", false) + textStyle(renderOptions) + '>' + textHtml(props.brand || "", renderOptions) + '</span>' + childrenHtml + '</div></nav>';
      case "data.table":
        return '<div class="table-responsive"' + rootStyle + '><table class="' + classes + '">' + tableHtml(props) + '</table></div>';
      default:
        return isPreview ? '<div class="preview-placeholder">Unsupported component</div>' : '<div class="preview-placeholder">Unsupported component</div>';
    }
  }

  function rootPlacementStyle(frame) {
    if (!frame) {
      return "";
    }

    return ' style="position:absolute;left:' + frame.x + 'px;top:' + frame.y + 'px;width:' + frame.width + 'px;min-height:' + frame.height + 'px;"';
  }

  function textStyle(renderOptions) {
    if (renderOptions && renderOptions.preserveLineBreaks) {
      return ' style="white-space: pre-line;"';
    }
    return "";
  }

  function inlineEditAttrs(renderOptions, fieldPath, multiline) {
    if (!renderOptions || !renderOptions.inlineEditing) {
      return "";
    }

    return ' data-inline-edit-field="' + fieldPath + '" data-inline-edit-multiline="' + (multiline ? "true" : "false") + '"';
  }

  function textHtml(text, renderOptions) {
    var value = utils.escapeHtml(text || "");
    if (renderOptions && renderOptions.preserveLineBreaks) {
      return value.replace(/\r?\n/g, "<br />");
    }
    return value;
  }

  function optionsHtml(text) {
    return splitLines(text).map(function (line) {
      return '<option>' + utils.escapeHtml(line) + '</option>';
    }).join("");
  }

  function tableHtml(props) {
    var columns = splitCsv(props.columnsText || "Column");
    var rows = splitLines(props.rowsText || "").map(splitCsv);
    return '<thead><tr>' + columns.map(function (column) { return '<th>' + utils.escapeHtml(column) + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function (row) {
      return '<tr>' + columns.map(function (_, index) { return '<td>' + utils.escapeHtml(row[index] || "") + '</td>'; }).join("") + '</tr>';
    }).join("") + '</tbody>';
  }

  function splitLines(text) {
    return String(text || "").split(/\r?\n/).map(function (entry) {
      return entry.trim();
    }).filter(Boolean);
  }

  function splitCsv(text) {
    return String(text || "").split(",").map(function (entry) {
      return entry.trim();
    }).filter(Boolean);
  }

  function exportHtml(project) {
    var page = projectData.getActivePage(project);
    var body = (page.root.children || []).map(function (component) {
      return renderComponentHtml(component, true, { isRootChild: true });
    }).join("\n");
    var viewport = MockApp.app.constants.VIEWPORTS[page.viewportPreset];
    var html = [
      "<!DOCTYPE html>",
      '<html lang="en">',
      "<head>",
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '  <title>' + utils.escapeHtml(project.metadata.name) + '</title>',
      '  <link rel="stylesheet" href="./vendor/bootstrap/css/bootstrap.min.css" />',
      "</head>",
      '<body class="bg-body-tertiary">',
      '  <main class="py-4"><section style="position:relative;margin:0 auto;background:#fff;width:' + viewport.width + 'px;min-height:' + viewport.height + 'px;box-shadow:0 8px 24px rgba(0,0,0,.08);">' + body + '</section></main>',
      '  <script src="./vendor/bootstrap/js/bootstrap.bundle.min.js"></script>',
      "</body>",
      "</html>"
    ].join("\n");

    utils.downloadFile((MockApp.utils.toSlug(project.metadata.name) || "mockapp") + ".html", html, "text/html");
  }

  function exportSvg(project) {
    var page = projectData.getActivePage(project);
    var content = (page.root.children || []).map(function (component) {
      return renderComponentHtml(component, true, { isRootChild: true });
    }).join("\n");
    var width = MockApp.app.constants.VIEWPORTS[page.viewportPreset].width;
    var height = MockApp.app.constants.VIEWPORTS[page.viewportPreset].height;
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">',
      '  <foreignObject width="100%" height="100%">',
      '    <div xmlns="http://www.w3.org/1999/xhtml">',
      '      <style>@import url(./vendor/bootstrap/css/bootstrap.min.css); body{margin:0;background:#fff;font-family:Segoe UI,Arial,sans-serif;} section{position:relative;width:' + width + 'px;min-height:' + height + 'px;background:#fff;}</style>',
      '      <section>' + content + '</section>',
      "    </div>",
      "  </foreignObject>",
      "</svg>"
    ].join("\n");

    utils.downloadFile((MockApp.utils.toSlug(project.metadata.name) || "mockapp") + ".svg", svg, "image/svg+xml");
  }

  function exportPng(node, project) {
    if (!window.html2canvas) {
      return Promise.reject(new Error("PNG export dependency is unavailable."));
    }

    return window.html2canvas(node, {
      backgroundColor: "#ffffff",
      useCORS: false,
      logging: false,
      scale: 2
    }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          throw new Error("PNG export failed.");
        }
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = (MockApp.utils.toSlug(project.metadata.name) || "mockapp") + ".png";
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    });
  }

  function copyProjectJson(project) {
    var text = JSON.stringify(project, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return Promise.reject(new Error("Clipboard API unavailable."));
  }

  MockApp.exporters.api = {
    classListFromComponent: classListFromComponent,
    renderComponentHtml: renderComponentHtml,
    exportHtml: exportHtml,
    exportPng: exportPng,
    exportSvg: exportSvg,
    copyProjectJson: copyProjectJson
  };
})(window.MockApp);
