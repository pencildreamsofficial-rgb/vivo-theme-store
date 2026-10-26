const $ = selector => document.querySelector(selector);

let allVideos = [];

const sidebar = $('#sidebar');
const scrim = $('#scrim');
const searchInput = $('#searchInput');

function menu(open) {
  sidebar.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
}

$('#menuBtn').addEventListener('click', () => menu(true));
$('#closeMenu').addEventListener('click', () => menu(false));
scrim.addEventListener('click', () => menu(false));

sidebar.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => menu(false));
});

$('#searchBtn').addEventListener('click', () => {
  const wrap = $('#searchWrap');
  wrap.classList.toggle('visible');

  if (wrap.classList.contains('visible')) {
    searchInput.focus();
  } else {
    searchInput.value = '';
    render();
  }
});

$('#clearSearch').addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  render();
});

searchInput.addEventListener('input', render);

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function getYoutubeId(raw) {
  try {
    const url = new URL(raw);

    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (
      url.hostname === 'youtube.com' ||
      url.hostname.endsWith('.youtube.com')
    ) {
      if (url.searchParams.get('v')) {
        return url.searchParams.get('v');
      }

      const match = url.pathname.match(
        /^\/(?:shorts|embed|live|v)\/([^/?]+)/
      );

      return match ? match[1] : '';
    }
  } catch {}

  return '';
}

function validHttpUrl(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function card(video) {
  const title = video.title || 'Untitled video';
  const description =
    video.description || 'Vivo & iQOO customization';

  const youtubeId = getYoutubeId(video.url || '');

  const thumbnailUrl =
    video.thumbnail ||
    (youtubeId
      ? `https://img.youtube.com/vi/${encodeURIComponent(youtubeId)}/hqdefault.jpg`
      : '');

  const thumbnail = validHttpUrl(thumbnailUrl)
    ? `<img src="${safe(thumbnailUrl)}"
         alt="${safe(title)} thumbnail"
         loading="lazy"
         onerror="this.style.display='none'">`
    : `<div class="thumb-fallback">VIVO<br>THEMES</div>`;

  const watch = validHttpUrl(video.url || '')
    ? `<a class="small-btn"
         href="${safe(video.url)}"
         target="_blank"
         rel="noopener noreferrer">▶ Watch</a>`
    : '';

  const downloadUrl = validHttpUrl(video.download || '')
    ? video.download
    : '';

  const detailsUrl =
    'download.html?url=' + encodeURIComponent(downloadUrl) +
    '&title=' + encodeURIComponent(title) +
    '&devices=' + encodeURIComponent(
      video.devices ||
      video.description ||
      'Check theme compatibility'
    );

  const downloadButton = downloadUrl
    ? `<a class="small-btn secondary"
         href="${safe(detailsUrl)}">↓ Theme ZIP</a>`
    : '';

  return `
    <article class="video-card">
      <a href="${safe(validHttpUrl(video.url || '') ? video.url : '#')}"
         ${validHttpUrl(video.url || '')
           ? 'target="_blank" rel="noopener noreferrer"'
           : ''}
         aria-label="Watch ${safe(title)}">
        <div class="thumb">
          ${thumbnail}
          <span class="play">▶ PLAY</span>
        </div>
      </a>

      <div class="card-body">
        <div class="card-tag">
          ${safe(video.tag || video.category || 'VIVO THEME')}
        </div>

        <h3>${safe(title)}</h3>
        <p>${safe(description)}</p>

        <div class="card-actions">
          ${watch}
          ${downloadButton}
        </div>
      </div>
    </article>
  `;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = allVideos.filter(video => {
    const searchable = [
      video.title,
      video.description,
      video.category,
      video.tag,
      video.devices
    ].join(' ').toLowerCase();

    return !query || searchable.includes(query);
  });

  const groups = {
    latest: ['latestGrid', 'latest'],
    premium: ['premiumGrid', 'premium'],
    members: ['membersGrid', 'members'],
    live: ['liveGrid', 'live'],
    widgets: ['widgetsGrid', 'widgets']
  };

  for (const [gridId, category] of Object.values(groups)) {
    const grid = $('#' + gridId);

    const videos = filtered.filter(video =>
      String(video.category || 'latest').toLowerCase() === category
    );

    grid.innerHTML = videos.length
      ? videos.map(card).join('')
      : `<div class="empty">${
          query
            ? 'No matches found. Try another search.'
            : 'Videos will appear here when you add them in videos.json.'
        }</div>`;
  }

  const posts = (window.storeData?.community || []).filter(post => {
    const text = String(post.text || '').toLowerCase();
    return !query || text.includes(query);
  });

  $('#communityGrid').innerHTML = posts.length
    ? posts.map(post => `
        <article class="community-card">
          <p>${safe(post.text || '')}</p>
          <small>${safe(post.date || 'Community update')}</small>
        </article>
      `).join('')
    : `<div class="empty">Community updates will appear here.</div>`;
}

async function loadStore() {
  try {
    const response = await fetch('videos.json', {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error('Unable to load videos.json');
    }

    const data = await response.json();

    window.storeData =
      data && typeof data === 'object' ? data : {};

    allVideos = Array.isArray(window.storeData.videos)
      ? window.storeData.videos.filter(
          video => video && typeof video === 'object'
        )
      : [];

    const telegram = window.storeData.settings?.telegram;

    if (validHttpUrl(telegram || '')) {
      $('#telegramLink').href = telegram;
      $('#footerTelegram').href = telegram;
    }
  } catch (error) {
    console.error('Vivo Theme Store loading error:', error);

    allVideos = [];
    window.storeData = { community: [] };
  }

  render();
}

loadStore();

