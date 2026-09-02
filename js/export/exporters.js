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
    var rootStyle = renderOptions.isRootChild ? rootPlacementStyle(component) : "";
    var overrideHtml = renderCodeOverride(component, isPreview, renderOptions, rootStyle);
    if (overrideHtml) {
      return overrideHtml;
    }

    var childrenHtml = (component.children || []).map(function (child) {
      return renderComponentHtml(child, isPreview, { isRootChild: false });
    }).join("\n");
    var classes = classListFromComponent(component);

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
          return '<div class="mb-3"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><input class="form-control"' + inputAttributes(props) + ' /></div>';
        }
        return '<div class="mb-3"' + rootStyle + '><label class="form-label">' + utils.escapeHtml(props.label || "") + '</label><input class="form-control"' + inputAttributes(props) + ' /></div>';
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
      case "form.radio":
        if (renderOptions.hideLabels) {
          return '<div class="form-check"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><input class="form-check-input" type="radio" name="' + utils.escapeHtml(props.groupName || component.id) + '"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
        }
        return '<div class="form-check"' + rootStyle + '><input class="form-check-input" type="radio" name="' + utils.escapeHtml(props.groupName || component.id) + '"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
      case "form.switch":
        if (renderOptions.hideLabels) {
          return '<div class="form-check form-switch"' + rootStyle + inlineEditAttrs(renderOptions, "props.label", false) + '><input class="form-check-input" type="checkbox" role="switch"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
        }
        return '<div class="form-check form-switch"' + rootStyle + '><input class="form-check-input" type="checkbox" role="switch"' + (props.checked ? ' checked="checked"' : '') + ' /><label class="form-check-label">' + utils.escapeHtml(props.label || "") + '</label></div>';
      case "feedback.alert":
        return '<div class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", true) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</div>';
      case "content.badge":
        return '<span class="' + classes + '"' + rootStyle + inlineEditAttrs(renderOptions, "props.text", false) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</span>';
      case "content.image":
        if (props.src) {
          return '<div class="mock-image"' + rootStyle + '><img class="mock-image-element" src="' + utils.escapeHtml(props.src) + '" alt="' + utils.escapeHtml(props.alt || "") + '" style="display:block;width:100%;height:100%;min-height:inherit;object-fit:' + utils.escapeHtml(props.fit || "cover") + ';background:' + utils.escapeHtml(props.placeholderColor || "#d9e2f0") + ';" /></div>';
        }
        return '<div class="mock-image"' + rootStyle + '><div class="mock-image-placeholder" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:110px;background:' + utils.escapeHtml(props.placeholderColor || "#d9e2f0") + ';border:1px dashed rgba(87, 106, 132, 0.36);color:#49566d;font-size:0.84rem;">' + utils.escapeHtml(props.placeholderText || "Image Placeholder") + '</div></div>';
      case "content.figure":
        return figureHtml(props, rootStyle);
      case "content.card":
        return '<div class="' + classes + '"' + rootStyle + '><div class="card-body"><h5 class="card-title"' + inlineEditAttrs(renderOptions, "props.title", false) + textStyle(renderOptions) + '>' + textHtml(props.title || "", renderOptions) + '</h5><p class="card-text"' + inlineEditAttrs(renderOptions, "props.text", true) + textStyle(renderOptions) + '>' + textHtml(props.text || "", renderOptions) + '</p>' + childrenHtml + '</div></div>';
      case "nav.navbar":
        return '<nav class="' + classes + '"' + rootStyle + '><div class="container-fluid"><span class="navbar-brand"' + inlineEditAttrs(renderOptions, "props.brand", false) + textStyle(renderOptions) + '>' + textHtml(props.brand || "", renderOptions) + '</span>' + navbarLinksHtml(props) + childrenHtml + '</div></nav>';
      case "nav.breadcrumb":
        return breadcrumbHtml(props, rootStyle);
      case "nav.pagination":
        return paginationHtml(props, rootStyle);
      case "nav.tabs":
        return tabsHtml(props, rootStyle, "tabs");
      case "nav.pills":
        return tabsHtml(props, rootStyle, "pills");
      case "nav.dropdown":
        return dropdownHtml(props, rootStyle, false);
      case "nav.dropdown-button":
        return dropdownHtml(props, rootStyle, true);
      case "nav.offcanvas-navigation":
        return offcanvasHtml(component, props, rootStyle);
      case "content.list-group":
        return listGroupHtml(props, rootStyle);
      case "data.table":
        return '<div class="table-responsive"' + rootStyle + '><table class="' + classes + '">' + tableHtml(props) + '</table></div>';
      case "feedback.progress":
        return progressHtml(props, rootStyle);
      case "feedback.spinner":
        return spinnerHtml(props, rootStyle);
      case "feedback.toast":
        return toastHtml(props, rootStyle);
      case "feedback.placeholder":
        return placeholderHtml(props, rootStyle);
      case "drawing.rectangle":
        return rectangleShapeHtml(component, props, rootStyle);
      case "drawing.circle":
        return circleShapeHtml(component, props, rootStyle);
      case "drawing.triangle":
        return triangleShapeHtml(component, props, rootStyle);
      case "drawing.line":
        return lineShapeHtml(component, props, rootStyle);
      case "interactive.accordion":
        return accordionHtml(component, props, rootStyle);
      case "interactive.collapse":
        return collapseHtml(component, props, rootStyle);
      case "interactive.carousel":
        return carouselHtml(component, props, rootStyle);
      case "interactive.tooltip":
        return tooltipHtml(props, rootStyle);
      case "interactive.popover":
        return popoverHtml(props, rootStyle);
      default:
        return isPreview ? '<div class="preview-placeholder">Unsupported component</div>' : '<div class="preview-placeholder">Unsupported component</div>';
    }
  }

  function renderCodeOverride(component, isPreview, renderOptions, rootStyle) {
    if (renderOptions.skipCodeOverride) {
      return "";
    }

    var code = component.code || {};
    var htmlText = String(code.html || "");
    var cssText = String(code.css || "");
    var hasHtml = htmlText.trim().length > 0;
    var hasCss = cssText.trim().length > 0;
    if (!hasHtml && !hasCss) {
      return "";
    }

    try {
      if (hasHtml) {
        validateCustomHtml(htmlText);
      }
      if (hasCss) {
        validateCustomCss(cssText);
      }

      var scopeValue = String(component.id || "component");
      var escapedScopeValue = utils.escapeHtml(scopeValue);
      var scopeSelector = '[data-mockapp-code-scope="' + cssStringEscape(scopeValue) + '"]';
      var styleBlock = hasCss ? '<style>' + safeStyleText(scopeCss(cssText, scopeSelector)) + '</style>' : "";
      var bodyHtml = hasHtml ? htmlText : renderComponentHtml(component, isPreview, {
        isRootChild: false,
        hideLabels: renderOptions.hideLabels,
        preserveLineBreaks: renderOptions.preserveLineBreaks,
        inlineEditing: false,
        skipCodeOverride: true
      });
      return '<div class="mockapp-custom-control" data-mockapp-code-scope="' + escapedScopeValue + '"' + rootStyle + '>' + styleBlock + bodyHtml + '</div>';
    } catch (error) {
      return renderComponentErrorHtml(rootStyle, error && error.message ? error.message : "Invalid HTML/CSS override.");
    }
  }

  function validateCustomHtml(htmlText) {
    if (/<\s*script\b/i.test(htmlText)) {
      throw new Error("Script tags are not supported in control HTML.");
    }
  }

  function validateCustomCss(cssText) {
    if (!cssText.trim()) {
      return;
    }

    if (typeof window.CSSStyleSheet === "function") {
      var testSheet = new window.CSSStyleSheet();
      testSheet.replaceSync(cssText);
    }
  }

  function scopeCss(cssText, scopeSelector) {
    return String(cssText || "").replace(/(^|})\s*([^@{}][^{]*)\{/g, function (_, boundary, selectors) {
      var scopedSelectors = selectors.split(",").map(function (selector) {
        var trimmed = selector.trim();
        if (!trimmed) {
          return "";
        }
        if (trimmed.indexOf(scopeSelector) === 0) {
          return trimmed;
        }
        if (trimmed === "body" || trimmed === "html" || trimmed === ":root") {
          return scopeSelector;
        }
        return scopeSelector + " " + trimmed;
      }).filter(Boolean).join(", ");
      return boundary + " " + scopedSelectors + " {";
    });
  }

  function cssStringEscape(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function safeStyleText(cssText) {
    return String(cssText || "").replace(/<\s*\/\s*style/gi, "<\\/style");
  }

  function renderComponentErrorHtml(rootStyle, message) {
    return '<div class="preview-placeholder mockapp-render-error"' + rootStyle + '><strong>Render error</strong><div>' + utils.escapeHtml(message || "Invalid control HTML/CSS.") + '</div></div>';
  }

  function rootPlacementStyle(component) {
    var frame = component && component.frame;
    if (!frame) {
      return "";
    }

    var style = 'position:absolute;left:' + frame.x + 'px;top:' + frame.y + 'px;width:' + frame.width + 'px;min-height:' + frame.height + 'px;';
    var rotation = Number(component && component.props && component.props.rotation);
    if (Number.isFinite(rotation) && rotation !== 0) {
      style += 'transform: rotate(' + rotation + 'deg); transform-origin: 50% 50%;';
    }

    return ' style="' + style + '"';
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

  function inputAttributes(props) {
    var inputType = String(props.inputType || "text");
    var attributes = ' type="' + utils.escapeHtml(inputType) + '"';

    if (inputType !== "file" && props.placeholder) {
      attributes += ' placeholder="' + utils.escapeHtml(props.placeholder) + '"';
    }
    if (inputType !== "file" && props.value) {
      attributes += ' value="' + utils.escapeHtml(props.value) + '"';
    }
    if (props.required) {
      attributes += ' required="required"';
    }

    return attributes;
  }

  function navbarLinksHtml(props) {
    var links = splitLines(props.linksText || "");
    if (!links.length) {
      return "";
    }

    return '<ul class="navbar-nav ms-auto">' + links.map(function (link, index) {
      return '<li class="nav-item"><span class="nav-link' + (index === 0 ? ' active' : '') + '">' + utils.escapeHtml(link) + '</span></li>';
    }).join("") + '</ul>';
  }

  function breadcrumbHtml(props, rootStyle) {
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["Home", "Page"];
    }

    return '<nav aria-label="breadcrumb"' + rootStyle + '><ol class="breadcrumb mb-0">' + items.map(function (item, index) {
      var isLast = index === items.length - 1;
      if (isLast) {
        return '<li class="breadcrumb-item active" aria-current="page">' + utils.escapeHtml(item) + '</li>';
      }
      return '<li class="breadcrumb-item"><a href="#" onclick="return false;">' + utils.escapeHtml(item) + '</a></li>';
    }).join("") + '</ol></nav>';
  }

  function paginationHtml(props, rootStyle) {
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["Previous", "1", "2", "3", "Next"];
    }

    var sizeClass = props.size === "sm" ? " pagination-sm" : (props.size === "lg" ? " pagination-lg" : "");
    var alignClass = props.align === "center" ? " justify-content-center" : (props.align === "end" ? " justify-content-end" : " justify-content-start");
    var activeIndex = Math.max(1, Number(props.activeIndex) || 1);

    return '<nav aria-label="Pagination"' + rootStyle + '><ul class="pagination mb-0' + sizeClass + alignClass + '">' + items.map(function (item, index) {
      var isActive = index + 1 === activeIndex;
      return '<li class="page-item' + (isActive ? ' active' : '') + '"><a class="page-link" href="#" onclick="return false;">' + utils.escapeHtml(item) + '</a></li>';
    }).join("") + '</ul></nav>';
  }

  function progressHtml(props, rootStyle) {
    var value = Math.max(0, Math.min(100, Number(props.value) || 0));
    var barClass = 'progress-bar bg-' + utils.escapeHtml(props.variant || "primary") + (props.striped ? ' progress-bar-striped' : '') + (props.animated ? ' progress-bar-animated' : '');
    var label = props.showLabel ? utils.escapeHtml(props.label || (String(value) + "%")) : "";
    return '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + value + '"' + rootStyle + '><div class="' + barClass + '" style="width:' + value + '%">' + label + '</div></div>';
  }

  function spinnerHtml(props, rootStyle) {
    var typeClass = props.spinnerType === "grow" ? "spinner-grow" : "spinner-border";
    var sizeClass = props.size === "sm" ? " " + typeClass + "-sm" : "";
    var largeStyle = props.size === "lg" ? ' style="width:2.5rem;height:2.5rem;"' : "";
    var colorClass = ' text-' + utils.escapeHtml(props.variant || "primary");
    var label = utils.escapeHtml(props.label || "Loading...");
    var visibleLabel = props.showLabel ? '<span class="ms-2">' + label + '</span>' : "";
    return '<div class="d-inline-flex align-items-center"' + rootStyle + '><div class="' + typeClass + sizeClass + colorClass + '" role="status"' + largeStyle + '><span class="visually-hidden">' + label + '</span></div>' + visibleLabel + '</div>';
  }

  function figureHtml(props, rootStyle) {
    var imageInner = "";
    if (props.src) {
      imageInner = '<img class="mock-figure-image" src="' + utils.escapeHtml(props.src) + '" alt="' + utils.escapeHtml(props.alt || "") + '" style="display:block;width:100%;height:100%;min-height:inherit;object-fit:' + utils.escapeHtml(props.fit || "cover") + ';background:' + utils.escapeHtml(props.placeholderColor || "#d9e2f0") + ';" />';
    } else {
      imageInner = '<div class="mock-figure-placeholder" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:120px;background:' + utils.escapeHtml(props.placeholderColor || "#d9e2f0") + ';border:1px dashed rgba(87, 106, 132, 0.36);color:#49566d;font-size:0.84rem;">' + utils.escapeHtml(props.placeholderText || "Figure Placeholder") + '</div>';
    }
    return '<figure class="mock-figure mb-0"' + rootStyle + '>' + imageInner + '<figcaption class="figure-caption mt-2">' + utils.escapeHtml(props.caption || "") + '</figcaption></figure>';
  }

  function rectangleShapeHtml(component, props, rootStyle) {
    var viewport = resolveShapeViewport(component);
    var strokeWidth = sanitizeThickness(props.lineThickness, 2);
    var inset = strokeWidth / 2;
    var width = 100 - strokeWidth;
    var height = 100 - strokeWidth;
    return '<div class="mock-shape"' + rootStyle + '><svg viewBox="0 0 100 100" preserveAspectRatio="none" width="' + viewport.width + '" height="' + viewport.height + '" style="display:block;width:100%;height:100%;min-height:inherit;"><rect x="' + inset + '" y="' + inset + '" width="' + width + '" height="' + height + '" fill="' + escapeShapeColor(props.fillColor, "#dbeafe") + '" stroke="' + escapeShapeColor(props.borderColor, "#2563eb") + '" stroke-width="' + strokeWidth + '" /></svg></div>';
  }

  function circleShapeHtml(component, props, rootStyle) {
    var viewport = resolveShapeViewport(component);
    var strokeWidth = sanitizeThickness(props.lineThickness, 2);
    var radius = Math.max(0, 50 - strokeWidth / 2);
    return '<div class="mock-shape"' + rootStyle + '><svg viewBox="0 0 100 100" preserveAspectRatio="none" width="' + viewport.width + '" height="' + viewport.height + '" style="display:block;width:100%;height:100%;min-height:inherit;"><ellipse cx="50" cy="50" rx="' + radius + '" ry="' + radius + '" fill="' + escapeShapeColor(props.fillColor, "#dcfce7") + '" stroke="' + escapeShapeColor(props.borderColor, "#16a34a") + '" stroke-width="' + strokeWidth + '" /></svg></div>';
  }

  function triangleShapeHtml(component, props, rootStyle) {
    var viewport = resolveShapeViewport(component);
    var strokeWidth = sanitizeThickness(props.lineThickness, 2);
    return '<div class="mock-shape"' + rootStyle + '><svg viewBox="0 0 100 100" preserveAspectRatio="none" width="' + viewport.width + '" height="' + viewport.height + '" style="display:block;width:100%;height:100%;min-height:inherit;"><polygon points="50,4 96,96 4,96" fill="' + escapeShapeColor(props.fillColor, "#fef3c7") + '" stroke="' + escapeShapeColor(props.borderColor, "#d97706") + '" stroke-width="' + strokeWidth + '" stroke-linejoin="round" /></svg></div>';
  }

  function lineShapeHtml(component, props, rootStyle) {
    var viewport = resolveShapeViewport(component);
    var strokeWidth = sanitizeThickness(props.lineThickness, 1);
    var color = escapeShapeColor(props.borderColor, "#334155");
    var startX = percentToViewport(clampPercent(props.startX, 6), viewport.width);
    var startY = percentToViewport(clampPercent(props.startY, 50), viewport.height);
    var endX = percentToViewport(clampPercent(props.endX, 94), viewport.width);
    var endY = percentToViewport(clampPercent(props.endY, 50), viewport.height);
    var markerId = sanitizeMarkerId(String(component.id || "shape-line"));
    var startMarker = props.arrowStart ? ' marker-start="url(#' + markerId + '-start)"' : "";
    var endMarker = props.arrowEnd ? ' marker-end="url(#' + markerId + '-end)"' : "";
    var defs = "";

    if (props.arrowStart) {
      defs += '<marker id="' + markerId + '-start" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0,0 L0,8 L8,4 Z" fill="' + color + '" /></marker>';
    }
    if (props.arrowEnd) {
      defs += '<marker id="' + markerId + '-end" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L0,8 L8,4 Z" fill="' + color + '" /></marker>';
    }

    return '<div class="mock-shape"' + rootStyle + '><svg viewBox="0 0 ' + viewport.width + ' ' + viewport.height + '" width="' + viewport.width + '" height="' + viewport.height + '" style="display:block;width:100%;height:100%;min-height:inherit;overflow:visible;">' + (defs ? '<defs>' + defs + '</defs>' : '') + '<line x1="' + startX + '" y1="' + startY + '" x2="' + endX + '" y2="' + endY + '" stroke="' + color + '" stroke-width="' + strokeWidth + '" stroke-linecap="round"' + startMarker + endMarker + ' /></svg></div>';
  }

  function resolveShapeViewport(component) {
    var frame = component && component.frame ? component.frame : null;
    var width = frame ? Math.max(1, Math.round(Number(frame.width) || 100)) : 100;
    var height = frame ? Math.max(1, Math.round(Number(frame.height) || 100)) : 100;
    return { width: width, height: height };
  }

  function sanitizeThickness(value, fallback) {
    var next = Number(value);
    if (!Number.isFinite(next)) {
      return fallback;
    }
    return Math.max(0, Math.min(24, next));
  }

  function escapeShapeColor(value, fallback) {
    var color = String(value || fallback || "").trim();
    if (!color) {
      color = fallback || "#000000";
    }
    return utils.escapeHtml(color);
  }

  function sanitizeMarkerId(value) {
    return String(value || "shape").replace(/[^a-zA-Z0-9_-]/g, "-");
  }

  function clampPercent(value, fallback) {
    var next = Number(value);
    if (!Number.isFinite(next)) {
      next = fallback;
    }
    return Math.max(0, Math.min(100, next));
  }

  function percentToViewport(percent, size) {
    return Math.round((Math.max(0, Math.min(100, percent)) / 100) * Math.max(1, Number(size) || 1));
  }

  function tabsHtml(props, rootStyle, mode) {
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["First", "Second", "Third"];
    }

    var navClass = mode === "pills" ? "nav nav-pills" : "nav nav-tabs";
    if (props.fill) {
      navClass += " nav-fill";
    }
    if (props.justified) {
      navClass += " nav-justified";
    }

    var activeIndex = Math.max(1, Number(props.activeIndex) || 1);
    return '<ul class="' + navClass + '"' + rootStyle + '>' + items.map(function (item, index) {
      var isActive = index + 1 === activeIndex;
      return '<li class="nav-item"><a class="nav-link' + (isActive ? ' active' : '') + '" href="#" onclick="return false;">' + utils.escapeHtml(item) + '</a></li>';
    }).join("") + '</ul>';
  }

  function dropdownHtml(props, rootStyle, split) {
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["Action", "Another action", "Something else"];
    }

    var variant = utils.escapeHtml(props.variant || "secondary");
    if (!split) {
      return '<div class="dropdown"' + rootStyle + '><button class="btn btn-' + variant + ' dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">' + utils.escapeHtml(props.label || "Dropdown") + '</button><ul class="dropdown-menu">' + dropdownItemsHtml(items) + '</ul></div>';
    }

    return '<div class="btn-group"' + rootStyle + '><button type="button" class="btn btn-' + variant + '">' + utils.escapeHtml(props.label || "Actions") + '</button><button type="button" class="btn btn-' + variant + ' dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle Dropdown</span></button><ul class="dropdown-menu">' + dropdownItemsHtml(items) + '</ul></div>';
  }

  function dropdownItemsHtml(items) {
    return items.map(function (item) {
      return '<li><a class="dropdown-item" href="#" onclick="return false;">' + utils.escapeHtml(item) + '</a></li>';
    }).join("");
  }

  function offcanvasHtml(component, props, rootStyle) {
    var offcanvasId = "offcanvas-" + utils.escapeHtml(component.id || "panel");
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["Dashboard", "Projects", "Settings"];
    }

    return '<div' + rootStyle + '><button class="btn btn-outline-secondary" type="button" data-bs-toggle="offcanvas" data-bs-target="#' + offcanvasId + '" aria-controls="' + offcanvasId + '">' + utils.escapeHtml(props.buttonText || "Open Menu") + '</button><div class="offcanvas offcanvas-' + utils.escapeHtml(props.placement || "start") + '" tabindex="-1" id="' + offcanvasId + '" aria-labelledby="' + offcanvasId + '-label"><div class="offcanvas-header"><h5 class="offcanvas-title" id="' + offcanvasId + '-label">' + utils.escapeHtml(props.title || "Menu") + '</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body"><div class="list-group">' + items.map(function (item, index) {
      return '<a href="#" onclick="return false;" class="list-group-item list-group-item-action' + (index === 0 ? ' active' : '') + '">' + utils.escapeHtml(item) + '</a>';
    }).join("") + '</div></div></div></div>';
  }

  function listGroupHtml(props, rootStyle) {
    var items = splitLines(props.itemsText || "");
    if (!items.length) {
      items = ["First item", "Second item", "Third item"];
    }
    var activeIndex = Math.max(1, Number(props.activeIndex) || 1);
    var listTag = props.numbered ? "ol" : "ul";
    var classes = "list-group" + (props.flush ? " list-group-flush" : "");
    return '<' + listTag + ' class="' + classes + '"' + rootStyle + '>' + items.map(function (item, index) {
      return '<li class="list-group-item' + (index + 1 === activeIndex ? ' active' : '') + '">' + utils.escapeHtml(item) + '</li>';
    }).join("") + '</' + listTag + '>';
  }

  function toastHtml(props, rootStyle) {
    return '<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true"' + rootStyle + '><div class="toast-header"><strong class="me-auto">' + utils.escapeHtml(props.title || "Notification") + '</strong><small>' + utils.escapeHtml(props.timestamp || "just now") + '</small><button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button></div><div class="toast-body">' + utils.escapeHtml(props.message || "Task completed successfully.") + '</div></div>';
  }

  function placeholderHtml(props, rootStyle) {
    var rows = Math.max(1, Math.min(8, Number(props.rows) || 3));
    var wrapperClass = props.animated ? "placeholder-glow" : "";
    var widths = [100, 92, 84, 76, 68, 60, 52, 44];
    var lines = [];
    for (var i = 0; i < rows; i += 1) {
      lines.push('<span class="placeholder col-' + Math.max(2, Math.round(widths[i % widths.length] / 8)) + '"></span>');
    }
    return '<p class="' + wrapperClass + ' mb-0"' + rootStyle + '>' + lines.join("") + '</p>';
  }

  function accordionHtml(component, props, rootStyle) {
    var headers = splitLines(props.headersText || "");
    var bodies = splitLines(props.bodiesText || "");
    if (!headers.length) {
      headers = ["Section One", "Section Two"];
    }
    var accordionId = "accordion-" + utils.escapeHtml(component.id || "group");
    var classes = "accordion" + (props.flush ? " accordion-flush" : "");
    return '<div class="' + classes + '" id="' + accordionId + '"' + rootStyle + '>' + headers.map(function (header, index) {
      var itemId = accordionId + "-item-" + index;
      var collapseId = itemId + "-collapse";
      return '<div class="accordion-item"><h2 class="accordion-header" id="' + itemId + '-header"><button class="accordion-button' + (index ? ' collapsed' : '') + '" type="button" data-bs-toggle="collapse" data-bs-target="#' + collapseId + '" aria-expanded="' + (index === 0 ? "true" : "false") + '" aria-controls="' + collapseId + '">' + utils.escapeHtml(header) + '</button></h2><div id="' + collapseId + '" class="accordion-collapse collapse' + (index === 0 ? ' show' : '') + '" data-bs-parent="#' + accordionId + '"><div class="accordion-body">' + utils.escapeHtml(bodies[index] || "Content") + '</div></div></div>';
    }).join("") + '</div>';
  }

  function collapseHtml(component, props, rootStyle) {
    var collapseId = "collapse-" + utils.escapeHtml(component.id || "panel");
    return '<div' + rootStyle + '><p><button class="btn btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#' + collapseId + '" aria-expanded="' + (props.shown ? "true" : "false") + '" aria-controls="' + collapseId + '">' + utils.escapeHtml(props.buttonText || "Toggle details") + '</button></p><div class="collapse' + (props.shown ? ' show' : '') + '" id="' + collapseId + '"><div class="card card-body">' + utils.escapeHtml(props.content || "Hidden content") + '</div></div></div>';
  }

  function carouselHtml(component, props, rootStyle) {
    var slides = splitLines(props.slidesText || "");
    if (!slides.length) {
      slides = ["Slide One", "Slide Two", "Slide Three"];
    }
    var carouselId = "carousel-" + utils.escapeHtml(component.id || "deck");
    return '<div id="' + carouselId + '" class="carousel slide' + (props.dark ? ' carousel-dark' : '') + '" data-bs-ride="' + (props.autoPlay ? "carousel" : "false") + '"' + rootStyle + '><div class="carousel-indicators">' + slides.map(function (_, index) {
      return '<button type="button" data-bs-target="#' + carouselId + '" data-bs-slide-to="' + index + '"' + (index === 0 ? ' class="active" aria-current="true"' : "") + ' aria-label="Slide ' + (index + 1) + '"></button>';
    }).join("") + '</div><div class="carousel-inner">' + slides.map(function (slide, index) {
      return '<div class="carousel-item' + (index === 0 ? ' active' : '') + '"><div style="height:180px;display:flex;align-items:center;justify-content:center;background:' + (index % 2 ? '#e9ecef' : '#f8f9fa') + ';">' + utils.escapeHtml(slide) + '</div></div>';
    }).join("") + '</div><button class="carousel-control-prev" type="button" data-bs-target="#' + carouselId + '" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button><button class="carousel-control-next" type="button" data-bs-target="#' + carouselId + '" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button></div>';
  }

  function tooltipHtml(props, rootStyle) {
    return '<button type="button" class="btn btn-outline-secondary" data-bs-toggle="tooltip" data-bs-placement="' + utils.escapeHtml(props.placement || "top") + '" title="' + utils.escapeHtml(props.title || "Tooltip text") + '"' + rootStyle + '>' + utils.escapeHtml(props.buttonText || "Hover me") + '</button>';
  }

  function popoverHtml(props, rootStyle) {
    return '<button type="button" class="btn btn-outline-secondary" data-bs-toggle="popover" data-bs-placement="' + utils.escapeHtml(props.placement || "right") + '" title="' + utils.escapeHtml(props.title || "Popover title") + '" data-bs-content="' + utils.escapeHtml(props.content || "Popover body content.") + '"' + rootStyle + '>' + utils.escapeHtml(props.buttonText || "Show popover") + '</button>';
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
