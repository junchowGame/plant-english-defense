import { createAudioManager } from "./core/audio.js";
import { createEventBus } from "./core/events.js";
import { createAppState, createDefaultBattleState } from "./core/state.js";
import { clearSave, saveToStorage } from "./core/storage.js";
import { levels, getLevelById } from "./data/levels.js";
import { uiText } from "./data/uiText.js";
import { homeScene } from "./scenes/homeScene.js";
import { levelSelectScene } from "./scenes/levelSelectScene.js";
import { battleScene } from "./scenes/battleScene.js";
import { resultScene } from "./scenes/resultScene.js";
import { parentScene } from "./scenes/parentScene.js";
import { createRouter } from "./router.js";
import { getCurrentQuestion, evaluateDragQuestion, evaluateTapQuestion } from "./systems/questionSystem.js";
import { completeLevel, markLearnedPhrases } from "./systems/rewardSystem.js";
import { beginRecordingSession, finishRecordingSession } from "./systems/speakSystem.js";

const scenes = {
  home: homeScene,
  "level-select": levelSelectScene,
  battle: battleScene,
  result: resultScene,
  "parent-settings": parentScene,
};

export function createApp(root) {
  const store = createAppState();
  const router = createRouter(store);
  const events = createEventBus();
  const audio = createAudioManager(() => store.getState());
  let cleanupSceneBindings = null;
  let pendingTimers = new Set();
  let recordingSession = null;

  function cancelTimers() {
    pendingTimers.forEach((timerId) => window.clearTimeout(timerId));
    pendingTimers = new Set();
  }

  function schedule(fn, delay) {
    const timerId = window.setTimeout(() => {
      pendingTimers.delete(timerId);
      fn();
    }, delay);
    pendingTimers.add(timerId);
  }

  function persistCurrentSave(nextSave) {
    saveToStorage(nextSave);
  }

  function setSave(updater) {
    store.setState((current) => {
      const nextSave = typeof updater === "function" ? updater(current.save) : updater;
      persistCurrentSave(nextSave);
      return { ...current, save: nextSave };
    });
  }

  function setBattle(updater) {
    store.setState((current) => ({
      ...current,
      battle: typeof updater === "function" ? updater(current.battle) : updater,
    }));
  }

  function getCurrentLevel() {
    return getLevelById(store.getState().battle.levelId);
  }

  function getQuestion() {
    const level = getCurrentLevel();
    return getCurrentQuestion(level, store.getState().battle);
  }

  function syncDebugHooks() {
    window.render_game_to_text = () => {
      const state = store.getState();
      const level = getCurrentLevel();
      const question = getQuestion();
      return JSON.stringify({
        scene: state.scene,
        levelId: state.battle.levelId,
        questionId: question?.id ?? null,
        questionType: question?.type ?? null,
        feedback: state.battle.feedback,
        unlockedLevel: state.save.unlockedLevel,
        speakModalOpen: state.battle.speakModalOpen,
        selectedDragItemId: state.battle.selectedDragItemId,
        progress: `${state.battle.questionIndex + 1}/${level?.questions?.length ?? 0}`,
        coordinateSystem: "percent-based positions with x from left to right and y from top to bottom",
      });
    };

    window.advanceTime = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function openScene(scene, params = {}) {
    router.go(scene, params);
  }

  function buildBattleState(levelId) {
    return {
      ...createDefaultBattleState(),
      levelId,
      feedback: uiText.feedback.ready,
    };
  }

  function startLevel(levelId) {
    cancelTimers();
    store.setState((current) => ({
      ...current,
      battle: buildBattleState(Number(levelId)),
      result: null,
    }));
    openScene("battle", { levelId: String(levelId) });
  }

  function playCurrentPrompt() {
    const question = getQuestion();
    if (!question) {
      return;
    }
    audio.unlock();
    audio.playPrompt(question);
  }

  function playSpeakExample() {
    const question = getQuestion();
    if (!question) {
      return;
    }
    audio.unlock();
    audio.playPhrase(question.phraseId, question.exampleTextOverride ?? question.promptText);
  }

  function applyFeedback(message, mood) {
    setBattle((battle) => ({
      ...battle,
      feedback: message,
      feedbackMood: mood,
    }));
  }

  function moveToNextQuestion() {
    const state = store.getState();
    const level = getCurrentLevel();
    const nextIndex = state.battle.questionIndex + 1;

    if (!level || nextIndex >= level.questions.length) {
      const completed = completeLevel(state.save, level);
      persistCurrentSave(completed.save);
      store.setState((current) => ({
        ...current,
        save: completed.save,
        result: completed.result,
      }));
      openScene("result", { levelId: String(level.id) });
      return;
    }

    setBattle((battle) => ({
      ...battle,
      questionIndex: nextIndex,
      feedback: uiText.feedback.ready,
      feedbackMood: "info",
      autoPlayedQuestionId: null,
      dragMatchedItemId: null,
      dragHoverZoneId: null,
      selectedDragItemId: null,
      isPlantGlow: false,
      isAttacking: false,
      isWrong: false,
      zombieHit: false,
      speakModalOpen: false,
      speakModalStatus: "idle",
    }));
  }

  function commitQuestionLearnedPhrases(question) {
    setSave((save) => markLearnedPhrases(save, question.learnedPhraseIds));
  }

  function resolveCorrectQuestion(question, extraBattleState = {}) {
    commitQuestionLearnedPhrases(question);
    audio.playFeedback("success");
    setBattle((battle) => ({
      ...battle,
      ...extraBattleState,
      feedback: Math.random() > 0.5 ? uiText.feedback.great : uiText.feedback.good,
      feedbackMood: "success",
      isPlantGlow: true,
      isAttacking: true,
      zombieHit: true,
      completedQuestionIds: [...battle.completedQuestionIds, question.id],
      isWrong: false,
    }));
    schedule(moveToNextQuestion, 1200);
  }

  function handleWrongAnswer() {
    audio.playFeedback("retry");
    setBattle((battle) => ({
      ...battle,
      feedback: uiText.feedback.tryAgain,
      feedbackMood: "error",
      isWrong: true,
    }));
    schedule(() => {
      setBattle((battle) => ({ ...battle, isWrong: false }));
    }, 420);
  }

  function handleTapAnswer(targetId) {
    const question = getQuestion();
    if (!question || question.type !== "tap") {
      return;
    }
    if (evaluateTapQuestion(question, targetId)) {
      resolveCorrectQuestion(question);
    } else {
      handleWrongAnswer();
    }
  }

  function handleDropAnswer({ itemId, zoneId }) {
    const question = getQuestion();
    if (!question || question.type !== "drag") {
      return false;
    }
    if (evaluateDragQuestion(question, itemId, zoneId)) {
      setBattle((battle) => ({
        ...battle,
        dragMatchedItemId: itemId,
        dragHoverZoneId: null,
        selectedDragItemId: null,
      }));
      schedule(() => resolveCorrectQuestion(question, { dragMatchedItemId: itemId }), 180);
      return true;
    }
    handleWrongAnswer();
    return false;
  }

  function selectDragItem(itemId) {
    const question = getQuestion();
    if (!question || question.type !== "drag" || !question.draggables?.some((item) => item.id === itemId)) {
      return;
    }
    setBattle((battle) => ({
      ...battle,
      selectedDragItemId: itemId,
      feedback: "Now tap the glowing place.",
      feedbackMood: "info",
    }));
  }

  function placeSelectedDragItem(zoneId) {
    const itemId = store.getState().battle.selectedDragItemId;
    if (!itemId) {
      setBattle((battle) => ({
        ...battle,
        feedback: "Tap the card first.",
        feedbackMood: "info",
      }));
      return;
    }
    handleDropAnswer({ itemId, zoneId });
  }

  function openSpeakModal() {
    setBattle((battle) => ({
      ...battle,
      speakModalOpen: true,
      speakModalStatus: "idle",
      feedback: uiText.feedback.speakReady,
      feedbackMood: "info",
    }));
  }

  function closeSpeakModal() {
    setBattle((battle) => ({
      ...battle,
      speakModalOpen: false,
      speakModalStatus: "idle",
    }));
  }

  async function startRecording() {
    recordingSession = await beginRecordingSession();
    setBattle((battle) => ({
      ...battle,
      speakModalStatus: "listening",
      feedback: uiText.feedback.listening,
      feedbackMood: "info",
    }));
  }

  function stopRecording() {
    const result = finishRecordingSession(recordingSession);
    recordingSession = null;
    setBattle((battle) => ({
      ...battle,
      speakModalStatus: "finished",
      recordingSeconds: result.seconds,
      feedback: `${uiText.feedback.speakDone} ${result.seconds}s`,
      feedbackMood: "success",
    }));
  }

  function completeSpeakQuestion() {
    const question = getQuestion();
    if (!question || question.type !== "speak") {
      return;
    }
    closeSpeakModal();
    resolveCorrectQuestion(question);
  }

  function toggleMasterAudio() {
    setSave((save) => ({
      ...save,
      settings: {
        ...save.settings,
        masterAudioEnabled: !save.settings.masterAudioEnabled,
      },
    }));
  }

  function toggleSetting(settingKey) {
    setSave((save) => ({
      ...save,
      settings: {
        ...save.settings,
        [settingKey]: !save.settings[settingKey],
      },
    }));
  }

  function clearAllSaveData() {
    const nextSave = clearSave();
    persistCurrentSave(nextSave);
    store.setState((current) => ({
      ...current,
      save: nextSave,
      battle: createDefaultBattleState(),
      result: null,
    }));
    openScene("home");
  }

  function showHomeToast(message) {
    const pageRoot = root.querySelector(".yard-home");
    const toast = pageRoot?.querySelector(".yard-toast");
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.remove("hidden");
    window.clearTimeout(showHomeToast.timer);
    showHomeToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 1600);
  }

  function playHomeEncourage() {
    const text = "Hello! 一起守护小院吧！";
    if (!("speechSynthesis" in window)) {
      showHomeToast(text);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Hello! Let's guard the yard!");
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  function markStickerSeen() {
    try {
      localStorage.setItem("plant-english-defense.yard-home.sticker-seen.v1", "1");
    } catch {
      // localStorage may be unavailable in restricted browser contexts.
    }
    root.querySelector(".yard-new-badge")?.classList.add("hidden");
    showHomeToast("贴纸册还在准备中");
  }

  function saveHomePlacement(id, x, y) {
    try {
      const key = "plant-english-defense.yard-home.placements.v1";
      const current = JSON.parse(localStorage.getItem(key) || "{}");
      current[id] = { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
      localStorage.setItem(key, JSON.stringify(current));
    } catch {
      showHomeToast("这次位置没有保存成功");
    }
  }

  function bindHomeDrag(pageRoot) {
    const dragState = {
      node: null,
      id: "",
      pointerId: null,
      startLeft: 0,
      startTop: 0,
      offsetX: 0,
      offsetY: 0,
    };
    const ring = pageRoot.querySelector(".yard-drop-ring");

    function setPairPosition(node, left, top) {
      node.style.left = `${left}%`;
      node.style.top = `${top}%`;
      const shadowClass = node.classList.contains("peashooter") ? ".plant-shadow" : ".zombie-shadow";
      const shadow = node.classList.contains("yard-character") ? pageRoot.querySelector(shadowClass) : null;
      if (shadow) {
        shadow.style.left = `${left}%`;
        shadow.style.top = `${top}%`;
      }
    }

    function isValidPlacement(left, top) {
      const inGrass = left >= 10 && left <= 70 && top >= 42 && top <= 88;
      const blocksMainAction = left > 62 && top > 18 && top < 72;
      return inGrass && !blocksMainAction;
    }

    function showDropRing(left, top, valid) {
      if (!ring) return;
      ring.classList.toggle("is-invalid", !valid);
      ring.classList.remove("hidden");
      ring.style.left = `${left}%`;
      ring.style.top = `${top}%`;
    }

    function onPointerDown(event) {
      const node = event.target.closest("[data-home-drag]");
      if (!node) return;
      event.preventDefault();
      dragState.node = node;
      dragState.id = node.dataset.homeDrag;
      dragState.pointerId = event.pointerId;
      dragState.startLeft = parseFloat(node.style.left) || 0;
      dragState.startTop = parseFloat(node.style.top) || 0;
      const rect = pageRoot.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      dragState.offsetX = event.clientX - (nodeRect.left + nodeRect.width / 2);
      dragState.offsetY = event.clientY - (nodeRect.top + nodeRect.height / 2);
      node.classList.add("is-dragging");
      if (node.dataset.dragSrc) {
        node.src = node.dataset.dragSrc;
      }
      node.setPointerCapture?.(event.pointerId);
      const left = ((event.clientX - dragState.offsetX - rect.left) / rect.width) * 100;
      const top = ((event.clientY - dragState.offsetY - rect.top) / rect.height) * 100;
      showDropRing(left, top, isValidPlacement(left, top));
    }

    function onPointerMove(event) {
      if (!dragState.node || event.pointerId !== dragState.pointerId) return;
      event.preventDefault();
      const rect = pageRoot.getBoundingClientRect();
      const left = Math.max(4, Math.min(94, ((event.clientX - dragState.offsetX - rect.left) / rect.width) * 100));
      const top = Math.max(10, Math.min(92, ((event.clientY - dragState.offsetY - rect.top) / rect.height) * 100));
      setPairPosition(dragState.node, left, top);
      showDropRing(left, top, isValidPlacement(left, top));
    }

    function onPointerUp(event) {
      if (!dragState.node || event.pointerId !== dragState.pointerId) return;
      const node = dragState.node;
      const left = parseFloat(node.style.left) || dragState.startLeft;
      const top = parseFloat(node.style.top) || dragState.startTop;
      node.classList.remove("is-dragging");
      if (node.dataset.idleSrc) {
        node.src = node.dataset.idleSrc;
      }
      ring?.classList.add("hidden");
      if (isValidPlacement(left, top)) {
        saveHomePlacement(dragState.id, left, top);
        showHomeToast("摆好了");
      } else {
        setPairPosition(node, dragState.startLeft, dragState.startTop);
        showHomeToast("放到草地里哦");
      }
      dragState.node = null;
      dragState.id = "";
      dragState.pointerId = null;
    }

    pageRoot.addEventListener("pointerdown", onPointerDown);
    pageRoot.addEventListener("pointermove", onPointerMove);
    pageRoot.addEventListener("pointerup", onPointerUp);
    pageRoot.addEventListener("pointercancel", onPointerUp);

    return () => {
      pageRoot.removeEventListener("pointerdown", onPointerDown);
      pageRoot.removeEventListener("pointermove", onPointerMove);
      pageRoot.removeEventListener("pointerup", onPointerUp);
      pageRoot.removeEventListener("pointercancel", onPointerUp);
    };
  }

  function nextLevel() {
    const level = getCurrentLevel() ?? getLevelById(store.getState().result?.levelId);
    if (level?.id < levels.length) {
      startLevel(level.id + 1);
    }
  }

  function replayLevel() {
    const levelId = store.getState().result?.levelId ?? store.getState().battle.levelId;
    if (levelId) {
      startLevel(levelId);
    }
  }

  function bindSceneEvents() {
    const pageRoot = root.querySelector("[data-page]");
    if (!pageRoot) {
      return () => {};
    }

    const clickHandler = async (event) => {
      audio.unlock();
      const target = event.target.closest("[data-action]");
      if (!target) {
        return;
      }
      const action = target.dataset.action;
      const levelId = target.dataset.levelId;
      const settingKey = target.dataset.settingKey;

      if (action === "go-level-select") {
        openScene("level-select");
      } else if (action === "go-home") {
        openScene("home");
      } else if (action === "go-parent-settings") {
        openScene("parent-settings");
      } else if (action === "go-level-select" || action === "open-level") {
        if (levelId) {
          startLevel(levelId);
        }
      } else if (action === "home-open-stickers") {
        markStickerSeen();
      } else if (action === "home-play-encourage") {
        playHomeEncourage();
      } else if (action === "play-prompt") {
        playCurrentPrompt();
      } else if (action === "tap-target") {
        handleTapAnswer(target.dataset.targetId);
      } else if (action === "select-drag-item") {
        selectDragItem(target.dataset.dragItemId);
      } else if (action === "place-drag-item") {
        placeSelectedDragItem(target.dataset.dropzoneId);
      } else if (action === "open-speak-modal") {
        openSpeakModal();
      } else if (action === "close-speak-modal") {
        closeSpeakModal();
      } else if (action === "play-speak-example") {
        playSpeakExample();
      } else if (action === "start-recording") {
        await startRecording();
      } else if (action === "stop-recording") {
        stopRecording();
      } else if (action === "complete-speak") {
        completeSpeakQuestion();
      } else if (action === "toggle-master-audio") {
        toggleMasterAudio();
      } else if (action === "toggle-setting") {
        toggleSetting(settingKey);
      } else if (action === "clear-save") {
        clearAllSaveData();
      } else if (action === "next-level") {
        nextLevel();
      } else if (action === "replay-level") {
        replayLevel();
      }
    };

    pageRoot.addEventListener("click", clickHandler);
    const cleanupHomeDrag = pageRoot.classList.contains("yard-home") ? bindHomeDrag(pageRoot) : null;

    return () => {
      pageRoot.removeEventListener("click", clickHandler);
      cleanupHomeDrag?.();
    };
  }

  function maybeAutoPlayPrompt() {
    const state = store.getState();
    if (state.scene !== "battle" || !state.save.settings.autoPlayPrompt) {
      return;
    }
    const question = getQuestion();
    if (!question || state.battle.autoPlayedQuestionId === question.id) {
      return;
    }
    schedule(() => {
      playCurrentPrompt();
      setBattle((battle) => ({ ...battle, autoPlayedQuestionId: question.id }));
    }, 180);
  }

  function render() {
    const state = store.getState();
    const scene = scenes[state.scene] ?? homeScene;
    const currentLevel = getCurrentLevel() ?? getLevelById(state.result?.levelId);

    root.innerHTML = `<main class="app-frame">${scene.render({ state, uiText, currentLevel })}</main>`;
    cleanupSceneBindings?.();
    cleanupSceneBindings = bindSceneEvents();
    maybeAutoPlayPrompt();
    syncDebugHooks();
    events.emit("rendered", state.scene);
  }

  store.subscribe(render);
  router.start();
  render();

  return {
    store,
    router,
    events,
  };
}
