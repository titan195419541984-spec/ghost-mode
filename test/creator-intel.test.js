import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const creator = await readFile(new URL("../public/creator-intel.js", import.meta.url), "utf8");

describe("Creator intelligence data integrity", () => {
  it("shows creator, niche, and audience-normalized lift on video cards", () => {
    assert.match(creator, /const audience = v\.audienceLift/);
    assert.match(creator, /esc\(audience\)/);
    assert.match(creator, /creator-video-baselines/);
  });

  it("rebuilds the video status note without appending duplicates on refresh", () => {
    assert.match(creator, /note\.dataset\.baseNote = baseNote/);
    assert.match(creator, /note\.textContent = baseNote \+/);
    assert.doesNotMatch(creator, /\$\("#creator-data-note"\)\.textContent \+=/);
  });

  it("surfaces a safe, escaped source error instead of hiding the cause", () => {
    assert.match(creator, /esc\(e\?\.message \|\| "Unknown source error"\)/);
    assert.match(creator, /Video source refresh failed/);
  });
});

const index = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const worker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const loader = await readFile(new URL("../public/monetag-loader.js", import.meta.url), "utf8");

describe("Ghost Mode production entry and Monetag integration", () => {
  it("opens on The Pulse rather than the creator workspace", () => {
    assert.match(index, /class="nav-item active" data-view="pulse"/);
    assert.match(index, /class="view active" id="view-pulse"/);
    assert.match(app, /view:'pulse'/);
    assert.match(app, /else switchView\('pulse'\)/);
  });

  it("loads the owner-configured Monetag page tag and verification marker", () => {
    assert.ok(index.includes('<script src="/monetag-loader.js" defer></script>'));
    assert.ok(loader.includes("script.dataset.zone = '12206531'"));
    assert.ok(loader.includes("https://nap5k.com/tag.min.js"));
    assert.ok(!index.includes("quge5.com") && !index.includes("305577"));
    assert.match(index, /name="monetag" content="51a9582a1f37dbc327a9f9179371f855"/);
  });

  it("does not install the mismatched third-party advertising worker", () => {
    assert.match(worker, /ghost-mode-shell-v1-5-0/);
    assert.doesNotMatch(worker, /3nbf4\.com|12187189|importScripts\(/);
    assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  });
});
