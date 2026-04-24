export function FeedbackBar({ title, body, actionButtonHtml = "" }) {
  return `
    <div class="cmp_feedback_bar feedback-bar" data-component="cmp_feedback_bar">
      <div>
        <strong>${title}</strong>
        <p>${body}</p>
      </div>
      <div>${actionButtonHtml}</div>
    </div>
  `;
}
