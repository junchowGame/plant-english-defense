import { MainButton } from "../ui/MainButton.js";
import { SecondaryButton } from "../ui/SecondaryButton.js";

export const homeScene = {
  render({ state, uiText }) {
    const audioLabel = state.save.settings.masterAudioEnabled ? uiText.home.audioOn : uiText.home.audioOff;

    return `
      <section class="page-shell scene-home" data-page="page_home">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="hero-block">
            <div class="hero-copy">
              <h1 class="hero-title">${uiText.brand.title}</h1>
              <p class="hero-subtitle">${uiText.home.headline}</p>
              <p class="scene-description">${uiText.home.description}</p>
              <div class="hero-actions">
                ${MainButton({ label: uiText.home.start, action: "go-level-select" })}
                ${SecondaryButton({ label: uiText.home.parent, action: "go-parent-settings" })}
                <button class="icon-button" data-action="toggle-master-audio">${audioLabel}</button>
              </div>
              <div class="hero-caption">${uiText.brand.heroCaption}</div>
            </div>
            <div class="hero-visual" data-asset-id="bg_home_garden_day">
              <div class="stage-object plant-main" style="left:28%; top:66%;">
                <div class="stage-sprite" data-asset-id="char_plant_sunflower_happy"><span>Hello!</span></div>
              </div>
              <div class="stage-object zombie-main" style="left:74%; top:68%;">
                <div class="stage-sprite" data-asset-id="char_zombie_basic_idle"><span>Hi?</span></div>
              </div>
              <div class="stage-object sun" style="left:52%; top:22%;">
                <div class="stage-sprite" data-asset-id="obj_sun"><span>Sun</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },
};
