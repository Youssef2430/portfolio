// ═══════════════════════════════════════════════
// THEME — Day/Night toggle with localStorage
// ═══════════════════════════════════════════════

import { renderHeroScene } from '../hero/scene.js';
import { refreshMap } from '../render/map.js';

const THEME_STORAGE_KEY = 'travel-journal-theme';

// Safe localStorage wrappers — some environments (Safari private mode,
// strict-privacy browsers, sandboxed iframes) throw SecurityError on access.
// We never want theme persistence to break page initialization.
function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'night';
}

export function initTheme(defaultTheme) {
  const saved = safeGetItem(THEME_STORAGE_KEY) || defaultTheme;
  document.documentElement.setAttribute('data-theme', saved);
  updateToggleIcon(saved);
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'night' ? 'day' : 'night';
  document.documentElement.setAttribute('data-theme', next);
  safeSetItem(THEME_STORAGE_KEY, next);
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
    const label = theme === 'night' ? 'Switch to Day' : 'Switch to Night';
    btn.textContent = theme === 'night' ? '🌙' : '☀️';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
}

export function initThemeToggle() {
  // Set correct icon now that the button exists in DOM
  updateToggleIcon(getTheme());

  document.querySelectorAll('[data-action="theme"]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}
