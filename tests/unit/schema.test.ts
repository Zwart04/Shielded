import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings } from '../../src/config-store/schema.ts';
import { createDefaultSettings } from '../../src/shared/defaults.ts';

test('normalizeSettings mengembalikan default untuk input kosong', () => {
  const settings = normalizeSettings(undefined);
  assert.deepEqual(settings, createDefaultSettings());
});

test('normalizeSettings mempertahankan nilai valid', () => {
  const base = createDefaultSettings();
  const custom = {
    ...base,
    level: 'maximum',
    theme: 'dark',
    blurIntensity: 'strong',
    revealTimeoutSec: 7,
    instantReveal: true,
    unblurOnAppHover: true,
    idleBlurMinutes: 15,
    coverTone: 'dark',
    onboardingDone: true,
  };
  const normalized = normalizeSettings(custom);
  assert.equal(normalized.level, 'maximum');
  assert.equal(normalized.theme, 'dark');
  assert.equal(normalized.blurIntensity, 'strong');
  assert.equal(normalized.revealTimeoutSec, 7);
  assert.equal(normalized.instantReveal, true);
  assert.equal(normalized.unblurOnAppHover, true);
  assert.equal(normalized.idleBlurMinutes, 15);
  assert.equal(normalized.coverTone, 'dark');
  assert.equal(normalized.onboardingDone, true);
});

test('nilai tidak valid jatuh ke default', () => {
  const normalized = normalizeSettings({
    level: 'ultra',
    theme: 'neon',
    blurIntensity: 'extreme',
    coverTone: 'rainbow',
    revealTimeoutSec: 99,
    platforms: 'bukan objek',
    autoProtectOnHidden: 'ya',
  });

  assert.equal(normalized.level, 'privacy');
  assert.equal(normalized.theme, 'system');
  assert.equal(normalized.blurIntensity, 'normal');
  assert.equal(normalized.coverTone, 'neutral');
  assert.equal(normalized.revealTimeoutSec, 10);
  assert.equal(normalized.autoProtectOnHidden, true);
});

test('revealTimeoutSec dibatasi minimal 1', () => {
  const normalized = normalizeSettings({ revealTimeoutSec: -5 });
  assert.equal(normalized.revealTimeoutSec, 1);
});

test('zona tidak valid memakai fallback platform', () => {
  const base = createDefaultSettings();
  const normalized = normalizeSettings({
    ...base,
    platforms: {
      ...base.platforms,
      whatsapp: {
        enabled: false,
        zones: {
          messages: { protected: false, effect: 'laser' },
        },
      },
    },
  });

  assert.equal(normalized.platforms.whatsapp.enabled, false);
  assert.equal(normalized.platforms.whatsapp.zones.messages.protected, false);
  assert.equal(normalized.platforms.whatsapp.zones.messages.effect, 'blur');
  assert.equal(normalized.platforms.telegram.enabled, true);
});

test('schema v1: conversationList dipetakan ke preview dan nama', () => {
  const normalized = normalizeSettings({
    schemaVersion: 1,
    platforms: {
      whatsapp: {
        enabled: true,
        zones: {
          messages: { protected: true, effect: 'blur' },
          conversationList: { protected: true, effect: 'cover' },
          identity: { protected: false, effect: 'blur' },
          media: { protected: false, effect: 'blur' },
        },
      },
    },
  });

  const zones = normalized.platforms.whatsapp.zones;
  assert.equal(zones.chatPreview.protected, true);
  assert.equal(zones.chatPreview.effect, 'cover');
  assert.equal(zones.names.protected, true);
  assert.equal(zones.avatars.protected, false);
  assert.equal(zones.chatList.protected, false);
});

test('schema v1: identity dipetakan ke nama dan avatar tanpa membuka baris chat', () => {
  const normalized = normalizeSettings({
    schemaVersion: 1,
    level: 'normal',
    platforms: {
      whatsapp: {
        enabled: true,
        zones: {
          identity: { protected: true, effect: 'hide' },
        },
      },
    },
  });

  const zones = normalized.platforms.whatsapp.zones;
  assert.equal(zones.names.protected, true);
  assert.equal(zones.names.effect, 'hide');
  assert.equal(zones.avatars.protected, true);
  assert.equal(zones.chatList.protected, false);
});

test('schema v1: identity yang tidak dilindungi tidak menyalakan nama', () => {
  const normalized = normalizeSettings({
    schemaVersion: 1,
    platforms: {
      whatsapp: {
        zones: {
          conversationList: { protected: true, effect: 'blur' },
          identity: { protected: false, effect: 'blur' },
        },
      },
    },
  });

  const zones = normalized.platforms.whatsapp.zones;
  assert.equal(zones.chatPreview.protected, true);
  assert.equal(zones.names.protected, true);
  assert.equal(zones.avatars.protected, false);
});

test('zona eksplisit selalu menang atas fallback preset', () => {
  const normalized = normalizeSettings({
    schemaVersion: 2,
    platforms: {
      whatsapp: {
        zones: {
          chatPreview: { protected: false, effect: 'cover' },
        },
      },
    },
  });

  const zones = normalized.platforms.whatsapp.zones;
  assert.equal(zones.chatPreview.protected, false);
  assert.equal(zones.chatPreview.effect, 'cover');
  assert.equal(zones.messages.protected, true);
});

test('schemaVersion selalu diisi versi saat ini', () => {
  const normalized = normalizeSettings({ schemaVersion: 0 });
  assert.equal(normalized.schemaVersion, createDefaultSettings().schemaVersion);
});

test('skema lama memakai ulang preset terbaru dan mengaktifkan platform baru', () => {
  const normalized = normalizeSettings({
    schemaVersion: 3,
    level: 'privacy',
    platforms: {
      whatsapp: { enabled: false, zones: { media: { protected: false, effect: 'blur' } } },
      telegram: { enabled: true, zones: { textInput: { protected: false, effect: 'blur' } } },
    },
  });

  assert.equal(normalized.platforms.whatsapp.enabled, false);
  assert.equal(normalized.platforms.whatsapp.zones.media.protected, true);
  assert.equal(normalized.platforms.telegram.zones.textInput.protected, true);
  assert.equal(normalized.platforms.threads.enabled, true);
  assert.equal(normalized.platforms.tiktok.enabled, true);
});
