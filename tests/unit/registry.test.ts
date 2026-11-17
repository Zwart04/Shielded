import { test } from 'node:test';
import assert from 'node:assert/strict';
import { supportedZones } from '../../src/adapters/registry.ts';
import { PLATFORM_IDS } from '../../src/shared/platform-ids.ts';

test('supportedZones hanya menampilkan zona yang bisa dideteksi platform', () => {
  // WhatsApp dan Telegram tidak punya feed, jadi zona Konten feed tidak ditawarkan.
  assert.ok(!supportedZones('whatsapp').includes('feedContent'));
  assert.ok(!supportedZones('telegram').includes('feedContent'));
  assert.ok(!supportedZones('tiktok').includes('feedContent'));
  assert.ok(!supportedZones('x').includes('feedContent'));

  // Facebook punya seluruh zona, termasuk feed.
  assert.equal(supportedZones('facebook').length, 9);

  // Empat zona baris tetap tersedia walau platform tidak punya selector khusus.
  for (const platform of PLATFORM_IDS) {
    for (const zone of ['names', 'chatPreview', 'avatars', 'mediaPreview'] as const) {
      assert.ok(supportedZones(platform).includes(zone), `${platform} kehilangan ${zone}`);
    }
  }
});
