import { getPhrase } from "../data/phrases.js";

export function createAudioManager(getState) {
  let audioContext = null;

  function canPlayVoice() {
    const state = getState();
    return state.save.settings.masterAudioEnabled && state.save.settings.voiceOverEnabled;
  }

  function canPlayAnyAudio() {
    const state = getState();
    return state.save.settings.masterAudioEnabled;
  }

  function speakText(text) {
    if (!text || !canPlayVoice() || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1.18;
    window.speechSynthesis.speak(utterance);
  }

  function playTone(frequency = 440, duration = 0.18) {
    if (!canPlayAnyAudio() || !("AudioContext" in window || "webkitAudioContext" in window)) {
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = audioContext ?? new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.03;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  return {
    playPromptByText(text) {
      playTone(480, 0.08);
      speakText(text);
    },
    playPhrase(phraseId, fallbackText = "") {
      const phrase = getPhrase(phraseId);
      playTone(520, 0.08);
      speakText(phrase.text || fallbackText);
    },
    playFeedback(kind) {
      if (kind === "success") {
        playTone(660, 0.12);
        playTone(820, 0.14);
        speakText(getPhrase("feedback_great").text);
      } else if (kind === "retry") {
        playTone(320, 0.18);
        speakText(getPhrase("feedback_try_again").text);
      }
    },
    stopSpeech() {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
  };
}
