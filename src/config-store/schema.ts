import type { Settings, PlatformId, ZoneId, ZoneRule, EffectKind, BlurIntensity, ThemePreference } from '../shared/types.ts';
import { PLATFORM_IDS } from '../shared/platform-ids.ts';
import { SCHEMA_VERSION, ZONE_IDS, createDefaultSettings, isLevel, zonesForLevel } from '../shared/defaults.ts';

const EFFECTS: readonly EffectKind[] = ['blur', 'cover', 'hide'];
const INTENSITIES: readonly BlurIntensity[] = ['light', 'normal', 'strong'];
const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** Platform yang baru masuk pada skema v6 dan perlu dinyalakan saat migrasi. */
const NEW_PLATFORMS: readonly PlatformId[] = ['facebook', 'x', 'threads', 'tiktok'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function readZone(value: unknown, fallback: ZoneRule): ZoneRule {
  if (!isRecord(value)) return { ...fallback };
  const effect = typeof value.effect === 'string' && (EFFECTS as readonly string[]).includes(value.effect)
    ? (value.effect as EffectKind)
    : fallback.effect;
  return {
    protected: bool(value.protected, fallback.protected),
    effect,
  };
}

function protectedOrFirst(...values: unknown[]): unknown {
  for (const value of values) {
    if (isRecord(value) && value.protected === true) return value;
  }
  return values.find((value) => isRecord(value));
}

/**
 * Skema 1 memakai zona gabungan `conversationList` dan `identity`.
 * Petakan ke zona granular agar preferensi lama tetap terpakai:
 * - conversationList -> preview pesan + nama
 * - identity         -> nama + foto profil
 */
function legacyZoneSource(source: Record<string, unknown>, zone: ZoneId): unknown {
  switch (zone) {
    case 'chatPreview':
      return source.conversationList;
    case 'names':
      return protectedOrFirst(source.identity, source.conversationList);
    case 'avatars':
      return source.identity;
    default:
      return undefined;
  }
}

function readZones(value: unknown, fallback: Record<ZoneId, ZoneRule>): Record<ZoneId, ZoneRule> {
  const source = isRecord(value) ? value : {};
  const result = {} as Record<ZoneId, ZoneRule>;
  for (const zone of ZONE_IDS) {
    const stored = source[zone] !== undefined ? source[zone] : legacyZoneSource(source, zone);
    result[zone] = readZone(stored, fallback[zone]);
  }
  return result;
}

/**
 * Menormalkan data dari storage. Selalu mengembalikan objek lengkap yang valid,
 * sehingga data korup atau dari versi lama tidak pernah merusak UI.
 */
export function normalizeSettings(raw: unknown): Settings {
  const defaults = createDefaultSettings();
  if (!isRecord(raw)) return defaults;

  const level = isLevel(raw.level) ? raw.level : defaults.level;
  const platformsSource = isRecord(raw.platforms) ? raw.platforms : {};

  const platforms = {} as Settings['platforms'];
  for (const id of PLATFORM_IDS) {
    const fallback = defaults.platforms[id];
    const candidate = platformsSource[id];
    const record = isRecord(candidate) ? candidate : {};
    platforms[id] = {
      enabled: bool(record.enabled, fallback.enabled),
      zones: readZones(record.zones, fallback.zones),
    };
  }

  // v4/v5: preset Privasi/Maksimum berubah (media + kotak ketik ikut dilindungi).
  // v6: empat platform baru ikut diaktifkan; di data lama nilainya masih false
  // karena saat itu belum didukung, bukan karena pilihan pengguna.
  // Zona lama diganti preset terbaru sekali agar perlindungan baru aktif.
  const storedVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0;
  if (storedVersion >= 3 && storedVersion < SCHEMA_VERSION) {
    const preset = zonesForLevel(level);
    for (const id of PLATFORM_IDS) {
      const zones = {} as Record<ZoneId, ZoneRule>;
      for (const zone of ZONE_IDS) zones[zone] = { ...preset[zone] };
      platforms[id].zones = zones;
    }
    for (const id of NEW_PLATFORMS) {
      if (defaults.platforms[id].enabled) platforms[id].enabled = true;
    }
  }

  const blurIntensity =
    typeof raw.blurIntensity === 'string' && (INTENSITIES as readonly string[]).includes(raw.blurIntensity)
      ? (raw.blurIntensity as BlurIntensity)
      : defaults.blurIntensity;

  const theme =
    typeof raw.theme === 'string' && (THEMES as readonly string[]).includes(raw.theme)
      ? (raw.theme as ThemePreference)
      : defaults.theme;

  return {
    schemaVersion: SCHEMA_VERSION,
    level,
    autoProtectOnHidden: bool(raw.autoProtectOnHidden, defaults.autoProtectOnHidden),
    autoProtectOnBlur: bool(raw.autoProtectOnBlur, defaults.autoProtectOnBlur),
    restoreOnFocus: bool(raw.restoreOnFocus, defaults.restoreOnFocus),
    hoverReveal: bool(raw.hoverReveal, defaults.hoverReveal),
    clickReveal: bool(raw.clickReveal, defaults.clickReveal),
    revealTimeoutSec: clampNumber(raw.revealTimeoutSec, defaults.revealTimeoutSec, 1, 10),
    instantReveal: bool(raw.instantReveal, defaults.instantReveal),
    unblurOnAppHover: bool(raw.unblurOnAppHover, defaults.unblurOnAppHover),
    idleBlurMinutes: clampNumber(raw.idleBlurMinutes, defaults.idleBlurMinutes, 0, 60),
    blurIntensity,
    coverTone: raw.coverTone === 'dark' ? 'dark' : 'neutral',
    theme,
    onboardingDone: bool(raw.onboardingDone, defaults.onboardingDone),
    platforms,
  };
}

export function platformDisplayOrder(): readonly PlatformId[] {
  return PLATFORM_IDS;
}
