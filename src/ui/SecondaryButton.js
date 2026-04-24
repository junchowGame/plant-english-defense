export function SecondaryButton({ label, action, disabled = false, extraClass = "" }) {
  return `<button class="cmp-secondary-button ${extraClass}" data-component="cmp_secondary_button" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
