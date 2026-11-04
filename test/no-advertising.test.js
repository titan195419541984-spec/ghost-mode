import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const paths = ['../public/index.html','../public/app.js','../server.js','../public/sw.js'];
const sources = await Promise.all(paths.map(path => readFile(new URL(path, import.meta.url), 'utf8')));

test('production application contains no advertising or rewarded-video integrations', () => {
  const source = sources.join('\n');
  for (const token of [
    'adsbygoogle',
    'googlesyndication',
    'imasdk.googleapis.com',
    'hilltop-ads',
    'realisticreply.com',
    'doubleclick.net',
    'fundingchoicesmessages.google.com',
    '/ads.js',
    '/rewards.js',
    '/ads.txt',
    '/api/rewards'
  ]) {
    assert.equal(source.includes(token), false, `Unexpected advertising integration: ${token}`);
  }
  assert.match(sources[0], /<script src="\/app\.js/);
});
