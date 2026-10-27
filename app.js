(() => {
  const $ = (s) => document.querySelector(s);

  const menuBtn = $('#menuBtn');
  const closeMenu = $('#closeMenu');
  const sidebar = $('#sidebar');
  const scrim = $('#scrim');

  const openMenu = () => {
    sidebar?.classList.add('open');
    scrim?.classList.add('show');
    document.body.classList.add('menu-open');
  };

  const shutMenu = () => {
    sidebar?.classList.remove('open');
    scrim?.classList.remove('show');
    document.body.classList.remove('menu-open');
  };

  menuBtn?.addEventListener('click', openMenu);
  closeMenu?.addEventListener('click', shutMenu);
  scrim?.addEventListener('click', shutMenu);
  sidebar?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', shutMenu)
  );

  const searchWrap = $('#searchWrap');
  const searchBtn = $('#searchBtn');
  const searchInput = $('#searchInput');

  searchBtn?.addEventListener('click', () => {
    searchWrap?.classList.toggle('active');
    if (searchWrap?.classList.contains('active')) {
      searchInput?.focus();
    }
  });

  $('#clearSearch')?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      render();
      searchInput.focus();
    }
  });

  let allVideos = [];
  let allResources = [];

  function ytId(url = '') {
    const match = String(url).match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : '';
  }

  // Remove known demo cards and obvious placeholder content.
  const fakeTitles = new Set([
    'originos theme preview',
    'minimal funtouch os setup',
    'purple amoled theme',
    'members theme collection',
    'live theme q&a'
  ]);

  function isDemo(item = {}) {
    const title = String(item.title || '').trim().toLowerCase();
    const description = String(item.description || '').toLowerCase();
    const url = String(item.url || item.video || '').toLowerCase();
    const download = String(item.download || '').toLowerCase();

    if (fakeTitles.has(title)) return true;

    return (
      /\bdemo\b|\bsample\b|\bplaceholder\b/.test(title + ' ' + description) ||
      /\breplace\s+with\b|replace-with|example\.com/.test(
        description + ' ' + url + ' ' + download
      )
    );
  }

  function card(v) {
    const article = document.createElement('article');
    article.className = 'video-card';

    article.dataset.search = [
      v.title,
      v.description,
      v.category,
      v.section,
      v.tag,
      v.device,
      v.os
    ].join(' ').toLowerCase();

    const videoUrl = v.url || v.video || '#';

    const link = document.createElement('a');
    link.href = videoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Watch ' + (v.title || 'video'));

    const thumb = document.createElement('div');
    thumb.className = 'thumb';

    const youtubeVideoId = ytId(videoUrl);
    const src = v.thumbnail ||
      (youtubeVideoId
        ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
        : '');

    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = v.title || 'Video thumbnail';
      img.loading = 'lazy';

      img.onerror = () => {
        if (youtubeVideoId && !img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`;
        } else {
          img.remove();

          if (!thumb.querySelector('.thumb-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'thumb-fallback';
            fallback.textContent = 'VIVO THEME STORE';
            thumb.prepend(fallback);
          }
        }
      };

      thumb.append(img);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'thumb-fallback';
      fallback.textContent = 'VIVO THEME STORE';
      thumb.append(fallback);
    }

    const play = document.createElement('span');
    play.className = 'play';
    play.textContent = '▶ PLAY';
    thumb.append(play);

    link.append(thumb);
    article.append(link);

    const body = document.createElement('div');
    body.className = 'card-body';

    const heading = document.createElement('h3');
    heading.textContent = v.title || 'Untitled video';

    const description = document.createElement('p');
    description.textContent = v.description || '';

    body.append(heading, description);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const watch = document.createElement('a');
    watch.className = 'btn primary';
    watch.href = videoUrl;
    watch.target = '_blank';
    watch.rel = 'noopener noreferrer';
    watch.textContent = '▶ Watch';
    actions.append(watch);

    const downloadUrl = String(v.download || '').trim();

    if (
      /^https:\/\//i.test(downloadUrl) &&
      !/example\.com/i.test(downloadUrl)
    ) {
      const download = document.createElement('a');
      download.className = 'btn ghost';

      // Pass this video's ID to the download page.
      const params = new URLSearchParams({
        id: v.id || '',
        title: v.title || 'Theme',
        url: downloadUrl,
        devices: v.device || 'Vivo & iQOO'
      });

      download.href = `download.html?${params.toString()}`;
      download.textContent = '↓ Theme ZIP';
      actions.append(download);
    }

    body.append(actions);
    article.append(body);

    return article;
  }

  function render() {
    const query = (searchInput?.value || '').trim().toLowerCase();

    const groups = {
      latest: $('#latestGrid'),
      premium: $('#premiumGrid'),
      members: $('#membersGrid'),
      live: $('#liveGrid'),
      widgets: $('#widgetsGrid')
    };

    Object.values(groups).forEach(group => {
      if (group) group.replaceChildren();
    });

    allVideos.forEach(video => {
      const rawCategory = String(
        video.section || video.category || 'latest'
      ).toLowerCase();

      const categoryAliases = {
        latest: 'latest',
        premium: 'premium',
        members: 'members',
        member: 'members',
        'member-only': 'members',
        'members-only': 'members',
        live: 'live',
        widgets: 'widgets',
        widget: 'widgets'
      };

      const section = categoryAliases[rawCategory] || 'latest';
      const target = groups[section];

      if (!target) return;

      const videoCard = card(video);

      if (!query || videoCard.dataset.search.includes(query)) {
        target.append(videoCard);
      }
    });

    const widgetGrid = groups.widgets;

    if (widgetGrid) {
      allResources.forEach(resource => {
        const searchable = [
          resource.title,
          resource.description
        ].join(' ').toLowerCase();

        if (query && !searchable.includes(query)) return;

        const link = document.createElement('a');
        link.className = 'video-card resource-card';
        link.href = resource.url || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const body = document.createElement('div');
        body.className = 'card-body';

        const heading = document.createElement('h3');
        heading.textContent =
          (resource.icon || '✧') + ' ' + (resource.title || 'Resource');

        const description = document.createElement('p');
        description.textContent = resource.description || '';

        body.append(heading, description);
        link.append(body);
        widgetGrid.append(link);
      });
    }

    const communityGrid = $('#communityGrid');

    if (communityGrid) {
      communityGrid.replaceChildren();

      (window.storeData?.posts || []).forEach(post => {
        const searchable = [
          post.title,
          post.text
        ].join(' ').toLowerCase();

        if (query && !searchable.includes(query)) return;

        const link = document.createElement('a');
        link.className = 'community-card';
        link.href = post.url || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const heading = document.createElement('h3');
        heading.textContent = post.title || 'Community post';

        const text = document.createElement('p');
        text.textContent = post.text || '';

        link.append(heading, text);
        communityGrid.append(link);
      });
    }
  }

  searchInput?.addEventListener('input', render);

  fetch('./videos.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Could not load videos.json');
      }
      return response.json();
    })
    .then(data => {
      window.storeData = data;

      allVideos = (data.videos || []).filter(video =>
        !isDemo(video) &&
        Boolean(video.url || video.video)
      );

      allResources = (data.resources || []).filter(resource =>
        !isDemo(resource)
      );

      const telegram = data.settings?.telegram || '#';

      ['telegramLink', 'footerTelegram'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.href = telegram;
      });

      render();
    })
    .catch(error => {
      console.error('Video Store Error:', error);

      [
        'latestGrid',
        'premiumGrid',
        'membersGrid',
        'liveGrid',
        'widgetsGrid'
      ].forEach(id => {
        const element = document.getElementById(id);

        if (element) {
          element.innerHTML =
            '<p class="notice">Could not load videos. Please check videos.json.</p>';
        }
      });
    });
})();
