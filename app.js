
const $=s=>document.querySelector(s);
let allVideos=[];
const sidebar=$('#sidebar'),scrim=$('#scrim');

function menu(open){
 sidebar.classList.toggle('open',open);
 scrim.classList.toggle('show',open)
}
$('#menuBtn').addEventListener('click',()=>menu(true));
$('#closeMenu').addEventListener('click',()=>menu(false));
scrim.addEventListener('click',()=>menu(false));
sidebar.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>menu(false)));

$('#searchBtn').addEventListener('click',()=>{
 $('#searchWrap').classList.toggle('visible');
 if($('#searchWrap').classList.contains('visible'))$('#searchInput').focus()
});
$('#clearSearch').addEventListener('click',()=>{
 $('#searchInput').value='';
 render()
});
$('#searchInput').addEventListener('input',render);

function safe(s){
 return String(s??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 }[c]))
}

function getYoutubeId(raw){
 try{
  const u=new URL(raw);
  if(u.hostname==='youtu.be')return u.pathname.split('/').filter(Boolean)[0]||'';
  if(u.hostname.includes('youtube.com')){
   if(u.searchParams.get('v'))return u.searchParams.get('v');
   const m=u.pathname.match(/\/(?:shorts|embed|live|v)\/([^/?]+)/);
   return m?m[1]:''
  }
 }catch{}
 return ''
}

function card(v){
 const autoId=getYoutubeId(v.url||'');
 const thumbUrl=v.thumbnail||(autoId?`https://img.youtube.com/vi/${encodeURIComponent(autoId)}/hqdefault.jpg`:'' );
 const thumb=thumbUrl
  ?`<img src="${safe(thumbUrl)}" alt="${safe(v.title)} thumbnail" loading="lazy" onerror="this.remove()">`
  :`<div class="thumb-fallback">VIVO<br>THEMES</div>`;
 const watch=v.url
  ?`<a class="small-btn" href="${safe(v.url)}" target="_blank" rel="noopener">▶ Watch</a>`:'';

 const detailsURL='download.html?url='+encodeURIComponent(v.download||'')
  +'&title='+encodeURIComponent(v.title||'Vivo Theme')
  +'&devices='+encodeURIComponent(v.devices||v.description||'Check theme compatibility');

 const dl=v.download
  ?`<a class="small-btn secondary" href="${safe(detailsURL)}">↓ Theme ZIP</a>`:'';

 return `<article class="video-card">
 <a href="${safe(v.url||'#')}" ${v.url?'target="_blank" rel="noopener"':''} aria-label="Watch ${safe(v.title)}">
 <div class="thumb">${thumb}<span class="play">▶ PLAY</span></div></a>
 <div class="card-body">
 <div class="card-tag">${safe(v.tag||v.category||'VIVO THEME')}</div>
 <h3>${safe(v.title||'Untitled video')}</h3>
 <p>${safe(v.description||'Vivo & iQOO customization')}</p>
 <div class="card-actions">${watch}${dl}</div>
 </div></article>`
}

function render(){
 const q=$('#searchInput').value.trim().toLowerCase();
 const data=allVideos.filter(v=>!q||[v.title,v.description,v.category,v.tag].join(' ').toLowerCase().includes(q));
 const groups={
  latest:['latestGrid','latest'],
  premium:['premiumGrid','premium'],
  members:['membersGrid','members'],
  live:['liveGrid','live'],
  widgets:['widgetsGrid','widgets']
 };
 for(const [id,cat] of Object.values(groups)){
  const list=data.filter(v=>(v.category||'latest').toLowerCase()===cat);
  $('#'+id).innerHTML=list.length?list.map(card).join(''):
   `<div class="empty">${q?'No matches found. Try another search.':'Videos will appear here when you add them in videos.json.'}</div>`
 }
 const posts=(window.storeData?.community||[]).filter(p=>!q||String(p.text).toLowerCase().includes(q));
 $('#communityGrid').innerHTML=posts.length
  ?posts.map(p=>`<article class="community-card"><p>${safe(p.text)}</p><small>${safe(p.date||'Community update')}</small></article>`).join('')
  :'<div class="empty">Community updates will appear here.</div>'
}

fetch('videos.json').then(r=>{
 if(!r.ok)throw Error('videos.json missing');
 return r.json()
}).then(d=>{
 window.storeData=d;
 allVideos=d.videos||[];
 const t=d.settings?.telegram;
 if(t){
  $('#telegramLink').href=t;
  $('#footerTelegram').href=t
 }
 render()
}).catch(()=>{
 allVideos=[];
 window.storeData={community:[]};
 render()
});
