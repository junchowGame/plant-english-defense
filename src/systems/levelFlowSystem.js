import { getPhrase } from "../data/phrases.js";
import { getStickerRewardByLevel } from "../data/rewards.js";

const levelTargets = {
  1: [
    { id: "hello", label: "Hello", phraseId: "hello", promptText: "Hello!", image: "./public/assets/level-interaction/art/art_learn_l01_hello_001.png" },
    { id: "hi", label: "Hi", phraseId: "hi", promptText: "Hi!", image: "./public/assets/level-interaction/art/art_learn_l01_hi_001.png" },
    { id: "good_morning", label: "Good morning", phraseId: "hello", promptText: "Good morning!", image: "./public/assets/level-interaction/art/art_learn_l01_good_morning_001.png" },
  ],
  2: [
    { id: "bye_bye", label: "Bye-bye", phraseId: "bye_bye", promptText: "Bye-bye!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L02_001.png" },
    { id: "see_you", label: "See you", phraseId: "bye_bye", promptText: "See you!", image: "./assets/images/characters/char_plant_sunflower_idle.png" },
    { id: "good_night", label: "Good night", phraseId: "bye_bye", promptText: "Good night!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L02_001.png" },
  ],
  3: [
    { id: "green", label: "Green", phraseId: "green", promptText: "green", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L03_001.png" },
    { id: "red", label: "Red", phraseId: "red", promptText: "red", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L03_001.png" },
    { id: "plant", label: "Plant", phraseId: "plant", promptText: "plant", image: "./assets/images/characters/char_plant_peashooter_idle.png" },
  ],
  4: [
    { id: "blue", label: "Blue", phraseId: "blue", promptText: "blue", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L04_001.png" },
    { id: "yellow", label: "Yellow", phraseId: "yellow", promptText: "yellow", image: "./assets/images/objects/obj_sun.png" },
    { id: "sun", label: "Sun", phraseId: "sun", promptText: "sun", image: "./assets/images/objects/obj_sun.png" },
  ],
  5: [
    { id: "one", label: "One", phraseId: "one", promptText: "one", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L05_001.png" },
    { id: "two", label: "Two", phraseId: "two", promptText: "two", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L05_001.png" },
    { id: "sun", label: "Sun", phraseId: "sun", promptText: "sun", image: "./assets/images/objects/obj_sun.png" },
  ],
  6: [
    { id: "three", label: "Three", phraseId: "three", promptText: "three", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L06_001.png" },
    { id: "one", label: "One", phraseId: "one", promptText: "one", image: "./assets/images/objects/obj_sun.png" },
    { id: "two", label: "Two", phraseId: "two", promptText: "two", image: "./assets/images/objects/obj_sun.png" },
  ],
  7: [
    { id: "sun", label: "Sun", phraseId: "sun", promptText: "sun", image: "./assets/images/objects/obj_sun.png" },
    { id: "plant", label: "Plant", phraseId: "plant", promptText: "plant", image: "./assets/images/characters/char_plant_peashooter_idle.png" },
    { id: "zombie", label: "Zombie", phraseId: "zombie", promptText: "zombie", image: "./assets/images/characters/char_zombie_basic_idle.png" },
  ],
  8: [
    { id: "water", label: "Water", phraseId: "water", promptText: "water", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L08_001.png" },
    { id: "i_want_water", label: "I want water", phraseId: "i_want_water", promptText: "I want water.", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L08_001.png" },
    { id: "plant", label: "Plant", phraseId: "plant", promptText: "plant", image: "./assets/images/characters/char_plant_peashooter_idle.png" },
  ],
  9: [
    { id: "thank_you", label: "Thank you", phraseId: "thank_you", promptText: "Thank you!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L09_001.png" },
    { id: "gift", label: "Gift", phraseId: "thank_you", promptText: "gift", image: "./assets/images/reward_collection/icons/ICON_REWARD_GIFT_001.png" },
    { id: "hello", label: "Hello", phraseId: "hello", promptText: "Hello!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L01_001.png" },
  ],
  10: [
    { id: "lets_go", label: "Let's go", phraseId: "lets_go", promptText: "Let's go!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L10_001.png" },
    { id: "thank_you", label: "Thank you", phraseId: "thank_you", promptText: "Thank you!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L09_001.png" },
    { id: "bye_bye", label: "Bye-bye", phraseId: "bye_bye", promptText: "Bye-bye!", image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L02_001.png" },
  ],
};

const promptOrder = [0, 1, 2, 0, 1, 2];
const defenseOrder = [0, 1, 2, 0, 1];

export function getLevelTargets(level) {
  const configuredTargets = levelTargets[level?.id] ?? null;
  if (configuredTargets) {
    return configuredTargets;
  }
  const sticker = getStickerRewardByLevel(level?.id);
  return [
    { id: "target-a", label: sticker?.label ?? "Hello", phraseId: sticker?.phraseId ?? "hello", promptText: sticker?.phraseText ?? "Hello!", image: sticker?.image },
    { id: "target-b", label: getPhrase("plant").text, phraseId: "plant", promptText: "plant", image: "./assets/images/characters/char_plant_peashooter_idle.png" },
    { id: "target-c", label: getPhrase("zombie").text, phraseId: "zombie", promptText: "zombie", image: "./assets/images/characters/char_zombie_basic_idle.png" },
  ];
}

export function getMemoryPrompt(level, battle) {
  const targets = getLevelTargets(level);
  const promptIndex = promptOrder[battle.memoryRoundIndex % promptOrder.length] ?? 0;
  return targets[promptIndex] ?? targets[0];
}

export function getMemoryOptions(level, battle) {
  const targets = getLevelTargets(level);
  const offset = battle.memoryRoundIndex % targets.length;
  return [...targets.slice(offset), ...targets.slice(0, offset)];
}

export function getDefensePrompt(level, battle) {
  const targets = getLevelTargets(level);
  const promptIndex = defenseOrder[battle.defenseStep % defenseOrder.length] ?? 0;
  return targets[promptIndex] ?? targets[0];
}

export function getMemoryTotalRounds() {
  return promptOrder.length;
}

export function getDefenseTotalSteps() {
  return defenseOrder.length;
}
