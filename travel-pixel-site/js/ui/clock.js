// ═══════════════════════════════════════════════
// CLOCK — Live game clock in bottom bar
// ═══════════════════════════════════════════════

let clockInterval = null;

export function initClock(currentDay) {
  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('game-time');
    if (el) el.textContent = `DAY ${currentDay} — ${h}:${m}`;
  }

  update();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(update, 1000);
}
