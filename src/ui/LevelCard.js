function renderStars(stars) {
  return `<div class="star-row">${[1, 2, 3]
    .map((index) => `<span class="${index <= stars ? "is-on" : ""}">★</span>`)
    .join("")}</div>`;
}

export function LevelCard({ level, locked, stars, completed }) {
  return `
    <button
      class="level-card ${locked ? "locked" : "unlocked"} ${completed ? "completed" : ""}"
      data-component="cmp_level_card"
      data-action="${locked ? "" : "open-level"}"
      data-level-id="${level.id}"
      ${locked ? "disabled" : ""}
    >
      <div>
        <div class="level-index">${locked ? "🔒" : level.id}</div>
        <h3>${level.title}</h3>
        <p>${level.subtitle}</p>
      </div>
      <div>
        ${renderStars(stars)}
      </div>
    </button>
  `;
}
