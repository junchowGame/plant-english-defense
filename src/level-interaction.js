const ASSET = "./public/assets/level-interaction";

const targets = [
  {
    id: "hello",
    label: "Hello",
    say: "Hello!",
    img: `${ASSET}/art/art_learn_l01_hello_001.png`,
  },
  {
    id: "hi",
    label: "Hi",
    say: "Hi!",
    img: `${ASSET}/art/art_learn_l01_hi_001.png`,
  },
  {
    id: "good-morning",
    label: "Good morning",
    say: "Good morning!",
    img: `${ASSET}/art/art_learn_l01_good_morning_001.png`,
  },
];

const spriteAssets = {
  "peashooter-idle": `${ASSET}/actions/ani_peashooter_idle_001.png`,
  "peashooter-spawn": `${ASSET}/actions/ani_peashooter_spawn_001.png`,
  "peashooter-planted": `${ASSET}/actions/ani_peashooter_planted_001.png`,
  "peashooter-attack": `${ASSET}/actions/ani_peashooter_attack_001.png`,
  "peashooter-win": `${ASSET}/actions/ani_peashooter_result_win_001.png`,
  "bucket-spawn": `${ASSET}/actions/ani_bucket_zombie_spawn_stumble_001.png`,
  "bucket-idle": `${ASSET}/actions/ani_bucket_zombie_idle_wait_001.png`,
  "bucket-walk": `${ASSET}/actions/ani_bucket_zombie_slow_walk_001.png`,
  "bucket-surprised": `${ASSET}/actions/ani_bucket_zombie_surprised_001.png`,
  "bucket-hit": `${ASSET}/actions/ani_bucket_zombie_hit_bucket_001.png`,
  "bucket-shoes": `${ASSET}/actions/ani_bucket_zombie_hit_shoes_001.png`,
  "bucket-pants": `${ASSET}/actions/ani_bucket_zombie_hit_pants_001.png`,
  "bucket-retreat": `${ASSET}/actions/ani_bucket_zombie_retreat_slide_001.png`,
};

const state = {
  screen: "loading",
  clickRound: 0,
  clickAttempts: 0,
  clickFirstTryCorrect: 0,
  clickMistakesThisRound: 0,
  clickLocked: false,
  speakCount: 0,
  sun: 0,
  planted: false,
  micReady: false,
  recordingSince: 0,
  dragOffset: { x: 0, y: 0 },
};

const editor = {
  enabled: new URLSearchParams(window.location.search).has("edit"),
  selected: null,
  mode: null,
  pointerId: null,
  start: null,
  panel: null,
  outline: null,
  fileInput: null,
  overrides: {},
  storageKey: "plant-english-defense.level-interaction.editor.v1",
};

const clickSequence = ["hello", "hi", "good-morning", "hello", "good-morning", "hi"];
const yardSequence = ["hello", "hi", "good-morning", "hello", "good-morning"];

const el = {
  screens: [...document.querySelectorAll(".screen")],
  loadFill: document.querySelector("#loadFill"),
  clickPrompt: document.querySelector("#clickPrompt"),
  clickRound: document.querySelector("#clickRound"),
  cardRow: document.querySelector("#cardRow"),
  yardPrompt: document.querySelector("#yardPrompt"),
  yardHint: document.querySelector("#yardHint"),
  yardField: document.querySelector("#yardField"),
  slots: document.querySelector("#slots"),
  plant: document.querySelector("#plantSprite"),
  zombie: document.querySelector("#zombieSprite"),
  projectile: document.querySelector("#projectile"),
  sunFly: document.querySelector("#sunFly"),
  sunCount: document.querySelector("#sunCount"),
  speakCount: document.querySelector("#speakCount"),
  mic: document.querySelector("#micBtn"),
  resultSun: document.querySelector("#resultSun"),
  resultClickRate: document.querySelector("#resultClickRate"),
  pauseModal: document.querySelector("#pauseModal"),
  toast: document.querySelector("#toast"),
};

function targetById(id) {
  return targets.find((item) => item.id === id);
}

function showScreen(name) {
  state.screen = name;
  el.screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  if (name === "comic") {
    restartComicPanels();
  }
  updateEditorScreenControls();
  queueEditorOutlineUpdate();
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => el.toast.classList.add("hidden"), 1600);
}

function safeCssSize(value) {
  if (typeof value !== "string") return "";
  if (!/^\d+(\.\d+)?(px|%|vw|vh|vmin|vmax|rem|em)$/.test(value.trim())) return "";
  return value.trim();
}

function loadEditorOverrides() {
  try {
    const raw = window.localStorage.getItem(editor.storageKey);
    editor.overrides = raw ? JSON.parse(raw) : {};
  } catch {
    editor.overrides = {};
  }
}

function saveEditorOverrides() {
  try {
    window.localStorage.setItem(editor.storageKey, JSON.stringify(editor.overrides));
  } catch {
    showToast("资源太大，浏览器本地保存失败");
  }
}

function editableNodes() {
  return [...document.querySelectorAll("[data-edit-id]")];
}

function applyOneEditorOverride(node) {
  const override = editor.overrides[node.dataset.editId];
  if (!override) return;

  if (override.left) {
    node.style.position = "absolute";
    node.style.left = override.left;
    node.style.top = override.top;
    node.style.right = "auto";
    node.style.bottom = "auto";
    node.style.transform = "none";
  }

  if (override.width) node.style.width = override.width;
  if (override.height) node.style.height = override.height;
  if (override.fontSize) node.style.fontSize = override.fontSize;
  if ("text" in override && node.children.length === 0) node.textContent = override.text;

  if (override.imageSrc && node instanceof HTMLImageElement) {
    node.src = override.imageSrc;
  }

  if (override.backgroundSrc) {
    node.style.backgroundImage = `url("${override.backgroundSrc}")`;
    node.style.backgroundSize = "100% 100%";
    node.style.backgroundRepeat = "no-repeat";
    node.style.backgroundPosition = "center";
  }
}

function applyEditorOverrides(root = document) {
  if (!editor.enabled) return;
  root.querySelectorAll?.("[data-edit-id]").forEach(applyOneEditorOverride);
  queueEditorOutlineUpdate();
}

function editorIdLabel(node) {
  return node?.dataset?.editId || "未选择";
}

function selectedOverride() {
  if (!editor.selected) return null;
  const id = editor.selected.dataset.editId;
  editor.overrides[id] ||= {};
  return editor.overrides[id];
}

function appRect() {
  return document.querySelector("#app").getBoundingClientRect();
}

function rectToPercent(rect) {
  const reference = editor.selected?.offsetParent?.getBoundingClientRect?.() || appRect();
  return {
    left: `${(((rect.left - reference.left) / reference.width) * 100).toFixed(3)}%`,
    top: `${(((rect.top - reference.top) / reference.height) * 100).toFixed(3)}%`,
    width: `${((rect.width / reference.width) * 100).toFixed(3)}%`,
    height: `${((rect.height / reference.height) * 100).toFixed(3)}%`,
  };
}

function setSelectedNode(node) {
  if (!editor.enabled || !node) return;
  editor.selected?.classList.remove("editor-selected");
  editor.selected = node;
  editor.selected.classList.add("editor-selected");
  syncEditorPanel();
  queueEditorOutlineUpdate();
}

function syncEditorPanel() {
  if (!editor.panel || !editor.selected) return;
  const override = selectedOverride();
  const textInput = editor.panel.querySelector("[data-editor-field='text']");
  const sizeInput = editor.panel.querySelector("[data-editor-field='fontSize']");
  const targetName = editor.panel.querySelector("[data-editor-target]");
  const resetButton = editor.panel.querySelector("[data-editor-reset-target]");
  targetName.textContent = editorIdLabel(editor.selected);
  textInput.value = editor.selected.children.length === 0 ? editor.selected.textContent.trim() : "";
  textInput.disabled = editor.selected.children.length > 0;
  sizeInput.value = parseFloat(override.fontSize || getComputedStyle(editor.selected).fontSize) || "";
  resetButton.disabled = !editor.overrides[editor.selected.dataset.editId];
}

function queueEditorOutlineUpdate() {
  if (!editor.enabled) return;
  window.requestAnimationFrame(updateEditorOutline);
}

function updateEditorOutline() {
  if (!editor.outline || !editor.selected || !editor.selected.isConnected) return;
  const rect = editor.selected.getBoundingClientRect();
  const app = appRect();
  editor.outline.classList.toggle("hidden", rect.width <= 0 || rect.height <= 0);
  editor.outline.style.left = `${rect.left - app.left}px`;
  editor.outline.style.top = `${rect.top - app.top}px`;
  editor.outline.style.width = `${rect.width}px`;
  editor.outline.style.height = `${rect.height}px`;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    showToast(text);
    return Promise.resolve();
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace("!", ""));
  utterance.lang = "en-US";
  utterance.rate = 0.82;
  utterance.pitch = 1.1;

  return new Promise((resolve) => {
    utterance.onend = resolve;
    utterance.onerror = resolve;
    window.speechSynthesis.speak(utterance);
  });
}

function shuffleItems(items) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function startLoading() {
  let progress = 12;
  const timer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.floor(Math.random() * 14) + 8);
    el.loadFill.style.width = `${progress}%`;
    if (progress >= 100) {
      window.clearInterval(timer);
    }
  }, 280);
}

function startClickGame() {
  state.clickRound = 0;
  state.clickAttempts = 0;
  state.clickFirstTryCorrect = 0;
  state.clickMistakesThisRound = 0;
  showScreen("click");
  renderClickRound();
}

function renderClickRound() {
  state.clickLocked = true;
  state.clickMistakesThisRound = 0;
  const current = targetById(clickSequence[state.clickRound]);
  el.clickRound.textContent = String(state.clickRound + 1);
  el.clickPrompt.textContent = "听声音，选择图片";
  el.cardRow.innerHTML = "";

  shuffleItems(targets).forEach((target, index) => {
    const card = document.createElement("button");
    card.className = "learn-card";
    card.style.animationDelay = `${index * 70}ms`;
    card.dataset.id = target.id;
    card.dataset.editId = `click-card-${target.id}`;
    card.innerHTML = `<img data-edit-id="click-card-${target.id}-image" src="${target.img}" alt="${target.label}" /><span data-edit-id="click-card-${target.id}-label">${target.label}</span>`;
    card.addEventListener("click", () => chooseCard(target.id));
    el.cardRow.append(card);
  });
  applyEditorOverrides(el.cardRow);

  window.setTimeout(async () => {
    await speak(current.say);
    state.clickLocked = false;
    el.clickPrompt.textContent = `Choose: ${current.label}`;
    applyEditorOverrides(document);
  }, 420);
}

async function chooseCard(id) {
  if (state.clickLocked) return;

  const correct = clickSequence[state.clickRound];
  const chosen = el.cardRow.querySelector(`[data-id="${id}"]`);
  const correctCard = el.cardRow.querySelector(`[data-id="${correct}"]`);
  state.clickAttempts += 1;
  state.clickLocked = true;

  if (id === correct) {
    if (state.clickMistakesThisRound === 0) {
      state.clickFirstTryCorrect += 1;
    }
    chosen.classList.add("correct");
    await wait(900);
    state.clickRound += 1;
    if (state.clickRound >= clickSequence.length) {
      completeClickGame();
    } else {
      renderClickRound();
    }
    return;
  }

  state.clickMistakesThisRound += 1;
  chosen.classList.add("wrong");
  correctCard.classList.add("correct");
  await wait(700);
  chosen.classList.remove("wrong");
  correctCard.classList.remove("correct");

  if (state.clickMistakesThisRound % 5 === 0) {
    correctCard.classList.add("hint");
    await wait(1900);
    correctCard.classList.remove("hint");
  }

  await speak(targetById(correct).say);
  renderClickRound();
}

async function completeClickGame() {
  el.clickPrompt.textContent = "做得好！";
  applyEditorOverrides(document);
  [...el.cardRow.children].forEach((card) => card.classList.add("correct"));
  await wait(1300);
  showScreen("comic");
  window.setTimeout(() => {
    if (state.screen === "comic") startYard();
  }, 3300);
}

function restartComicPanels() {
  document.querySelectorAll(".comic-panel").forEach((panel) => {
    panel.style.animation = "none";
    void panel.offsetWidth;
    panel.style.animation = "";
  });
}

function startYard() {
  showScreen("yard");
  state.speakCount = 0;
  state.sun = 0;
  state.planted = false;
  updateYardHud();
  setupSlots();
  setSprite(el.zombie, "bucket-spawn");
  el.zombie.classList.add("entering");
  el.plant.className = "sprite plant-sprite hidden";
  el.plant.style.left = "";
  el.plant.style.top = "";
  el.plant.style.bottom = "";
  setMicReady(false);
  el.yardPrompt.textContent = "僵尸走进来了";
  el.yardHint.textContent = "等它站稳，再开始跟读。";
  applyEditorOverrides(document);

  window.setTimeout(() => {
    el.zombie.classList.remove("entering");
    setSprite(el.zombie, "bucket-idle");
    prepareYardPrompt();
  }, 1500);
}

function setupSlots() {
  el.slots.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.slot = String(i);
    slot.dataset.editId = `yard-slot-${i + 1}`;
    el.slots.append(slot);
  }
  applyEditorOverrides(el.slots);
}

function updateYardHud() {
  el.sunCount.textContent = String(state.sun);
  el.speakCount.textContent = String(state.speakCount);
}

async function prepareYardPrompt() {
  setMicReady(false);
  const current = targetById(yardSequence[state.speakCount]);
  el.yardPrompt.textContent = `Say: ${current.label}!`;
  el.yardHint.textContent = "听完后按住麦克风说一遍。";
  applyEditorOverrides(document);
  await speak(current.say);
  if (state.screen !== "yard") return;
  setMicReady(true);
  el.yardHint.textContent = "按住麦克风，说完再松手。";
  applyEditorOverrides(document);
}

function setMicReady(ready) {
  state.micReady = ready;
  el.mic.disabled = !ready;
  el.mic.classList.toggle("ready", ready);
  el.mic.classList.remove("recording");
}

async function handleSpeakSuccess() {
  setMicReady(false);
  state.speakCount += 1;
  state.sun += 1;
  updateYardHud();
  await collectSun();

  if (state.speakCount === 1) {
    spawnDraggablePlant();
    return;
  }

  await attackZombie();
}

function spawnDraggablePlant() {
  setSprite(el.plant, "peashooter-spawn");
  el.plant.className = "sprite plant-sprite draggable";
  el.yardPrompt.textContent = "把植物种到草地上吧";
  el.yardHint.textContent = "拖动豌豆射手，放到任意草地格。";
  applyEditorOverrides(document);
  [...el.slots.children].forEach((slot) => slot.classList.add("is-target"));
}

function plantPointerDown(event) {
  if (!el.plant.classList.contains("draggable")) return;

  const rect = el.plant.getBoundingClientRect();
  state.dragOffset.x = event.clientX - rect.left;
  state.dragOffset.y = event.clientY - rect.top;
  el.plant.classList.add("is-dragging");
  el.plant.setPointerCapture(event.pointerId);
}

function plantPointerMove(event) {
  if (!el.plant.classList.contains("is-dragging")) return;

  const field = el.yardField.getBoundingClientRect();
  const left = event.clientX - field.left - state.dragOffset.x;
  const top = event.clientY - field.top - state.dragOffset.y;
  el.plant.style.left = `${left}px`;
  el.plant.style.top = `${top}px`;
  el.plant.style.bottom = "auto";
}

function plantPointerUp(event) {
  if (!el.plant.classList.contains("is-dragging")) return;

  el.plant.classList.remove("is-dragging");
  const slot = findSlotAt(event.clientX, event.clientY);
  if (!slot) {
    el.plant.style.left = "";
    el.plant.style.top = "";
    el.plant.style.bottom = "";
    showToast("放到草地格里哦");
    return;
  }

  plantInSlot(slot);
}

function findSlotAt(x, y) {
  return [...el.slots.children].find((slot) => {
    const rect = slot.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  });
}

async function plantInSlot(slot) {
  const field = el.yardField.getBoundingClientRect();
  const rect = slot.getBoundingClientRect();
  const size = el.plant.getBoundingClientRect();
  el.plant.classList.remove("draggable");
  el.plant.style.left = `${rect.left - field.left + rect.width / 2 - size.width / 2}px`;
  el.plant.style.top = `${rect.top - field.top - size.height * 0.55}px`;
  el.plant.style.bottom = "auto";
  [...el.slots.children].forEach((item) => item.classList.remove("is-target"));
  setSprite(el.plant, "peashooter-planted");
  await wait(700);
  state.planted = true;
  setSprite(el.plant, "peashooter-idle");
  setSprite(el.zombie, "bucket-walk");
  await wait(450);
  prepareYardPrompt();
}

async function attackZombie() {
  const stage = state.speakCount;
  setSprite(el.plant, "peashooter-attack");
  setSprite(el.zombie, "bucket-surprised");
  el.projectile.classList.remove("hidden", "fire");
  void el.projectile.offsetWidth;
  el.projectile.classList.add("fire");
  await wait(950);
  el.projectile.classList.add("hidden");
  el.projectile.classList.remove("fire");

  const hitSprite = {
    2: "bucket-hit",
    3: "bucket-shoes",
    4: "bucket-pants",
    5: "bucket-retreat",
  }[stage];
  setSprite(el.zombie, hitSprite);
  setSprite(el.plant, "peashooter-idle");

  await wait(stage === 5 ? 1700 : 1450);
  if (stage === 5) {
    finishLevel();
    return;
  }

  setSprite(el.zombie, "bucket-walk");
  await wait(450);
  prepareYardPrompt();
}

async function collectSun() {
  el.sunFly.classList.remove("hidden", "collect");
  void el.sunFly.offsetWidth;
  el.sunFly.classList.add("collect");
  await wait(920);
  el.sunFly.classList.add("hidden");
  el.sunFly.classList.remove("collect");
}

function finishLevel() {
  setSprite(el.plant, "peashooter-win");
  window.setTimeout(() => {
    const rate = Math.round((state.clickFirstTryCorrect / clickSequence.length) * 100);
    el.resultSun.textContent = String(state.sun);
    el.resultClickRate.textContent = `${rate}%`;
    showScreen("result");
    applyEditorOverrides(document);
  }, 850);
}

function setSprite(node, key) {
  node.dataset.sprite = key;
  node.style.backgroundImage = `url("${spriteAssets[key]}")`;
  node.dataset.frame = "0";
}

function animateSprites(time) {
  const frame = Math.floor(time / 140) % 16;
  document.querySelectorAll(".sprite:not(.hidden)").forEach((node) => {
    const x = frame % 4;
    const y = Math.floor(frame / 4);
    node.style.backgroundPosition = `${x * -100}% ${y * -100}%`;
  });
  requestAnimationFrame(animateSprites);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function restart() {
  window.speechSynthesis?.cancel();
  el.pauseModal.classList.add("hidden");
  state.clickRound = 0;
  state.clickAttempts = 0;
  state.clickFirstTryCorrect = 0;
  state.speakCount = 0;
  state.sun = 0;
  state.planted = false;
  setMicReady(false);
  showScreen("loading");
  el.loadFill.style.width = "100%";
  applyEditorOverrides(document);
}

function beginEditorPointer(event, mode) {
  if (!editor.enabled || !editor.selected) return;
  event.preventDefault();
  event.stopPropagation();
  editor.mode = mode;
  editor.pointerId = event.pointerId;
  const rect = editor.selected.getBoundingClientRect();
  editor.start = {
    x: event.clientX,
    y: event.clientY,
    rect,
  };
  editor.outline.setPointerCapture(event.pointerId);
}

function updateSelectedGeometryFromRect(nextRect) {
  const values = rectToPercent(nextRect);
  const override = selectedOverride();
  Object.assign(override, values);
  Object.assign(editor.selected.style, {
    position: "absolute",
    left: values.left,
    top: values.top,
    right: "auto",
    bottom: "auto",
    width: values.width,
    height: values.height,
    transform: "none",
  });
  saveEditorOverrides();
  queueEditorOutlineUpdate();
}

function moveEditorPointer(event) {
  if (!editor.mode || event.pointerId !== editor.pointerId || !editor.start) return;
  event.preventDefault();
  const dx = event.clientX - editor.start.x;
  const dy = event.clientY - editor.start.y;
  const base = editor.start.rect;
  const app = appRect();
  const minSize = Math.max(20, app.width * 0.025);
  const nextRect =
    editor.mode === "resize"
      ? {
          left: base.left,
          top: base.top,
          width: Math.max(minSize, base.width + dx),
          height: Math.max(minSize, base.height + dy),
        }
      : {
          left: base.left + dx,
          top: base.top + dy,
          width: base.width,
          height: base.height,
        };

  updateSelectedGeometryFromRect(nextRect);
}

function endEditorPointer(event) {
  if (event.pointerId !== editor.pointerId) return;
  editor.mode = null;
  editor.pointerId = null;
  editor.start = null;
  syncEditorPanel();
}

function createEditorPanel() {
  const app = document.querySelector("#app");
  const panel = document.createElement("aside");
  panel.className = "editor-panel";
  panel.innerHTML = `
    <div class="editor-title">
      <strong>UI 编辑</strong>
      <span data-editor-target>未选择</span>
    </div>
    <div class="editor-screen-tabs" aria-label="切换画面">
      <button type="button" data-editor-screen="loading">加载</button>
      <button type="button" data-editor-screen="click">点选</button>
      <button type="button" data-editor-screen="comic">过场</button>
      <button type="button" data-editor-screen="yard">小院</button>
      <button type="button" data-editor-screen="result">结算</button>
    </div>
    <label>文字
      <textarea data-editor-field="text" rows="2" placeholder="只支持没有子元素的文字节点"></textarea>
    </label>
    <label>字号
      <input data-editor-field="fontSize" type="number" min="8" max="96" step="1" />
    </label>
    <div class="editor-actions">
      <button type="button" data-editor-action="apply-text">应用文字</button>
      <button type="button" data-editor-action="upload">上传资源</button>
      <button type="button" data-editor-action="copy">复制配置</button>
      <button type="button" data-editor-action="export">导出 JSON</button>
      <button type="button" data-editor-action="import">导入</button>
      <button type="button" data-editor-reset-target>重置选中</button>
      <button type="button" data-editor-action="reset-all">全部重置</button>
    </div>
    <p>点选页面元素后拖动蓝框移动，拖右下角缩放。改完后把导出的 JSON 发给我，我可以固化进代码。</p>
  `;

  const outline = document.createElement("div");
  outline.className = "editor-outline hidden";
  outline.innerHTML = `<span></span><button type="button" aria-label="缩放"></button>`;

  const fileInput = document.createElement("input");
  fileInput.className = "hidden";
  fileInput.type = "file";
  fileInput.accept = "image/*,.json,application/json";

  app.append(panel, outline, fileInput);
  editor.panel = panel;
  editor.outline = outline;
  editor.fileInput = fileInput;
}

function updateEditorScreenControls() {
  if (!editor.panel) return;
  editor.panel.querySelectorAll("[data-editor-screen]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.editorScreen === state.screen);
  });
}

function handleEditorPanelClick(event) {
  const screen = event.target.closest("[data-editor-screen]")?.dataset.editorScreen;
  if (screen) {
    if (screen === "click" && !el.cardRow.children.length) renderClickRound();
    if (screen === "yard" && !el.slots.children.length) setupSlots();
    showScreen(screen);
    applyEditorOverrides(document);
    return;
  }

  const action = event.target.closest("[data-editor-action]")?.dataset.editorAction;
  if (!action && !event.target.matches("[data-editor-reset-target]")) return;

  if (event.target.matches("[data-editor-reset-target]")) {
    if (!editor.selected) return;
    delete editor.overrides[editor.selected.dataset.editId];
    saveEditorOverrides();
    window.location.reload();
    return;
  }

  if (action === "apply-text") applyEditorTextEdits();
  if (action === "upload") {
    editor.fileInput.dataset.mode = "upload";
    editor.fileInput.accept = "image/*";
    editor.fileInput.click();
  }
  if (action === "copy") copyEditorConfig();
  if (action === "export") exportEditorConfig();
  if (action === "import") {
    editor.fileInput.dataset.mode = "import";
    editor.fileInput.accept = ".json,application/json";
    editor.fileInput.click();
  }
  if (action === "reset-all") {
    editor.overrides = {};
    saveEditorOverrides();
    window.location.reload();
  }
}

function applyEditorTextEdits() {
  if (!editor.selected) return;
  const override = selectedOverride();
  const textInput = editor.panel.querySelector("[data-editor-field='text']");
  const sizeInput = editor.panel.querySelector("[data-editor-field='fontSize']");

  if (!textInput.disabled) {
    override.text = textInput.value;
    editor.selected.textContent = textInput.value;
  }

  const size = safeCssSize(`${sizeInput.value}px`);
  if (size) {
    override.fontSize = size;
    editor.selected.style.fontSize = size;
  }

  saveEditorOverrides();
  syncEditorPanel();
  queueEditorOutlineUpdate();
}

function handleEditorFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const mode = editor.fileInput.dataset.mode;
  editor.fileInput.dataset.mode = "";
  editor.fileInput.accept = "image/*,.json,application/json";

  const reader = new FileReader();
  reader.onload = () => {
    if (mode === "import") {
      try {
        editor.overrides = JSON.parse(String(reader.result));
        saveEditorOverrides();
        window.location.reload();
      } catch {
        showToast("JSON 格式不对");
      }
      return;
    }

    if (!editor.selected) return;
    const override = selectedOverride();
    if (editor.selected instanceof HTMLImageElement) {
      override.imageSrc = String(reader.result);
      editor.selected.src = override.imageSrc;
    } else {
      override.backgroundSrc = String(reader.result);
      editor.selected.style.backgroundImage = `url("${override.backgroundSrc}")`;
      editor.selected.style.backgroundSize = "100% 100%";
      editor.selected.style.backgroundRepeat = "no-repeat";
      editor.selected.style.backgroundPosition = "center";
    }
    saveEditorOverrides();
    queueEditorOutlineUpdate();
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

async function copyEditorConfig() {
  const text = JSON.stringify(editor.overrides, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    showToast("配置已复制");
  } catch {
    showToast("浏览器不允许复制，请用导出");
  }
}

function exportEditorConfig() {
  const blob = new Blob([JSON.stringify(editor.overrides, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "level-interaction-ui-overrides.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function initEditor() {
  if (!editor.enabled) return;
  loadEditorOverrides();
  document.body.classList.add("edit-mode");
  createEditorPanel();
  applyEditorOverrides(document);
  updateEditorScreenControls();

  document.addEventListener(
    "click",
    (event) => {
      if (event.target.closest(".editor-panel") || event.target.closest(".editor-outline")) return;
      const target = event.target.closest("[data-edit-id]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedNode(target);
    },
    true,
  );

  editor.panel.addEventListener("click", handleEditorPanelClick);
  editor.fileInput.addEventListener("change", handleEditorFileChange);
  editor.outline.addEventListener("pointerdown", (event) => beginEditorPointer(event, "move"));
  editor.outline.querySelector("button").addEventListener("pointerdown", (event) => beginEditorPointer(event, "resize"));
  editor.outline.addEventListener("pointermove", moveEditorPointer);
  editor.outline.addEventListener("pointerup", endEditorPointer);
  editor.outline.addEventListener("pointercancel", endEditorPointer);
  window.addEventListener("resize", queueEditorOutlineUpdate);

  const firstActive = document.querySelector(".screen.is-active [data-edit-id]");
  if (firstActive) setSelectedNode(firstActive);
}

function bindActions() {
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;

    if (action === "start-click") startClickGame();
    if (action === "replay-click") speak(targetById(clickSequence[state.clickRound])?.say || "Hello!");
    if (action === "start-yard") startYard();
    if (action === "replay-yard") speak(targetById(yardSequence[state.speakCount])?.say || "Hello!");
    if (action === "pause") el.pauseModal.classList.remove("hidden");
    if (action === "resume") el.pauseModal.classList.add("hidden");
    if (action === "restart") restart();
    if (action === "next") {
      showToast("下一关入口已预留");
      restart();
    }
    if (action === "map") {
      showToast("章节地图入口已预留");
      restart();
    }
  });

  el.mic.addEventListener("pointerdown", (event) => {
    if (!state.micReady) return;
    state.recordingSince = event.timeStamp;
    el.mic.classList.add("recording");
    el.mic.setPointerCapture(event.pointerId);
    el.yardHint.textContent = "正在听你说...";
  });

  el.mic.addEventListener("pointerup", async (event) => {
    if (!el.mic.classList.contains("recording")) return;
    el.mic.classList.remove("recording");
    if (event.timeStamp - state.recordingSince < 300) {
      showToast("再按久一点点");
      el.yardHint.textContent = "按住麦克风，说完再松手。";
      return;
    }

    setMicReady(false);
    el.yardHint.textContent = "正在听发音...";
    await wait(650);
    if (state.screen === "yard") {
      await handleSpeakSuccess();
    }
  });

  el.mic.addEventListener("pointercancel", () => {
    el.mic.classList.remove("recording");
    if (state.screen === "yard" && state.micReady) {
      el.yardHint.textContent = "按住麦克风，说完再松手。";
    }
  });

  el.plant.addEventListener("pointerdown", plantPointerDown);
  el.plant.addEventListener("pointermove", plantPointerMove);
  el.plant.addEventListener("pointerup", plantPointerUp);
  el.plant.addEventListener("pointercancel", plantPointerUp);
}

bindActions();
startLoading();
initEditor();
requestAnimationFrame(animateSprites);

Object.entries(spriteAssets).forEach(([, src]) => {
  const img = new Image();
  img.src = src;
});
