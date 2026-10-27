let data={settings:{channelName:'Vivo Theme Store',youtubeChannel:'',telegram:''},videos:[],community:[]};
const $=s=>document.querySelector(s);
const fields=['title','description','category','tag','thumbnail','url','download','videoPW'];

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function youtubeId(raw){try{const u=new URL(raw);if(u.hostname==='youtu.be'||u.hostname.endsWith('.youtu.be'))return u.pathname.split('/').filter(Boolean)[0]||'';if(u.hostname.includes('youtube.com')){if(u.searchParams.get('v'))return u.searchParams.get('v');const m=u.pathname.match(/\/(?:shorts|embed|live|v)\/([^/?]+)/);return m?m[1]:''}}catch{}return ''}

function autoThumb(){
  const id=youtubeId($('#url').value.trim());
  const url=id?`https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`:'';
  const thumb=$('#thumbnail');
  if(url&&!thumb.dataset.manual)thumb.value=url;
  const current=thumb.value.trim();
  $('#thumbPreviewWrap').hidden=!current;
  $('#thumbPreview').src=current;
  $('#thumbPreview').onerror=()=>{$('#thumbPreviewWrap').hidden=true};
}

$('#thumbnail').addEventListener('input',()=>{
  $('#thumbnail').dataset.manual='1';
  autoThumb();
});
$('#url').addEventListener('input',()=>{
  if(!$('#thumbnail').dataset.manual)autoThumb();
});

function render(){
  $('#count').textContent=data.videos.length;
  $('#videoList').innerHTML=data.videos.length
    ?data.videos.map((v,i)=>`<div class="video-edit"><b>${i+1}. ${esc(v.title)}</b><p class="muted">${esc(v.category)} · ${esc(v.url)}</p><button class="small-btn secondary" data-remove="${i}">Remove</button></div>`).join('')
    :'<p class="muted">No videos yet. Add one above.</p>';

  $('#videoList').querySelectorAll('[data-remove]').forEach(b=>
    b.addEventListener('click',()=>{
      data.videos.splice(Number(b.dataset.remove),1);
      render();
    })
  );
}

function clear(){
  fields.forEach(id=>{
    const el=$('#'+id);
    if(el)el.value='';
  });
  delete $('#thumbnail').dataset.manual;
  $('#thumbPreviewWrap').hidden=true;
  $('#thumbPreview').removeAttribute('src');
}

$('#addBtn').addEventListener('click',()=>{
  const v={};
  fields.forEach(id=>{
    const el=$('#'+id);
    v[id]=el?el.value.trim():'';
  });

  if(!v.title||!v.url){
    alert('Please enter a video title and video URL.');
    return;
  }

  if(!/^https?:\/\//i.test(v.url)){
    alert('Video URL must start with https:// or http://');
    return;
  }

  if(!v.thumbnail){
    const id=youtubeId(v.url);
    if(id)v.thumbnail=`https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  }

  if(v.thumbnail&&!/^https?:\/\//i.test(v.thumbnail)){
    alert('Thumbnail must be a public http(s) URL.');
    return;
  }

  if(v.download&&!/^https?:\/\//i.test(v.download)){
    alert('Download URL must be a public http(s) URL.');
    return;
  }

  v.id='video-'+Date.now();
  v.tag=v.tag||v.category.toUpperCase();

  // Save the per-video password in videos.json
  v.videoPW=v.videoPW||'';

  data.videos.unshift(v);
  clear();
  render();
});

$('#resetForm').addEventListener('click',clear);

function updateSettings(){
  data.settings.youtubeChannel=$('#channel').value.trim();
  data.settings.telegram=$('#telegram').value.trim();
}

function download(){
  updateSettings();
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='videos.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

$('#downloadBtn').addEventListener('click',download);
$('#exportBtn').addEventListener('click',download);
$('#importBtn').addEventListener('click',()=>$('#fileInput').click());

$('#fileInput').addEventListener('change',async e=>{
  const f=e.target.files[0];
  if(!f)return;

  try{
    const d=JSON.parse(await f.text());
    if(!Array.isArray(d.videos))throw Error();

    data=d;
    $('#channel').value=d.settings?.youtubeChannel||'';
    $('#telegram').value=d.settings?.telegram||'';
    render();
  }catch{
    alert('That file is not a valid videos.json file.');
  }

  e.target.value='';
});

fetch('videos.json')
  .then(r=>r.json())
  .then(d=>{
    data=d;
    $('#channel').value=d.settings?.youtubeChannel||'';
    $('#telegram').value=d.settings?.telegram||'';
    render();
  })
  .catch(render);
