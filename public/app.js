
const $=(q,root=document)=>root.querySelector(q);const $$=(q,root=document)=>[...root.querySelectorAll(q)];
const state={trends:[],sources:[],mode:'connecting',updatedAt:null,category:'All',sort:'score',layout:'grid',view:'pulse',saved:new Set(),savedItems:new Map(),interests:new Set(),lastPayload:null, offline:false};
const rewardState={points:0,level:1,providerReady:false};
const rewardLevels=[{level:1,name:'Scout',points:0},{level:2,name:'Tracker',points:100},{level:3,name:'Analyst',points:300},{level:4,name:'Insider',points:700}];
const DEMO=[
 {id:'ai-agents',title:'AI agents move from demos into everyday workflows',category:'Technology',score:91,momentum:'Surging',confidence:'Moderate',sources:['Hacker News','Global News'],sourceCount:2,source:'Hacker News',detail:'Discussion and coverage are appearing across more than one source.',url:'https://news.ycombinator.com/',publishedAt:new Date(Date.now()-14*60000).toISOString(),engagement:1250,kind:'cross-source'},
 {id:'creator-economy',title:'Creators are experimenting with new ways to own their audience',category:'Entertainment',score:84,momentum:'Surging',confidence:'Limited',sources:['Google Trends'],sourceCount:1,source:'Google Trends',detail:'Search interest is a useful early signal, but does not confirm future popularity.',url:'https://trends.google.com/trending?geo=US',publishedAt:new Date(Date.now()-25*60000).toISOString(),engagement:0,kind:'single-source'},
 {id:'indie-games',title:'Small independent games find big audiences through communities',category:'Gaming',score:79,momentum:'Rising',confidence:'Moderate',sources:['Hacker News','Global News'],sourceCount:2,source:'Hacker News',detail:'Community activity and media coverage are both visible.',url:'https://news.ycombinator.com/',publishedAt:new Date(Date.now()-37*60000).toISOString(),engagement:820,kind:'cross-source'},
 {id:'sports-fandom',title:'Fan-made data visualizations are changing how people follow sports',category:'Sports',score:76,momentum:'Rising',confidence:'Limited',sources:['Google Trends'],sourceCount:1,source:'Google Trends',detail:'An illustrative topic card used when live data is unavailable.',url:'https://trends.google.com/trending?geo=US',publishedAt:new Date(Date.now()-48*60000).toISOString(),engagement:0,kind:'single-source'},
 {id:'open-source',title:'Open-source tools keep gaining attention from builders',category:'Technology',score:72,momentum:'Rising',confidence:'Moderate',sources:['Hacker News','Mastodon'],sourceCount:2,source:'Hacker News',detail:'Signals may reflect a niche community rather than broad mainstream interest.',url:'https://news.ycombinator.com/',publishedAt:new Date(Date.now()-65*60000).toISOString(),engagement:540,kind:'cross-source'},
 {id:'nostalgia',title:'Internet nostalgia brings older formats back into the conversation',category:'Culture',score:68,momentum:'Rising',confidence:'Limited',sources:['Mastodon'],sourceCount:1,source:'Mastodon',detail:'A social hashtag can be a useful clue, not a measure of the whole internet.',url:'https://mastodon.social/explore',publishedAt:new Date(Date.now()-80*60000).toISOString(),engagement:210,kind:'single-source'},
 {id:'market-tools',title:'People compare lightweight tools before choosing a platform',category:'Business',score:64,momentum:'Early signal',confidence:'Limited',sources:['Global News'],sourceCount:1,source:'Global News',detail:'Early signals need more evidence before they should be treated as a trend.',url:'https://www.gdeltproject.org/',publishedAt:new Date(Date.now()-105*60000).toISOString(),engagement:0,kind:'single-source'},
 {id:'climate-tech',title:'New climate technology stories spark cross-community discussion',category:'World',score:61,momentum:'Early signal',confidence:'Limited',sources:['Global News'],sourceCount:1,source:'Global News',detail:'Coverage is not the same as public opinion or verified impact.',url:'https://www.gdeltproject.org/',publishedAt:new Date(Date.now()-140*60000).toISOString(),engagement:0,kind:'single-source'},
 {id:'mastodon-tags',title:'#DigitalCulture is appearing in social conversations',category:'Culture',score:57,momentum:'Early signal',confidence:'Limited',sources:['Mastodon'],sourceCount:1,source:'Mastodon',detail:'Social signals are limited to the connected public instance.',url:'https://mastodon.social/explore',publishedAt:new Date(Date.now()-190*60000).toISOString(),engagement:90,kind:'single-source'}
];
function escapeHTML(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ago(iso){if(!iso)return'Just now';const n=Date.now()-new Date(iso).getTime();if(!Number.isFinite(n)||n<0)return'Just now';const m=Math.floor(n/60000);if(m<1)return'Just now';if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return`${Math.floor(h/24)}d ago`;}
function fmtTime(iso){if(!iso)return'Waiting…';return new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function safeURL(raw){try{const u=new URL(raw,location.origin);return ['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return'#';}}
function scoreRing(score){return `<span class="score-ring" style="--score:${Number(score)||0}"><span>${Number(score)||0}</span></span>`;}
function catClass(category){return String(category||'Culture').toLowerCase().replace(/[^a-z]/g,'');}
const imageLookupDone=new Set();
function hydrateCardImages(){
  const cards=[...document.querySelectorAll('.trend-card:not(.has-card-image)')].slice(0,12);
  cards.forEach(async article=>{
    const id=article.dataset.id;
    if(!id||imageLookupDone.has(id))return;
    const trend=state.trends.find(t=>t.id===id)||DEMO.find(t=>t.id===id)||state.savedItems.get(id);
    if(!trend)return;
    imageLookupDone.add(id);
    try{
      const response=await fetch('/api/image?title='+encodeURIComponent(trend.title),{headers:{accept:'application/json'}});
      if(!response.ok)return;
      const payload=await response.json();
      if(payload.image&&article.isConnected){
        article.insertAdjacentHTML('afterbegin',cardImageHTML({...trend,image:payload.image}));
        article.classList.add('has-card-image');
      }
    }catch{}
  });
}
function cardImageHTML(t){
  const img=t.image;
  if(!img?.url) return '';
  return `<a class="trend-card-image-wrap" href="${safeURL(img.pageUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View image source: ${escapeHTML(img.title||'Wikimedia Commons photo')}"><img class="trend-card-image" src="${safeURL(img.url)}" alt="${escapeHTML(img.alt||t.title)}" loading="lazy" decoding="async"><span class="image-credit">PHOTO · ${escapeHTML(img.artist||'Wikimedia Commons')} · ${escapeHTML(img.license||'license')}</span></a>`;
}
function cardTrend(t){const saved=state.saved.has(t.id);const sources=(t.sources||[t.source||'Public source']);const pills=sources.slice(0,2).map(s=>`<span class="source-pill">${escapeHTML(s)}</span>`).join('')+(sources.length>2?`<span class="source-pill more-sources">+${sources.length-2}</span>`:'');const momentum=String(t.momentum||'Early signal');const mclass=momentum.toLowerCase().includes('surging')?'surging':momentum.toLowerCase().includes('early')?'early':'';return `<article class="trend-card" data-id="${escapeHTML(t.id)}">${cardImageHTML(t)}<div class="trend-card-top"><span class="category-tag ${catClass(t.category)}">${escapeHTML((t.category||'Culture').toUpperCase())}</span><span class="momentum ${mclass}"><i class="momentum-dot"></i>${escapeHTML(momentum)}</span></div><button class="trend-title title-button" data-detail="${escapeHTML(t.id)}">${escapeHTML(t.title)}</button><p class="trend-description">${escapeHTML(t.detail||'A signal surfaced from a connected public source.')}</p><div class="trend-card-meta"><span>${escapeHTML(t.source||sources[0]||'Public source')} · ${ago(t.publishedAt)}</span><span class="source-pills">${pills}</span></div><div class="trend-card-footer"><div class="score-block">${scoreRing(t.score)}<span class="score-copy"><strong>GHOST SCORE</strong><small>${escapeHTML(t.confidence||'Limited')} confidence</small></span></div><div class="card-actions"><button class="card-action share-action" data-share="${escapeHTML(t.id)}" aria-label="Share signal" title="Share signal">↗</button><button class="card-action ${saved?'saved':''}" data-save="${escapeHTML(t.id)}" aria-label="${saved?'Remove saved signal':'Save signal'}" title="${saved?'Remove from vault':'Save to vault'}">${saved?'◆':'◇'}</button><button class="card-action open-source" data-detail="${escapeHTML(t.id)}" aria-label="Open trend details" title="View signal details">⌁</button></div></div></article>`;}
function adSlotHTML(id, slotKey){
  return `<div class="ad-container" data-slot="${slotKey}" id="${id}" data-enabled="false"><span class="ad-label">SPONSORED</span><div class="ad-placeholder"><strong>SPONSORED AREA</strong> Ad space reserved.</div><ins class="adsbygoogle" style="display:block; min-height:90px" data-ad-client="" data-ad-slot="" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
}
function toast(msg){const region=$('#toast-region');if(!region)return;const el=document.createElement('div');el.className='toast';el.textContent=msg;region.appendChild(el);setTimeout(()=>el.remove(),2600);}
function switchView(name){
  state.view=name;
  $$('.nav-item').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  $$('.view').forEach(v=>v.classList.toggle('active', v.id===`view-${name}`));
  $('#breadcrumb-current').textContent=name.toUpperCase();
  $('#sidebar').classList.remove('open');
  if(name==='vault'||name==='signal'||name==='underground'||name==='radar') renderCards();
  if(name==='rewards') renderRewards();
  history.replaceState(null,'',`#${name}`);
}
function renderMetrics(){
  // OODA Loop live metrics
  const cross=state.trends.filter(t=>t.sourceCount>1).length;
  const online=state.sources.filter(s=>s.status==='connected').length;
  const total=state.trends.length||0;
  const now=Date.now();
  const updatedAt=state.updatedAt? new Date(state.updatedAt).getTime() : 0;
  const ageSec=updatedAt? Math.floor((now-updatedAt)/1000) : 999;
  const freshness = Math.max(0, 100 - ageSec/1.8); // 0-100 based on 180s cache
  
  // OBSERVE: freshness + total
  const obsEl=$('#metric-observe');
  const obsBar=$('#observe-bar');
  const obsFoot=$('#metric-observe-foot');
  if(obsEl){
    obsEl.innerHTML=`${total||'—'}<small> sigs</small>`;
    if(obsBar) obsBar.style.width=`${Math.min(100,freshness)}%`;
    if(obsFoot) obsFoot.innerHTML=`<i class="mini-dot ${ageSec<60?'mint':'violet'}"></i> ${ageSec<60?'Live · ':'Stale · '}${ageSec<90?ageSec+'s ago':fmtTime(state.updatedAt)} · ${online}/4 src`;
  }
  
  // ORIENT: cross-source + delta
  const prevCross=state._prevCross||0;
  const delta=cross-prevCross;
  if(state.trends.length) state._prevCross=cross;
  const orientEl=$('#metric-orient');
  const orientBar=$('#orient-bar');
  const orientDelta=$('#orient-delta');
  const orientFoot=$('#metric-orient-foot');
  if(orientEl){
    orientEl.innerHTML=`${cross||0}<small> cross</small>`;
    if(orientBar) orientBar.style.width=`${Math.min(100, (cross/ Math.max(1,total))*100 + 20)}%`;
    if(orientDelta){
      orientDelta.textContent=(delta>0?`+${delta}`:delta<0?`${delta}`:'+0');
      orientDelta.className='ooda-delta '+(delta>0?'up':delta<0?'down':'');
    }
    if(orientFoot){
      const accelerating = state.trends.filter(t=>t.score>=78).length;
      orientFoot.innerHTML=`<i class="mini-dot ${accelerating>0?'cyan':'amber'}"></i> ${accelerating} surging · ${total?Math.round(cross/total*100):0}% cross`;
    }
  }
  
  // DECIDE: time to first action + filtered count
  const filteredCount=filtered().length;
  const decideEl=$('#metric-decide');
  const decideBar=$('#decide-bar');
  const decideFoot=$('#metric-decide-foot');
  const decideBadge=$('#decide-badge');
  if(decideEl){
    const avgScore=total? Math.round(state.trends.reduce((s,t)=>s+(t.score||0),0)/total) : 0;
    decideEl.innerHTML=`${avgScore||'—'}<small> avg</small>`;
    if(decideBar) decideBar.style.width=`${Math.min(100, avgScore)}%`;
    if(decideFoot) decideFoot.innerHTML=`<i class="mini-dot violet"></i> ${filteredCount} in view · ${state.category!=='All'?state.category:'All signals'}`;
    if(decideBadge) decideBadge.textContent= state.sort==='score'?'SCORE':state.sort.toUpperCase();
  }
  
  // ACT: saved + vault growth
  const actEl=$('#metric-act');
  const actBar=$('#act-bar');
  const actFoot=$('#metric-act-foot');
  if(actEl){
    actEl.innerHTML=`${state.saved.size||0}<small> saved</small>`;
    if(actBar) actBar.style.width=`${Math.min(100, state.saved.size*12 + (state.interests.size*8))}%`;
    if(actFoot) actFoot.innerHTML=`<i class="mini-dot mint"></i> ${state.interests.size} interests · ${state.saved.size>0?Math.round(state.saved.size/total*100)+'%' : 'Vault empty'}`;
  }
  
  // Also update system status text
  const sys=$('#system-status-text');
  if(sys){
    sys.textContent= state.offline? 'OFFLINE · DEMO' : state.mode==='demo'? 'DEMO · OODA IDLE' : `OODA LIVE · ${ageSec<60?'FRESH':'CACHED'} · ${online}/4`;
  }
}
function renderSources(){
  const rows=$$('#source-list .source-row');
  if(!rows.length) return;
  const map={};
  state.sources.forEach(s=>map[s.name]=s);
  rows.forEach(row=>{
    const name=row.textContent.trim().split('\n')[0] || row.querySelector('span:nth-child(2)')?.textContent;
    const key=Object.keys(map).find(k=> name.includes(k) || k.includes(name));
    const statusEl=row.querySelector('.source-status');
    if(!statusEl) return;
    const src= key? map[key] : null;
    statusEl.className='source-status '+(src? src.status : 'pending');
    statusEl.title=src? `${src.name}: ${src.status} (${src.count})${src.error?' — '+src.error:''}` : 'Connecting';
  });
}
function filtered(){
  let list=[...state.trends];
  if(state.category!=='All') list=list.filter(t=>t.category===state.category);
  if(state.interests.size && state.view==='signal'){
    list=list.filter(t=>state.interests.has(t.category));
  }
  if(state.sort==='recent') list.sort((a,b)=> new Date(b.publishedAt)-new Date(a.publishedAt));
  else if(state.sort==='sources') list.sort((a,b)=> b.sourceCount-a.sourceCount || b.score-a.score);
  else if(state.sort==='engagement') list.sort((a,b)=>(Number(b.engagement)||0)-(Number(a.engagement)||0)||b.score-a.score);
  else list.sort((a,b)=> b.score-a.score);
  return list;
}
function renderCards(){
  const pulseGrid=$('#pulse-grid');
  const undergroundGrid=$('#underground-grid');
  const vaultGrid=$('#vault-grid');
  const radarCanvas=$('#radar-canvas');
  const searchVal=$('#search-input')?.value?.toLowerCase()||'';

  const list=filtered();

  // Pulse
  if(pulseGrid){
    if(!state.trends.length){
      pulseGrid.innerHTML=`<div class="empty-state"><span>◌</span><h3>No signals yet</h3><p>We are connecting to public sources. If offline, demo cards will appear.</p><button class="primary-button" id="retry-pulse">Retry</button></div>`;
    }else{
      const visible = searchVal? list.filter(t=> t.title.toLowerCase().includes(searchVal) || t.category.toLowerCase().includes(searchVal)) : list;
      const cards=visible.map(cardTrend);
      // inject ad slots
      if(cards.length>=3){
        cards.splice(2,0, adSlotHTML('ad-pulse-top','pulseTop'));
      }
      if(cards.length>=8){
        cards.splice(7,0, adSlotHTML('ad-pulse-mid','pulseMid'));
      }
      pulseGrid.className=`trend-grid ${state.layout==='list'?'list-view':''}`;
      pulseGrid.innerHTML=cards.join('') || `<div class="empty-state"><h3>No matches</h3><p>Try a different category or search.</p></div>`;
      // after inject, set ad client/slot if enabled
      if(window.GhostAds?.enabled){
        document.querySelectorAll('.ad-container ins').forEach(ins=>{
          ins.setAttribute('data-ad-client', window.GhostAds.clientId);
          // slot mapping placeholder
        });
      }
    }
  }
  // Underground: Early signal only
  if(undergroundGrid){
    const early=list.filter(t=> (t.score<70) || t.momentum==='Early signal').slice(0,12);
    const html=early.length? early.map(cardTrend).join('') : `<div class="empty-state"><span>⌁</span><h3>The surface is calm</h3><p>Early signals appear when fresh topics surface from a single source. Check back after the next sweep.</p></div>`;
    undergroundGrid.innerHTML=html + adSlotHTML('ad-underground','underground');
  }
  // Vault: keep saved snapshots available even after a signal leaves the live feed.
  if(vaultGrid){
    const savedMap=new Map(state.savedItems);
    state.trends.filter(t=>state.saved.has(t.id)).forEach(t=>savedMap.set(t.id,t));
    const allSaved=[...state.saved].map(id=>savedMap.get(id)).filter(Boolean);
    const saved=allSaved.filter(t=>state.category==='All'||t.category===state.category);
    $('#vault-count').textContent=allSaved.length;
    if(!allSaved.length){
      vaultGrid.innerHTML='<div class="empty-state"><span>▣</span><h3>Your vault is quiet.</h3><p>Save a signal and it stays here, even when it leaves the live feed.</p><button class="primary-button" data-go="pulse">Explore signals <span>↗</span></button></div>';
    }else{
      vaultGrid.innerHTML=saved.length? saved.map(cardTrend).join('') : '<div class="empty-state"><h3>No matches in vault</h3><p>Try another category to see saved signals.</p></div>';
    }
  }
  // Radar visualization
  if(radarCanvas){
    renderRadar(radarCanvas, list.slice(0,18));
  }
  hydrateCardImages();
  renderMetrics();
  renderSources();
  renderInterestControls();
}
function renderRadar(container, trends){
  container.innerHTML='';
  container.className='radar-canvas';
  if(!trends.length){ container.innerHTML='<div class="empty-state" style="grid-column:1/-1">No data for radar</div>'; return;}
  // Stable ID-based placement prevents the radar from visually reshuffling on each render.
  const hash=(value)=>{let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
  trends.forEach((t)=>{
    const score=Math.max(0,Math.min(100,Number(t.score)||0));
    const seed=hash(t.id||t.title);
    const angle=((seed%360)*Math.PI/180);
    const radius=12+(100-score)*0.30+((seed>>>9)%9);
    const spread=Math.min(41,radius);
    const cx=Math.max(7,Math.min(93,50+Math.cos(angle)*spread));
    const cy=Math.max(8,Math.min(92,50+Math.sin(angle)*spread));
    const dot=document.createElement('button');
    dot.type='button';
    dot.className='radar-dot';
    const sourceCount=Number(t.sourceCount)||1;
    const col=sourceCount>=3?'#9b8cff':sourceCount===2?'#44d9e9':'#8d96ad';
    dot.style.left=cx+'%'; dot.style.top=cy+'%'; dot.style.background=col; dot.style.color=col;
    dot.setAttribute('aria-label','Open signal: '+t.title+', Ghost Score '+score+', '+sourceCount+' source'+(sourceCount===1?'':'s'));
    dot.title=t.title+' — '+score+' · '+t.category;
    dot.addEventListener('click',()=>openDetail(t.id));
    container.appendChild(dot);
  });
}
function renderSearch(q){
  const results=$('#search-results');
  if(!q){ results.innerHTML='<p class="search-hint">Search the current signal field. Try Technology, Sports, or a keyword.</p>'; renderCards(); return; }
  const lower=q.toLowerCase();
  const matches=state.trends.filter(t=> t.title.toLowerCase().includes(lower) || t.category.toLowerCase().includes(lower) || t.source.toLowerCase().includes(lower)).slice(0,20);
  if(!matches.length){ results.innerHTML='<p class="search-hint">No matches in current field.</p>'; renderCards(); return;}
  results.innerHTML=matches.map(t=>`<div class="search-result" data-detail="${escapeHTML(t.id)}"><span>${escapeHTML(t.title)}</span><small>${escapeHTML(t.category)} · ${t.score}</small></div>`).join('');
  renderCards();
}
function saveToggle(id){
  if(state.saved.has(id)){
    state.saved.delete(id);
    state.savedItems.delete(id);
  }else{
    const trend=state.trends.find(t=>t.id===id)||DEMO.find(t=>t.id===id);
    state.saved.add(id);
    if(trend) state.savedItems.set(id,trend);
  }
  persist();
  renderCards();
  toast(state.saved.has(id)?'Saved to vault.':'Removed from vault.');
}
function persist(){try{
  localStorage.setItem('gm-saved',JSON.stringify([...state.saved]));
  localStorage.setItem('gm-saved-items',JSON.stringify([...state.savedItems.entries()]));
  localStorage.setItem('gm-interests',JSON.stringify([...state.interests]));
  localStorage.setItem('gm-reward-points',String(rewardState.points));
}catch{}}
function loadPrefs(){try{
  state.saved=new Set(JSON.parse(localStorage.getItem('gm-saved')||'[]'));
  state.savedItems=new Map(JSON.parse(localStorage.getItem('gm-saved-items')||'[]'));
  state.interests=new Set(JSON.parse(localStorage.getItem('gm-interests')||'[]'));
  rewardState.points=Math.max(0,Math.floor(Number(localStorage.getItem('gm-reward-points')||0)));
}catch{state.saved=new Set();state.savedItems=new Map();state.interests=new Set();}}
function getRewardLevel(points=rewardState.points){return [...rewardLevels].reverse().find(x=>points>=x.points)||rewardLevels[0];}
function renderRewards(){
  const current=getRewardLevel(); rewardState.level=current.level;
  const next=rewardLevels.find(x=>x.level===current.level+1);
  const points=$('#reward-points'), name=$('#reward-level-name'), pill=$('#reward-level-pill'), mark=$('#rewards-level-mark'), nav=$('#nav-level'), fill=$('#reward-progress-fill'), progress=$('#reward-progress-label'), nextLabel=$('#reward-next-label');
  if(points) points.innerHTML=`${rewardState.points.toLocaleString()} <small>pts</small>`;
  if(name) name.textContent=`Level ${current.level} · ${current.name}`;
  if(pill) pill.textContent=`LV ${String(current.level).padStart(2,'0')}`;
  if(mark) mark.textContent=String(current.level).padStart(2,'0');
  if(nav) nav.textContent=`LV ${current.level}`;
  const prev=current.points, goal=next?.points||current.points;
  const pct=next?Math.max(0,Math.min(100,(rewardState.points-prev)/(goal-prev)*100)):100;
  if(fill) fill.style.width=pct+'%';
  if(progress) progress.textContent=next?`${rewardState.points-prev} / ${goal-prev} points`:'MAX LEVEL REACHED';
  if(nextLabel) nextLabel.textContent=next?`${Math.max(0,goal-rewardState.points)} pts to Level ${next.level}`:'All tiers unlocked';
  $('.tier-card').forEach(card=>{const tier=Number(card.dataset.tier);const level=rewardLevels.find(x=>x.level===tier);const unlocked=rewardState.points>=level.points;card.classList.toggle('current',tier===current.level);card.classList.toggle('unlocked',unlocked);card.classList.toggle('locked',!unlocked);const stateLabel=card.querySelector('.tier-state');const lock=card.querySelector('.tier-lock');if(stateLabel)stateLabel.textContent=tier===current.level?'CURRENT':unlocked?'UNLOCKED':'LOCKED';if(lock)lock.textContent=unlocked?(tier===current.level?'✓ Your current level':'✓ Unlocked'):`🔒 Unlock at ${level.points} points`;});
  const ready=!!(window.GhostRewardsProvider&&typeof window.GhostRewardsProvider.showRewardedAd==='function');
  rewardState.providerReady=ready;
  const btn=$('#watch-reward-button'), note=$('#reward-provider-note');
  if(btn){btn.disabled=!ready;btn.textContent=ready?'▶  Watch to earn':'▶  Watch to earn';btn.setAttribute('aria-disabled',String(!ready));}
  if(note)note.textContent=ready?'Complete the full rewarded video to receive points.':'Rewarded video provider is not configured yet. No points will be granted until completion is verified.';
}
async function watchRewardedVideo(){
  renderRewards();
  if(!rewardState.providerReady){openInfo('Reward videos are not connected yet','<p>The level and unlock system is built, but this deployment does not yet have a rewarded-ad provider configured.</p><p>To prevent fake rewards and abuse, Ghost Mode will not award points from a button click or a skipped/failed video. The next integration needs a real provider completion callback and server-side verification before points can be issued.</p>');return;}
  const btn=$('#watch-reward-button');if(btn)btn.disabled=true;
  try{
    const result=await window.GhostRewardsProvider.showRewardedAd();
    if(!result||result.completed!==true||!result.verificationToken){toast('No points awarded — video completion could not be verified.');return;}
    const response=await fetch('/api/rewards/claim',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({verificationToken:result.verificationToken})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.verified){toast(data.error||'Reward verification failed. No points awarded.');return;}
    rewardState.points=Math.max(0,Number(data.points)||0);persist();renderRewards();toast('Verified reward added. Your level progress is updated.');
  }catch{toast('Video unavailable or incomplete. No points awarded.');}
  finally{if(btn)btn.disabled=!rewardState.providerReady;}
}
function renderInterestControls(){ $$('#interest-grid input').forEach(i=>{ if(i) i.checked=state.interests.has(i.value); });const el=$('#interest-count'); if(el) el.textContent=state.interests.size?`${state.interests.size} interest${state.interests.size===1?'':'s'} selected`:'No interests selected';}
function openInfo(title,copy){$('#info-title').textContent=title;$('#info-copy').innerHTML=copy;$('#info-modal').classList.add('open');$('#info-modal').setAttribute('aria-hidden','false');}
function closeModal(sel){const m=$(sel); if(m){ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); }}
function openSearch(){ $('#search-modal').classList.add('open'); $('#search-modal').setAttribute('aria-hidden','false'); setTimeout(()=>$('#search-input')?.focus(),80);}
function openDetail(id){
  const t=state.trends.find(x=>x.id===id)||DEMO.find(x=>x.id===id); if(!t) return;
  const sources=t.sourceDetails|| (t.sources||[]).map(s=>({name:s, url:t.url, detail:''}));
  const srcList=sources.map(s=>`<li><a href="${safeURL(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.name)}</a> — ${escapeHTML(s.detail||'Source')}</li>`).join('');
  const html=`
  <div style="padding:22px 22px 18px">
    <div class="eyebrow small-eyebrow"><span class="eyebrow-line"></span> SIGNAL DETAIL</div>
    <h2 id="detail-title" style="margin:10px 0 8px;font-size:22px;line-height:1.25">${escapeHTML(t.title)}</h2>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px"><span class="category-tag ${catClass(t.category)}">${escapeHTML(t.category)}</span><span class="momentum ${t.momentum==='Surging'?'surging': t.momentum==='Early signal'?'early':''}"><i class="momentum-dot"></i>${escapeHTML(t.momentum)}</span><span class="source-pill">Ghost Score ${t.score}</span><span class="source-pill">${escapeHTML(t.confidence)} confidence</span></div>
    <p style="color:var(--muted);line-height:1.6;font-size:14px;margin:0 0 14px">${escapeHTML(t.detail)}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0 16px">
      <div class="metric" style="padding:12px"><span class="metric-label">SOURCES</span><strong>${t.sourceCount||1}</strong><span class="metric-foot">${escapeHTML((t.sources||[]).join(', '))}</span></div>
      <div class="metric" style="padding:12px"><span class="metric-label">PUBLISHED</span><strong style="font-size:14px">${ago(t.publishedAt)}</strong><span class="metric-foot">${escapeHTML(new Date(t.publishedAt).toLocaleString())}</span></div>
    </div>
    <div style="margin:10px 0"><strong style="font-size:12px;letter-spacing:.12em">SOURCE TRAIL</strong><ul style="margin:8px 0 0;padding-left:18px;color:var(--muted);font-size:13px;line-height:1.7">${srcList}</ul><p style="color:var(--muted-2);font-size:11px;margin-top:10px">Ghost Score = f(recency, available engagement, source overlap). Not a prediction. Sources may be unavailable; confidence reflects only connected sources.</p></div>
    <div style="display:flex;gap:10px;margin-top:16px"><a class="primary-button" href="${safeURL(t.url)}" target="_blank" rel="noopener noreferrer">Open original source ↗</a><button class="subtle-button" data-share="${escapeHTML(t.id)}">Share</button><button class="subtle-button" data-save="${escapeHTML(t.id)}">${state.saved.has(t.id)?'Remove from vault':'Save to vault'}</button></div>
    <div style="margin-top:18px" class="ad-container" data-slot="detail" data-enabled="false"><span class="ad-label">SPONSORED</span><div class="ad-placeholder"><strong>SPONSORED AREA</strong> Reserved.</div></div>
  </div>`;
  $('#detail-content').innerHTML=html;
  $('#detail-modal').classList.add('open');
  $('#detail-modal').setAttribute('aria-hidden','false');
}
async function shareText(title,text,url){const payload={title,text,url};try{if(navigator.share){await navigator.share(payload);toast('Ready to spread the signal.');return;}if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(`${text}\n${url}`);toast('Share text copied. Paste it anywhere.');return;}const area=document.createElement('textarea');area.value=`${text}\n${url}`;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Share text copied.':'Copy unavailable.');}catch(e){if(e.name!=='AbortError')toast('Sharing is not available.');}}
function shareTrend(id){const t=state.trends.find(x=>x.id===id)||DEMO.find(x=>x.id===id);if(!t)return;const link=location.href.split('#')[0];shareText(`Ghost Mode signal: ${t.title}`,`👻 GHOST MODE SIGNAL\n${t.title}\nGhost Score: ${Number(t.score)||0} · ${t.momentum||'Early signal'}\nSources: ${(t.sources||[t.source||'Public source']).join(', ')}\nOriginal source: ${safeURL(t.url)}\nScores are directional, not predictions.`,link);}
function shareApp(){const url=location.href.split('#')[0];shareText('Ghost Mode — Catch the Signal','I found a new way to spot what is rising across the internet before it hits the mainstream. Check out Ghost Mode.',url);}
function bindEvents(){
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  $('#mobile-menu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  $('#refresh-button').addEventListener('click',()=>loadTrends());
  $('#sort-select').addEventListener('change',e=>{state.sort=e.target.value;renderCards();});
  $$('.view-toggle').forEach(b=>b.addEventListener('click',()=>{state.layout=b.dataset.layout;$$('.view-toggle').forEach(x=>x.classList.toggle('active',x===b));renderCards();}));
  $$('#category-filters [data-category]').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category;$$('#category-filters [data-category]').forEach(x=>x.classList.toggle('active',x===b));renderCards();}));
  document.addEventListener('error',e=>{if(e.target?.matches?.('.trend-card-image'))e.target.closest('.trend-card-image-wrap')?.classList.add('failed-card-image');},true);
document.addEventListener('click',e=>{const share=e.target.closest('[data-share]');if(share){shareTrend(share.dataset.share);return;}const save=e.target.closest('[data-save]');if(save){saveToggle(save.dataset.save);if($('#detail-modal').classList.contains('open'))openDetail(save.dataset.save);return;}const detail=e.target.closest('[data-detail]');if(detail){openDetail(detail.dataset.detail);closeModal('#search-modal');return;}const go=e.target.closest('[data-go]');if(go){switchView(go.dataset.go);return;} if(e.target.id==='retry-pulse'){loadTrends();}});
  $('#invite-button')?.addEventListener('click',shareApp);$('#share-pulse-button')?.addEventListener('click',shareApp);
  $('#search-open').addEventListener('click',openSearch);
  $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));
  $('#search-close').addEventListener('click',()=>closeModal('#search-modal'));
  $('#detail-close').addEventListener('click',()=>closeModal('#detail-modal'));
  $('#info-close').addEventListener('click',()=>closeModal('#info-modal'));
  $$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal('#'+m.id);}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-backdrop.open').forEach(m=>closeModal('#'+m.id));if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();openSearch();}if(/^[1-5]$/.test(e.key)&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){const v=['pulse','radar','underground','signal','vault'][Number(e.key)-1];switchView(v);}});
  $$('#interest-grid input').forEach(i=>i.addEventListener('change',()=>{if(i.checked)state.interests.add(i.value);else state.interests.delete(i.value);const el=$('#interest-count'); if(el) el.textContent=state.interests.size?`${state.interests.size} interest${state.interests.size===1?'':'s'} selected`:'No interests selected';}));
  $('#save-interests').addEventListener('click',()=>{persist();toast('Your signal preferences are saved on this device.');switchView('pulse');});
  $('#clear-interests').addEventListener('click',()=>{state.interests.clear();persist();renderInterestControls();toast('Interest filters reset.');});
  $('#clear-vault').addEventListener('click',()=>{if(!state.saved.size){toast('Your vault is already empty.');return;}state.saved.clear();persist();renderCards();toast('Your vault has been cleared.');});
  $('#methodology-link').addEventListener('click',e=>{e.preventDefault();openInfo('How Ghost Score works','<p>Ghost Score is a directional index based on freshness, available engagement, and source overlap. It is not a probability of going viral, and source coverage is incomplete.</p><p>Each source has different coverage and limitations. Topics with a single source are labeled with limited confidence. Similar headlines are grouped heuristically, so some clusters may be imperfect.</p><p>Ghost Mode links back to the origin where possible and does not claim private platform data.</p>');});
  $('#about-link').addEventListener('click',e=>{e.preventDefault();openInfo('About Ghost Mode','<p>Ghost Mode is a trend intelligence prototype designed to help curious people explore emerging topics across public sources.</p><p>This starter release aggregates Google Trends RSS, Hacker News, Mastodon public trends, and GDELT news results where those sources are reachable. Availability varies. It does not have privileged access to TikTok, Instagram, YouTube, or private platform analytics.</p><p>All sponsored placements are reserved and labeled; this build does not serve paid ads until AdSense is approved and configured.</p>');});
  $('#alerts-button').addEventListener('click',()=>openInfo('Signal alerts','<p>Personalized push alerts are not active in this build yet. The next production step is to add opt-in notifications for followed categories and saved topics, with quiet hours and clear controls.</p>'));
  $('#profile-button').addEventListener('click',()=>switchView('signal'));
  $('#watch-reward-button')?.addEventListener('click',watchRewardedVideo);
  window.addEventListener('online',()=>{state.offline=false;toast('Back online — refreshing signals.');loadTrends({quiet:true});});
  window.addEventListener('offline',()=>{state.offline=true;toast('You are offline — showing cached signals.');});
}
async function loadTrends(opts={}){
  const quiet=opts.quiet;
  if(!quiet){ $('#system-status-text').textContent='SWEEPING SIGNALS…'; }
  try{
    const r=await fetch('/api/trends',{cache:'no-store'});
    if(!r.ok) throw new Error('api '+r.status);
    const data=await r.json();
    state.lastPayload=data;
    state.trends=data.trends||[];
    state.sources=data.sources||[];
    state.updatedAt=data.updatedAt||new Date().toISOString();
    state.mode=data.trends?.length? 'live':'demo';
    state.offline=false;
    if(!state.trends.length){
      state.trends=[...DEMO];
      state.mode='demo';
      state.sources=[{name:'Google Trends',status:'unavailable'},{name:'Hacker News',status:'unavailable'},{name:'Mastodon',status:'unavailable'},{name:'Global News',status:'unavailable'}];
    }
    $('#system-status-text').textContent= data.cached? `CACHED · ${new Date(data.updatedAt).toLocaleTimeString()}` : `UPDATED · ${new Date(data.updatedAt).toLocaleTimeString()}`;
    const heroStatus=$('#hero-signal-status');
    if(heroStatus){
      const isDemo=!(data.trends||[]).length;
      heroStatus.textContent=isDemo?'ILLUSTRATIVE DATA':data.cached?'CACHED FEED':'SOURCE FEED';
      heroStatus.classList.toggle('demo',isDemo);
      heroStatus.classList.toggle('cached',!isDemo&&!!data.cached);
    }
    state.trends.forEach(t=>{if(state.saved.has(t.id)) state.savedItems.set(t.id,t);});
    persist();
    renderCards();
    if(data.notice && !quiet) toast(data.notice);
  }catch(e){
    console.warn('trends load failed', e);
    state.offline=true;
    if(!state.trends.length){ state.trends=[...DEMO]; state.mode='demo'; }
    $('#system-status-text').textContent='OFFLINE · DEMO CARDS';
    const heroStatus=$('#hero-signal-status');
    if(heroStatus){heroStatus.textContent='DEMO MODE';heroStatus.classList.add('demo');heroStatus.classList.remove('cached');}
    renderCards();
    if(!quiet) toast('Live sources unavailable — showing illustrative cards.');
  }
}
async function init(){
  loadPrefs();
  bindEvents();
  renderRewards();
  renderInterestControls();
  const hash=location.hash.replace('#','');
  if(['pulse','radar','underground','signal','vault'].includes(hash)) switchView(hash);
  if('serviceWorker' in navigator){ try{ await navigator.serviceWorker.register('/sw.js'); }catch{} }
  await loadTrends();
}
init();
setInterval(()=>{ if(document.visibilityState==='visible') loadTrends({quiet:true}); }, 180000);
