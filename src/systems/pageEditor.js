const storageKey = "plant-english-defense.page-editor.v1";

const autoTargets = [
  [".page-shell", "page"],
  [".page-content", "content"],
  [".page-bg-decor, .yard-home-bg, .level-select-bg, .stickerbook-bg", "background"],
  [".yard-audio-toggle, .yard-encourage, .yard-next-panel, .yard-primary-action, .yard-guard-btn, .yard-secondary-actions, .yard-map-btn, .yard-sticker-btn, .yard-status-panel", "home ui"],
  [".yard-object, .yard-shadow", "home asset"],
  [".level-back-btn, .level-title-panel, .level-hint-panel, .level-board, .level-card-grid-fixed, .level-select-card, .level-number, .level-topic, .level-flag, .level-lock, .level-reward-badge", "level ui"],
  [".battle-topbar, .battle-topbar-title, .unified-progress, .unified-level-flow, .memory-prompt-panel, .memory-card-row, .memory-choice-card", "battle ui"],
  [".memory-choice-card img, .memory-choice-card strong", "memory card"],
  [".comic-phase, .comic-grid, .comic-cell, .comic-phase p", "comic"],
  [".defense-yard, .defense-sky, .defense-plant, .defense-zombie, .defense-projectile, .defense-sun-row, .defense-speak-panel, .task-button-row", "defense"],
  [".mdd-screen, .mdd-loading-copy, .mdd-load-ill, .mdd-load-panel, .mdd-top-hud, .mdd-context-panel, .mdd-card-row, .mdd-learn-card, .mdd-bottom-actions, .mdd-comic-strip, .mdd-comic-panel, .mdd-comic-caption, .mdd-yard-hud, .mdd-speak-panel, .mdd-yard-field, .mdd-slots, .mdd-slot, .mdd-sprite, .mdd-projectile, .mdd-sun-fly, .mdd-yard-actions, .mdd-result-panel, .mdd-result-stats, .mdd-result-actions", "mdd battle"],
  [".feedback-bar, .feedback-bar strong, .feedback-bar p", "feedback"],
  [".cmp-speak-modal, .speak-modal-card, .speak-sentence, .speak-status-badge, .modal-button-row, .modal-action-button", "speak modal"],
  [".result-panel, .result-summary, .result-actions, .reward-stage, .reward-modal, .reward-modal-panel, .reward-modal-title, .reward-modal-cards, .reward-modal-card, .reward-card-art, .reward-confirm-btn", "reward ui"],
  [".stickerbook-back-btn, .stickerbook-title, .stickerbook-hint, .stickerbook-panel, .stickerbook-grid, .stickerbook-slot, .stickerbook-art, .stickerbook-level, .stickerbook-new-badge", "sticker ui"],
  ["button, h1, h2, h3, p, span, strong, em, img", "element"],
];

function readHashParams() {
  const query = window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
  return new URLSearchParams(query);
}

function isEditorEnabled() {
  const search = new URLSearchParams(window.location.search);
  const hash = readHashParams();
  return search.get("edit") === "1" || hash.get("edit") === "1";
}

function loadOverrides() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  window.localStorage.setItem(storageKey, JSON.stringify(overrides));
}

function percent(value, total) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(3));
}

function px(value) {
  return `${Number(value.toFixed(2))}px`;
}

function readNumber(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function escapeSelector(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}

function getEditId(node) {
  return node?.dataset?.editId || "";
}

function getLabel(node) {
  return node?.dataset?.editLabel || getEditId(node) || "Nothing selected";
}

function getFrame() {
  return document.querySelector(".app-frame") || document.body;
}

function getPositionParent(node) {
  if (!node || node === document.body) return getFrame();
  return node.parentElement || getFrame();
}

function ensurePositionParent(node) {
  const parent = getPositionParent(node);
  if (parent && parent !== document.body && window.getComputedStyle(parent).position === "static") {
    parent.style.position = "relative";
  }
  return parent;
}

function rectToOverride(node) {
  const parent = ensurePositionParent(node);
  const parentRect = parent.getBoundingClientRect();
  const rect = node.getBoundingClientRect();
  return {
    left: percent(rect.left - parentRect.left, parentRect.width),
    top: percent(rect.top - parentRect.top, parentRect.height),
    width: percent(rect.width, parentRect.width),
    height: percent(rect.height, parentRect.height),
  };
}

function getTextTarget(node) {
  if (!node || node.matches("img, video, canvas, svg")) return null;
  if (node.dataset.editText === "true") return node;
  const editableChild = node.querySelector(":scope > [data-edit-text='true']");
  if (editableChild) return editableChild;
  if (node.children.length === 0 && node.textContent.trim()) return node;
  if (node.children.length === 1 && node.firstElementChild.children.length === 0) {
    return node.firstElementChild;
  }
  const simpleChild = node.querySelector(":scope > span, :scope > strong, :scope > em, :scope > p, :scope > h1, :scope > h2, :scope > h3");
  return simpleChild?.children.length === 0 ? simpleChild : null;
}

function slugClass(node) {
  const className = String(node.className || "")
    .split(/\s+/)
    .find(Boolean);
  return (className || node.tagName.toLowerCase()).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function decorateAutoTargets(root) {
  const page = root.querySelector("[data-page]")?.dataset.page || "page";
  const usedIds = new Set(Array.from(root.querySelectorAll("[data-edit-id]")).map((node) => node.dataset.editId));
  autoTargets.forEach(([selector, label]) => {
    root.querySelectorAll(selector).forEach((node, index) => {
      if (node.dataset.editId) return;
      let id = `${page}-${slugClass(node)}-${index + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${page}-${slugClass(node)}-${index + 1}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);
      node.dataset.editId = id;
      node.dataset.editLabel = `${label} ${index + 1}`;
      if (
        !node.dataset.editText &&
        !node.matches("img, video, canvas, svg") &&
        node.children.length === 0 &&
        node.textContent.trim()
      ) {
        node.dataset.editText = "true";
      }
    });
  });
}

function applyOverride(node, override) {
  if (!node || !override) return;

  if (
    override.left !== undefined ||
    override.top !== undefined ||
    override.width !== undefined ||
    override.height !== undefined
  ) {
    ensurePositionParent(node);
    node.style.position = "absolute";
    node.style.transform = "none";
    node.style.zIndex = override.zIndex || "30";
  }

  if (override.left !== undefined) node.style.left = `${override.left}%`;
  if (override.top !== undefined) node.style.top = `${override.top}%`;
  if (override.width !== undefined) node.style.width = `${override.width}%`;
  if (override.height !== undefined) node.style.height = `${override.height}%`;
  if (override.fontSize) node.style.fontSize = override.fontSize;
  if (override.backgroundSrc) {
    node.style.backgroundImage = `url("${override.backgroundSrc}")`;
    node.style.backgroundSize = "contain";
    node.style.backgroundRepeat = "no-repeat";
    node.style.backgroundPosition = "center";
  }
  if (override.imageSrc && node.matches("img")) node.src = override.imageSrc;
  if (override.text !== undefined) {
    const target = getTextTarget(node);
    if (target) target.textContent = override.text;
  }
}

function createPanel() {
  const panel = document.createElement("aside");
  panel.className = "page-editor-panel";
  panel.innerHTML = `
    <div class="page-editor-head">
      <strong>Page Editor</strong>
      <span>Select, drag, resize, replace art, and edit text.</span>
    </div>
    <div class="page-editor-current" data-editor-current>Nothing selected</div>
    <label>
      Text
      <textarea data-editor-field="text" rows="2" placeholder="Select a text element first"></textarea>
    </label>
    <div class="page-editor-grid">
      <label>Font px<input data-editor-field="fontSize" type="number" min="8" max="120" step="1" /></label>
      <label>Left %<input data-editor-field="left" type="number" step="0.1" /></label>
      <label>Top %<input data-editor-field="top" type="number" step="0.1" /></label>
      <label>Width %<input data-editor-field="width" type="number" step="0.1" /></label>
      <label>Height %<input data-editor-field="height" type="number" step="0.1" /></label>
    </div>
    <div class="page-editor-actions">
      <button type="button" data-editor-action="apply-size">Apply values</button>
      <button type="button" data-editor-action="upload-image">Upload image</button>
      <button type="button" data-editor-action="upload-bg">Upload bg</button>
      <button type="button" data-editor-action="reset-selected">Reset selected</button>
      <button type="button" data-editor-action="reset-all">Reset all</button>
      <button type="button" data-editor-action="export-json">Export JSON</button>
      <button type="button" data-editor-action="import-json">Import JSON</button>
    </div>
    <textarea class="page-editor-json" data-editor-field="json" rows="4" placeholder="JSON appears here"></textarea>
    <p class="page-editor-status" data-editor-status>Changes are saved in this browser.</p>
    <input data-editor-file="image" type="file" accept="image/*" hidden />
    <input data-editor-file="json" type="file" accept="application/json,.json" hidden />
  `;
  return panel;
}

function createOutline() {
  const outline = document.createElement("div");
  outline.className = "page-editor-outline hidden";
  outline.innerHTML = `<span data-editor-resize-handle></span>`;
  return outline;
}

export function createPageEditor(root) {
  const enabled = isEditorEnabled();
  const editor = {
    enabled,
    root,
    panel: null,
    outline: null,
    overrides: loadOverrides(),
    selectedId: "",
    selectedNode: null,
    mode: "",
    pointerId: null,
    start: null,
    uploadMode: "image",
  };

  function setStatus(message) {
    const status = editor.panel?.querySelector("[data-editor-status]");
    if (status) status.textContent = message;
  }

  function getOverride(id = editor.selectedId) {
    if (!id) return null;
    editor.overrides[id] = editor.overrides[id] || {};
    return editor.overrides[id];
  }

  function persist() {
    saveOverrides(editor.overrides);
  }

  function findNode(id = editor.selectedId) {
    if (!id) return null;
    return editor.root.querySelector(`[data-edit-id="${escapeSelector(id)}"]`);
  }

  function updateOutline() {
    if (!editor.outline) return;
    const node = editor.selectedNode;
    if (!node || !document.body.contains(node)) {
      editor.outline.classList.add("hidden");
      return;
    }
    const rect = node.getBoundingClientRect();
    editor.outline.classList.remove("hidden");
    editor.outline.style.left = px(rect.left);
    editor.outline.style.top = px(rect.top);
    editor.outline.style.width = px(rect.width);
    editor.outline.style.height = px(rect.height);
  }

  function syncPanel() {
    if (!editor.panel) return;
    const node = editor.selectedNode;
    const current = editor.panel.querySelector("[data-editor-current]");
    const textField = editor.panel.querySelector("[data-editor-field='text']");
    const fontField = editor.panel.querySelector("[data-editor-field='fontSize']");
    const leftField = editor.panel.querySelector("[data-editor-field='left']");
    const topField = editor.panel.querySelector("[data-editor-field='top']");
    const widthField = editor.panel.querySelector("[data-editor-field='width']");
    const heightField = editor.panel.querySelector("[data-editor-field='height']");
    const override = getOverride();
    const textTarget = getTextTarget(node);

    current.textContent = node ? getLabel(node) : "Nothing selected";
    textField.disabled = !textTarget;
    textField.value = textTarget ? textTarget.textContent.trim() : "";

    if (node) {
      const geometry = { ...rectToOverride(node), ...override };
      fontField.value = Number.parseFloat(override?.fontSize || window.getComputedStyle(node).fontSize) || "";
      leftField.value = geometry.left ?? "";
      topField.value = geometry.top ?? "";
      widthField.value = geometry.width ?? "";
      heightField.value = geometry.height ?? "";
    } else {
      [fontField, leftField, topField, widthField, heightField].forEach((field) => {
        field.value = "";
      });
    }
  }

  function selectNode(node) {
    if (!node) return;
    editor.selectedNode = node;
    editor.selectedId = getEditId(node);
    document.querySelectorAll(".is-page-editor-selected").forEach((item) => item.classList.remove("is-page-editor-selected"));
    node.classList.add("is-page-editor-selected");
    applyOverride(node, getOverride());
    syncPanel();
    updateOutline();
  }

  function applyAll() {
    if (!editor.enabled) return;
    decorateAutoTargets(editor.root);
    editor.root.querySelectorAll("[data-edit-id]").forEach((node) => {
      applyOverride(node, editor.overrides[getEditId(node)]);
    });
    if (editor.selectedId) {
      const node = findNode();
      if (node) selectNode(node);
    }
  }

  function writeGeometryFromInputs() {
    const node = editor.selectedNode;
    const override = getOverride();
    if (!node || !override) return;
    ["left", "top", "width", "height"].forEach((field) => {
      const value = readNumber(editor.panel.querySelector(`[data-editor-field='${field}']`).value);
      if (value !== null) override[field] = value;
    });
    const fontSize = readNumber(editor.panel.querySelector("[data-editor-field='fontSize']").value);
    if (fontSize !== null) override.fontSize = `${fontSize}px`;
    applyOverride(node, override);
    persist();
    updateOutline();
    setStatus("Values applied.");
  }

  function resetSelected() {
    if (!editor.selectedId) return;
    delete editor.overrides[editor.selectedId];
    persist();
    setStatus("Selected item reset. Refresh or switch pages to see the original.");
  }

  function resetAll() {
    editor.overrides = {};
    persist();
    setStatus("All editor changes cleared. Refresh to see the original.");
  }

  function importJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        editor.overrides = JSON.parse(String(reader.result || "{}"));
        persist();
        applyAll();
        editor.panel.querySelector("[data-editor-field='json']").value = JSON.stringify(editor.overrides, null, 2);
        setStatus("JSON imported.");
      } catch {
        setStatus("Import failed: invalid JSON.");
      }
    };
    reader.readAsText(file);
  }

  function uploadImage(file) {
    const node = editor.selectedNode;
    const override = getOverride();
    if (!file || !node || !override) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      if (editor.uploadMode === "background" || !node.matches("img")) {
        override.backgroundSrc = src;
      } else {
        override.imageSrc = src;
      }
      applyOverride(node, override);
      persist();
      updateOutline();
      setStatus("Asset uploaded and saved locally.");
    };
    reader.readAsDataURL(file);
  }

  function startMove(event, node) {
    const override = getOverride(getEditId(node));
    Object.assign(override, rectToOverride(node));
    applyOverride(node, override);
    persist();

    const parent = getPositionParent(node);
    const parentRect = parent.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    editor.start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      parentRect,
      leftPx: rect.left - parentRect.left,
      topPx: rect.top - parentRect.top,
      widthPx: rect.width,
      heightPx: rect.height,
    };
    editor.mode = "move";
    editor.pointerId = event.pointerId;
  }

  function startResize(event) {
    const node = editor.selectedNode;
    if (!node) return;
    const parent = getPositionParent(node);
    const parentRect = parent.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    editor.start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      parentRect,
      leftPx: rect.left - parentRect.left,
      topPx: rect.top - parentRect.top,
      widthPx: rect.width,
      heightPx: rect.height,
    };
    editor.mode = "resize";
    editor.pointerId = event.pointerId;
  }

  function onPointerDown(event) {
    if (!editor.enabled || editor.panel?.contains(event.target)) return;
    if (event.target.closest("[data-editor-resize-handle]")) {
      event.preventDefault();
      event.stopPropagation();
      startResize(event);
      return;
    }
    const node = event.target.closest("[data-edit-id]");
    if (!node || !editor.root.contains(node)) return;
    event.preventDefault();
    event.stopPropagation();
    selectNode(node);
    startMove(event, node);
  }

  function onPointerMove(event) {
    if (!editor.mode || event.pointerId !== editor.pointerId || !editor.selectedNode || !editor.start) return;
    event.preventDefault();
    const override = getOverride();
    const dx = event.clientX - editor.start.pointerX;
    const dy = event.clientY - editor.start.pointerY;

    if (editor.mode === "move") {
      override.left = percent(editor.start.leftPx + dx, editor.start.parentRect.width);
      override.top = percent(editor.start.topPx + dy, editor.start.parentRect.height);
    } else if (editor.mode === "resize") {
      override.width = percent(Math.max(20, editor.start.widthPx + dx), editor.start.parentRect.width);
      override.height = percent(Math.max(20, editor.start.heightPx + dy), editor.start.parentRect.height);
    }

    applyOverride(editor.selectedNode, override);
    persist();
    syncPanel();
    updateOutline();
  }

  function onPointerUp(event) {
    if (event.pointerId !== editor.pointerId) return;
    editor.mode = "";
    editor.pointerId = null;
    editor.start = null;
  }

  function bindPanel() {
    editor.panel.addEventListener("click", (event) => {
      const button = event.target.closest("[data-editor-action]");
      if (!button) return;
      const action = button.dataset.editorAction;
      if (action === "apply-size") writeGeometryFromInputs();
      if (action === "upload-image") {
        editor.uploadMode = "image";
        editor.panel.querySelector("[data-editor-file='image']").click();
      }
      if (action === "upload-bg") {
        editor.uploadMode = "background";
        editor.panel.querySelector("[data-editor-file='image']").click();
      }
      if (action === "reset-selected") resetSelected();
      if (action === "reset-all") resetAll();
      if (action === "export-json") {
        const text = JSON.stringify(editor.overrides, null, 2);
        editor.panel.querySelector("[data-editor-field='json']").value = text;
        setStatus("JSON exported to the text box.");
      }
      if (action === "import-json") editor.panel.querySelector("[data-editor-file='json']").click();
    });

    editor.panel.querySelector("[data-editor-field='text']").addEventListener("input", (event) => {
      const node = editor.selectedNode;
      const target = getTextTarget(node);
      const override = getOverride();
      if (!target || !override) return;
      override.text = event.target.value;
      target.textContent = event.target.value;
      persist();
      updateOutline();
    });

    editor.panel.querySelector("[data-editor-field='fontSize']").addEventListener("input", (event) => {
      const node = editor.selectedNode;
      const override = getOverride();
      const value = readNumber(event.target.value);
      if (!node || !override || value === null) return;
      override.fontSize = `${value}px`;
      applyOverride(node, override);
      persist();
      updateOutline();
    });

    editor.panel.querySelector("[data-editor-file='image']").addEventListener("change", (event) => {
      uploadImage(event.target.files?.[0]);
      event.target.value = "";
    });

    editor.panel.querySelector("[data-editor-file='json']").addEventListener("change", (event) => {
      importJson(event.target.files?.[0]);
      event.target.value = "";
    });
  }

  function mount() {
    if (!editor.enabled || editor.panel) return;
    document.body.classList.add("page-editor-enabled");
    editor.panel = createPanel();
    editor.outline = createOutline();
    document.body.append(editor.panel, editor.outline);
    bindPanel();
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("resize", updateOutline);
    setStatus("Edit mode is enabled by ?edit=1.");
  }

  mount();

  return {
    enabled,
    apply: applyAll,
    refresh() {
      if (!editor.enabled) return;
      if (editor.selectedId) editor.selectedNode = findNode();
      syncPanel();
      updateOutline();
    },
  };
}
