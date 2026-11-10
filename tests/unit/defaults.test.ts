import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPreset,
  createDefaultSettings,
  zonesForLevel,
  LEVEL_LABELS,
  MVP_ZONES,
  ZONE_ICONS,
  ZONE_IDS,
} from '../../src/shared/defaults.ts';

test('default settings memakai preset Privasi dan mematikan semua platform', () => {
  const settings = createDefaultSettings();

  assert.equal(settings.level, 'privacy');
  for (const platform of Object.values(settings.platforms)) {
    assert.equal(platform.enabled, false);
  }
});

test('preset Privasi melindungi pesan, preview, nama, dan foto per item', () => {
  const zones = zonesForLevel('privacy');
  assert.equal(zones.messages.protected, true);
  assert.equal(zones.messages.effect, 'blur');
  assert.equal(zones.chatPreview.protected, true);
  assert.equal(zones.names.protected, true);
  assert.equal(zones.avatars.protected, true);
  assert.equal(zones.chatList.protected, false);
  assert.equal(zones.mediaPreview.protected, true);
  assert.equal(zones.media.protected, true);
  assert.equal(zones.textInput.protected, true);
});

test('preset Maksimum menutup isi pesan dan menyembunyikan identitas', () => {
  const zones = zonesForLevel('maximum');
  assert.equal(zones.messages.protected, true);
  assert.equal(zones.messages.effect, 'cover');
  // Baris chat dibiarkan utuh; bagiannya dilindungi satu per satu.
  assert.equal(zones.chatList.protected, false);
  assert.equal(zones.chatPreview.protected, true);
  assert.equal(zones.names.protected, true);
  assert.equal(zones.names.effect, 'hide');
  assert.equal(zones.avatars.protected, true);
  assert.equal(zones.avatars.effect, 'hide');
  assert.equal(zones.media.protected, true);
});

test('preset Normal tidak melindungi apa pun', () => {
  const zones = zonesForLevel('normal');
  for (const zone of Object.values(zones)) {
    assert.equal(zone.protected, false);
  }
});

test('applyPreset mengganti level dan menimpa zona semua platform tanpa memutasi objek lama', () => {
  const original = createDefaultSettings();
  const next = applyPreset(original, 'maximum');

  assert.equal(original.level, 'privacy');
  assert.equal(original.platforms.whatsapp.zones.messages.effect, 'blur');
  assert.equal(next.level, 'maximum');
  assert.equal(next.platforms.whatsapp.zones.messages.effect, 'cover');
  assert.equal(next.platforms.tiktok.zones.messages.protected, true);
});

test('applyPreset mempertahankan status aktif/nonaktif platform', () => {
  const original = createDefaultSettings();
  original.platforms.telegram.enabled = true;

  const next = applyPreset(original, 'maximum');

  assert.equal(next.platforms.whatsapp.enabled, false);
  assert.equal(next.platforms.telegram.enabled, true);
  assert.equal(next.platforms.tiktok.enabled, false);
});

test('label level lengkap', () => {
  assert.deepEqual(Object.keys(LEVEL_LABELS).sort(), ['maximum', 'normal', 'privacy']);
});

test('setiap zona punya label dan ikon unik di MVP', () => {
  assert.equal(ZONE_IDS.length, 9);
  assert.equal(MVP_ZONES.length, 9);
  const icons = MVP_ZONES.map((zone) => ZONE_ICONS[zone]);
  assert.equal(new Set(icons).size, icons.length);
  assert.ok(icons.every((name) => name.length > 0));
});

test('preset Maksimum menetapkan efek berbeda per zona', () => {
  const zones = zonesForLevel('maximum');
  const effects = new Set(MVP_ZONES.map((zone) => zones[zone].effect));
  assert.deepEqual([...effects].sort(), ['blur', 'cover', 'hide']);
});
