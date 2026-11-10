import type { PlatformId, Settings } from '../shared/types.ts';
import { PLATFORM_LABELS } from '../shared/platform-ids.ts';
import { MVP_ZONES } from '../shared/defaults.ts';

export type RuntimeMessage =
  | { type: 'toggle-protection' }
  | { type: 'reveal-all' }
  | { type: 'panic' }
  | { type: 'status'; platform: PlatformId | null; protected: boolean }
  | { type: 'get-status' };

export function sendToActiveTab(message: RuntimeMessage): void {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query) return;
  void chrome.tabs
    .query({ active: true, currentWindow: true })
    .then((tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      void chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Tidak ada content script di tab ini; abaikan.
      });
    })
    .catch(() => undefined);
}

export function platformName(id: PlatformId | null): string {
  if (!id) return 'Situs tidak didukung';
  return PLATFORM_LABELS[id];
}

export function describeProtection(settings: Settings, platform: PlatformId | null): string {
  if (!platform) return 'Situs ini tidak didukung.';
  const platformSettings = settings.platforms[platform];
  if (!platformSettings.enabled) return 'Nonaktif di situs ini.';
  const count = MVP_ZONES.filter((zone) => platformSettings.zones[zone].protected).length;
  if (count === 0) return 'Aktif, tetapi tidak ada zona yang dilindungi.';
  return `Terlindungi · ${count} zona`;
}
