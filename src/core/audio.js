import { getPhrase } from "../data/phrases.js";

export function createAudioManager(getState) {
  let audioContext = null;
  let lastUtterance = null;

  function canPlayVoice() {
    const state = getState();
    return state.save.settings.masterAudioEnabled && state.save.settings.voiceOverEnabled;
  }

  function canPlayAnyAudio() {
    const state = getState();
    return state.save.settings.masterAudioEnabled;
  }

  function getAudioContext() {
    if (!("AudioContext" in window || "webkitAudioContext" in window)) {
      return null;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = audioContext ?? new AudioCtx();
    return audioContext;
  }

  function unlockAudio() {
    const context = getAudioContext();
    if (context?.state === "suspended") {
      context.resume();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      window.speechSynthesis.getVoices();
    }
  }

  function pickEnglishVoice() {
    if (!("speechSynthesis" in window)) {
      return null;
    }
    return window.speechSynthesis.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith("en")) ?? null;
  }

  function speakText(text) {
    if (!text || !canPlayVoice() || !("speechSynthesis" in window)) {
      return;
    }
    unlockAudio();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1.18;
    const voice = pickEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }
    lastUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function playTone(frequency = 440, duration = 0.18) {
    if (!canPlayAnyAudio() || !("AudioContext" in window || "webkitAudioContext" in window)) {
      return;
    }

    const context = getAudioContext();
    if (!context) {
      return;
    }
    if (context.state === "suspended") {
      context.resume();
    }
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
    unlock() {
      unlockAudio();
    },
    playPromptByText(text) {
      unlockAudio();
      playTone(480, 0.08);
      speakText(text);
    },
    playPhrase(phraseId, fallbackText = "") {
      const phrase = getPhrase(phraseId);
      unlockAudio();
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
      lastUtterance = null;
    },
  };
}
