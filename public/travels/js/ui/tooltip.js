// ═══════════════════════════════════════════════
// TOOLTIP — Show/hide/move tooltip on hover
// ═══════════════════════════════════════════════

export function initTooltips() {
  const tooltip = document.getElementById('tooltip');
  const ttName = document.getElementById('tt-name');
  const ttType = document.getElementById('tt-type');
  const ttDesc = document.getElementById('tt-desc');

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const parts = el.dataset.tooltip.split('|');
      ttName.textContent = parts[0] || '';
      ttType.textContent = parts[1] || '';
      ttDesc.textContent = parts[2] || '';
      tooltip.classList.add('show');
    });

    el.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top  = (e.clientY - 8) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('show');
    });
  });
}
