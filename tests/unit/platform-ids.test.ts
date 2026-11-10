import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTENT_MATCH_PATTERNS,
  platformFromHost,
  platformFromUrl,
} from '../../src/shared/platform-ids.ts';

test('platformFromHost mengenali seluruh platform target', () => {
  assert.equal(platformFromHost('web.whatsapp.com'), 'whatsapp');
  assert.equal(platformFromHost('web.telegram.org'), 'telegram');
  assert.equal(platformFromHost('www.instagram.com'), 'instagram');
  assert.equal(platformFromHost('www.facebook.com'), 'facebook');
  assert.equal(platformFromHost('x.com'), 'x');
  assert.equal(platformFromHost('www.threads.net'), 'threads');
  assert.equal(platformFromHost('www.tiktok.com'), 'tiktok');
});

test('platformFromHost tidak mengenali domain lain', () => {
  assert.equal(platformFromHost('example.com'), null);
  assert.equal(platformFromHost('whatsapp.com'), null);
  assert.equal(platformFromHost(''), null);
});

test('platformFromUrl aman untuk URL tidak valid', () => {
  assert.equal(platformFromUrl('bukan url'), null);
  assert.equal(platformFromUrl('https://web.whatsapp.com/'), 'whatsapp');
});

test('match pattern tidak memakai all_urls', () => {
  assert.equal(CONTENT_MATCH_PATTERNS.includes('<all_urls>'), false);
  assert.equal(CONTENT_MATCH_PATTERNS.includes('*://*/*'), false);
  assert.ok(CONTENT_MATCH_PATTERNS.length > 0);
  for (const pattern of CONTENT_MATCH_PATTERNS) {
    assert.match(pattern, /^https:\/\/[^*]+\/\*$/);
  }
});
