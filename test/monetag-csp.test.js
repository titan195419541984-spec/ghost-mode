import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const server = await readFile(new URL('../server.js', import.meta.url), 'utf8');

test('Monetag ad resources are permitted by the production Content Security Policy', () => {
  assert.match(server, /script-src 'self' https:\/\/quge5\.com/);
  assert.match(server, /connect-src 'self' https:/);
  assert.match(server, /frame-src 'self' https:/);
  assert.match(server, /object-src 'none'/);
});
