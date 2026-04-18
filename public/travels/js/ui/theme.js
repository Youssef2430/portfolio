// ═══════════════════════════════════════════════
// THEME — Day/Night toggle with localStorage
// ═══════════════════════════════════════════════

import { renderHeroScene } from '../hero/scene.js';
import { refreshMap } from '../render/map.js';

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'night';
}

export function initTheme(defaultTheme) {
  const saved = localStorage.getItem('travel-journal-theme') || defaultTheme;
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'night' ? 'day' : 'night';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('travel-journal-theme', next);
  updateToggleIcon(next);

  // Re-render theme-aware elements
  renderHeroScene();

  // Re-render map if visible
  const mapTab = document.getElementById('tab-map');
  if (mapTab && mapTab.classList.contains('active')) {
    refreshMap();
  }
}

function updateToggleIcon(theme) {
  const btn = document.querySelector('[data-action="theme"]');
  if (btn) {
    btn.textContent = theme === 'night' ? '🌙' : '☀️';
    btn.title = theme === 'night' ? 'Switch to Day' : 'Switch to Night';
  }
}

export function initThemeToggle() {
  // Set correct icon now that the button exists in DOM
  updateToggleIcon(getTheme());

  document.querySelectorAll('[data-action="theme"]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}
