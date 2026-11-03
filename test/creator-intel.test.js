import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const creator = await readFile(new URL("../public/creator-intel.js", import.meta.url), "utf8");

describe("Creator Desk video intelligence rendering", () => {
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
