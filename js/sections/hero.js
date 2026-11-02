export function initHero(config) {
  const section = document.querySelector("#hero");
  if (!section) return;
  section.querySelector("#hero-title").textContent = config.hero.title;
  section.querySelector('[data-field="names"]').innerHTML =
    `${escapeText(config.basic.groomName)} <span aria-hidden="true">♥</span> ${escapeText(config.basic.brideName)}`;
  section.querySelector('[data-field="date"]').textContent =
    `${config.basic.dateLabel} ${config.basic.timeLabel}`;
}
function escapeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
