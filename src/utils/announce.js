export function announce(message) {
  const el = document.getElementById('announcements');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}
