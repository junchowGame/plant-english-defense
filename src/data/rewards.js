export const stickerRewards = [
  {
    id: "sticker_hello_bloom",
    levelId: 1,
    label: "Hello",
    phraseId: "hello",
    phraseText: "Hello!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L01_001.png",
  },
  {
    id: "sticker_bye_cloud",
    levelId: 2,
    label: "Bye-bye",
    phraseId: "bye_bye",
    phraseText: "Bye-bye!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L02_001.png",
  },
  {
    id: "sticker_color_leaf",
    levelId: 3,
    label: "Green",
    phraseId: "green",
    phraseText: "green",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L03_001.png",
  },
  {
    id: "sticker_sunny_ribbon",
    levelId: 4,
    label: "Yellow",
    phraseId: "yellow",
    phraseText: "yellow",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L04_001.png",
  },
  {
    id: "sticker_counting_sun",
    levelId: 5,
    label: "One two",
    phraseId: "one",
    phraseText: "One, two!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L05_001.png",
  },
  {
    id: "sticker_number_tree",
    levelId: 6,
    label: "Three",
    phraseId: "three",
    phraseText: "Three!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L06_001.png",
  },
  {
    id: "sticker_object_badge",
    levelId: 7,
    label: "Sun",
    phraseId: "sun",
    phraseText: "sun",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L07_001.png",
  },
  {
    id: "sticker_water_drop",
    levelId: 8,
    label: "Water",
    phraseId: "water",
    phraseText: "water",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L08_001.png",
  },
  {
    id: "sticker_gift_grin",
    levelId: 9,
    label: "Thank you",
    phraseId: "thank_you",
    phraseText: "Thank you!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L09_001.png",
  },
  {
    id: "sticker_go_flag",
    levelId: 10,
    label: "Let's go",
    phraseId: "lets_go",
    phraseText: "Let's go!",
    image: "./assets/images/reward_collection/art/ART_REWARD_STICKER_L10_001.png",
  },
];

export const stageRewards = [
  {
    id: "collectible_peashooter",
    levelId: 5,
    label: "豌豆射手",
    type: "collectible",
    image: "./assets/images/reward_collection/art/ART_REWARD_PEASHOOTER_COLLECTIBLE_001.png",
  },
  {
    id: "collectible_bucket_zombie",
    levelId: 10,
    label: "搞笑僵尸",
    type: "collectible",
    image: "./assets/images/reward_collection/art/ART_REWARD_BUCKET_ZOMBIE_COLLECTIBLE_001.png",
  },
];

export const stickerFallbackImage = "./assets/images/reward_collection/art/ART_REWARD_STICKER_DEFAULT_PLACEHOLDER_001.png";
export const stickerMissingImage = "./assets/images/reward_collection/art/ART_REWARD_STICKER_EMPTY_SILHOUETTE_001.png";
export const collectibleFallbackImage = "./assets/images/reward_collection/art/ART_REWARD_COLLECTIBLE_DEFAULT_PLACEHOLDER_001.png";

export function getStickerReward(stickerId) {
  return stickerRewards.find((reward) => reward.id === stickerId) ?? null;
}

export function getStickerRewardByLevel(levelId) {
  return stickerRewards.find((reward) => reward.levelId === Number(levelId)) ?? null;
}

export function getStageRewardByLevel(levelId) {
  return stageRewards.find((reward) => reward.levelId === Number(levelId)) ?? null;
}

export function getStageReward(collectibleId) {
  return stageRewards.find((reward) => reward.id === collectibleId) ?? null;
}

export function getRewardsForLevel(levelId) {
  return [getStickerRewardByLevel(levelId), getStageRewardByLevel(levelId)].filter(Boolean);
}
