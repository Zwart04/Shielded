import type { Settings } from '../shared/types.ts';
import { createDefaultSettings } from '../shared/defaults.ts';
import { normalizeSettings } from './schema.ts';

export const STORAGE_KEY = 'settings';

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

export async function loadSettings(): Promise<Settings> {
  if (!hasChromeStorage()) return createDefaultSettings();
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return normalizeSettings(stored[STORAGE_KEY]);
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!hasChromeStorage()) return;
  const normalized = normalizeSettings(settings);
  await chrome.storage.local.set({ [STORAGE_KEY]: normalized });
}

export async function updateSettings(mutator: (current: Settings) => Settings): Promise<Settings> {
  const current = await loadSettings();
  const next = normalizeSettings(mutator(current));
  await saveSettings(next);
  return next;
}

export async function resetSettings(): Promise<Settings> {
  const defaults = createDefaultSettings();
  await saveSettings(defaults);
  return defaults;
}

export function onSettingsChanged(callback: (settings: Settings) => void): () => void {
  if (!hasChromeStorage()) return () => undefined;

  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== 'local') return;
    const change = changes[STORAGE_KEY];
    if (!change) return;
    callback(normalizeSettings(change.newValue));
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
