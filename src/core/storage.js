import { defaultSettings } from "../data/settings.js";

const STORAGE_KEY = "plant-english-defense.save.v1";

export function createDefaultSave() {
  return {
    unlockedLevel: 1,
    levels: {},
    stickers: [],
    learnedPhraseIds: [],
    settings: { ...defaultSettings },
  };
}

export function loadSave() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultSave();
    }
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultSave(),
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      levels: parsed.levels ?? {},
      stickers: parsed.stickers ?? [],
      learnedPhraseIds: parsed.learnedPhraseIds ?? [],
    };
  } catch (error) {
    return createDefaultSave();
  }
}

export function saveToStorage(payload) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearSave() {
  window.localStorage.removeItem(STORAGE_KEY);
  return createDefaultSave();
}

export function ensureLevelRecord(saveData, levelId) {
  const currentRecord = saveData.levels[levelId];
  if (currentRecord) {
    return currentRecord;
  }
  const newRecord = {
    completed: false,
    stars: 0,
    speakCompleted: false,
    attempts: 0,
  };
  saveData.levels[levelId] = newRecord;
  return newRecord;
}
