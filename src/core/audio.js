import { getPhrase } from "../data/phrases.js";

export function createAudioManager(getState) {
  let audioContext = null;
  let lastUtterance = null;
  let currentAudio = null;

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

  function speakWithLoadedVoice(utterance) {
    const voice = pickEnglishVoice();
    if (voice) {
      try {
        utterance.voice = voice;
      } catch {}
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        lastUtterance = null;
      }
      return;
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      lastUtterance = null;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }

  function speakText(text) {
    if (!text || !canPlayVoice() || !("speechSynthesis" in window)) {
      return;
    }
    unlockAudio();
    try {
      window.speechSynthesis.cancel();
    } catch {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88;
    utterance.pitch = 1.18;
    lastUtterance = utterance;
    speakWithLoadedVoice(utterance);
  }

  function getPhraseByAudioId(audioId) {
    if (!audioId) {
      return null;
    }
    const normalizedId = audioId.replace(/^vo_/, "").replace(/_the_/g, "_");
    return getPhrase(audioId).audio ? getPhrase(audioId) : getPhrase(normalizedId);
  }

  function resolveAudioSource(audioId) {
    if (!audioId) {
      return "";
    }
    const phrase = getPhraseByAudioId(audioId);
    if (phrase?.audio) {
      return phrase.audio;
    }
    return `assets/audio/${audioId}.mp3`;
  }

  function playAudioFile(audioId, fallbackText = "") {
    if (!audioId || !canPlayVoice() || !("Audio" in window)) {
      speakText(fallbackText);
      return;
    }

    currentAudio?.pause();
    currentAudio = new Audio(resolveAudioSource(audioId));
    currentAudio.preload = "auto";
    currentAudio.play().catch(() => {
      currentAudio = null;
      speakText(fallbackText);
    });
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
    playPrompt(question) {
      unlockAudio();
      playTone(480, 0.08);
      playAudioFile(question?.promptAudioId, question?.promptText ?? "");
    },
    playPhrase(phraseId, fallbackText = "") {
      const phrase = getPhrase(phraseId);
      unlockAudio();
      playTone(520, 0.08);
      playAudioFile(phrase.audio ? phraseId : "", phrase.text || fallbackText);
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
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      currentAudio?.pause();
      currentAudio = null;
      lastUtterance = null;
    },
  };
}
