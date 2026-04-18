// ═══════════════════════════════════════════════
// PANELS — Collapsible left-panel sections
// ═══════════════════════════════════════════════

export function initPanelToggles() {
  document.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const toggle  = header.querySelector('.toggle');

      if (content.style.display === 'none') {
        content.style.display = '';
        toggle.innerHTML = '&#9660;';
      } else {
        content.style.display = 'none';
        toggle.innerHTML = '&#9654;';
      }
    });
  });
}
