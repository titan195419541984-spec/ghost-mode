import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const index = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const ads = await readFile(new URL('../public/ads.js', import.meta.url), 'utf8');

describe('Advertising placement policy', () => {
  it('keeps the only ad container inside the Pulse view', () => {
    const pulseStart = index.indexOf('id="view-pulse"');
    const studioStart = index.indexOf('id="view-studio"');
    assert.ok(pulseStart >= 0 && studioStart > pulseStart);
    const pulse = index.slice(pulseStart, studioStart);
    const outsidePulse = index.slice(0, pulseStart) + index.slice(studioStart);
    assert.match(pulse, /id="ad-pulse-mid"[^>]*data-slot="pulseMid"/);
    assert.doesNotMatch(pulse, /id="ad-radar"/);
    assert.doesNotMatch(outsidePulse, /class="[^"]*ad-container/);
  });

  it('does not render inactive ad placeholders or reserve their space', () => {
    assert.match(index, /id="ad-pulse-mid"[^>]*hidden/);
    assert.match(ads, /el\.hidden=!active/);
    assert.match(ads, /#view-pulse \.ad-container/);
    assert.doesNotMatch(ads, /SPONSORED AREA/);
  });
});

const rewardApp = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');

describe('Ad configuration and reward integrity', () => {
  it('uses correct numeric AdSense slot and publisher ID validation patterns', () => {
    assert.ok(ads.includes('/^\\d+$/'));
    assert.ok(ads.includes('/^ca-pub-\\d{10,}$/'));
  });

  it('does not issue client-side points from an ad playback callback', () => {
    assert.match(rewardApp, /const ready=false/);
    assert.match(rewardApp, /Server-side rewarded-video verification is not configured/);
    assert.doesNotMatch(rewardApp, /rewardState\\.points\\+=award/);
  });
});
