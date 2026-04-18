// ═══════════════════════════════════════════════
// ACHIEVEMENTS — Achievement grid rendering
// ═══════════════════════════════════════════════

function renderAchievement(ach) {
  const stateClass = ach.locked ? 'locked' : 'unlocked';
  const icon = ach.locked ? '🔒' : ach.icon;
  const dateHtml = ach.date ? `<div class="ach-date">${ach.date}</div>` : '';

  return `
    <div class="achievement ${stateClass}">
      <div class="ach-icon">${icon}</div>
      <div class="ach-info">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.description}</div>
        ${dateHtml}
      </div>
    </div>
  `;
}

export function renderAchievements(achievements, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div class="achievement-grid">
      ${achievements.map(renderAchievement).join('')}
    </div>
  `;
}
