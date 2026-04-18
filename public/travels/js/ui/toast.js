// ═══════════════════════════════════════════════
// TOAST — Slide-in notification
// ═══════════════════════════════════════════════

let toastTimeout = null;

export function showToast(icon, text) {
  const toastEl   = document.getElementById('toast');
  const iconEl    = document.getElementById('toast-icon');
  const textEl    = document.getElementById('toast-text');

  iconEl.textContent = icon;
  textEl.textContent = text;
  toastEl.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 2500);
}
