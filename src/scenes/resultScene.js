import { collectibleFallbackImage, getStickerReward, stickerFallbackImage } from "../data/rewards.js";

const ASSET = "./public/assets/level-interaction";

function renderStars(count) {
  return `
    <div class="mdd-stars" data-edit-id="result-stars" aria-label="Star result">
      ${[1, 2, 3].map((index) => `<span class="${index <= count ? "is-on" : ""}">★</span>`).join("")}
    </div>
  `;
}

function renderRewardCard(reward) {
  const isCollectible = reward.type === "collectible";
  const image = reward.image || (isCollectible ? collectibleFallbackImage : stickerFallbackImage);
  const title = isCollectible ? "Stage prize" : "New sticker";

  return `
    <article class="reward-modal-card ${isCollectible ? "is-collectible" : "is-sticker"}">
      <div class="reward-card-art-wrap">
        <img class="reward-card-art" src="${image}" alt="" aria-hidden="true" />
      </div>
      <span>${title}</span>
      <strong>${reward.label}</strong>
    </article>
  `;
}

function renderRewardModal(result) {
  const rewards = result?.newRewards ?? [];
  if (result?.rewardModalDismissed || rewards.length === 0) {
    return "";
  }

  return `
    <section class="reward-modal" aria-label="New reward">
      <div class="reward-modal-mask" aria-hidden="true"></div>
      <div class="reward-modal-panel" role="dialog" aria-modal="true">
        <div class="reward-modal-title">
          <h2>New reward</h2>
        </div>
        <div class="reward-modal-cards ${rewards.length === 1 ? "is-single" : "is-multiple"}">
          ${rewards.map(renderRewardCard).join("")}
        </div>
        <p>Stickers go to the sticker book. Stage prizes return to the yard.</p>
        <button class="reward-confirm-btn" data-action="close-reward-modal" type="button">OK</button>
      </div>
    </section>
  `;
}

export const resultScene = {
  render({ state, currentLevel }) {
    const result = state.result;
    const hasNext = currentLevel?.id < 10;
    const sticker = getStickerReward(result?.stickerId ?? currentLevel?.rewardSticker);
    const clickTotal = (result?.memoryCorrectCount ?? 0) + (result?.memoryWrongCount ?? 0);
    const clickRate = clickTotal ? Math.round(((result?.memoryCorrectCount ?? 0) / clickTotal) * 100) : 100;

    return `
      <section class="page-shell scene-result mdd-result-scene" data-page="page_result" data-edit-id="result-page">
        <div class="mdd-result-mask" aria-hidden="true"></div>
        <div class="mdd-result-panel" data-edit-id="result-panel" role="dialog" aria-modal="true" aria-labelledby="resultTitle">
          <p class="mdd-eyebrow" data-edit-id="result-eyebrow" data-edit-text="true">Level complete</p>
          <h2 id="resultTitle" data-edit-id="result-title" data-edit-text="true">Great!</h2>
          ${renderStars(result?.stars ?? 3)}
          <div class="mdd-result-sun" data-edit-id="result-sun">
            <img data-edit-id="result-sun-icon" src="${ASSET}/art/icon_sys_sun_001_256.png" alt="" />
            <span>x <strong data-edit-id="result-sun-count">${result?.sunCount ?? 5}</strong></span>
          </div>
          <div class="mdd-result-stats" data-edit-id="result-stats">
            <span data-edit-id="result-click-rate-label">Picture correct <strong>${clickRate}%</strong></span>
            <span data-edit-id="result-speak-rate-label">Speak success <strong>100%</strong></span>
            <span data-edit-id="result-sticker-label">Sticker <strong>${sticker?.label ?? result?.stickerId ?? currentLevel?.rewardSticker}</strong></span>
          </div>
          <div class="mdd-result-actions" data-edit-id="result-actions">
            <button class="mdd-secondary-btn" data-action="go-level-select" data-edit-id="result-map-button" type="button">Map</button>
            <button class="mdd-secondary-btn" data-action="replay-level" data-edit-id="result-restart-button" type="button">Replay</button>
            <button class="mdd-primary-btn" data-action="next-level" data-edit-id="result-next-button" type="button" ${hasNext ? "" : "disabled"}>Next</button>
          </div>
        </div>
        ${renderRewardModal(result)}
      </section>
    `;
  },
};
