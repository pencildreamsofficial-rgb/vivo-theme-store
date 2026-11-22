(() => {
  const KEY = 'vivo-theme-store-theme';
  const P = {
    join: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    recent: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
    premium: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18"/>',
    live: '<circle cx="12" cy="12" r="2.2"/><path d="M7.5 7.5a6 6 0 000 9M16.5 7.5a6 6 0 010 9"/>',
    docs: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    chat: '<path d="M5 6h14a2 2 0 012 2v7a2 2 0 01-2 2h-7l-4 3v-3H5a2 2 0 01-2-2V8a2 2 0 012-2z"/>',
    dots: '<circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="3"/><path d="M11 18.5h2"/>',
    battery: '<rect x="3" y="8" width="16" height="8" rx="2.5"/><path d="M21 11v2"/>',
    wifi: '<path d="M3 9a13 13 0 0118 0M6 12.5a8.5 8.5 0 0112 0M9 16a4 4 0 016 0"/><circle cx="12" cy="19" r=".8"/>',
    bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/>',
    palette: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10" r="1"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/>'
  };

  window.VI = {
    ic: (name, size = 20) =>
      `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`
  };

  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');
  const btn = document.getElementById('themeToggle');

  function apply(theme) {
    const dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    if (meta) meta.setAttribute('content', dark ? '#0a0b10' : '#f3f4f7');
    if (btn) {
      btn.innerHTML = window.VI.ic(dark ? 'sun' : 'moon');
      const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  const system = window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  apply(saved || system);

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (_) {}
    apply(next);
  });
})();
