import type { PlatformId, Settings } from '../shared/types.ts';
import type { RuntimeMessage } from '../shared/messaging.ts';
import { platformFromHost } from '../shared/platform-ids.ts';
import { getAdapter } from '../adapters/registry.ts';
import { loadSettings, onSettingsChanged, updateSettings } from '../config-store/storage.ts';
import { PrivacyEngine, type EngineStatus } from '../core/engine.ts';

declare global {
  interface Window {
    __psxBooted?: boolean;
  }
}

function sendStatus(platform: PlatformId, protectedNow: boolean): void {
  try {
    void chrome.runtime
      .sendMessage({ type: 'status', platform, protected: protectedNow } satisfies RuntimeMessage)
      .catch(() => undefined);
  } catch {
    // Background belum siap; abaikan.
  }
}

async function bootstrap(): Promise<void> {
  if (window.__psxBooted) return;
  window.__psxBooted = true;

  const platform = platformFromHost(location.hostname);
  if (!platform) return;

  const adapter = getAdapter(platform);
  if (!adapter) return;

  let settings: Settings = await loadSettings();
  let lastStatus: EngineStatus | null = null;

  const engine = new PrivacyEngine(adapter, platform, settings, {
    onStatus(status) {
      if (status === lastStatus) return;
      lastStatus = status;
      sendStatus(platform, status !== 'inactive');
    },
  });

  const refreshBadge = (): void => {
    sendStatus(platform, settings.platforms[platform].enabled);
  };

  engine.start();
  refreshBadge();

  const unsubscribe = onSettingsChanged((next) => {
    settings = next;
    engine.setSettings(next);
    refreshBadge();
  });

  chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
    if (!message || typeof message !== 'object') return false;

    switch (message.type) {
      case 'toggle-protection': {
        const enabled = !settings.platforms[platform].enabled;
        void updateSettings((current) => ({
          ...current,
          platforms: {
            ...current.platforms,
            [platform]: { ...current.platforms[platform], enabled },
          },
        })).then((next) => {
          settings = next;
          engine.setSettings(next);
          refreshBadge();
        });
        sendResponse({ ok: true });
        break;
      }
      case 'reveal-all':
        engine.revealAllTemporarily();
        sendResponse({ ok: true });
        break;
      case 'panic':
        engine.panic();
        sendResponse({ ok: true });
        break;
      default:
        break;
    }
    return false;
  });

  window.addEventListener(
    'pagehide',
    () => {
      unsubscribe();
      engine.dispose();
    },
    { once: true },
  );
}

void bootstrap();
