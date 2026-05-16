(function() {
  "use strict";

  console.log("[GDE] streetview.js injected at document_start");

  let hideLabels = true;

  window.addEventListener("message", (evt) => {
    if (evt.data?.type !== "GEODUELS_ENHANCER_SETTINGS") return;
    hideLabels = evt.data.settings.hideRoadLabels !== false;
  });
  window.parent.postMessage({ type: "GEODUELS_ENHANCER_REQUEST_SETTINGS" }, "*");

  // Returns a blank transparent canvas matching given dimensions
  function blankCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width  = w || 1;
    c.height = h || 1;
    return c; // default is transparent
  }

  // Is this source likely a label texture?
  // Labels are rendered on wide (>=4:1) or tall-but-narrow sprite sheets
  function isLabelSource(source) {
    const w = source.naturalWidth  || source.videoWidth  || source.width;
    const h = source.naturalHeight || source.videoHeight || source.height;
    if (!w || !h) return false;
    const ratio = w / h;
    // 8:1 canvas labels (e.g. 1024x128) OR route shield atlases (often 512x512 or 256x256 but
    // we'll also catch them by checking if source is an <img> with a maps tile URL)
    if (ratio >= 4) {
      console.log("[GDE] flagged label texture:", w + "x" + h, "ratio:", ratio.toFixed(1), source.src || "canvas");
      return true;
    }
    // Also catch image atlases from Google's label tile servers
    if (source instanceof HTMLImageElement) {
      const src = source.src || "";
      if (
        src.includes("maps/vt") ||
        src.includes("mapsLabel") ||
        src.includes("label") ||
        src.includes("overlay")
      ) {
        console.log("[GDE] flagged label image:", src.slice(0, 80));
        return true;
      }
    }
    return false;
  }

  // ── Patch texImage2D ───────────────────────────────────────────────────────
  const origTexImage2D = WebGLRenderingContext.prototype.texImage2D;
  WebGLRenderingContext.prototype.texImage2D = function(target, level, internalformat, ...args) {
    if (hideLabels) {
      // Detect the overload: texImage2D(target, level, internalfmt, format, type, source)
      const source = args.length >= 3 && args[2] != null && typeof args[2] === "object" ? args[2]
                   : args.length >= 5 && args[4] != null && typeof args[4] === "object" ? args[4]
                   : null;

      if (source && isLabelSource(source)) {
        const w = source.naturalWidth || source.videoWidth || source.width || 1;
        const h = source.naturalHeight || source.videoHeight || source.height || 1;
        const blank = blankCanvas(w, h);
        // Replace the source with a blank canvas in args
        if (args.length >= 3 && typeof args[2] === "object") args[2] = blank;
        else if (args.length >= 5 && typeof args[4] === "object") args[4] = blank;
      }
    }
    return origTexImage2D.call(this, target, level, internalformat, ...args);
  };

  // ── Patch texSubImage2D (Google updates existing textures per frame) ────────
  const origTexSubImage2D = WebGLRenderingContext.prototype.texSubImage2D;
  WebGLRenderingContext.prototype.texSubImage2D = function(target, level, xoffset, yoffset, ...args) {
    if (hideLabels) {
      const source = args.length >= 3 && typeof args[2] === "object" ? args[2]
                   : args.length >= 5 && typeof args[4] === "object" ? args[4]
                   : null;

      if (source && isLabelSource(source)) {
        const w = source.naturalWidth || source.videoWidth || source.width || 1;
        const h = source.naturalHeight || source.videoHeight || source.height || 1;
        const blank = blankCanvas(w, h);
        if (args.length >= 3 && typeof args[2] === "object") args[2] = blank;
        else if (args.length >= 5 && typeof args[4] === "object") args[4] = blank;
      }
    }
    return origTexSubImage2D.call(this, target, level, xoffset, yoffset, ...args);
  };

  console.log("[GDE] WebGLRenderingContext prototype patched");

})();
