import { getLevelById } from "../data/levels.js";
import { ProgressIndicator } from "../ui/ProgressIndicator.js";
import { BattleStage } from "../ui/BattleStage.js";
import { TaskPanel } from "../ui/TaskPanel.js";
import { FeedbackBar } from "../ui/FeedbackBar.js";
import { SpeakModal } from "../ui/SpeakModal.js";
import { getCurrentQuestion, getQuestionProgress } from "../systems/questionSystem.js";

export const battleScene = {
  render({ state, uiText }) {
    const level = getLevelById(state.battle.levelId);
    const question = getCurrentQuestion(level, state.battle);
    const progress = getQuestionProgress(level, state.battle);
    const audioText = state.save.settings.masterAudioEnabled ? "🔊" : "🔇";

    return `
      <section class="page-shell scene-battle" data-page="page_battle">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="battle-topbar">
            <button class="icon-button" data-action="go-level-select">←</button>
            <div class="battle-topbar-title">
              <strong>${level.title}</strong>
              <span>${level.subtitle}</span>
            </div>
            ${ProgressIndicator({ total: progress.total, currentIndex: state.battle.questionIndex })}
            <button class="icon-button" data-action="toggle-master-audio">${audioText}</button>
          </div>
          <div class="battle-layout">
            ${BattleStage({ level, question, battle: state.battle })}
            ${TaskPanel({ question, uiText, battle: state.battle })}
          </div>
          ${FeedbackBar({
            title:
              state.battle.feedbackMood === "success"
                ? "Nice!"
                : state.battle.feedbackMood === "error"
                  ? "Almost!"
                  : "Garden Coach",
            body: state.battle.feedback,
            actionButtonHtml: '<button class="task-action-button" data-action="play-prompt">再播一次</button>',
          })}
          ${SpeakModal({ question, battle: state.battle, uiText })}
        </div>
      </section>
    `;
  },
};
