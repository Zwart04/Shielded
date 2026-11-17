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

/**
 * Antrean tulis: Chrome tidak menjamin urutan selesai `storage.local.set`,
 * jadi klik beruntun bisa membuat snapshot lama menang dan pengaturan
 * terlihat "tidak live". Semua penulisan lewat satu antrean.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task);
  writeQueue = run.catch(() => undefined);
  return run;
}

function writeDirect(settings: Settings): Promise<void> {
  if (!hasChromeStorage()) return Promise.resolve();
  const normalized = normalizeSettings(settings);
  return chrome.storage.local.set({ [STORAGE_KEY]: normalized });
}

export function saveSettings(settings: Settings): Promise<void> {
  return enqueue(() => writeDirect(settings));
}

export function updateSettings(mutator: (current: Settings) => Settings): Promise<Settings> {
  return enqueue(async () => {
    const current = await loadSettings();
    const next = normalizeSettings(mutator(current));
    await writeDirect(next);
    return next;
  });
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
