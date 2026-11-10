import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeProtection, platformName } from '../../src/shared/messaging.ts';
import { createDefaultSettings } from '../../src/shared/defaults.ts';

test('describeProtection menghitung hanya zona MVP saat preset Maksimum', () => {
  const settings = createDefaultSettings();
  settings.platforms.whatsapp.enabled = true;
  settings.level = 'maximum';
  for (const zone of Object.values(settings.platforms.whatsapp.zones)) {
    zone.protected = true;
  }

  assert.equal(describeProtection(settings, 'whatsapp'), 'Terlindungi · 9 zona');
});

test('describeProtection menyatakan nonaktif saat platform dimatikan', () => {
  const settings = createDefaultSettings();
  settings.platforms.whatsapp.enabled = false;
  assert.equal(describeProtection(settings, 'whatsapp'), 'Nonaktif di situs ini.');
});

test('describeProtection menyatakan tidak ada zona bila semua zona MVP terbuka', () => {
  const settings = createDefaultSettings();
  settings.platforms.whatsapp.enabled = true;
  for (const zone of Object.values(settings.platforms.whatsapp.zones)) {
    zone.protected = false;
  }
  assert.equal(
    describeProtection(settings, 'whatsapp'),
    'Aktif, tetapi tidak ada zona yang dilindungi.',
  );
});

test('describeProtection menangani situs tanpa platform', () => {
  assert.equal(describeProtection(createDefaultSettings(), null), 'Situs ini tidak didukung.');
});

test('platformName memakai label panjang atau teks fallback', () => {
  assert.equal(platformName('whatsapp'), 'WhatsApp Web');
  assert.equal(platformName(null), 'Situs tidak didukung');
});
