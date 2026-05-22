import { ensureLevelRecord } from "../core/storage.js";
import { getRewardsForLevel, getStickerRewardByLevel } from "../data/rewards.js";

function cloneData(data) {
  if (globalThis.structuredClone) {
    return globalThis.structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
}

function addUnique(list, item) {
  if (item && !list.includes(item)) {
    list.push(item);
  }
}

export function completeLevel(saveData, level) {
  const nextSave = cloneData(saveData);
  const record = ensureLevelRecord(nextSave, level.id);
  const firstClear = !record.completed;
  const newRewards = [];

  record.completed = true;
  record.stars = 3;
  record.speakCompleted = true;
  record.attempts += 1;
  nextSave.unlockedLevel = Math.max(nextSave.unlockedLevel, Math.min(level.id + 1, 10));
  nextSave.stickers = nextSave.stickers ?? [];
  nextSave.newStickerIds = nextSave.newStickerIds ?? [];
  nextSave.collectibles = nextSave.collectibles ?? [];
  nextSave.newCollectibleIds = nextSave.newCollectibleIds ?? [];

  if (firstClear) {
    getRewardsForLevel(level.id).forEach((reward) => {
      if (reward.type === "collectible") {
        if (!nextSave.collectibles.includes(reward.id)) {
          addUnique(nextSave.collectibles, reward.id);
          addUnique(nextSave.newCollectibleIds, reward.id);
          newRewards.push(reward);
        }
        return;
      }
      if (!nextSave.stickers.includes(reward.id)) {
        addUnique(nextSave.stickers, reward.id);
        addUnique(nextSave.newStickerIds, reward.id);
        newRewards.push({ ...reward, type: "sticker" });
      }
    });
  }

  const sticker = getStickerRewardByLevel(level.id);

  return {
    save: nextSave,
    result: {
      levelId: level.id,
      stars: 3,
      stickerId: sticker?.id ?? level.rewardSticker,
      unlockedNextLevel: Math.min(level.id + 1, 10),
      isFirstClear: firstClear,
      newRewards,
      rewardModalDismissed: newRewards.length === 0,
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

export function markStickersViewed(saveData) {
  return {
    ...cloneData(saveData),
    newStickerIds: [],
  };
}

export function markCollectibleViewed(saveData, collectibleId) {
  const nextSave = cloneData(saveData);
  nextSave.newCollectibleIds = (nextSave.newCollectibleIds ?? []).filter((id) => id !== collectibleId);
  return nextSave;
}
