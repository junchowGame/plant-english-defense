import { getPhrase } from "../data/phrases.js";

function renderDragCards(question, battle) {
  return `
    <div class="drag-source-list">
      ${(question.draggables ?? [])
        .map((item) => {
          const isMatched = battle.dragMatchedItemId === item.id;
          const isSelected = battle.selectedDragItemId === item.id;
          return `
            <button
              class="drag-card ${isMatched ? "is-matched" : ""} ${isSelected ? "is-selected" : ""}"
              data-action="select-drag-item"
              data-drag-item-id="${item.id}"
              data-asset-id="${item.assetId}"
              ${isMatched ? "disabled" : ""}
            >
              ${item.label}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

export function TaskPanel({ question, uiText, battle }) {
  const helperText =
    question.type === "tap"
      ? uiText.battle.guideTap
      : question.type === "drag"
        ? "Tap a card, then tap the glowing place."
        : uiText.battle.guideSpeak;
  const examplePhrase = question.phraseId ? getPhrase(question.phraseId) : null;

  return `
    <aside class="cmp_task_panel cmp-task-panel" data-component="cmp_task_panel">
      <div class="task-header">
        <h2>${uiText.battle.questionLabel} ${question.id}</h2>
        <p>${question.guideText}</p>
      </div>
      <div class="task-audio-row">
        <button class="task-action-button" data-action="play-prompt">${uiText.battle.replayPrompt}</button>
      </div>
      <div class="task-card-grid">
        <div class="speak-status-badge">${helperText}</div>
        ${
          question.type === "drag"
            ? renderDragCards(question, battle)
            : question.type === "speak"
              ? `
                <div class="speak-sentence">${question.exampleTextOverride ?? examplePhrase?.text ?? question.promptText}</div>
                <div class="task-button-row">
                  <button class="task-action-button" data-action="play-speak-example">${uiText.battle.playExample}</button>
                  <button class="task-action-button" data-action="open-speak-modal">${uiText.battle.openSpeak}</button>
                </div>
              `
              : ""
        }
      </div>
    </aside>
  `;
}
