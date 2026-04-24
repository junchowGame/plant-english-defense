import { SecondaryButton } from "../ui/SecondaryButton.js";
import { ToggleSwitch } from "../ui/ToggleSwitch.js";
import { getPhrase } from "../data/phrases.js";

export const parentScene = {
  render({ state, uiText }) {
    const phrases = state.save.learnedPhraseIds.map((phraseId) => getPhrase(phraseId)).filter(Boolean);

    return `
      <section class="page-shell scene-parent" data-page="page_parent_settings">
        <div class="page-bg-decor"></div>
        <div class="page-content">
          <div class="scene-header">
            <div>
              <h1 class="scene-title">${uiText.parent.title}</h1>
              <p class="scene-description">${uiText.parent.description}</p>
            </div>
            ${SecondaryButton({ label: uiText.parent.back, action: "go-home" })}
          </div>
          <div class="parent-layout">
            <div class="settings-card">
              <div class="settings-list">
                <div class="settings-row">
                  <div>
                    <strong>${uiText.parent.bgm}</strong>
                    <span>占位版不播放真实 BGM，但保留配置入口。</span>
                  </div>
                  ${ToggleSwitch({
                    checked: state.save.settings.bgmEnabled,
                    action: "toggle-setting",
                    settingKey: "bgmEnabled",
                  })}
                </div>
                <div class="settings-row">
                  <div>
                    <strong>${uiText.parent.voice}</strong>
                    <span>使用浏览器语音播报作为占位实现。</span>
                  </div>
                  ${ToggleSwitch({
                    checked: state.save.settings.voiceOverEnabled,
                    action: "toggle-setting",
                    settingKey: "voiceOverEnabled",
                  })}
                </div>
                <div class="settings-row">
                  <div>
                    <strong>${uiText.parent.autoplay}</strong>
                    <span>进入每题时自动播放题目。</span>
                  </div>
                  ${ToggleSwitch({
                    checked: state.save.settings.autoPlayPrompt,
                    action: "toggle-setting",
                    settingKey: "autoPlayPrompt",
                  })}
                </div>
              </div>
              <div style="margin-top: var(--space-24);">
                ${SecondaryButton({ label: uiText.parent.clearSave, action: "clear-save" })}
              </div>
            </div>
            <div class="phrase-card">
              <h2 style="margin:0;">${uiText.parent.learned}</h2>
              ${
                phrases.length
                  ? `<div class="phrase-list">${phrases
                      .map((phrase) => `<div class="phrase-chip">${phrase.text}</div>`)
                      .join("")}</div>`
                  : `<p>${uiText.parent.noPhrases}</p>`
              }
            </div>
          </div>
        </div>
      </section>
    `;
  },
};
