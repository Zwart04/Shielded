import type {
  ProtectionLevel,
  ZoneId,
  ZoneRule,
  PlatformSettings,
  Settings,
  PlatformId,
  BlurIntensity,
} from './types.ts';
import { PLATFORM_IDS, MVP_PLATFORMS } from './platform-ids.ts';

export const SCHEMA_VERSION = 7;

export const ZONE_IDS: readonly ZoneId[] = [
  'messages',
  'chatList',
  'chatPreview',
  'names',
  'avatars',
  'mediaPreview',
  'media',
  'feedContent',
  'textInput',
];

/** Zona yang benar-benar didukung MVP. Media direncanakan untuk P1. */
export const MVP_ZONES: readonly ZoneId[] = [...ZONE_IDS];

export const ZONE_LABELS: Record<ZoneId, string> = {
  messages: 'Isi pesan',
  chatList: 'Seluruh baris chat',
  chatPreview: 'Preview pesan',
  names: 'Nama kontak',
  avatars: 'Foto profil',
  mediaPreview: 'Preview media',
  media: 'Galeri media',
  feedContent: 'Konten feed',
  textInput: 'Kotak ketik',
};

export const ZONE_DESCRIPTIONS: Record<ZoneId, string> = {
  messages: 'Panel percakapan yang sedang dibuka.',
  chatList: 'Seluruh baris di daftar chat, termasuk semua isinya.',
  chatPreview: 'Teks pesan terakhir di setiap baris chat.',
  names: 'Nama kontak di daftar chat dan header percakapan.',
  avatars: 'Foto profil kontak di daftar dan header.',
  mediaPreview: 'Gambar dan dokumen kecil di daftar chat.',
  media: 'Gambar, video, dan dokumen di dalam percakapan.',
  feedContent: 'Teks dan media unggahan di feed, bukan percakapan.',
  textInput: 'Teks yang sedang diketik sebelum dikirim.',
};

/** Ikon per zona; dipetakan ke komponen ikon di UI. */
export const ZONE_ICONS: Record<ZoneId, string> = {
  messages: 'message',
  chatList: 'list',
  chatPreview: 'chat-preview',
  names: 'user',
  avatars: 'image',
  mediaPreview: 'media-preview',
  media: 'media',
  feedContent: 'feed',
  textInput: 'text-input',
};

export const LEVEL_LABELS: Record<ProtectionLevel, string> = {
  normal: 'Normal',
  privacy: 'Privasi',
  maximum: 'Maksimum',
};

export const LEVEL_DESCRIPTIONS: Record<ProtectionLevel, string> = {
  normal: 'Tidak ada yang disembunyikan.',
  privacy: 'Pesan, preview, nama, dan foto profil dikaburkan per item.',
  maximum: 'Pesan, preview, nama, dan media ditutup. Tampilkan lewat pintasan.',
};

/**
 * Radius kecil-menengah: cukup untuk menghilangkan keterbacaan teks 13-16px
 * tanpa melelehkan huruf menjadi balok. Avatar/foto otomatis lebih kuat
 * (lihat styles.ts) karena area gambarnya jauh lebih besar dari teks.
 */
export const BLUR_PIXELS: Record<BlurIntensity, number> = {
  light: 4,
  normal: 5,
  strong: 8,
};

const OFF: ZoneRule = { protected: false, effect: 'blur' };

function emptyZones(): Record<ZoneId, ZoneRule> {
  const zones = {} as Record<ZoneId, ZoneRule>;
  for (const zone of ZONE_IDS) zones[zone] = { ...OFF };
  return zones;
}

function cloneZones(zones: Record<ZoneId, ZoneRule>): Record<ZoneId, ZoneRule> {
  const copy = {} as Record<ZoneId, ZoneRule>;
  for (const zone of ZONE_IDS) copy[zone] = { ...zones[zone] };
  return copy;
}

export function zonesForLevel(level: ProtectionLevel): Record<ZoneId, ZoneRule> {
  const zones = emptyZones();

  switch (level) {
    case 'normal':
      return zones;
    case 'privacy':
      zones.messages = { protected: true, effect: 'blur' };
      zones.chatPreview = { protected: true, effect: 'blur' };
      zones.names = { protected: true, effect: 'blur' };
      zones.avatars = { protected: true, effect: 'blur' };
      zones.mediaPreview = { protected: true, effect: 'blur' };
      zones.media = { protected: true, effect: 'blur' };
      zones.textInput = { protected: true, effect: 'blur' };
      return zones;
    case 'maximum':
      zones.messages = { protected: true, effect: 'cover' };
      // Baris chat tidak ditutup utuh: nama/preview/avatar sudah ditangani
      // per bagian, jadi satu blok besar hanya membuat daftar tak terbaca.
      zones.chatList = { protected: false, effect: 'blur' };
      zones.chatPreview = { protected: true, effect: 'cover' };
      zones.names = { protected: true, effect: 'hide' };
      zones.avatars = { protected: true, effect: 'hide' };
      zones.mediaPreview = { protected: true, effect: 'cover' };
      zones.media = { protected: true, effect: 'cover' };
      zones.textInput = { protected: true, effect: 'blur' };
      return zones;
    default: {
      const exhaustive: never = level;
      return exhaustive;
    }
  }
}

function platformDefaults(level: ProtectionLevel): Record<PlatformId, PlatformSettings> {
  const zones = zonesForLevel(level);
  const result = {} as Record<PlatformId, PlatformSettings>;
  for (const id of PLATFORM_IDS) {
    result[id] = {
      enabled: MVP_PLATFORMS.includes(id),
      zones: cloneZones(zones),
    };
  }
  return result;
}

export function createDefaultSettings(): Settings {
  return {
    schemaVersion: SCHEMA_VERSION,
    level: 'privacy',
    autoProtectOnHidden: true,
    autoProtectOnBlur: true,
    restoreOnFocus: true,
    hoverReveal: true,
    clickReveal: false,
    revealTimeoutSec: 3,
    instantReveal: false,
    unblurOnAppHover: false,
    idleBlurMinutes: 0,
    blurIntensity: 'normal',
    coverTone: 'neutral',
    theme: 'system',
    onboardingDone: false,
    platforms: platformDefaults('privacy'),
  };
}

/**
 * Mengembalikan salinan baru dengan preset diterapkan ke zona semua platform.
 * Status aktif/nonaktif per platform dipertahankan agar preset tidak
 * menyalakan kembali platform yang sengaja dimatikan pengguna.
 */
export function applyPreset(settings: Settings, level: ProtectionLevel): Settings {
  const zones = zonesForLevel(level);
  const platforms = {} as Record<PlatformId, PlatformSettings>;

  for (const id of PLATFORM_IDS) {
    platforms[id] = {
      enabled: settings.platforms[id]?.enabled ?? MVP_PLATFORMS.includes(id),
      zones: cloneZones(zones),
    };
  }

  return {
    ...settings,
    level,
    platforms,
  };
}

export function isLevel(value: unknown): value is ProtectionLevel {
  return value === 'normal' || value === 'privacy' || value === 'maximum';
}

export function isZoneId(value: unknown): value is ZoneId {
  return typeof value === 'string' && (ZONE_IDS as readonly string[]).includes(value);
}
