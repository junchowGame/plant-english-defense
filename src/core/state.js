import { loadSave } from "./storage.js";

export function createAppState() {
  const persisted = loadSave();
  const initialState = {
    scene: "home",
    routeParams: {},
    save: persisted,
    battle: createDefaultBattleState(),
    result: null,
  };

  let state = initialState;
  const subscribers = new Set();

  return {
    getState() {
      return state;
    },
    setState(updater) {
      const nextState = typeof updater === "function" ? updater(state) : { ...state, ...updater };
      state = nextState;
      subscribers.forEach((subscriber) => subscriber(state));
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

export function createDefaultBattleState() {
  return {
    levelId: null,
    questionIndex: 0,
    feedback: "Ready! Tap the speaker to hear the task.",
    feedbackMood: "info",
    autoPlayedQuestionId: null,
    isPlantGlow: false,
    isAttacking: false,
    isWrong: false,
    zombieHit: false,
    dragMatchedItemId: null,
    dragHoverZoneId: null,
    speakModalOpen: false,
    speakModalStatus: "idle",
    recordingSeconds: 0,
    completedQuestionIds: [],
  };
}
