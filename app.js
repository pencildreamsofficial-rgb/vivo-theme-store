(() => {
  const $ = (s) => document.querySelector(s);
  const IC = (n) => window.VI.ic(n);
  const DEFAULT_YT = 'https://www.youtube.com/@vivothemestore';

  let data = { settings: {}, videos: [], resources: [], posts: [], premiumMembers: [] };
  const searchInput = $('#searchInput');

  /* ---------- helpers ---------- */
  const isHttps = (u) => /^https:\/\//i.test(String(u || '').trim());

  function ytId(url = '') {
    const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
    return m ? m[1] : '';
  }

  // Hide leftover demo / placeholder entries.
  const fakeTitles = new Set([
    'originos theme preview', 'minimal funtouch os setup', 'purple amoled theme',
    'members theme collection', 'live theme q&a'
  ]);
  function isDemo(item = {}) {
    const title = String(item.title || '').trim().toLowerCase();
    const text = [item.title, item.description, item.text].join(' ').toLowerCase();
    const links = [item.url, item.video, item.download].join(' ').toLowerCase();
    if (fakeTitles.has(title)) return true;
    return /\bdemo\b|\bsample\b|\bplaceholder\b/.test(text) ||
      /\breplace\s+with\b|replace-with|example\.com|your_channel/.test(text + ' ' + links);
  }

  const joinUrl = () =>
    data.settings.membershipUrl ||
    ((data.settings.youtubeChannel || data.settings.youtube || DEFAULT_YT).split('?')[0].replace(/\/$/, '') + '/join');

  /* ---------- menu + dock ---------- */
  const ITEMS = [
    { key: 'join', icon: 'join', menu: 'Be a Premium Member', dock: 'Join' },
    { key: 'latest', icon: 'recent', menu: 'Recent Videos', dock: 'Recent' },
    { key: 'premium', icon: 'premium', menu: 'Premium Videos', dock: 'Premium' },
    { key: 'live', icon: 'live', menu: 'Live Streams', dock: 'Live' },
    { key: 'widgets', icon: 'docs', menu: 'Widgets and Documents', dock: 'Docs' },
    { key: 'comments', icon: 'chat', menu: 'Comment Option', dock: 'Chat' }
  ];

  function buildNav() {
    const menu = $('#menu');
    const dock = $('#dock');
    menu.innerHTML = ITEMS.map((it, i) => {
      const cls = 'g' + (i === 0 ? ' first' : '');
      return it.key === 'join'
        ? `<a class="${cls}" role="menuitem" href="${joinUrl()}" target="_blank" rel="noopener noreferrer">${IC(it.icon)}<span>${it.menu}</span></a>`
        : `<button class="${cls}" role="menuitem" type="button" data-target="${it.key}">${IC(it.icon)}<span>${it.menu}</span></button>`;
    }).join('');
    dock.innerHTML = ITEMS.map((it) =>
      it.key === 'join'
        ? `<a class="g" href="${joinUrl()}" target="_blank" rel="noopener noreferrer" aria-label="${it.menu}">${IC(it.icon)}${it.dock}</a>`
        : `<button class="g" type="button" data-target="${it.key}" aria-label="${it.menu}">${IC(it.icon)}${it.dock}</button>`
    ).join('');
  }

  const menuBtn = $('#menuBtn');
  const menu = $('#menu');
  const closeMenu = () => { menu.classList.remove('on'); menuBtn.setAttribute('aria-expanded', 'false'); };

  menuBtn.innerHTML = IC('dots');
  $('#searchIcon').innerHTML = IC('search');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('on');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-target]');
    if (t) {
      closeMenu();
      document.getElementById('sec-' + t.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('#menu a')) closeMenu();
    else if (!e.target.closest('#menu, #menuBtn')) closeMenu();
  });

  /* tap glow + soft bounce */
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest('.g');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', e.clientX - r.left + 'px');
    el.style.setProperty('--y', e.clientY - r.top + 'px');
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  });

  /* ---------- hero phone + floating objects ---------- */
  const phone = $('#phone');
  const stage = $('#stage');
  stage.addEventListener('pointermove', (e) => {
    const r = phone.getBoundingClientRect();
    phone.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 30 + 'deg');
    phone.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 30 + 'deg');
  });
  ['pointerleave', 'pointerup'].forEach((ev) => stage.addEventListener(ev, () => {
    phone.style.setProperty('--rx', '0deg');
    phone.style.setProperty('--ry', '0deg');
  }));

  function tick() {
    const d = new Date();
    $('#clockText').textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    $('#dateText').textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  }
  tick();
  setInterval(tick, 20000);

  const FO = [['phone', 8, 60, 54, .35], ['battery', 80, 40, 46, .6], ['wifi', 86, 75, 44, .25], ['image', 4, 125, 50, .5],
    ['bell', 74, 115, 44, .4], ['palette', 15, 165, 44, .7], ['live', 90, 155, 42, .3], ['recent', 45, 95, 50, .55]];
  $('#fl').innerHTML = FO.map((o) =>
    `<div class="fo" data-sp="${o[4]}" style="left:${o[1]}%;top:${o[2] * 1.1 + 80}px;width:${o[3]}px;height:${o[3]}px">${IC(o[0])}</div>`).join('');
  const fos = [...document.querySelectorAll('.fo')];
  let raf = 0;
  const parallax = () => {
    raf = 0;
    const y = scrollY;
    fos.forEach((f, i) => {
      const s = +f.dataset.sp;
      f.style.transform = `translate3d(0,${-y * s}px,0) rotate(${y * s * .08 * (i % 2 ? 1 : -1)}deg)`;
    });
  };
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    addEventListener('scroll', () => { raf || (raf = requestAnimationFrame(parallax)); }, { passive: true });
  }

  /* ---------- cards ---------- */
  function card(v) {
    const article = document.createElement('article');
    article.className = 'card glass';

    const videoUrl = v.url || v.video || '#';
    const thumb = document.createElement('a');
    thumb.className = 'th';
    thumb.href = videoUrl;
    thumb.target = '_blank';
    thumb.rel = 'noopener noreferrer';
    thumb.setAttribute('aria-label', 'Watch ' + (v.title || 'video'));

    const id = ytId(videoUrl);
    const src = v.thumbnail || (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '');
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = () => {
        if (id && !img.dataset.fb) { img.dataset.fb = '1'; img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`; }
        else img.remove();
      };
      thumb.append(img);
    }
    if (v.tag) {
      const lb = document.createElement('span');
      lb.className = 'lb';
      lb.textContent = v.tag;
      thumb.append(lb);
    }

    const h = document.createElement('h3');
    h.textContent = v.title || 'Untitled video';
    article.append(thumb, h);

    if (v.description) {
      const p = document.createElement('p');
      p.textContent = v.description;
      article.append(p);
    }

    const bt = document.createElement('div');
    bt.className = 'bt';
    const watch = document.createElement('a');
    watch.className = 'g';
    watch.href = videoUrl;
    watch.target = '_blank';
    watch.rel = 'noopener noreferrer';
    watch.textContent = 'Watch';
    bt.append(watch);

    const dl = String(v.download || '').trim();
    if (isHttps(dl) && !/example\.com/i.test(dl)) {
      const zip = document.createElement('a');
      zip.className = 'g zp';
      const params = new URLSearchParams({
        id: v.id || '', title: v.title || 'Theme', url: dl, devices: v.device || 'Vivo & iQOO'
      });
      zip.href = 'download.html?' + params.toString();
      zip.textContent = 'Theme ZIP';
      bt.append(zip);
    }
    article.append(bt);
    return article;
  }

  const ALIAS = {
    latest: 'latest', recent: 'latest', premium: 'premium',
    members: 'premium', member: 'premium', 'member-only': 'premium', 'members-only': 'premium',
    live: 'live', widgets: 'widgets', widget: 'widgets'
  };
  const EMPTY = {
    latest: 'No recent videos yet.', premium: 'No premium videos yet.',
    live: 'No live streams yet.', widgets: 'No widgets or documents yet.'
  };

  function renderMembers() {
    const box = $('#memberList');
    const list = (data.premiumMembers || []).filter((m) => m && m.name);
    box.replaceChildren();
    if (!list.length) {
      const n = document.createElement('div');
      n.className = 'none glass';
      n.textContent = 'Channel members will appear here.';
      box.append(n);
      return;
    }
    list.forEach((m) => {
      const item = document.createElement('div');
      item.className = 'mm';
      const av = document.createElement('div');
      av.className = 'av';
      if (isHttps(m.image)) {
        const img = document.createElement('img');
        img.src = m.image; img.alt = ''; img.loading = 'lazy';
        img.onerror = () => { img.remove(); av.textContent = m.name[0].toUpperCase(); };
        av.append(img);
      } else av.textContent = m.name[0].toUpperCase();
      const nm = document.createElement('div');
      nm.textContent = m.name;
      item.append(av, nm);
      box.append(item);
    });
  }

  function render() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const grids = { latest: $('#latestGrid'), premium: $('#premiumGrid'), live: $('#liveGrid'), widgets: $('#widgetsGrid') };
    Object.values(grids).forEach((g) => g.replaceChildren());

    const videos = (data.videos || []).filter((v) => !isDemo(v) && (v.url || v.video));
    videos.forEach((v) => {
      const raw = String(v.section || v.category || 'latest').toLowerCase();
      const target = grids[ALIAS[raw] || 'latest'];
      const hay = [v.title, v.description, v.category, v.section, v.tag, v.device, v.os].join(' ').toLowerCase();
      if (q && !hay.includes(q)) return;
      target.append(card(v));
    });

    (data.resources || []).filter((r) => !isDemo(r)).forEach((r) => {
      if (q && !([r.title, r.description].join(' ').toLowerCase().includes(q))) return;
      const a = document.createElement('a');
      a.className = 'post glass g';
      a.href = r.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const h = document.createElement('h3'); h.textContent = r.title || 'Resource';
      const p = document.createElement('p'); p.textContent = r.description || '';
      a.append(h, p);
      grids.widgets.append(a);
    });

    Object.entries(grids).forEach(([k, g]) => {
      const section = $('#sec-' + k);
      if (!g.children.length) {
        if (q) { section.hidden = true; return; }
        const n = document.createElement('div');
        n.className = 'none glass';
        n.textContent = EMPTY[k];
        g.append(n);
      }
      section.hidden = false;
    });
    $('#sec-members').hidden = !!q;

    const cg = $('#communityGrid');
    cg.replaceChildren();
    (data.posts || []).filter((p) => !isDemo(p)).forEach((p) => {
      if (q && !([p.title, p.text].join(' ').toLowerCase().includes(q))) return;
      const a = document.createElement('a');
      a.className = 'post glass g';
      a.href = p.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const h = document.createElement('h3'); h.textContent = p.title || 'Community post';
      const t = document.createElement('p'); t.textContent = p.text || '';
      a.append(h, t);
      cg.append(a);
    });
  }

  let searchTimer;
  searchInput.addEventListener('input', () => {
    render();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (searchInput.value.trim()) {
        const first = [...document.querySelectorAll('section.s')].find((s) => !s.hidden && s.querySelector('.card,.post'));
        first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
  });

  /* ---------- load data ---------- */
  buildNav();
  fetch('./videos.json', { cache: 'no-store' })
    .then((r) => { if (!r.ok) throw new Error('Could not load videos.json'); return r.json(); })
    .then((d) => {
      data = Object.assign(data, d);
      data.settings = d.settings || {};
      const yt = (data.settings.youtubeChannel || data.settings.youtube || DEFAULT_YT);
      const tg = data.settings.telegram || '#';
      ['telegramLink', 'footerTelegram'].forEach((id) => { const el = document.getElementById(id); if (el) el.href = tg; });
      $('#ytComment').href = yt;
      buildNav();
      renderMembers();
      render();
    })
    .catch((err) => {
      console.error('Store error:', err);
      ['latestGrid', 'premiumGrid', 'liveGrid', 'widgetsGrid'].forEach((id) => {
        $('#' + id).innerHTML = '<div class="none glass">Could not load videos. Please check videos.json.</div>';
      });
      renderMembers();
    });
})();
