// ═══════════════════════════════════════════════
// TABS — Tab switching + keyboard shortcuts
// ═══════════════════════════════════════════════

import { renderMap } from '../render/map.js';
import { showToast } from './toast.js';

let mapInitialized = false;

export function switchTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update nav buttons
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${tabId}`);
  });

  // Init map on first open
  if (tabId === 'map' && !mapInitialized) {
    renderMap();
    mapInitialized = true;
  } else if (tabId === 'map') {
    // Re-render flights/pins on subsequent opens (handles resize)
    renderMap();
  }
}

export function initTabs() {
  // Tab bar buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Top nav buttons
  document.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Save buttons
  document.querySelectorAll('[data-action="save"]').forEach(btn => {
    btn.addEventListener('click', () => showToast('★', 'PROGRESS SAVED.'));
  });

  // Bottom bar hotkey clicks
  document.querySelectorAll('.hotkey[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.querySelectorAll('.hotkey[data-action="save"]').forEach(btn => {
    btn.addEventListener('click', () => showToast('★', 'PROGRESS SAVED.'));
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    if (key === 'q') switchTab('quests');
    if (key === 'm') switchTab('map');
    if (key === 'a') switchTab('achievements');
    if (key === 'c') switchTab('magnets');
    if (e.key === 'F5') {
      e.preventDefault();
      showToast('★', 'PROGRESS SAVED.');
    }
  });
}
