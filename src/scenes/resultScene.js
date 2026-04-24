import { MainButton } from "../ui/MainButton.js";
import { SecondaryButton } from "../ui/SecondaryButton.js";

function renderStars(count) {
  return `<div class="star-row" style="font-size:2.2rem;">${[1, 2, 3]
    .map((index) => `<span class="${index <= count ? "is-on" : ""}">★</span>`)
    .join("")}</div>`;
}

export const resultScene = {
  render({ state, currentLevel, uiText }) {
    const result = state.result;
    const hasNext = currentLevel?.id < 10;

    return `
      <section class="page-shell scene-result" data-page="page_result">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="result-panel">
            <div class="result-summary">
              <h2>${uiText.result.title}</h2>
              <p>${uiText.result.subtitle}</p>
              ${renderStars(result?.stars ?? 3)}
              <p>${uiText.result.stickerLabel}: ${result?.stickerId ?? currentLevel?.rewardSticker}</p>
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
      </section>
    `;
  },
};
