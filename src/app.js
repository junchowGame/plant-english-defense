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
import { attachDragSystem } from "./systems/dragSystem.js";
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
    audio.playPromptByText(question.promptText);
  }

  function playSpeakExample() {
    const question = getQuestion();
    if (!question) {
      return;
    }
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
      }));
      schedule(() => resolveCorrectQuestion(question, { dragMatchedItemId: itemId }), 180);
      return true;
    }
    handleWrongAnswer();
    return false;
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
      } else if (action === "play-prompt") {
        playCurrentPrompt();
      } else if (action === "tap-target") {
        handleTapAnswer(target.dataset.targetId);
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

    let cleanupDrag = () => {};
    if (store.getState().scene === "battle") {
      cleanupDrag = attachDragSystem({
        root: pageRoot,
        onHover(zoneId) {
          setBattle((battle) => ({ ...battle, dragHoverZoneId: zoneId }));
        },
        onDrop: handleDropAnswer,
      });
    }

    return () => {
      cleanupDrag();
      pageRoot.removeEventListener("click", clickHandler);
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
