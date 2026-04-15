// ═══════════════════════════════════════════════
// BOTTOM BAR — Hotkeys and game clock
// ═══════════════════════════════════════════════

export function renderBottomBar(site, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = `
    <div class="hotkeys">
      <div class="hotkey" data-tab="quests"><span class="key">Q</span><span class="key-label">QUESTS</span></div>
      <div class="hotkey" data-tab="map"><span class="key">M</span><span class="key-label">MAP</span></div>
      <div class="hotkey" data-tab="achievements"><span class="key">A</span><span class="key-label">FEATS</span></div>
      <div class="hotkey"><span class="key">I</span><span class="key-label">INV</span></div>
      <div class="hotkey"><span class="key">P</span><span class="key-label">PARTY</span></div>
      <div class="hotkey" data-action="save"><span class="key">F5</span><span class="key-label">SAVE</span></div>
    </div>
    <div class="game-clock">
      <span>&#9788;</span>
      <span id="game-time">DAY ${site.currentDay}</span>
    </div>
  `;
}
