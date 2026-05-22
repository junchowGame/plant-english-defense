import { getLevelById } from "../data/levels.js";
import { FeedbackBar } from "../ui/FeedbackBar.js";
import { SpeakModal } from "../ui/SpeakModal.js";
import {
  getDefensePrompt,
  getDefenseTotalSteps,
  getMemoryOptions,
  getMemoryPrompt,
  getMemoryTotalRounds,
} from "../systems/levelFlowSystem.js";

function renderTopbar(level, battle, audioText) {
  const phaseText = battle.phase === "memory" ? "听一听，点图片" : battle.phase === "comic" ? "僵尸来了" : "说一次，打一发";
  return `
    <div class="battle-topbar unified-battle-topbar">
      <button class="icon-button" data-action="go-level-select" aria-label="返回小路地图">返回</button>
      <div class="battle-topbar-title">
        <strong>${level.title}</strong>
        <span>${phaseText}</span>
      </div>
      <div class="unified-progress">${battle.phase === "memory" ? `${battle.memoryRoundIndex + 1}/${getMemoryTotalRounds()}` : battle.phase === "defense" ? `${battle.defenseStep + 1}/${getDefenseTotalSteps()}` : "漫画"}</div>
      <button class="icon-button" data-action="toggle-master-audio">${audioText}</button>
    </div>
  `;
}

function renderMemoryPhase(level, battle) {
  const prompt = getMemoryPrompt(level, battle);
  const options = getMemoryOptions(level, battle);

  return `
    <section class="unified-level-flow memory-phase ${battle.isWrong ? "is-wrong" : ""}" aria-label="图片点击记忆题">
      <div class="memory-prompt-panel">
        <span>听到这个英语后，点对应图片</span>
        <strong>${prompt.promptText}</strong>
        <button class="task-action-button" data-action="play-flow-prompt" type="button">再听一次</button>
      </div>
      <div class="memory-card-row">
        ${options
          .map(
            (target) => `
              <button class="memory-choice-card" data-action="memory-choice" data-target-id="${target.id}" type="button" aria-label="${target.label}">
                <img src="${target.image}" alt="" aria-hidden="true" />
                <strong>${target.label}</strong>
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderComicPhase() {
  return `
    <section class="unified-level-flow comic-phase" aria-label="过渡漫画">
      <div class="comic-grid" aria-hidden="true">
        <div class="comic-cell plant-sun"><span>植物晒太阳</span></div>
        <div class="comic-cell shadow"><span>远处有影子</span></div>
        <div class="comic-cell surprised"><span>植物发现了</span></div>
        <div class="comic-cell ready"><span>准备守护</span></div>
      </div>
      <p>僵尸来了，准备守护小院。</p>
      <button class="task-action-button" data-action="skip-comic" type="button">开始守护</button>
    </section>
  `;
}

function renderSunRow(count) {
  return `
    <div class="defense-sun-row" aria-label="阳光数量">
      ${Array.from({ length: getDefenseTotalSteps() }, (_, index) => `<span class="${index < count ? "is-on" : ""}"></span>`).join("")}
    </div>
  `;
}

function renderDefensePhase(level, battle) {
  const prompt = getDefensePrompt(level, battle);
  const zombieClass = battle.defenseStep >= 4 ? "is-falling" : battle.zombieHit ? "is-hit" : "";

  return `
    <section class="unified-level-flow defense-phase" aria-label="院子保卫战">
      <div class="defense-yard ${battle.isAttacking ? "is-attacking" : ""} ${battle.isPlanted ? "is-planted" : ""}">
        <div class="defense-sky"></div>
        <img class="defense-plant" src="./assets/images/characters/char_plant_peashooter_${battle.isAttacking ? "attack" : "idle"}.png" alt="豌豆射手" />
        <img class="defense-zombie ${zombieClass}" src="./assets/images/characters/char_zombie_basic_${battle.zombieHit ? "hit" : "idle"}.png" alt="僵尸" />
        <div class="defense-projectile" aria-hidden="true"></div>
        ${renderSunRow(battle.sunCount)}
      </div>
      <aside class="defense-speak-panel">
        <span>${battle.defenseStep === 0 ? "第一次跟读会种下植物" : "继续跟读，植物会攻击"}</span>
        <strong>${prompt.promptText}</strong>
        <div class="task-button-row">
          <button class="task-action-button" data-action="play-flow-prompt" type="button">再听一次</button>
          <button class="task-action-button primary-speak-action" data-action="defense-speak-success" type="button">我说好了</button>
        </div>
      </aside>
    </section>
  `;
}

export const battleScene = {
  render({ state, uiText }) {
    const level = getLevelById(state.battle.levelId);
    const question = getDefensePrompt(level, state.battle);
    const audioText = state.save.settings.masterAudioEnabled ? "Audio" : "Muted";
    const flowHtml =
      state.battle.phase === "memory"
        ? renderMemoryPhase(level, state.battle)
        : state.battle.phase === "comic"
          ? renderComicPhase()
          : renderDefensePhase(level, state.battle);

    return `
      <section class="page-shell scene-battle" data-page="page_battle">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          ${renderTopbar(level, state.battle, audioText)}
          ${flowHtml}
          ${FeedbackBar({
            title:
              state.battle.feedbackMood === "success"
                ? "Nice!"
                : state.battle.feedbackMood === "error"
                  ? "Almost!"
                  : "Garden Coach",
            body: state.battle.feedback,
            actionButtonHtml: '<button class="task-action-button" data-action="play-prompt">Play again</button>',
          })}
          ${SpeakModal({ question, battle: state.battle, uiText })}
        </div>
      </section>
    `;
  },
};
