import type { PlatformId, ZoneId } from '../shared/types.ts';
import { ZONE_IDS } from '../shared/defaults.ts';
import type { PlatformAdapter } from './contract.ts';
import { whatsappAdapter } from './whatsapp/index.ts';
import { telegramAdapter } from './telegram/index.ts';
import { instagramAdapter } from './instagram/index.ts';
import { facebookAdapter } from './facebook/index.ts';
import { xAdapter } from './x/index.ts';
import { threadsAdapter } from './threads/index.ts';
import { tiktokAdapter } from './tiktok/index.ts';

const ADAPTERS: readonly PlatformAdapter[] = [
  whatsappAdapter,
  telegramAdapter,
  instagramAdapter,
  facebookAdapter,
  xAdapter,
  threadsAdapter,
  tiktokAdapter,
];

export function getAdapter(platform: PlatformId): PlatformAdapter | null {
  return ADAPTERS.find((adapter) => adapter.id === platform) ?? null;
}

export function allAdapters(): readonly PlatformAdapter[] {
  return ADAPTERS;
}

export function supportedPlatforms(): readonly PlatformId[] {
  return ADAPTERS.map((adapter) => adapter.id as PlatformId);
}

/**
 * Zona yang bisa dideteksi platform ini. Empat zona baris diturunkan dari
 * struktur baris chat walau tidak punya selector sendiri, jadi tetap dihitung
 * didukung. Zona lain harus punya selector agar tidak tampil sebagai menu
 * yang tidak melakukan apa pun (contoh: Konten feed di WhatsApp/Telegram).
 */
const STRUCTURAL_ZONES = new Set<ZoneId>(['names', 'chatPreview', 'avatars', 'mediaPreview']);

export function supportedZones(platform: PlatformId): readonly ZoneId[] {
  const adapter = getAdapter(platform);
  if (!adapter) return ZONE_IDS;
  return ZONE_IDS.filter(
    (zone) => STRUCTURAL_ZONES.has(zone) || adapter.selectors[zone] !== undefined,
  );
}
