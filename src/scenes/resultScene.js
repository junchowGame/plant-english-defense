import { MainButton } from "../ui/MainButton.js";
import { SecondaryButton } from "../ui/SecondaryButton.js";
import { collectibleFallbackImage, getStickerReward, stickerFallbackImage } from "../data/rewards.js";

function renderStars(count) {
  return `<div class="star-row" style="font-size:2.2rem;">${[1, 2, 3]
    .map((index) => `<span class="${index <= count ? "is-on" : ""}">★</span>`)
    .join("")}</div>`;
}

function renderRewardCard(reward) {
  const isCollectible = reward.type === "collectible";
  const image = reward.image || (isCollectible ? collectibleFallbackImage : stickerFallbackImage);
  const title = isCollectible ? "阶段大奖" : "新贴纸";

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
    <section class="reward-modal" aria-label="获得新奖励">
      <div class="reward-modal-mask" aria-hidden="true"></div>
      <div class="reward-modal-panel" role="dialog" aria-modal="true">
        <div class="reward-modal-title">
          <h2>获得新奖励</h2>
        </div>
        <div class="reward-modal-cards ${rewards.length === 1 ? "is-single" : "is-multiple"}">
          ${rewards.map(renderRewardCard).join("")}
        </div>
        <p>贴纸会放进贴纸册，阶段大奖会回到庭院。</p>
        <button class="reward-confirm-btn" data-action="close-reward-modal" type="button">知道了</button>
      </div>
    </section>
  `;
}

export const resultScene = {
  render({ state, currentLevel, uiText }) {
    const result = state.result;
    const hasNext = currentLevel?.id < 10;
    const sticker = getStickerReward(result?.stickerId ?? currentLevel?.rewardSticker);

    return `
      <section class="page-shell scene-result" data-page="page_result">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="result-panel">
            <div class="result-summary">
              <h2>${uiText.result.title}</h2>
              <p>${uiText.result.subtitle}</p>
              ${renderStars(result?.stars ?? 3)}
              <p>${uiText.result.stickerLabel}: ${sticker?.label ?? result?.stickerId ?? currentLevel?.rewardSticker}</p>
              <div class="result-actions">
                ${MainButton({ label: uiText.result.next, action: "next-level", disabled: !hasNext })}
                ${SecondaryButton({ label: uiText.result.replay, action: "replay-level" })}
                ${SecondaryButton({ label: uiText.result.levelSelect, action: "go-level-select" })}
              </div>
            </div>
            <div class="reward-stage" data-asset-id="bg_result_reward">
              <div class="visual-starburst"></div>
              <div class="visual-sticker" data-asset-id="${result?.stickerId ?? currentLevel?.rewardSticker}"></div>
            </div>
          </div>
        </div>
        ${renderRewardModal(result)}
      </section>
    `;
  },
};
