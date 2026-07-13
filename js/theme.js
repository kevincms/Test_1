/* ============================================
   THEME MANAGER
   ============================================ */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);

  // Update toggle icon
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
}
