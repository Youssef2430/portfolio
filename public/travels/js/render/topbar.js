// ═══════════════════════════════════════════════
// TOPBAR — Character HUD, stat bars, navigation
// ═══════════════════════════════════════════════

export function renderTopBar(character, containerId) {
  const el = document.getElementById(containerId);
  const hpPct = Math.round((character.hp.current / character.hp.max) * 100);
  const xpPct = Math.round((character.xp.current / character.xp.max) * 100);
  const stPct = Math.round((character.stamina.current / character.stamina.max) * 100);

  // Determine current theme so we can render the correct accessible name
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'night';
  const toggleIcon = currentTheme === 'night' ? '🌙' : '☀️';
  const toggleLabel = currentTheme === 'night' ? 'Switch to Day' : 'Switch to Night';

  const arabicName = character.nameArabic
    ? ` <span class="arabic-bracket" style="font-size:16px;">${character.nameArabic}</span>`
    : '';

  el.innerHTML = `
    <div class="char-info">
      <div class="char-avatar">
        ${character.emoji}
        <span class="level-badge">LV${character.level}</span>
      </div>
      <div class="char-details">
        <div class="char-name">${character.name}${arabicName}</div>
        <div class="char-class">CLASS: <span class="arabic-bracket">「</span>${character.class}<span class="arabic-bracket">」</span></div>
      </div>
      <div class="stat-bars">
        <div class="stat-bar-row">
          <span class="stat-bar-label" style="color:var(--hp-red);">HP</span>
          <div class="stat-bar"><div class="stat-bar-fill hp" style="width:${hpPct}%"></div></div>
          <span class="stat-bar-val">${character.hp.current}/${character.hp.max}</span>
        </div>
        <div class="stat-bar-row">
          <span class="stat-bar-label" style="color:var(--xp-gold);">XP</span>
          <div class="stat-bar"><div class="stat-bar-fill xp" style="width:${xpPct}%"></div></div>
          <span class="stat-bar-val">${character.xp.current}/${character.xp.max}</span>
        </div>
        <div class="stat-bar-row">
          <span class="stat-bar-label" style="color:var(--stamina-green);">ST</span>
          <div class="stat-bar"><div class="stat-bar-fill stamina" style="width:${stPct}%"></div></div>
          <span class="stat-bar-val">${character.stamina.current}/${character.stamina.max}</span>
        </div>
      </div>
    </div>
    <div class="top-nav">
      <button class="theme-toggle" data-action="theme" type="button" title="${toggleLabel}" aria-label="${toggleLabel}">${toggleIcon}</button>
    </div>
  `;
}
