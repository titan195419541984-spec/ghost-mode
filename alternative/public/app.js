const state = { items: [], sources: [], query: "", category: "all" };
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function relativeTime(value) {
  if (!value) return "TIME UNKNOWN";
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60000));
  if (minutes < 1) return "JUST NOW";
  if (minutes < 60) return minutes + "M AGO";
  if (minutes < 1440) return Math.floor(minutes / 60) + "H AGO";
  return Math.floor(minutes / 1440) + "D AGO";
}

function cardMarkup(item) {
  return `
    <article class="signal-card">
      <div class="card-meta">
        <span class="category-tag">${escapeHTML(item.category || "SIGNAL")}</span>
        <time>${escapeHTML(relativeTime(item.publishedAt))}</time>
      </div>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.summary || "Open the original publisher for the full report.")}</p>
      <div class="card-footer">
        <span class="publisher" title="${escapeHTML(item.source || "Public source")}">${escapeHTML(item.source || "PUBLIC SOURCE")}</span>
        <a href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">OPEN SOURCE ↗</a>
      </div>
    </article>`;
}

function filteredItems() {
  const query = state.query.toLowerCase();
  return state.items.filter(item => {
    const categoryMatch = state.category === "all" || item.category === state.category;
    const text = [item.title, item.summary, item.source, item.category].join(" ").toLowerCase();
    return categoryMatch && (!query || text.includes(query));
  });
}

function render() {
  const rows = filteredItems();
  const groups = {
    search: rows.filter(item => item.category === "News"),
    tech: rows.filter(item => ["Technology", "Culture"].includes(item.category)),
    macro: rows.filter(item => ["Business", "Science"].includes(item.category))
  };

  Object.entries(groups).forEach(([key, items]) => {
    const container = $("#stream-" + key);
    const ad = key === "tech" ? container.querySelector(".infeed-ad") : null;
    container.innerHTML = items.length
      ? items.map(cardMarkup).join("")
      : '<div class="empty mono">NO MATCHING SIGNALS</div>';
    if (ad) container.prepend(ad);
  });

  $("#feed-count").textContent = rows.length + " ITEMS INDEXED";
  $("#feed-status").textContent = state.items.length
    ? "PUBLIC SOURCES RESPONDING · " + state.sources.filter(source => source.ok).length + "/" + state.sources.length + " ONLINE"
    : "NO FEED ITEMS RETURNED · RETRY AVAILABLE";
}

async function loadFeeds() {
  $("#refresh").classList.add("spinning");
  $("#feed-status").textContent = "REQUESTING PUBLIC SOURCE UPDATES…";
  try {
    const response = await fetch("/api/feeds", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Feed request failed: " + response.status);
    const payload = await response.json();
    state.items = Array.isArray(payload.items) ? payload.items : [];
    state.sources = Array.isArray(payload.sources) ? payload.sources : [];
    render();
    const stamp = payload.updatedAt ? new Date(payload.updatedAt) : new Date();
    $("#last-updated").textContent = "UPDATED " + stamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error(error);
    $("#feed-status").textContent = "FEED CONNECTION INTERRUPTED";
    ["search", "tech", "macro"].forEach(key => {
      const target = $("#stream-" + key);
      const ad = key === "tech" ? target.querySelector(".infeed-ad") : null;
      target.innerHTML = '<div class="empty mono">SOURCE CONNECTION UNAVAILABLE<br>USE REFRESH TO RETRY</div>';
      if (ad) target.prepend(ad);
    });
  } finally {
    $("#refresh").classList.remove("spinning");
  }
}

$("#search").addEventListener("input", event => {
  state.query = event.target.value.trim();
  render();
});
$("#category").addEventListener("change", event => {
  state.category = event.target.value;
  render();
});
$("#refresh").addEventListener("click", loadFeeds);
$("#sources").addEventListener("click", () => {
  $("#source-list").innerHTML = state.sources.map(source => `
    <div class="source-row">
      <span>${escapeHTML(source.name)}</span>
      <b class="${source.ok ? "online" : "offline"}">${source.ok ? "ONLINE · " + source.count + " ITEMS" : "UNAVAILABLE"}</b>
    </div>`).join("") || '<p class="empty">No source report available yet.</p>';
  $("#source-dialog").showModal();
});
$("#close-dialog").addEventListener("click", () => $("#source-dialog").close());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(console.error));
}

loadFeeds();
window.setInterval(() => {
  if (document.visibilityState === "visible") loadFeeds();
}, 180000);