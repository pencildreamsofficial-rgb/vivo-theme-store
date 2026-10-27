(() => {
  const key = 'vivo-theme-store-theme';
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const btn = document.getElementById('themeToggle');
  function apply(theme) {
    const dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.body?.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (meta) meta.setAttribute('content', dark ? '#0b1020' : '#f5f8ff');
    if (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }
  let saved = 'light';
  try { saved = localStorage.getItem(key) || 'light'; } catch (_) {}
  apply(saved);
  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, next); } catch (_) {}
    apply(next);
  });
})();
