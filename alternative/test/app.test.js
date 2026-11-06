import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("alternative PWA manifest and shell are valid", async () => {
  const [html, sw, manifest] = await Promise.all(
    ["../public/index.html", "../public/sw.js", "../public/manifest.json"].map(path =>
      readFile(new URL(path, import.meta.url), "utf8")
    )
  );

  const parsedManifest = JSON.parse(manifest);
  assert.equal(parsedManifest.name, "NexusFlow Digital Terminal");
  assert.equal(parsedManifest.short_name, "NexusFlow");
  assert.equal(parsedManifest.start_url, "/index.html");
  assert.equal(parsedManifest.theme_color, "#05070c");
  assert.match(html, /name=.monetag./i);
  assert.match(html, /12206531/);
  assert.match(html, /NEXUSFLOW_V5\.1/);
  assert.match(html, /system-footer/);
  assert.doesNotMatch(html, /smartLinkUrl/);

  assert.match(sw, /networkFirst/);
  assert.match(sw, /cacheFirst/);
  assert.match(sw, /nexusflow-v5/);
  assert.match(sw, /api-v5/);
  assert.doesNotMatch(sw, /https:\/\/tailwindcss\.com|https:\/\/googleapis\.com/);
  assert.match(sw, /key\.startsWith\(CACHE_PREFIX\)/);
  assert.match(sw, /Public signal feeds are unavailable while offline/);
});

test("feed endpoint uses fixed sources and bounded fetches", async () => {
  const code = await readFile(new URL("../api/feeds.js", import.meta.url), "utf8");
  assert.match(code, /FEEDS=/);
  assert.match(code, /AbortSignal\.timeout/);
  assert.doesNotMatch(code, /req\.query\.url/);
});
