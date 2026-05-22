import { defaultSettings } from "../data/settings.js";
import { getStageRewardByLevel, getStickerRewardByLevel } from "../data/rewards.js";

const STORAGE_KEY = "plant-english-defense.save.v1";

function uniqueList(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function migrateCompletedRewards(parsed) {
  const levels = parsed.levels ?? {};
  const stickers = uniqueList(parsed.stickers ?? []);
  const collectibles = uniqueList(parsed.collectibles ?? []);

  Object.entries(levels).forEach(([levelId, record]) => {
    if (!record?.completed) {
      return;
    }
    const sticker = getStickerRewardByLevel(levelId);
    const stageReward = getStageRewardByLevel(levelId);
    if (sticker && !stickers.includes(sticker.id)) {
      stickers.push(sticker.id);
    }
    if (stageReward && !collectibles.includes(stageReward.id)) {
      collectibles.push(stageReward.id);
    }
  });

  return { stickers, collectibles };
}

export function createDefaultSave() {
  return {
    unlockedLevel: 1,
    levels: {},
    stickers: [],
    newStickerIds: [],
    collectibles: [],
    newCollectibleIds: [],
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
    const migratedRewards = migrateCompletedRewards(parsed);
    return {
      ...createDefaultSave(),
      ...parsed,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      levels: parsed.levels ?? {},
      stickers: migratedRewards.stickers,
      newStickerIds: uniqueList(parsed.newStickerIds ?? []),
      collectibles: migratedRewards.collectibles,
      newCollectibleIds: uniqueList(parsed.newCollectibleIds ?? []),
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
