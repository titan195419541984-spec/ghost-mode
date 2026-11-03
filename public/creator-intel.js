
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const STORE = "gm-creator-formats-v1";
  const formats = [
    {id:"open-loop",name:"Open-loop reveal",tag:"RETENTION",desc:"Show an intriguing result first, hold back the explanation, then close the loop.",beats:["Lead with the unexplained result","Give only the minimum context","Add one detail that deepens the question","Reveal the cause or answer","End with a concise takeaway"],hook:"The part nobody sees coming about {topic} is this…",fit:"Stories, product demos, history, food, fitness"},
    {id:"reverse",name:"Reverse-order reveal",tag:"STRUCTURE",desc:"Start at the outcome, rewind to the first decision, then replay the chain that caused it.",beats:["Show the final outcome","Ask how it got there","Rewind to the first step","Reveal the turning point","Return to the outcome with new meaning"],hook:"This is where {topic} ended up. Now rewind to how it started.",fit:"Transformations, sports, builds, experiments, case studies"},
    {id:"visual-proof",name:"Visual proof first",tag:"HOOK",desc:"Open on a visible demonstration before explaining the claim.",beats:["Show the strongest visual proof","State the claim in one sentence","Demonstrate the process","Show the result clearly","Explain the one lesson"],hook:"Watch what happens when {topic} meets this one test.",fit:"DIY, science, cooking, tech, fitness"},
    {id:"myth-check",name:"Expectation vs. reality",tag:"CONTRAST",desc:"Set up the common assumption, test it, and show the surprising gap.",beats:["State the common belief","Explain why it sounds reasonable","Test it with a concrete example","Reveal the gap or exception","Give a practical conclusion"],hook:"Most people assume this about {topic}. The reality is different.",fit:"Education, money, health topics, tools, culture"},
    {id:"three-beat",name:"Three-beat escalation",tag:"PACING",desc:"Use three increasingly consequential examples, then land one clear payoff.",beats:["Promise three escalating examples","Deliver the first quick example","Raise the stakes with the second","Make the third the strongest","Tie all three to one takeaway"],hook:"Three things about {topic}—and the last changes the whole picture.",fit:"Lists, explainers, travel, gaming, product comparisons"},
    {id:"hidden-detail",name:"The overlooked detail",tag:"CURIOSITY",desc:"Direct attention to one small detail that changes how the whole subject is understood.",beats:["Point to the overlooked detail","Show the wider scene or context","Explain what most viewers miss","Connect the detail to the bigger picture","Invite viewers to look again"],hook:"Look closely at {topic}. One small detail changes everything.",fit:"History, architecture, mysteries, film, product analysis"},
    {id:"constraint",name:"Constraint challenge",tag:"EXPERIMENT",desc:"Introduce a clear limitation, attempt the task, and reveal what the constraint exposes.",beats:["State the challenge and limitation","Set a measurable success condition","Show the attempt without filler","Reveal the result","Explain what the constraint taught"],hook:"Can {topic} work with just one restriction? Let's test it.",fit:"Creator challenges, recipes, gaming, design, workouts"},
    {id:"before-after",name:"Before / after with the why",tag:"TRANSFORMATION",desc:"Make the change visible, then explain the decisions that produced it.",beats:["Show the after state first","Flash the starting point","Identify the key changes","Show the process in quick steps","Name the repeatable lesson"],hook:"The difference in {topic} looks dramatic. Here's what actually caused it.",fit:"Beauty, home, fitness, editing, learning"}
  ];
  let trends = [];
  let videos = [];
  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(STORE) || "[]")); } catch {}
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify([...saved])); } catch {} };
  function currentTrend(topic) { return trends.find(t => t.title === topic) || null; }
  function recommendedFormat(t) {
    const s = (t.title + " " + t.category).toLowerCase();
    if (/before|after|transform|build|makeover|growth/.test(s)) return "before-after";
    if (/how|why|explained|science|technology|ai|tool/.test(s)) return "myth-check";
    if (/mystery|secret|hidden|strange|history|missing/.test(s)) return "hidden-detail";
    if (/game|challenge|test|experiment|recipe|workout/.test(s)) return "constraint";
    if (/sports|final|champion|record|comeback/.test(s)) return "reverse";
    return "open-loop";
  }
  function renderFormats() {
    const host = $("#creator-format-grid");
    if (!host) return;
    host.innerHTML = formats.map(f => {
      const active = saved.has(f.id);
      return '<article class="creator-format-card"><div class="creator-format-top"><span>' + f.tag + '</span><button class="creator-save ' + (active ? 'is-saved' : '') + '" data-format-save="' + f.id + '" aria-label="' + (active ? 'Remove saved structure' : 'Save structure') + '">' + (active ? '★ SAVED' : '☆ SAVE') + '</button></div><h3>' + f.name + '</h3><p>' + f.desc + '</p><small>WORKS ACROSS: ' + f.fit + '</small><button class="creator-use" data-format-use="' + f.id + '">Use this structure <span>↗</span></button></article>';
    }).join("");
    const savedHost = $("#creator-saved-list");
    if (savedHost) {
      const chosen = formats.filter(f => saved.has(f.id));
      savedHost.innerHTML = chosen.length ? chosen.map(f => '<button class="creator-saved-chip" data-format-use="' + f.id + '">' + f.name + ' <span>↗</span></button>').join("") : '<p class="creator-muted">Save a structure to build your personal swipe file.</p>';
    }
  }

  function renderVideos(data) {
    const host = $("#creator-video-grid");
    if (!host) return;
    const coverage = $("#creator-video-coverage");
    const baseline = $("#creator-baseline-status");
    const indexState = $("#creator-index-state");
    if (!data || !data.configured) {
      if (coverage) coverage.textContent = "NOT CONNECTED";
      if (baseline) baseline.textContent = "NOT AVAILABLE";
      if (indexState) indexState.textContent = "YouTube API key required";
      host.innerHTML = '<div class="creator-empty"><strong>YouTube connector is ready to configure.</strong><br>Add YOUTUBE_API_KEY to the ghost-mode Render service environment to activate official public Shorts sampling. This is a sample connector, not a million-video catalog.</div>';
      return;
    }
    videos = Array.isArray(data.videos) ? data.videos : [];
    if (coverage) coverage.textContent = String(data.sampleCount || videos.length) + " SAMPLED";
    if (baseline) baseline.textContent = String(data.baselineReady || 0) + " SCORED";
    if (indexState) indexState.textContent = "YouTube sample · " + (data.cached ? "cached" : "refreshed");
    if (!videos.length) {
      host.innerHTML = '<div class="creator-empty">The connector is active, but no eligible Shorts were returned in this sample. Check the API quota and try the next refresh.</div>';
      return;
    }
    host.innerHTML = videos.slice(0,18).map(v => {
      const score = Number.isFinite(v.breakoutScore) ? '<b class="creator-video-score">' + v.breakoutScore + '</b>' : '<b class="creator-video-score is-pending">—</b>';
      const creator = v.creatorLift ? v.creatorLift.toFixed(2) + '× creator' : 'Creator baseline building';
      const niche = v.nicheLift ? v.nicheLift.toFixed(2) + '× niche' : 'Niche baseline building';
      const thumb = v.thumbnail ? '<img src="' + esc(v.thumbnail) + '" alt="" loading="lazy">' : '';
      return '<article class="creator-video-card"><a class="creator-video-thumb" href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer">' + thumb + '<span>OPEN VIDEO ↗</span></a><div class="creator-video-body"><div class="creator-video-kicker">YOUTUBE SHORT · ' + esc(v.channelTitle || "Creator") + '</div><h3><a href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer">' + esc(v.title) + '</a></h3><div class="creator-video-stats"><span>' + Number(v.views).toLocaleString() + ' views</span><span>' + Number(v.viewsPerHour).toLocaleString() + ' avg views/hr</span></div><div class="creator-video-baselines"><span>' + esc(creator) + '</span><span>' + esc(niche) + '</span></div><div class="creator-video-score-row"><span>BASELINE-RELATIVE SCORE</span>' + score + '</div></div></article>';
    }).join("");
    $("#creator-data-note").textContent += " · YouTube sample " + (data.refreshedAt ? new Date(data.refreshedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "available") + " · " + (data.note || "");
  }
  async function loadVideos() {
    const host = $("#creator-video-grid");
    if (!host) return;
    try {
      const r = await fetch("/api/videos", {cache:"no-store"});
      const data = await r.json();
      if (!r.ok && !data.configured) throw new Error(data.error || "Video source unavailable");
      renderVideos(data);
    } catch (e) {
      host.innerHTML = '<div class="creator-empty">Video source refresh failed. Public topic discovery and the format library remain available.</div>';
      const coverage = $("#creator-video-coverage");
      if (coverage) coverage.textContent = "SOURCE ERROR";
    }
  }

  function renderScan() {
    const host = $("#creator-opportunities");
    if (!host) return;
    const fresh = [...trends].sort((a,b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, 12);
    $("#creator-scan-count").textContent = String(trends.length);
    $("#creator-scan-time").textContent = "UPDATED " + new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    $("#creator-index-state").textContent = "PUBLIC TOPIC SIGNALS";
    if (!fresh.length) {
      host.innerHTML = '<div class="creator-empty">No live signals returned. Refresh the scan when the source feeds recover.</div>';
      return;
    }
    host.innerHTML = fresh.map(t => {
      const format = formats.find(f => f.id === recommendedFormat(t)) || formats[0];
      return '<article class="creator-opportunity"><div class="creator-opportunity-main"><div class="creator-opportunity-meta"><span>' + esc(t.category || "CULTURE") + '</span><span>' + esc(t.momentum || "Early signal") + '</span><span>' + esc(t.source || "Public source") + '</span></div><h3>' + esc(t.title) + '</h3><p>' + esc(t.detail || "Public topic signal. Validate the original source before producing.") + '</p><div class="creator-opportunity-foot"><span>PUBLIC SIGNAL SCORE <b>' + Number(t.score || 0) + '</b></span><span>' + esc(t.confidence || "Limited") + ' confidence</span></div></div><div class="creator-format-pick"><small>EDITORIAL FORMAT SUGGESTION</small><strong>' + format.name + '</strong><button data-apply-topic="' + esc(t.id) + '" data-topic="' + esc(t.title) + '" data-format="' + format.id + '">Build hooks ↗</button></div></article>';
    }).join("");
  }
  function makeHooks(topic, formatId) {
    const f = formats.find(x => x.id === formatId) || formats[0];
    const cleanTopic = topic.trim();
    if (!cleanTopic) return [];
    const base = f.hook.replaceAll("{topic}", cleanTopic);
    return [
      base,
      "I tested a different way to look at " + cleanTopic + ". Here's what stood out.",
      "Before you scroll past " + cleanTopic + ", notice this one thing."
    ];
  }
  function generateHooks() {
    const topic = $("#creator-hook-topic").value.trim();
    const formatId = $("#creator-hook-format").value;
    const hooks = makeHooks(topic, formatId);
    const out = $("#creator-hook-results");
    if (!hooks.length) { out.innerHTML = '<p class="creator-muted">Enter a topic or choose one from the morning scan.</p>'; return; }
    out.innerHTML = hooks.map((h,i) => '<div class="creator-hook-result"><span>OPTION 0' + (i+1) + '</span><p>' + esc(h) + '</p><button data-copy-hook="' + esc(h) + '">COPY</button></div>').join("");
  }
  function applyFormat(id, topic) {
    const f = formats.find(x => x.id === id) || formats[0];
    $("#creator-hook-format").value = f.id;
    if (topic) $("#creator-hook-topic").value = topic;
    $("#creator-format-detail").innerHTML = '<div class="creator-detail-head"><span>' + f.tag + '</span><h3>' + f.name + '</h3><p>' + f.desc + '</p></div><ol>' + f.beats.map(x => '<li>' + x + '</li>').join("") + '</ol><small>Use as a creative framework. This is an editorial recommendation, not a claim that the structure is already trending.</small>';
    generateHooks();
    $("#creator-hook-topic").focus();
  }
  function captureBookmarklet() {
    const code = 'javascript:(()=>{const u=location.href;const t=document.title;window.open("https://ghost-mode-umm5.onrender.com/#creator?source="+encodeURIComponent(u)+"&title="+encodeURIComponent(t),"_blank","noopener")})();';
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(() => alert("Bookmarklet copied. Add it as a browser bookmark and paste the copied code into its URL field."), () => alert(code));
    } else {
      window.prompt("Copy this as the URL of a new browser bookmark:", code);
    }
  }
  async function load() {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const source = params.get("source");
    const title = params.get("title");
    if (source) {
      $("#creator-source-capture").hidden = false;
      $("#creator-source-capture").innerHTML = 'Captured page: <a href="' + esc(source) + '" target="_blank" rel="noopener noreferrer">' + esc(title || source) + '</a>';
      if (title) $("#creator-hook-topic").value = title.slice(0,180);
    }
    try {
      const r = await fetch("/api/trends", {cache:"no-store"});
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      trends = Array.isArray(data.trends) ? data.trends : [];
      renderScan();
      $("#creator-data-note").textContent = (data.cached ? "Cached public feed" : "Live public feed") + " · " + new Date(data.updatedAt || Date.now()).toLocaleString();
    } catch (e) {
      $("#creator-opportunities").innerHTML = '<div class="creator-empty">Live public feeds are temporarily unavailable. Your saved structures and hook generator still work.</div>';
      $("#creator-data-note").textContent = "Source feed unavailable";
    }
    renderFormats();
    loadVideos();
  }
  document.addEventListener("click", e => {
    const saveBtn = e.target.closest("[data-format-save]");
    if (saveBtn) { const id=saveBtn.dataset.formatSave; saved.has(id)?saved.delete(id):saved.add(id); save(); renderFormats(); return; }
    const useBtn = e.target.closest("[data-format-use]");
    if (useBtn) { applyFormat(useBtn.dataset.formatUse, $("#creator-hook-topic").value); return; }
    const applyBtn = e.target.closest("[data-apply-topic]");
    if (applyBtn) { applyFormat(applyBtn.dataset.format, applyBtn.dataset.topic); return; }
    const copyBtn = e.target.closest("[data-copy-hook]");
    if (copyBtn) { navigator.clipboard?.writeText(copyBtn.dataset.copyHook).then(()=>alert("Hook copied."),()=>{}); return; }
  });
  $("#creator-hook-generate")?.addEventListener("click", generateHooks);
  $("#creator-hook-topic")?.addEventListener("keydown", e => { if(e.key==="Enter"){e.preventDefault();generateHooks();} });
  $("#creator-bookmarklet")?.addEventListener("click", captureBookmarklet);
  $("#creator-refresh")?.addEventListener("click", load);
  if (location.hash.startsWith("#creator")) document.querySelector('[data-view="creator"]')?.click();
  load();
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") load(); });
})();
