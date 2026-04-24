import { levels } from "../data/levels.js";
import { LevelCard } from "../ui/LevelCard.js";
import { SecondaryButton } from "../ui/SecondaryButton.js";

export const levelSelectScene = {
  render({ state, uiText }) {
    return `
      <section class="page-shell scene-level-select" data-page="page_level_select">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="scene-header">
            <div>
              <h1 class="scene-title">${uiText.levelSelect.title}</h1>
              <p class="scene-description">${uiText.levelSelect.description}</p>
            </div>
            ${SecondaryButton({ label: "返回首页", action: "go-home" })}
          </div>
          <div class="level-grid">
            ${levels
              .map((level) => {
                const record = state.save.levels[level.id] ?? { stars: 0, completed: false };
                return LevelCard({
                  level,
                  locked: level.id > state.save.unlockedLevel,
                  stars: record.stars ?? 0,
                  completed: record.completed ?? false,
                });
              })
              .join("")}
          </div>
        </div>
      </section>
    `;
  },
};
