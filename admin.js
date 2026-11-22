let data = { settings: {}, videos: [], resources: [], posts: [], premiumMembers: [] };
const $ = (s) => document.querySelector(s);
const fields = ['title', 'description', 'category', 'tag', 'thumbnail', 'url', 'download', 'videoPW'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isUrl = (u) => /^https?:\/\//i.test(u);

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function youtubeId(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname === 'youtu.be' || u.hostname.endsWith('.youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || '';
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/\/(?:shorts|embed|live|v)\/([^/?]+)/);
      return m ? m[1] : '';
    }
  } catch {}
  return '';
}

function autoThumb() {
  const id = youtubeId($('#url').value.trim());
  const url = id ? `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '';
  const thumb = $('#thumbnail');
  if (url && !thumb.dataset.manual) thumb.value = url;
  const current = thumb.value.trim();
  $('#thumbPreviewWrap').hidden = !current;
  $('#thumbPreview').src = current;
  $('#thumbPreview').onerror = () => { $('#thumbPreviewWrap').hidden = true; };
}
$('#thumbnail').addEventListener('input', () => { $('#thumbnail').dataset.manual = '1'; autoThumb(); });
$('#url').addEventListener('input', () => { if (!$('#thumbnail').dataset.manual) autoThumb(); });

function render() {
  data.videos = data.videos || [];
  data.premiumMembers = data.premiumMembers || [];
  $('#count').textContent = data.videos.length;
  $('#memberCount').textContent = data.premiumMembers.length;

  $('#videoList').innerHTML = data.videos.length
    ? data.videos.map((v, i) =>
      `<div class="row-item"><span><b>${i + 1}. ${esc(v.title)}</b><small>${esc(v.section || v.category)} · ${v.videoPWHash || v.videoPW ? 'password set' : 'no password'}</small></span><button type="button" data-remove="${i}">Remove</button></div>`).join('')
    : '<p class="muted">No videos yet. Add one above.</p>';

  $('#memberListAdmin').innerHTML = data.premiumMembers.length
    ? data.premiumMembers.map((m, i) =>
      `<div class="row-item"><span>${esc(m.name)}</span><button type="button" data-removem="${i}">Remove</button></div>`).join('')
    : '<p class="muted">No members yet.</p>';

  $('#videoList').querySelectorAll('[data-remove]').forEach((b) =>
    b.addEventListener('click', () => { data.videos.splice(Number(b.dataset.remove), 1); render(); }));
  $('#memberListAdmin').querySelectorAll('[data-removem]').forEach((b) =>
    b.addEventListener('click', () => { data.premiumMembers.splice(Number(b.dataset.removem), 1); render(); }));
}

function clearForm() {
  fields.forEach((id) => { const el = $('#' + id); if (el) el.value = ''; });
  $('#category').value = 'latest';
  delete $('#thumbnail').dataset.manual;
  $('#thumbPreviewWrap').hidden = true;
  $('#thumbPreview').removeAttribute('src');
}

$('#addBtn').addEventListener('click', async () => {
  const v = {};
  fields.forEach((id) => { const el = $('#' + id); v[id] = el ? el.value.trim() : ''; });
  const pw = $('#videoPW').value; // keep exactly as typed

  if (!v.title || !v.url) return alert('Please enter a video title and video URL.');
  if (!isUrl(v.url)) return alert('Video URL must start with https:// or http://');
  if (!pw) return alert('Please set a password for this video.');
  if (!v.thumbnail) {
    const id = youtubeId(v.url);
    if (id) v.thumbnail = `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  }
  if (v.thumbnail && !isUrl(v.thumbnail)) return alert('Thumbnail must be a public http(s) URL.');
  if (v.download && !isUrl(v.download)) return alert('Download URL must be a public http(s) URL.');

  v.id = 'video-' + Date.now();
  v.tag = v.tag || v.category.toUpperCase();
  delete v.videoPW;
  try {
    v.videoPWHash = await sha256(v.id + ':' + pw);
  } catch {
    return alert('Password hashing needs a secure (https) page.');
  }

  data.videos.unshift(v);
  clearForm();
  render();
});

$('#addMember').addEventListener('click', () => {
  const name = $('#memberName').value.trim();
  const image = $('#memberImage').value.trim();
  if (!name) return alert('Please enter the member name.');
  if (image && !/^https:\/\//i.test(image)) return alert('Profile image must be a public https:// URL.');
  data.premiumMembers.push({ name, image });
  $('#memberName').value = '';
  $('#memberImage').value = '';
  render();
});

$('#resetForm').addEventListener('click', clearForm);

function readSettings() {
  data.settings = data.settings || {};
  data.settings.youtubeChannel = $('#channel').value.trim();
  data.settings.telegram = $('#telegram').value.trim();
  data.settings.membershipUrl = $('#membership').value.trim();
}

function writeSettings() {
  $('#channel').value = data.settings?.youtubeChannel || data.settings?.youtube || '';
  $('#telegram').value = data.settings?.telegram || '';
  $('#membership').value = data.settings?.membershipUrl || '';
}

function downloadJson() {
  readSettings();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'videos.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

$('#downloadBtn').addEventListener('click', downloadJson);
$('#exportBtn').addEventListener('click', downloadJson);
$('#importBtn').addEventListener('click', () => $('#fileInput').click());

$('#fileInput').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!Array.isArray(d.videos)) throw Error();
    data = d;
    writeSettings();
    render();
  } catch {
    alert('That file is not a valid videos.json file.');
  }
  e.target.value = '';
});

document.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.g');
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--x', e.clientX - r.left + 'px');
  el.style.setProperty('--y', e.clientY - r.top + 'px');
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
});

fetch('videos.json', { cache: 'no-store' })
  .then((r) => r.json())
  .then((d) => { data = d; writeSettings(); render(); })
  .catch(render);
