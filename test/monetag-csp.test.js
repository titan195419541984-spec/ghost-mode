import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const server = await readFile(new URL('../server.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');

test('Monetag zone script is permitted by the production Content Security Policy', () => {
  assert.match(server, /script-src 'self' 'sha256-\/MikLPrqKBaIQ1Sg4xAWWBzkVYckapvivgBsTAa57U8=' https:\/\/nap5k\.com/);
  assert.doesNotMatch(server, /https:\/\/quge5\.com/);
  assert.match(server, /connect-src 'self' https:/);
  assert.match(server, /frame-src 'self' https:/);
  assert.match(server, /object-src 'none'/);
  assert.ok(html.includes("<script>(function(s){s.dataset.zone='12206531',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>"));
  assert.doesNotMatch(html, /https:\/\/quge5\.com\/88\/tag\.min\.js/);
  assert.match(html, /name="monetag"/);
});
