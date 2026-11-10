import type { PlatformId } from '../shared/types.ts';
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
