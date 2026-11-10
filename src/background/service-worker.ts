import type { PlatformId, Settings } from '../shared/types.ts';
import type { RuntimeMessage } from '../shared/messaging.ts';
import { platformFromUrl } from '../shared/platform-ids.ts';
import { loadSettings, onSettingsChanged, saveSettings } from '../config-store/storage.ts';

const BADGE_COLOR = '#0071e3';

function setBadge(tabId: number, platform: PlatformId | null, protectedNow: boolean): void {
  const text = platform && protectedNow ? 'ON' : '';
  void chrome.action.setBadgeText({ tabId, text }).catch(() => undefined);
  if (text) {
    void chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR }).catch(() => undefined);
  }
}

function enabledFor(settings: Settings, platform: PlatformId | null): boolean {
  return platform ? settings.platforms[platform].enabled : false;
}

async function refreshBadgeForTab(tabId: number): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    const platform = tab.url ? platformFromUrl(tab.url) : null;
    const settings = await loadSettings();
    setBadge(tabId, platform, enabledFor(settings, platform));
  } catch {
    // Tab sudah ditutup atau tidak dapat diakses.
  }
}

async function refreshActiveBadge(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id) await refreshBadgeForTab(tab.id);
}

chrome.runtime.onInstalled.addListener((details) => {
  void (async () => {
    const settings = await loadSettings();
    await saveSettings(settings);

    if (details.reason === 'install' && !settings.onboardingDone) {
      await chrome.tabs.create({ url: chrome.runtime.getURL('ui/onboarding/index.html') });
    }
    await refreshActiveBadge();
  })();
});

chrome.runtime.onStartup.addListener(() => {
  void refreshActiveBadge();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  void refreshBadgeForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || typeof changeInfo.url === 'string') {
    void refreshBadgeForTab(tabId);
  }
});

chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    const type =
      command === 'toggle-protection'
        ? 'toggle-protection'
        : command === 'reveal-all'
          ? 'reveal-all'
          : command === 'panic'
            ? 'panic'
            : null;
    if (!type) return;
    await chrome.tabs
      .sendMessage(tab.id, { type } satisfies RuntimeMessage)
      .catch(() => undefined);
  })();
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender) => {
  if (message?.type === 'status' && sender.tab?.id != null) {
    setBadge(sender.tab.id, message.platform, message.protected);
  }
  return false;
});

onSettingsChanged(() => {
  void refreshActiveBadge();
});
