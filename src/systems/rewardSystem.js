import { ensureLevelRecord } from "../core/storage.js";

function cloneData(data) {
  if (globalThis.structuredClone) {
    return globalThis.structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
}

export function completeLevel(saveData, level) {
  const nextSave = cloneData(saveData);
  const record = ensureLevelRecord(nextSave, level.id);
  record.completed = true;
  record.stars = 3;
  record.speakCompleted = true;
  record.attempts += 1;
  nextSave.unlockedLevel = Math.max(nextSave.unlockedLevel, Math.min(level.id + 1, 10));

  if (!nextSave.stickers.includes(level.rewardSticker)) {
    nextSave.stickers.push(level.rewardSticker);
  }

  return {
    save: nextSave,
    result: {
      levelId: level.id,
      stars: 3,
      stickerId: level.rewardSticker,
      unlockedNextLevel: Math.min(level.id + 1, 10),
    },
  };
}

export function markLearnedPhrases(saveData, phraseIds = []) {
  const nextSave = cloneData(saveData);
  const set = new Set(nextSave.learnedPhraseIds);
  phraseIds.forEach((phraseId) => {
    if (phraseId) {
      set.add(phraseId);
    }
  });
  nextSave.learnedPhraseIds = [...set];
  return nextSave;
}
