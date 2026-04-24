export function ProgressIndicator({ total, currentIndex }) {
  return `
    <div class="cmp-progress-indicator" data-component="cmp_progress_indicator" aria-label="Question progress">
      ${Array.from({ length: total }, (_, index) => {
        const className =
          index < currentIndex ? "progress-dot is-done" : index === currentIndex ? "progress-dot is-current" : "progress-dot";
        return `<span class="${className}"></span>`;
      }).join("")}
    </div>
  `;
}
