import { getLevelById } from "../data/levels.js";
import {
  getDefensePrompt,
  getDefenseTotalSteps,
  getMemoryOptions,
  getMemoryPrompt,
  getMemoryTotalRounds,
} from "../systems/levelFlowSystem.js";

const ASSET = "./public/assets/level-interaction";

const zombieHitSprite = {
  2: "hit",
  3: "shoes",
  4: "pants",
  5: "retreat",
};

function spriteStyle(fileName) {
  return `background-image:url('${ASSET}/actions/${fileName}')`;
}

function renderExitButton(id) {
  return `<button class="mdd-icon-btn mdd-exit-btn" data-action="pause-battle" data-edit-id="${id}" type="button" aria-label="Pause">Exit</button>`;
}

function renderLoading(level) {
  return `
    <section class="mdd-screen mdd-loading" data-edit-id="battle-loading-screen" data-edit-label="loading screen">
      ${renderExitButton("battle-loading-exit")}
      <div class="mdd-loading-copy" data-edit-id="battle-loading-copy">
        <p class="mdd-eyebrow" data-edit-id="battle-loading-level" data-edit-text="true">Level ${level.id}</p>
        <h1 data-edit-id="battle-loading-title" data-edit-text="true">Plant English Defense</h1>
        <p data-edit-id="battle-loading-desc" data-edit-text="true">Listen, tap, and use your voice to guard the yard.</p>
      </div>
      <img class="mdd-load-ill" data-edit-id="battle-loading-illustration" src="${ASSET}/ui/ui_load_ill_001.png" alt="" />
      <div class="mdd-load-panel" data-edit-id="battle-loading-controls">
        <div class="mdd-load-bar" aria-label="Loading progress"><span></span></div>
        <button class="mdd-primary-btn" data-action="start-click" data-edit-id="battle-start-click-button" type="button">Start</button>
      </div>
    </section>
  `;
}

function renderMemoryPhase(level, battle) {
  const prompt = getMemoryPrompt(level, battle);
  const options = getMemoryOptions(level, battle);

  return `
    <section class="mdd-screen mdd-click-game ${battle.isWrong ? "is-wrong" : ""}" data-edit-id="battle-click-screen" data-edit-label="picture click screen">
      ${renderExitButton("battle-click-exit")}
      <div class="mdd-top-hud" data-edit-id="battle-click-top-hud">
        <div>
          <p class="mdd-eyebrow" data-edit-id="battle-click-eyebrow" data-edit-text="true">Listen and choose</p>
          <h2 data-edit-id="battle-click-prompt" data-edit-text="true">Choose: ${prompt.label}</h2>
        </div>
        <div class="mdd-progress-pill" data-edit-id="battle-click-progress">${battle.memoryRoundIndex + 1}/${getMemoryTotalRounds()}</div>
      </div>
      <div class="mdd-context-panel" data-edit-id="battle-click-context-panel">
        <img data-edit-id="battle-click-context-image" src="${ASSET}/art/art_dialogue_thank_001.png" alt="" />
      </div>
      <div class="mdd-card-row" data-edit-id="battle-click-card-row" aria-live="polite">
        ${options
          .map(
            (target, index) => `
              <button class="mdd-learn-card" style="animation-delay:${index * 70}ms" data-action="memory-choice" data-target-id="${target.id}" data-edit-id="battle-click-card-${target.id}" type="button" aria-label="${target.label}">
                <img data-edit-id="battle-click-card-${target.id}-image" src="${target.image}" alt="${target.label}" />
                <span data-edit-id="battle-click-card-${target.id}-label" data-edit-text="true">${target.label}</span>
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="mdd-bottom-actions" data-edit-id="battle-click-bottom-actions">
        <button class="mdd-round-btn" data-action="play-flow-prompt" data-edit-id="battle-click-replay-button" type="button" aria-label="Replay">Replay</button>
      </div>
    </section>
  `;
}

function renderComicPhase() {
  return `
    <section class="mdd-screen mdd-comic" data-edit-id="battle-comic-screen" data-edit-label="comic screen">
      ${renderExitButton("battle-comic-exit")}
      <div class="mdd-comic-strip" data-edit-id="battle-comic-strip" aria-hidden="true">
        <figure class="mdd-comic-panel panel-top-left" data-edit-id="battle-comic-frame-1">
          <img data-edit-id="battle-comic-image-1" src="${ASSET}/art/art_comic_transition_grid_001_top_left.png" alt="" />
        </figure>
        <figure class="mdd-comic-panel panel-top-right" data-edit-id="battle-comic-frame-2">
          <img data-edit-id="battle-comic-image-2" src="${ASSET}/art/art_comic_transition_grid_002_top_right.png" alt="" />
        </figure>
        <figure class="mdd-comic-panel panel-bottom-left" data-edit-id="battle-comic-frame-3">
          <img data-edit-id="battle-comic-image-3" src="${ASSET}/art/art_comic_transition_grid_003_bottom_left.png" alt="" />
        </figure>
        <figure class="mdd-comic-panel panel-bottom-right" data-edit-id="battle-comic-frame-4">
          <img data-edit-id="battle-comic-image-4" src="${ASSET}/art/art_comic_transition_grid_004_bottom_right.png" alt="" />
        </figure>
      </div>
      <div class="mdd-comic-caption" data-edit-id="battle-comic-caption">
        <h2 data-edit-id="battle-comic-title" data-edit-text="true">Your voice is ready. The yard is ready.</h2>
        <button class="mdd-primary-btn" data-action="start-yard" data-edit-id="battle-start-yard-button" type="button">Go to yard</button>
      </div>
    </section>
  `;
}

function renderSlots(battle) {
  return Array.from({ length: 5 }, (_, index) => {
    const isTarget = battle.plantPlacementPending ? " is-target" : "";
    return `<button class="mdd-slot${isTarget}" data-action="place-plant" data-slot="${index}" data-edit-id="battle-yard-slot-${index + 1}" type="button" aria-label="Plant slot ${index + 1}"></button>`;
  }).join("");
}

function renderDefensePhase(level, battle) {
  const prompt = getDefensePrompt(level, battle);
  const plantVisible = battle.defenseStep > 0 || battle.isPlanted || battle.plantPlacementPending;
  const plantSprite = battle.plantPlacementPending
    ? "ani_peashooter_spawn_001.png"
    : battle.isAttacking
      ? "ani_peashooter_attack_001.png"
      : battle.isCompleting
        ? "ani_peashooter_result_win_001.png"
        : battle.isPlanted
          ? "ani_peashooter_idle_001.png"
          : "ani_peashooter_spawn_001.png";
  const zombieSprite =
    battle.isCompleting || battle.defenseStep >= getDefenseTotalSteps()
      ? "ani_bucket_zombie_retreat_slide_001.png"
      : battle.zombieHit
        ? `ani_bucket_zombie_hit_${zombieHitSprite[battle.defenseStep] || "bucket"}_001.png`
        : battle.defenseStep > 0
          ? "ani_bucket_zombie_slow_walk_001.png"
          : "ani_bucket_zombie_idle_wait_001.png";

  return `
    <section class="mdd-screen mdd-yard" data-edit-id="battle-yard-screen" data-edit-label="yard defense screen">
      ${renderExitButton("battle-yard-exit")}
      <div class="mdd-yard-hud" data-edit-id="battle-yard-hud">
        <div class="mdd-sun-counter" data-edit-id="battle-sun-counter">
          <img data-edit-id="battle-sun-icon" src="${ASSET}/art/icon_sys_sun_001_256.png" alt="" />
          <span data-edit-id="battle-sun-count" data-edit-text="true">${battle.sunCount}</span>
        </div>
        <div class="mdd-repeat-count" data-edit-id="battle-speak-counter">Speak <span>${Math.min(battle.defenseStep, getDefenseTotalSteps())}</span>/${getDefenseTotalSteps()}</div>
      </div>
      <div class="mdd-speak-panel" data-edit-id="battle-speak-panel">
        <p class="mdd-eyebrow" data-edit-id="battle-yard-eyebrow" data-edit-text="true">Say it aloud</p>
        <h2 data-edit-id="battle-yard-prompt" data-edit-text="true">${battle.plantPlacementPending ? "Plant the peashooter." : `Say: ${prompt.label}!`}</h2>
        <p data-edit-id="battle-yard-hint" data-edit-text="true">${battle.plantPlacementPending ? "Tap any grass slot to plant." : "Listen, then press the mic button."}</p>
      </div>
      <div class="mdd-yard-field" data-edit-id="battle-yard-field">
        <div class="mdd-slots" data-edit-id="battle-yard-slots">${renderSlots(battle)}</div>
        <div class="mdd-sprite mdd-plant-sprite ${plantVisible ? "" : "hidden"} ${battle.plantPlacementPending ? "draggable" : ""}" data-edit-id="battle-plant-sprite" style="${spriteStyle(plantSprite)}"></div>
        <div class="mdd-sprite mdd-zombie-sprite ${battle.defenseStep === 0 ? "entering" : ""}" data-edit-id="battle-zombie-sprite" style="${spriteStyle(zombieSprite)}"></div>
        <img class="mdd-projectile ${battle.isAttacking ? "fire" : "hidden"}" data-edit-id="battle-projectile" src="${ASSET}/art/icon_sys_projectile_001.png" alt="" />
        <img class="mdd-sun-fly ${battle.isPlantGlow ? "collect" : "hidden"}" data-edit-id="battle-sun-fly" src="${ASSET}/art/icon_sys_sun_001_256.png" alt="" />
      </div>
      <div class="mdd-yard-actions" data-edit-id="battle-yard-actions">
        <button class="mdd-round-btn small" data-action="play-flow-prompt" data-edit-id="battle-yard-replay-button" type="button" aria-label="Replay">Replay</button>
        <button class="mdd-mic-btn ${battle.plantPlacementPending ? "" : "ready"}" data-action="defense-speak-success" data-edit-id="battle-mic-button" type="button" ${battle.plantPlacementPending ? "disabled" : ""} aria-label="Speak"></button>
      </div>
    </section>
  `;
}

function renderPauseModal(battle) {
  if (!battle.pauseOpen) return "";
  return `
    <div class="mdd-modal" role="dialog" aria-modal="true" aria-labelledby="battlePauseTitle">
      <div class="mdd-modal-panel" data-edit-id="battle-pause-panel">
        <h2 id="battlePauseTitle" data-edit-id="battle-pause-title" data-edit-text="true">Pause</h2>
        <p data-edit-id="battle-pause-desc" data-edit-text="true">Leaving now will return to the level map.</p>
        <div class="mdd-modal-actions" data-edit-id="battle-pause-actions">
          <button class="mdd-secondary-btn" data-action="resume-battle" data-edit-id="battle-pause-resume-button" type="button">Continue</button>
          <button class="mdd-primary-btn" data-action="go-level-select" data-edit-id="battle-pause-map-button" type="button">Map</button>
        </div>
      </div>
    </div>
  `;
}

export const battleScene = {
  render({ state }) {
    const level = getLevelById(state.battle.levelId);
    const phaseHtml =
      state.battle.phase === "loading"
        ? renderLoading(level)
        : state.battle.phase === "memory"
          ? renderMemoryPhase(level, state.battle)
          : state.battle.phase === "comic"
            ? renderComicPhase()
            : renderDefensePhase(level, state.battle);

    return `
      <section class="page-shell scene-battle mdd-level-scene" data-page="page_battle" data-edit-id="battle-page" data-edit-label="MDD battle page">
        ${phaseHtml}
        ${renderPauseModal(state.battle)}
      </section>
    `;
  },
};
