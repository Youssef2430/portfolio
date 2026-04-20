// ═══════════════════════════════════════════════
// MAGNETS — Pixel-art fridge-magnet collection board
// ═══════════════════════════════════════════════

export function renderMagnets(magnets, containerId) {
  const el = document.getElementById(containerId);
  const collected = magnets.filter(m => m.collected).length;
  const total = magnets.length;
  // Guard against empty magnet arrays — 0/0 would produce NaN and emit
  // `width:NaN%` into the progress-bar style.
  const pct = total > 0 ? Math.round((collected / total) * 100) : 0;

  // Get unique regions for filter buttons
  const regions = [...new Set(magnets.map(m => m.region))];

  el.innerHTML = `
    <div class="magnet-board">
      <!-- Header -->
      <div class="magnet-header">
        <div class="magnet-title-row">
          <span class="magnet-title">MAGNET COLLECTION</span>
          <span class="magnet-counter">${collected}/${total}</span>
        </div>
        <div class="magnet-progress">
          <div class="magnet-progress-bar" style="width:${pct}%"></div>
        </div>
        <div class="magnet-filters">
          <button class="magnet-filter active" data-region="ALL">ALL</button>
          ${regions.map(r => `<button class="magnet-filter" data-region="${r}">${r}</button>`).join('')}
        </div>
      </div>

      <!-- Magnet Grid -->
      <div class="magnet-grid" id="magnet-grid">
        ${magnets.map((m, i) => renderMagnetCard(m, i)).join('')}
      </div>
    </div>
  `;

  // ── Filter buttons ──
  el.querySelectorAll('.magnet-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.magnet-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const region = btn.dataset.region;
      el.querySelectorAll('.magnet-card').forEach(card => {
        if (region === 'ALL' || card.dataset.region === region) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── Hover interaction — tilt reset on hover ──
  el.querySelectorAll('.magnet-card.collected').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'rotate(0deg) scale(1.08)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function renderMagnetCard(magnet, index) {
  // Deterministic pseudo-random rotation based on city name
  const seed = magnet.city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotation = ((seed % 13) - 6) * 0.8; // range: roughly -4.8 to +4.8 degrees
  const cls = magnet.collected ? 'collected' : 'locked';

  return `
    <div class="magnet-card ${cls}"
         data-region="${magnet.region}"
         style="--rotate: ${rotation}deg; --delay: ${index * 60}ms">
      <div class="magnet-img-wrap">
        <img src="assets/${magnet.image}"
             alt="${magnet.city} magnet"
             class="magnet-img"
             loading="lazy" />
        ${magnet.collected ? '' : '<div class="magnet-lock">🔒</div>'}
      </div>
      <div class="magnet-label">${magnet.city.toUpperCase()}</div>
      <div class="magnet-country">${magnet.country}</div>
    </div>
  `;
}
