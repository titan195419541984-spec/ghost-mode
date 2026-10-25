
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { URL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const ROOT = join(__dirname, 'public');
const USER_AGENT = 'GhostModeTrendIntelligence/1.2.0 (public aggregation; contact: operator)';
const commonsImageCache = new Map();
const COMMONS_IMAGE_TTL = 6 * 60 * 60 * 1000;
async function findCommonsImage(title) {
  const query = String(title || '').replace(/https?:\/\/\S+/g, '').trim().slice(0, 120);
  if (!query) return null;
  const key = query.toLowerCase();
  const cached = commonsImageCache.get(key);
  if (cached && Date.now() - cached.at < COMMONS_IMAGE_TTL) return cached.image;
  try {
    const endpoint = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=' + encodeURIComponent(query) + '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=720&format=json';
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(3200), headers: { 'user-agent': USER_AGENT, accept: 'application/json' } });
    if (!response.ok) throw new Error('Commons image search unavailable');
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    const candidate = pages.find(page => {
      const info = page.imageinfo?.[0], mime = String(info?.mime || ''), name = String(page.title || '').toLowerCase();
      return info?.thumburl && mime.startsWith('image/') && !/\.svg$/.test(name) && !/(logo|icon|flag|map|diagram|screenshot|symbol)/i.test(name);
    });
    const info = candidate?.imageinfo?.[0]; let image = null;
    if (candidate && info) {
      const meta = info.extmetadata || {};
      const plain = value => String(value?.value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 180);
      image = { url: info.thumburl, pageUrl: info.descriptionurl || ('https://commons.wikimedia.org/wiki/' + encodeURIComponent(candidate.title.replace(/ /g, '_'))), title: candidate.title.replace(/^File:/, ''), artist: plain(meta.Artist) || 'Wikimedia Commons contributor', license: plain(meta.LicenseShortName) || 'See license', alt: plain(meta.ObjectName) || candidate.title.replace(/^File:/, '') };
    }
    commonsImageCache.set(key, { at: Date.now(), image }); return image;
  } catch { commonsImageCache.set(key, { at: Date.now(), image: null }); return null; }
}
const CACHE_MS = Number(process.env.CACHE_MS || 3*60*1000);
const ADS_ENABLED = String(process.env.ADS_ENABLED||'false').toLowerCase()==='true';
const AD_CLIENT_ID = process.env.AD_CLIENT_ID || '';
const ADS_TXT_CONTENT = process.env.ADS_TXT_CONTENT || '';

let cache = { at: 0, data: null, staleAt: 0 };
const ipHits = new Map(); // simple rate limit

const stopwords = new Set(('about after again all also and are back been before being best between big but can cant could day did do does down each for from get gets got had has have here how into its just like make many more most new not now off one only other our out over people really said see she should since some such than that the their them then there these they this those through time today too trend trends under up use using very was way were what when where which while who why will with would you your www com http https official').split(' '));

function log(req, status, ms, extra=''){
  const line = `[${new Date().toISOString()}] ${req.method} ${req.url} -> ${status} ${ms}ms ${extra}`.trim();
  console.log(line);
}
function clean(s=''){
  return String(s).replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
}
function stripTags(s){ return clean(s.replace(/<!\[CDATA\[|\]\]>/g,'')); }
function xmlItems(xml, itemTag='item'){
  const re = new RegExp(`<${itemTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${itemTag}>`,'gi');
  const out=[]; let m;
  while((m=re.exec(xml)) && out.length<60){
    const block=m[1];
    const get=(tag)=>{ const x=block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,'i')); return x ? stripTags(x[1]) : ''; };
    const linkAttr=block.match(/<link[^>]*href=["']([^"']+)["']/i);
    out.push({title:get('title'), url:get('link') || (linkAttr?.[1]||''), publishedAt:get('pubDate')||get('published')||get('updated'), description:get('description')||get('summary')});
  }
  return out;
}
function keywords(title){
  return clean(title).toLowerCase().replace(/https?:\/\/\S+/g,' ').replace(/[^a-z0-9\s#]/g,' ').split(/\s+/).filter(w=>w.length>2&&!stopwords.has(w)&&!/^\d+$/.test(w));
}
function topicKey(title){
  const ws=keywords(title);
  const key=ws.slice(0, Math.min(4,ws.length)).sort().join('-');
  if(key) return key;
  // Stable fallback IDs avoid signals changing identity between refreshes.
  let hash=2166136261;
  for(const ch of clean(title).toLowerCase()){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
  return 'emerging-topic-'+(hash>>>0).toString(36);
}
function scoreFor(item, sources, rank){
  const parsedTime = item.publishedAt ? new Date(item.publishedAt).getTime() : NaN;
  const recency = Number.isFinite(parsedTime) ? Math.max(0, 1 - (Date.now()-parsedTime)/(72*3600*1000)) : .35;
  const engagement = Math.log10(1 + Math.max(0, Number(item.engagement)||0)) / 5;
  return Math.max(12, Math.min(99, Math.round(32 + Math.min(3,sources-1)*10 + recency*20 + Math.min(1,engagement)*18 + Math.max(0,16-rank)*1.2)));
}
function safeUrlValidate(raw){
  try{
    const u=new URL(raw);
    if(!['http:','https:'].includes(u.protocol)) return null;
    if(u.hostname==='localhost' || u.hostname==='127.0.0.1') return null;
    return u.href;
  }catch{ return null; }
}
async function fetchText(url, timeout=7000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(), timeout);
  try{
    const r=await fetch(url,{signal:controller.signal, headers:{'user-agent':USER_AGENT,'accept':'application/json, application/rss+xml, application/xml, text/xml, */*'}});
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    const text=await r.text();
    if(text.length>1_000_000) throw new Error('Response too large');
    return text;
  } finally { clearTimeout(timer); }
}
async function sourceHackerNews(){
  const json=JSON.parse(await fetchText('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=50',7000));
  return (json.hits||[]).filter(x=>x.title).map(x=>({title:clean(x.title),url:safeUrlValidate(x.url||`https://news.ycombinator.com/item?id=${x.objectID}`)||`https://news.ycombinator.com/item?id=${x.objectID}`,source:'Hacker News',sourceType:'community',publishedAt:x.created_at,engagement:Number(x.points||0)+Number(x.num_comments||0),detail:`${x.points||0} points · ${x.num_comments||0} comments`}));
}
async function sourceGoogleTrends(){
  const xml=await fetchText('https://trends.google.com/trending/rss?geo=US',7000);
  return xmlItems(xml).map(x=>({title:x.title,url:safeUrlValidate(x.url)||'https://trends.google.com/trending?geo=US',source:'Google Trends',sourceType:'search',publishedAt:x.publishedAt,engagement:0,detail:'Search interest rising'})).filter(x=>x.title);
}
async function sourceMastodon(){
  const json=JSON.parse(await fetchText('https://mastodon.social/api/v1/trends/tags?limit=20',7000));
  return (json||[]).map(x=>({title:'#'+clean(x.name),url:`https://mastodon.social/tags/${encodeURIComponent(x.name)}`,source:'Mastodon',sourceType:'social',publishedAt:new Date().toISOString(),engagement:(x.history||[]).reduce((n,h)=>n+Number(h.uses||0),0),detail:'Trending social hashtag'}));
}
async function sourceGdelt(){
  const url='https://news.google.com/rss/search?q=trending&hl=en-US&gl=US&ceid=US:en';
  const xml=await fetchText(url,9000);
  return xmlItems(xml).map(x=>({title:clean(x.title),url:safeUrlValidate(x.url)||'https://news.google.com/',source:'Global News',sourceType:'news',publishedAt:x.publishedAt?new Date(x.publishedAt).toISOString():new Date().toISOString(),engagement:0,detail:'Google News public RSS'})).filter(x=>x.title&&x.url);
}
function parseGdeltDate(value){
  const m=String(value||'').match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})/);
  if(!m) return new Date().toISOString();
  const d=new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`);
  return Number.isFinite(d.getTime())?d.toISOString():new Date().toISOString();
}
function categoryFor(title=''){
  const t=title.toLowerCase();
  if(/nfl|nba|mlb|nhl|soccer|football|basketball|baseball|hockey|sports|olympic/.test(t)) return 'Sports';
  if(/ai|openai|model|machine learning|robot|software|developer|github|apple|google|tech|chip|iphone|android/.test(t)) return 'Technology';
  if(/music|song|album|artist|concert|movie|film|celebrity|netflix|tiktok|meme|viral/.test(t)) return 'Entertainment';
  if(/election|president|government|policy|congress|court|war|minister|senate/.test(t)) return 'World';
  if(/game|gaming|steam|xbox|playstation|nintendo|esports/.test(t)) return 'Gaming';
  if(/money|market|stock|economy|business|crypto|bitcoin|startup/.test(t)) return 'Business';
  return 'Culture';
}
async function aggregate(){
  const defs=[['Google Trends',sourceGoogleTrends],['Hacker News',sourceHackerNews],['Mastodon',sourceMastodon],['Global News',sourceGdelt]];
  const settled=await Promise.allSettled(defs.map(([,fn])=>fn()));
  const sources=settled.map((r,i)=>{if(r.status==='rejected'){const raw=String(r.reason?.message||r.reason?.name||'Request failed');const reason=/abort|timeout/i.test(raw)?'Timed out':/^HTTP \d+/.test(raw)?raw.slice(0,24):/fetch failed|network/i.test(raw)?'Network request failed':'Request failed';console.warn('[trend-source-unavailable]',defs[i][0],reason,raw.slice(0,140));return {name:defs[i][0],status:'unavailable',count:0,error:reason,latency:0};}return {name:defs[i][0],status:'connected',count:r.value.length,latency:0};});
  const raw=settled.flatMap(r=>r.status==='fulfilled'?r.value:[]);
  // dedup by URL
  const seenUrl=new Set();
  const deduped=[];
  for(const item of raw){
    const u=item.url?.toLowerCase();
    if(u && seenUrl.has(u)) continue;
    if(u) seenUrl.add(u);
    deduped.push(item);
  }
  const buckets=new Map();
  for(const item of deduped){
    const key=topicKey(item.title);
    if(!buckets.has(key)) buckets.set(key,[]);
    buckets.get(key).push(item);
  }
  const trends=[];
  for(const [key,items] of buckets){
    const distinct=new Set(items.map(i=>i.source));
    const sorted=[...items].sort((a,b)=>(Number(b.engagement)||0)-(Number(a.engagement)||0));
    const best=sorted[0];
    const latest=items.map(i=>i.publishedAt).filter(Boolean).sort().at(-1)||new Date().toISOString();
    const validUrl=safeUrlValidate(best.url)||'https://www.gdeltproject.org/';
    trends.push({id:key,title:best.title,topic:best.title,category:categoryFor(best.title),url:validUrl,source:best.source,sources:[...distinct],sourceCount:distinct.size,sourceDetails:items.slice(0,4).map(i=>({name:i.source,url:safeUrlValidate(i.url)||validUrl,detail:i.detail})),publishedAt:latest,engagement:items.reduce((n,i)=>n+(Number(i.engagement)||0),0),detail:best.detail||'Emerging signal',score:0,kind:distinct.size>1?'cross-source':'single-source'});
  }
  trends.sort((a,b)=>b.sourceCount-a.sourceCount || b.engagement-a.engagement || new Date(b.publishedAt)-new Date(a.publishedAt));
  trends.forEach((t,i)=>{t.score=scoreFor(t,t.sourceCount,i);t.momentum=t.score>=78?'Surging':t.score>=60?'Rising':'Early signal';t.confidence=t.sourceCount>=3?'High':t.sourceCount===2?'Moderate':'Limited';});
  // Add topic-searched Commons photography to the most visible cards; each image carries attribution metadata.
  await Promise.all(trends.slice(0, 24).map(async trend => { trend.image = await findCommonsImage(trend.title); }));
  return {updatedAt:new Date().toISOString(),sources,trendCount:trends.length,trends:trends.slice(0,80),mode:'live',notice:sources.some(s=>s.status==='unavailable')?'Some sources are temporarily unavailable; scores reflect only connected sources.':'Scores summarize available public signals and are not predictions of future virality.'};
}

function rateLimit(ip){
  const now=Date.now();
  const entry=ipHits.get(ip)||{count:0, reset:now+60000};
  if(now>entry.reset){ entry.count=0; entry.reset=now+60000; }
  entry.count++;
  ipHits.set(ip,entry);
  return entry.count>120; // >120 req/min
}

const mime={
  '.html':'text/html; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.txt':'text/plain; charset=utf-8',
  '.ico':'image/x-icon'
};

const server=http.createServer(async(req,res)=>{
  const start=Date.now();
  const ip=req.headers['x-forwarded-for']?.split(',')[0]?.trim()||req.socket.remoteAddress||'unknown';
  if(rateLimit(ip)){
    res.writeHead(429,{'content-type':'application/json','retry-after':'60'});
    res.end(JSON.stringify({error:'Too many requests'}));
    log(req,429,Date.now()-start);
    return;
  }
  const url=new URL(req.url,'http://localhost');
  const pathname=url.pathname;

  // security headers
  const secHeaders={
    'x-content-type-options':'nosniff',
    'x-frame-options':'DENY',
    'referrer-policy':'strict-origin-when-cross-origin',
    'x-xss-protection':'0',
    'permissions-policy':'geolocation=(), microphone=(), camera=()',
    'content-security-policy': "default-src 'self'; script-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://fundingchoicesmessages.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://pagead2.googlesyndication.com; frame-src https://*.googlesyndication.com https://googleads.g.doubleclick.net; font-src 'self' data:; manifest-src 'self';"
  };

  if(pathname==='/api/health'){
    const body={ok:true,service:'ghost-mode',version:'1.2.0',time:new Date().toISOString(),uptime:process.uptime(),cacheAge: cache.data? Date.now()-cache.at : null, sourcesCached: cache.data?.sources||null, env:{adsEnabled:ADS_ENABLED, nodeEnv:process.env.NODE_ENV||'development'}};
    res.writeHead(200,{'content-type':'application/json','cache-control':'no-store',...secHeaders});
    res.end(JSON.stringify(body));
    log(req,200,Date.now()-start);
    return;
  }
  if(pathname==='/api/config'){
    res.writeHead(200,{'content-type':'application/json','cache-control':'public, max-age=300',...secHeaders});
    res.end(JSON.stringify({adsEnabled:ADS_ENABLED, adClientId: ADS_ENABLED? AD_CLIENT_ID : '', adSlots:{
      pulseTop: process.env.AD_SLOT_PULSE_TOP||'',
      pulseMid: process.env.AD_SLOT_PULSE_MID||'',
      radar: process.env.AD_SLOT_RADAR||'',
      underground: process.env.AD_SLOT_UNDERGROUND||''
    }, siteUrl: process.env.SITE_URL||''}));
    log(req,200,Date.now()-start);
    return;
  }
  if(pathname==='/api/image'){
    res.setHeader('content-type','application/json; charset=utf-8');
    res.setHeader('cache-control','public, max-age=3600');
    Object.entries(secHeaders).forEach(([k,v])=>res.setHeader(k,v));
    const title=String(url.searchParams.get('title')||'').trim().slice(0,120);
    if(!title){res.writeHead(400);res.end(JSON.stringify({error:'A topic title is required.'}));log(req,400,Date.now()-start);return;}
    const image=await findCommonsImage(title);
    res.writeHead(200);res.end(JSON.stringify({image}));
    log(req,200,Date.now()-start,image?'image-found':'no-image');return;
  }
  if(pathname==='/api/trends'){
    res.setHeader('content-type','application/json; charset=utf-8');
    res.setHeader('cache-control','no-store');
    res.setHeader('access-control-allow-origin','*');
    Object.entries(secHeaders).forEach(([k,v])=>res.setHeader(k,v));
    if(cache.data && Date.now()-cache.at < CACHE_MS){
      res.writeHead(200);
      res.end(JSON.stringify({...cache.data,cached:true, cacheAge:Date.now()-cache.at}));
      log(req,200,Date.now()-start,'cached');
      return;
    }
    try{
      const data=await aggregate();
      cache={at:Date.now(), data, staleAt:Date.now()+CACHE_MS};
      res.writeHead(200);
      res.end(JSON.stringify(data));
      log(req,200,Date.now()-start,'fresh');
    }catch(e){
      if(cache.data){
        res.writeHead(200);
        res.end(JSON.stringify({...cache.data, cached:true, stale:true, notice:'Serving stale cache — live sources unavailable.'}));
        log(req,200,Date.now()-start,'stale-fallback');
      }else{
        res.writeHead(502);
        res.end(JSON.stringify({error:'Trend sources are temporarily unavailable.', message:String(e.message||e)}));
        log(req,502,Date.now()-start,'error');
      }
    }
    return;
  }
  if(pathname==='/ads.txt' || pathname==='/.well-known/ads.txt'){
    const content=ADS_TXT_CONTENT || (AD_CLIENT_ID? `google.com, ${AD_CLIENT_ID.replace('ca-pub-','pub-')}, DIRECT, f08c47fec0942fa0` : '# ads.txt not configured — set ADS_TXT_CONTENT env');
    res.writeHead(200,{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=3600',...secHeaders});
    res.end(content);
    log(req,200,Date.now()-start);
    return;
  }

  // static file handling
  let safePath=decodeURIComponent(pathname==='/'?'/index.html':pathname);
  // SPA fallback for legal pages
  const legalPages=new Set(['/privacy','/terms','/contact','/about']);
  if(legalPages.has(safePath)) safePath='/index.html';

  const normalized=normalize(safePath).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/,'');
  try{
    const body=await readFile(join(ROOT, normalized));
    const ext=extname(normalized);
    res.writeHead(200,{'content-type': mime[ext]||'application/octet-stream', 'cache-control': ext==='.html'?'no-cache':'public, max-age=3600', ...secHeaders});
    res.end(body);
    log(req,200,Date.now()-start);
  }catch{
    // SPA fallback for frontend routes
    if(!extname(normalized)){
      try{
        const index=await readFile(join(ROOT,'index.html'));
        res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-cache',...secHeaders});
        res.end(index);
        log(req,200,Date.now()-start,'spa-fallback');
        return;
      }catch{}
    }
    res.writeHead(404,{'content-type':'text/plain; charset=utf-8',...secHeaders});
    res.end('Not found');
    log(req,404,Date.now()-start);
  }
});

server.listen(PORT,'0.0.0.0',()=>console.log(`Ghost Mode listening on ${PORT} env=${process.env.NODE_ENV||'dev'} ads=${ADS_ENABLED?'enabled':'disabled'}`));
