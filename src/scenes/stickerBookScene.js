import { stickerFallbackImage, stickerMissingImage, stickerRewards } from "../data/rewards.js";

function renderStickerSlot(sticker, state) {
  const owned = state.save.stickers.includes(sticker.id);
  const isNew = state.save.newStickerIds?.includes(sticker.id);
  const action = owned ? "play-sticker" : "sticker-locked-hint";
  const image = owned ? sticker.image || stickerFallbackImage : stickerMissingImage;

  return `
    <button
      class="stickerbook-slot ${owned ? "is-owned" : "is-missing"}${isNew ? " is-new" : ""}"
      data-action="${action}"
      data-sticker-id="${sticker.id}"
      data-phrase-id="${sticker.phraseId}"
      data-phrase-text="${sticker.phraseText}"
      type="button"
      aria-label="${owned ? `${sticker.label} 贴纸` : `第 ${sticker.levelId} 关贴纸未获得`}"
    >
      <span class="stickerbook-slot-glow" aria-hidden="true"></span>
      <img class="stickerbook-art" src="${image}" alt="" aria-hidden="true" />
      <span class="stickerbook-level">第 ${sticker.levelId} 关</span>
      <strong>${owned ? sticker.label : "???"}</strong>
      ${isNew ? `<img class="stickerbook-new-badge" src="./assets/images/reward_collection/icons/ICON_REWARD_NEW_BADGE_001.png" alt="新" />` : ""}
    </button>
  `;
}

export const stickerBookScene = {
  render({ state }) {
    const ownedCount = stickerRewards.filter((sticker) => state.save.stickers.includes(sticker.id)).length;
    const hasAnySticker = ownedCount > 0;

    return `
      <section class="page-shell stickerbook-page" data-page="page_sticker_book" aria-label="贴纸册">
        <div class="stickerbook-bg" aria-hidden="true"></div>
        <button class="stickerbook-back-btn" data-action="close-stickerbook" type="button" aria-label="返回庭院首页"></button>

        <header class="stickerbook-title">
          <h1>贴纸册</h1>
        </header>
        <div class="stickerbook-hint">
          ${hasAnySticker ? "点一点贴纸，听听英语。" : "继续守护，收集贴纸吧。"}
        </div>

        <section class="stickerbook-panel" aria-label="贴纸列表">
          <div class="stickerbook-grid">
            ${stickerRewards.map((sticker) => renderStickerSlot(sticker, state)).join("")}
          </div>
        </section>

        <div class="stickerbook-toast hidden" aria-live="polite"></div>
      </section>
    `;
  },
};
