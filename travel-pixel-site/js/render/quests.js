// ═══════════════════════════════════════════════
// QUESTS — Quest log rendering
// ═══════════════════════════════════════════════

function questMeta(status, questTypeOverride) {
  // Returns [cssClass, typeClass, typeLabel]
  switch (status) {
    case 'active':
      return ['active-quest', 'active', '&#9733; ACTIVE QUEST'];
    case 'completed':
      if (questTypeOverride === 'side') {
        return ['completed', 'done', '&#10003; SIDE QUEST'];
      }
      return ['completed', 'done', '&#10003; COMPLETED'];
    case 'upcoming-main':
      return ['main-quest', 'main', '&#9734; UPCOMING'];
    case 'upcoming-side':
      return ['side-quest', 'side', '&#9734; SIDE QUEST'];
    default:
      return ['', 'main', status];
  }
}

function renderObjectives(objectives, isCompleted) {
  if (!objectives || !objectives.length) return '';
  const header = isCompleted ? 'OBJECTIVES: (ALL COMPLETE)' : 'OBJECTIVES:';
  const items = objectives.map(obj => `
    <div class="objective">
      <div class="obj-check ${obj.done ? 'done' : ''}">${obj.done ? '&#10003;' : '&#9675;'}</div>
      <span class="obj-text ${obj.done ? 'done' : ''}">${obj.text}</span>
    </div>
  `).join('');

  return `
    <div class="quest-objectives">
      <h4>${header}</h4>
      ${items}
    </div>
  `;
}

function renderRewards(rewards) {
  if (!rewards || !rewards.length) return '';
  return `
    <div class="quest-rewards">
      ${rewards.map(r => `<div class="reward">&#9733; ${r}</div>`).join('')}
    </div>
  `;
}

function renderQuest(quest) {
  const [entryClass, typeClass, typeLabel] = questMeta(quest.status, quest.questTypeOverride);
  const isCompleted = quest.status === 'completed';
  const xpStyle = isCompleted ? 'style="color:var(--green);"' : '';
  const xpSuffix = isCompleted ? ' &#10003;' : '';
  const arabicName = quest.nameArabic
    ? ` <span class="arabic-bracket" style="font-size:14px;">${quest.nameArabic}</span>`
    : '';

  return `
    <div class="quest-entry ${entryClass}" data-quest>
      <div class="quest-header">
        <div class="quest-title-area">
          <span class="quest-type ${typeClass}">${typeLabel}</span>
          <div class="quest-name">${quest.name}${arabicName}</div>
          <div class="quest-location">&#9758; ${quest.location}</div>
        </div>
        <div class="quest-status">
          <div class="quest-date">${quest.date}</div>
          <div class="quest-xp" ${xpStyle}>+${quest.xp} XP${xpSuffix}</div>
        </div>
      </div>
      <div class="quest-body">
        <p>${quest.narrative}</p>
        ${renderObjectives(quest.objectives, isCompleted)}
        ${renderRewards(quest.rewards)}
      </div>
    </div>
  `;
}

export function renderQuestLog(quests, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = quests.map(renderQuest).join('');

  // Event delegation for expand/collapse
  el.addEventListener('click', e => {
    const entry = e.target.closest('[data-quest]');
    if (entry) entry.classList.toggle('expanded');
  });

  // Auto-expand active quest
  setTimeout(() => {
    const active = el.querySelector('.active-quest');
    if (active) active.classList.add('expanded');
  }, 500);
}
