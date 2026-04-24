export function ToggleSwitch({ checked, action, settingKey }) {
  return `
    <button
      class="toggle-switch ${checked ? "is-on" : ""}"
      data-component="cmp_toggle_switch"
      data-action="${action}"
      data-setting-key="${settingKey}"
      aria-pressed="${checked ? "true" : "false"}"
    ></button>
  `;
}
