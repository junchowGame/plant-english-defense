export function MainButton({ label, action, disabled = false, extraClass = "" }) {
  return `<button class="cmp-main-button ${extraClass}" data-component="cmp_main_button" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
