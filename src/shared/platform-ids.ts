import type { PlatformId } from './types.ts';

export const PLATFORM_IDS: readonly PlatformId[] = [
  'whatsapp',
  'telegram',
  'instagram',
  'facebook',
  'x',
  'threads',
  'tiktok',
];

/**
 * Semua platform yang punya adapter aktif. Nama konstanta dipertahankan agar
 * pemanggil lama tidak perlu diubah.
 */
export const MVP_PLATFORMS: readonly PlatformId[] = [...PLATFORM_IDS];

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  whatsapp: 'WhatsApp Web',
  telegram: 'Telegram Web',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  threads: 'Threads',
  tiktok: 'TikTok',
};

export const PLATFORM_SHORT_LABELS: Record<PlatformId, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X',
  threads: 'Threads',
  tiktok: 'TikTok',
};

const HOSTS: Record<PlatformId, readonly string[]> = {
  whatsapp: ['web.whatsapp.com'],
  telegram: ['web.telegram.org'],
  instagram: ['www.instagram.com', 'instagram.com'],
  facebook: ['www.facebook.com', 'facebook.com', 'web.facebook.com', 'www.messenger.com', 'messenger.com'],
  x: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  threads: ['www.threads.net', 'threads.net', 'www.threads.com', 'threads.com'],
  tiktok: ['www.tiktok.com', 'tiktok.com'],
};

const HOST_TO_PLATFORM = new Map<string, PlatformId>();
for (const id of PLATFORM_IDS) {
  for (const host of HOSTS[id]) {
    HOST_TO_PLATFORM.set(host, id);
  }
}

export function platformFromHost(hostname: string): PlatformId | null {
  const normalized = hostname.toLowerCase();
  return HOST_TO_PLATFORM.get(normalized) ?? null;
}

export function platformFromUrl(url: string): PlatformId | null {
  try {
    return platformFromHost(new URL(url).hostname);
  } catch {
    return null;
  }
}

export function hostsForPlatform(id: PlatformId): readonly string[] {
  return HOSTS[id];
}

export const CONTENT_MATCH_PATTERNS: readonly string[] = PLATFORM_IDS.flatMap((id) =>
  HOSTS[id].map((host) => `https://${host}/*`),
);
