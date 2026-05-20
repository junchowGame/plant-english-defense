import { levels } from "../data/levels.js";

const slotCount = 10;
const rewardSlots = new Set([5, 10]);

function statusForLevel(level, state, index) {
  if (!level) return "disabled";
  if (level.id > state.save.unlockedLevel) return "locked";
  if (state.save.levels[level.id]?.completed) return "cleared";
  if (level.id === state.save.unlockedLevel) return "current";
  return index === 0 ? "current" : "base";
}

function levelTitle(level, index) {
  if (!level) return `第 ${index + 1} 关`;
  const [, title = level.title] = level.title.split("·").map((part) => part.trim());
  return title || level.title;
}

function renderLevelSlot(index, state) {
  const slotNumber = index + 1;
  const level = levels.find((item) => item.id === slotNumber);
  const status = statusForLevel(level, state, index);
  const isLocked = status === "locked";
  const isDisabled = status === "disabled";
  const action = isDisabled ? "level-unavailable" : isLocked ? "level-locked" : "open-level";
  const reward = rewardSlots.has(slotNumber);

  return `
    <button
      class="level-select-card is-${status}${reward ? " is-reward" : ""}"
      data-action="${action}"
      data-level-id="${level?.id ?? slotNumber}"
      data-level-slot="${slotNumber}"
      type="button"
      aria-label="第 ${slotNumber} 关 ${levelTitle(level, index)}"
    >
      <span class="level-current-glow" aria-hidden="true"></span>
      <span class="level-number">${slotNumber}</span>
      <span class="level-topic">${levelTitle(level, index)}</span>
      ${status === "cleared" ? `<img class="level-flag" src="./assets/images/level_select/ui/icon/ui_level_icon_flag_001.png" alt="已完成" />` : ""}
      ${isLocked ? `<img class="level-lock" src="./assets/images/level_select/ui/icon/ui_level_icon_lock_001.png" alt="未解锁" />` : ""}
      ${isDisabled ? `<img class="level-lock" src="./assets/images/level_select/ui/icon/ui_level_icon_unavailable_001.png" alt="未准备好" />` : ""}
      ${
        reward
          ? `<img class="level-reward-badge" src="./assets/images/level_select/ui/badge/${isLocked || isDisabled ? "ui_level_reward_badge_locked_001.png" : "ui_level_reward_badge_001.png"}" alt="奖励关" />`
          : ""
      }
    </button>
  `;
}

export const levelSelectScene = {
  render({ state }) {
    const completedCount = Object.values(state.save.levels).filter((record) => record?.completed).length;
    const showFirstGuide = state.save.unlockedLevel <= 1 && completedCount === 0;

    return `
      <section class="page-shell scene-level-select level-select-page" data-page="page_level_select" aria-label="关卡选择">
        <div class="level-select-bg" aria-hidden="true"></div>
        <div class="level-sun-float" aria-hidden="true"></div>
        <img class="level-edge-decor decor-a" src="./assets/images/level_select/art_scene/art_level_select_edge_decor_001_a.png" alt="" aria-hidden="true" />
        <img class="level-edge-decor decor-b" src="./assets/images/level_select/art_scene/art_level_select_edge_decor_001_b.png" alt="" aria-hidden="true" />
        <img class="level-edge-decor decor-c" src="./assets/images/level_select/art_scene/art_level_select_edge_decor_001_c.png" alt="" aria-hidden="true" />

        <button class="level-back-btn" data-action="go-home" type="button" aria-label="返回庭院首页"></button>

        <header class="level-title-panel">
          <h1>关卡选择</h1>
        </header>
        <div class="level-hint-panel">选择一个已解锁关卡开始游戏</div>

        <section class="level-board" aria-label="关卡列表">
          <img class="level-board-decor" src="./assets/images/level_select/art_scene/art_level_select_board_decor_001.png" alt="" aria-hidden="true" />
          <div class="level-card-grid-fixed">
            ${Array.from({ length: slotCount }, (_, index) => renderLevelSlot(index, state)).join("")}
          </div>
        </section>

        <div class="level-float-hint ${showFirstGuide ? "is-visible is-guide" : ""}" aria-live="polite">
          <span>${showFirstGuide ? "从第一关开始吧" : ""}</span>
        </div>
      </section>
    `;
  },
};
