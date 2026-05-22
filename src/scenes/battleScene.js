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
  const phaseText = battle.phase === "memory" ? "Listen and tap" : battle.phase === "comic" ? "Comic moment" : "Speak to defend";
  const progressText =
    battle.phase === "memory"
      ? `${battle.memoryRoundIndex + 1}/${getMemoryTotalRounds()}`
      : battle.phase === "defense"
        ? `${battle.defenseStep + 1}/${getDefenseTotalSteps()}`
        : "Comic";

  return `
    <div class="battle-topbar unified-battle-topbar" data-edit-id="battle-topbar" data-edit-label="battle topbar">
      <button class="icon-button" data-action="go-level-select" data-edit-id="battle-back-button" data-edit-label="battle back button" type="button" aria-label="Back to level map">Back</button>
      <div class="battle-topbar-title" data-edit-id="battle-title-block" data-edit-label="battle title">
        <strong data-edit-text="true">${level.title}</strong>
        <span data-edit-text="true">${phaseText}</span>
      </div>
      <div class="unified-progress" data-edit-id="battle-progress" data-edit-label="battle progress">${progressText}</div>
      <button class="icon-button" data-action="toggle-master-audio" data-edit-id="battle-audio-button" data-edit-label="battle audio button" type="button">${audioText}</button>
    </div>
  `;
}

function renderMemoryPhase(level, battle) {
  const prompt = getMemoryPrompt(level, battle);
  const options = getMemoryOptions(level, battle);

  return `
    <section class="unified-level-flow memory-phase ${battle.isWrong ? "is-wrong" : ""}" data-edit-id="battle-memory-layout" data-edit-label="memory layout" aria-label="Listen and choose">
      <div class="memory-prompt-panel" data-edit-id="battle-memory-prompt-panel" data-edit-label="memory prompt panel">
        <span data-edit-id="battle-memory-helper" data-edit-label="memory helper" data-edit-text="true">Listen, then tap the matching picture.</span>
        <strong data-edit-id="battle-memory-word" data-edit-label="memory phrase" data-edit-text="true">${prompt.promptText}</strong>
        <button class="task-action-button" data-action="play-flow-prompt" data-edit-id="battle-memory-play-button" data-edit-label="memory play button" type="button">Play again</button>
      </div>
      <div class="memory-card-row" data-edit-id="battle-memory-card-row" data-edit-label="memory card row">
        ${options
          .map(
            (target) => `
              <button class="memory-choice-card" data-action="memory-choice" data-target-id="${target.id}" data-edit-id="battle-memory-card-${target.id}" data-edit-label="memory card ${target.label}" type="button" aria-label="${target.label}">
                <img src="${target.image}" data-edit-id="battle-memory-card-img-${target.id}" data-edit-label="memory image ${target.label}" alt="" aria-hidden="true" />
                <strong data-edit-text="true">${target.label}</strong>
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
    <section class="unified-level-flow comic-phase" data-edit-id="battle-comic-layout" data-edit-label="comic layout" aria-label="Transition comic">
      <div class="comic-grid" data-edit-id="battle-comic-grid" data-edit-label="four panel comic" aria-hidden="true">
        <div class="comic-cell plant-sun" data-edit-id="battle-comic-cell-1" data-edit-label="comic panel top left"><span data-edit-text="true">Plant in the sun</span></div>
        <div class="comic-cell shadow" data-edit-id="battle-comic-cell-2" data-edit-label="comic panel top right"><span data-edit-text="true">A shadow appears</span></div>
        <div class="comic-cell surprised" data-edit-id="battle-comic-cell-3" data-edit-label="comic panel bottom left"><span data-edit-text="true">Plant notices</span></div>
        <div class="comic-cell ready" data-edit-id="battle-comic-cell-4" data-edit-label="comic panel bottom right"><span data-edit-text="true">Ready to defend</span></div>
      </div>
      <p data-edit-id="battle-comic-caption" data-edit-label="comic caption" data-edit-text="true">The zombie is coming. Get ready to guard the yard.</p>
      <button class="task-action-button" data-action="skip-comic" data-edit-id="battle-comic-start-button" data-edit-label="comic start button" type="button">Start defense</button>
    </section>
  `;
}

function renderSunRow(count) {
  return `
    <div class="defense-sun-row" data-edit-id="battle-defense-sun-row" data-edit-label="defense sun row" aria-label="Sun count">
      ${Array.from({ length: getDefenseTotalSteps() }, (_, index) => `<span class="${index < count ? "is-on" : ""}"></span>`).join("")}
    </div>
  `;
}

function renderDefensePhase(level, battle) {
  const prompt = getDefensePrompt(level, battle);
  const zombieClass = battle.defenseStep >= 4 ? "is-falling" : battle.zombieHit ? "is-hit" : "";

  return `
    <section class="unified-level-flow defense-phase" data-edit-id="battle-defense-layout" data-edit-label="defense layout" aria-label="Yard defense">
      <div class="defense-yard ${battle.isAttacking ? "is-attacking" : ""} ${battle.isPlanted ? "is-planted" : ""}" data-edit-id="battle-defense-yard" data-edit-label="defense yard">
        <div class="defense-sky" data-edit-id="battle-defense-sky" data-edit-label="defense sky"></div>
        <img class="defense-plant" data-edit-id="battle-defense-plant" data-edit-label="defense plant" src="./assets/images/characters/char_plant_peashooter_${battle.isAttacking ? "attack" : "idle"}.png" alt="Peashooter" />
        <img class="defense-zombie ${zombieClass}" data-edit-id="battle-defense-zombie" data-edit-label="defense zombie" src="./assets/images/characters/char_zombie_basic_${battle.zombieHit ? "hit" : "idle"}.png" alt="Zombie" />
        <div class="defense-projectile" data-edit-id="battle-defense-projectile" data-edit-label="defense projectile" aria-hidden="true"></div>
        ${renderSunRow(battle.sunCount)}
      </div>
      <aside class="defense-speak-panel" data-edit-id="battle-defense-speak-panel" data-edit-label="defense speak panel">
        <span data-edit-id="battle-defense-helper" data-edit-label="defense helper" data-edit-text="true">${battle.defenseStep === 0 ? "First repeat plants the defense." : "Keep speaking to attack."}</span>
        <strong data-edit-id="battle-defense-word" data-edit-label="defense phrase" data-edit-text="true">${prompt.promptText}</strong>
        <div class="task-button-row" data-edit-id="battle-defense-button-row" data-edit-label="defense button row">
          <button class="task-action-button" data-action="play-flow-prompt" data-edit-id="battle-defense-play-button" data-edit-label="defense play button" type="button">Play again</button>
          <button class="task-action-button primary-speak-action" data-action="defense-speak-success" data-edit-id="battle-defense-speak-button" data-edit-label="defense speak button" type="button">I said it</button>
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
      <section class="page-shell scene-battle" data-page="page_battle" data-edit-id="battle-page" data-edit-label="battle page">
        <div class="page-bg-decor" data-edit-id="battle-page-bg" data-edit-label="battle background"></div>
        <div class="page-content" data-edit-id="battle-page-content" data-edit-label="battle content">
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
