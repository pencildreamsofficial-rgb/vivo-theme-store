(() => {
  const $ = (s) => document.querySelector(s);
  const menuBtn=$('#menuBtn'), closeMenu=$('#closeMenu'), sidebar=$('#sidebar'), scrim=$('#scrim');
  const openMenu=()=>{sidebar?.classList.add('open');scrim?.classList.add('show');document.body.classList.add('menu-open');};
  const shutMenu=()=>{sidebar?.classList.remove('open');scrim?.classList.remove('show');document.body.classList.remove('menu-open');};
  menuBtn?.addEventListener('click',openMenu); closeMenu?.addEventListener('click',shutMenu); scrim?.addEventListener('click',shutMenu);
  sidebar?.querySelectorAll('a').forEach(a=>a.addEventListener('click',shutMenu));
  const searchWrap=$('#searchWrap'), searchBtn=$('#searchBtn'), searchInput=$('#searchInput');
  searchBtn?.addEventListener('click',()=>{searchWrap?.classList.toggle('active'); if(searchWrap?.classList.contains('active')) searchInput?.focus();});
  $('#clearSearch')?.addEventListener('click',()=>{if(searchInput){searchInput.value='';searchInput.dispatchEvent(new Event('input'));searchInput.focus();}});
  let allVideos=[];
  function ytId(url=''){let m=url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);return m?m[1]:'';}
  function card(v){
    const a=document.createElement('article');a.className='video-card';a.dataset.search=[v.title,v.description,v.category,v.tag].join(' ').toLowerCase();
    const link=document.createElement('a');link.href=v.url||'#';link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Watch '+(v.title||'video'));
    const thumb=document.createElement('div');thumb.className='thumb';
    let src=v.thumbnail||'';const id=ytId(v.url||'');if(!src&&id)src=`https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    if(src){const img=document.createElement('img');img.src=src;img.alt=v.title||'Video thumbnail';img.loading='lazy';img.onerror=()=>{if(id&&!img.dataset.fallback){img.dataset.fallback='1';img.src=`https://img.youtube.com/vi/${id}/hqdefault.jpg`;}else{img.remove();thumb.insertAdjacentHTML('afterbegin','<div class="thumb-fallback">VIVO<br>THEME STORE</div>');}};thumb.append(img);}else thumb.innerHTML='<div class="thumb-fallback">VIVO<br>THEME STORE</div>';
    const play=document.createElement('span');play.className='play';play.textContent='▶ PLAY';thumb.append(play);link.append(thumb);a.append(link);
    const body=document.createElement('div');body.className='card-body';const h=document.createElement('h3');h.textContent=v.title||'Untitled video';const p=document.createElement('p');p.textContent=v.description||'';body.append(h,p);
    const actions=document.createElement('div');actions.className='card-actions';const watch=document.createElement('a');watch.className='btn primary';watch.href=v.url||'#';watch.target='_blank';watch.rel='noopener noreferrer';watch.textContent='▶ Watch';actions.append(watch);
    if(v.download&&/^https:\/\//i.test(v.download)&&!v.download.includes('example.com')){const dl=document.createElement('a');dl.className='btn ghost';dl.href='download.html?title='+encodeURIComponent(v.title||'Theme')+'&url='+encodeURIComponent(v.download)+'&devices='+encodeURIComponent(v.device||'Vivo & iQOO');dl.textContent='↓ Theme ZIP';actions.append(dl);}
    body.append(actions);a.append(body);return a;
  }
  function render(){const q=(searchInput?.value||'').trim().toLowerCase();const groups={latest:$('#latestGrid'),premium:$('#premiumGrid'),members:$('#membersGrid'),live:$('#liveGrid'),widgets:$('#widgetsGrid')};Object.values(groups).forEach(g=>{if(g)g.innerHTML='';});
    allVideos.forEach(v=>{const section=(v.section||(['latest','premium','members','live'].includes(v.category)?v.category:'latest')).toLowerCase();const target=groups[section]||groups.latest;if(!target)return;const c=card(v);if(!q||c.dataset.search.includes(q))target.append(c);});
    const cg=$('#communityGrid');if(cg){cg.innerHTML='';(window.storeData?.posts||[]).forEach(p=>{if(q&&!(p.title+' '+p.text).toLowerCase().includes(q))return;const a=document.createElement('a');a.className='community-card';a.href=p.url||'#';a.target='_blank';a.rel='noopener noreferrer';const h=document.createElement('h3');h.textContent=p.title;const t=document.createElement('p');t.textContent=p.text;a.append(h,t);cg.append(a);});}
  }
  searchInput?.addEventListener('input',render);
  fetch('videos.json').then(r=>{if(!r.ok)throw Error('Could not load videos.json');return r.json();}).then(data=>{window.storeData=data;allVideos=data.videos||[];const tg=data.settings?.telegram||'#';['telegramLink','footerTelegram'].forEach(id=>{const el=document.getElementById(id);if(el)el.href=tg;});const resources=data.resources||[];const wg=$('#widgetsGrid');if(wg){resources.forEach(r=>{const a=document.createElement('a');a.className='video-card resource-card';a.href=r.url||'#';a.target='_blank';a.rel='noopener noreferrer';const b=document.createElement('div');b.className='card-body';const h=document.createElement('h3');h.textContent=(r.icon||'✧')+' '+r.title;const p=document.createElement('p');p.textContent=r.description||'';b.append(h,p);a.append(b);wg.append(a);});}render();}).catch(err=>{console.error(err);['latestGrid','premiumGrid','membersGrid','liveGrid'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<p class="notice">Could not load videos. Please check videos.json.</p>';});});
})();
