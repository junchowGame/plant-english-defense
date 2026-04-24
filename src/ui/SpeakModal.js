import { getPhrase } from "../data/phrases.js";

function getStatusLabel(status) {
  if (status === "listening") {
    return "Listening...";
  }
  if (status === "finished") {
    return "Recorded!";
  }
  return "Tap the mic when ready.";
}

export function SpeakModal({ question, battle, uiText }) {
  if (!battle.speakModalOpen) {
    return "";
  }

  const phrase = question.phraseId ? getPhrase(question.phraseId) : null;
  const sentence = question.exampleTextOverride ?? phrase?.text ?? question.promptText;
  const isListening = battle.speakModalStatus === "listening";
  const canFinish = battle.speakModalStatus === "finished";

  return `
    <div class="cmp_speak_modal cmp-speak-modal" data-component="cmp_speak_modal">
      <div class="speak-modal-card">
        <h3>Speak With The Plant</h3>
        <p>先听标准发音，再模仿说出来。首版只给鼓励，不做严格评分。</p>
        <div class="speak-sentence">${sentence}</div>
        <div class="speak-status-badge ${isListening ? "is-listening" : canFinish ? "is-finished" : ""}">
          ${getStatusLabel(battle.speakModalStatus)}
        </div>
        <div class="modal-button-row">
          <button class="modal-action-button" data-action="play-speak-example">${uiText.battle.playExample}</button>
          <button class="modal-action-button" data-action="${isListening ? "stop-recording" : "start-recording"}">
            ${isListening ? uiText.battle.stopRecording : uiText.battle.startRecording}
          </button>
          <button class="modal-action-button" data-action="complete-speak" ${canFinish ? "" : "disabled"}>
            ${uiText.battle.speakComplete}
          </button>
          <button class="modal-action-button" data-action="close-speak-modal">${uiText.battle.closeModal}</button>
        </div>
      </div>
    </div>
  `;
}
