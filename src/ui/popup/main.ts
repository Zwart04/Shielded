import type {
  BlurIntensity,
  PlatformId,
  ProtectionLevel,
  Settings,
  ZoneId,
} from '../../shared/types.ts';
import {
  LEVEL_LABELS,
  ZONE_ICONS,
  ZONE_IDS,
  ZONE_LABELS,
  applyPreset,
} from '../../shared/defaults.ts';
import { PLATFORM_IDS, PLATFORM_LABELS, platformFromUrl } from '../../shared/platform-ids.ts';
import { loadSettings, updateSettings } from '../../config-store/storage.ts';
import { activeTabUrl, applyTheme, clear, el } from '../components/dom.ts';
import { icon, platformIcon, type IconName } from '../components/icons.ts';
import { brandLogo } from '../components/logo.ts';
import { createSegmented } from '../components/segmented.ts';
import { createToggle } from '../components/toggle.ts';
import { showToast } from '../components/toast.ts';
import { SUPPORT_URL } from '../../shared/links.ts';

const LEVELS: readonly ProtectionLevel[] = ['normal', 'privacy', 'maximum'];

const INTENSITIES: ReadonlyArray<{ value: BlurIntensity; label: string }> = [
  { value: 'light', label: 'Ringan' },
  { value: 'normal', label: 'Sedang' },
  { value: 'strong', label: 'Kuat' },
];

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Tema yang benar-benar tampil, termasuk saat preferensi masih `system`. */
function resolvedTheme(theme: Settings['theme']): 'light' | 'dark' {
  return theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme;
}

function zoneCount(settings: Settings, platform: PlatformId): number {
  return ZONE_IDS.filter((zone) => settings.platforms[platform].zones[zone].protected).length;
}

function skeleton(): HTMLElement {
  return el('div', { className: 'popup' }, [
    el('div', { className: 'po-skeleton po-skeleton--wide' }),
    el('div', { className: 'po-skeleton' }),
    el('div', { className: 'po-skeleton po-skeleton--short' }),
  ]);
}

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  clear(app);
  app.append(skeleton());

  let settings: Settings;
  let selected: PlatformId = 'whatsapp';

  try {
    const [url, stored] = await Promise.all([activeTabUrl(), loadSettings()]);
    settings = stored;
    const onSite = url ? platformFromUrl(url) : null;
    selected =
      onSite ??
      PLATFORM_IDS.find((id) => settings.platforms[id].enabled) ??
      'whatsapp';
    applyTheme(settings.theme);
  } catch {
    clear(app);
    const retry = el('button', {
      className: 'btn btn-secondary btn-sm',
      text: 'Muat ulang',
      attrs: { type: 'button' },
    });
    retry.addEventListener('click', () => location.reload());
    app.append(
      el('div', { className: 'popup' }, [
        el('div', { className: 'po-banner' }, [
          el('span', { text: 'Preferensi tidak dapat dibaca.' }),
          retry,
        ]),
      ]),
    );
    return;
  }

  const persist = (next: Settings): void => {
    settings = next;
    render();
    void updateSettings(() => next)
      .then((saved) => {
        settings = saved;
      })
      .catch(() => showToast('Gagal menyimpan pengaturan.'));
  };

  const patchPlatform = (id: PlatformId, patch: Partial<Settings['platforms'][PlatformId]>): void => {
    persist({
      ...settings,
      platforms: {
        ...settings.platforms,
        [id]: { ...settings.platforms[id], ...patch },
      },
    });
  };

  const renderHeader = (): HTMLElement => {
    const resolved = resolvedTheme(settings.theme);
    const toDark = resolved === 'light';
    const themeButton = el(
      'button',
      {
        className: 'po-theme',
        attrs: {
          type: 'button',
          'aria-label': toDark ? 'Aktifkan tema gelap' : 'Aktifkan tema terang',
          title: toDark ? 'Tema gelap' : 'Tema terang',
        },
      },
      [icon(toDark ? 'moon' : 'sun', 17)],
    );
    themeButton.addEventListener('click', () => {
      const next = { ...settings, theme: toDark ? ('dark' as const) : ('light' as const) };
      settings = next;
      applyTheme(next.theme);
      render();
      void updateSettings(() => next).catch(() => showToast('Gagal menyimpan tema.'));
    });

    return el('header', { className: 'po-head' }, [
      el('div', { className: 'po-brand' }, [
        el('span', { className: 'po-brand-logo' }, [brandLogo(24)]),
        el('span', { text: 'Shielded' }),
      ]),
      themeButton,
    ]);
  };

  const renderGreeting = (): HTMLElement =>
    el('div', { className: 'po-greeting' }, [
      el('h1', { text: 'Hai 👋' }),
      el('p', { text: 'Atur apa yang terlihat hari ini.' }),
    ]);

  const renderPlatformCard = (): HTMLElement => {
    const platform = settings.platforms[selected];
    const count = zoneCount(settings, selected);
    const status = platform.enabled
      ? count > 0
        ? `Aktif · ${count} zona terlindungi`
        : 'Aktif · belum ada zona'
      : 'Nonaktif';

    const toggle = createToggle({
      checked: platform.enabled,
      label: `Aktifkan perlindungan di ${PLATFORM_LABELS[selected]}`,
      onChange: (checked) => patchPlatform(selected, { enabled: checked }),
    });

    const chips = el('div', { className: 'po-chips', attrs: { role: 'tablist', 'aria-label': 'Pilih platform' } });
    for (const id of PLATFORM_IDS) {
      const on = settings.platforms[id].enabled;
      const chip = el(
        'button',
        {
          className: 'po-chip',
          attrs: {
            type: 'button',
            role: 'tab',
            title: PLATFORM_LABELS[id],
            'aria-label': PLATFORM_LABELS[id],
            'aria-selected': id === selected ? 'true' : 'false',
          },
        },
        [platformIcon(id, 19)],
      );
      chip.dataset.on = on ? 'true' : 'false';
      chip.addEventListener('click', () => {
        if (id === selected) return;
        selected = id;
        render();
      });
      chips.append(chip);
    }

    return el('section', { className: 'po-card po-platform' }, [
      el('div', { className: 'po-platform-row' }, [
        el('span', { className: 'po-platform-logo' }, [platformIcon(selected, 22)]),
        el('div', { className: 'po-platform-meta' }, [
          el('strong', { text: PLATFORM_LABELS[selected] }),
          el('span', { text: status }),
        ]),
        toggle,
      ]),
      chips,
    ]);
  };

  const renderZones = (): HTMLElement => {
    const platform = settings.platforms[selected];
    const enabled = platform.enabled;
    const rows: HTMLElement[] = [];

    for (const zone of ZONE_IDS) {
      const rule = platform.zones[zone];
      const toggle = createToggle({
        checked: rule.protected,
        label: `${ZONE_LABELS[zone]} di ${PLATFORM_LABELS[selected]}`,
        disabled: !enabled,
        onChange: (checked) =>
          patchPlatform(selected, {
            zones: {
              ...platform.zones,
              [zone]: { ...rule, protected: checked },
            },
          }),
      });

      rows.push(
        el('div', { className: `po-zone${enabled ? '' : ' po-zone--off'}` }, [
          el('span', { className: 'po-zone-icon' }, [icon(ZONE_ICONS[zone] as IconName, 16)]),
          el('div', { className: 'po-zone-text' }, [
            el('strong', { text: ZONE_LABELS[zone] }),
            el('span', { text: rule.protected ? 'Dilindungi' : 'Terlihat' }),
          ]),
          toggle,
        ]),
      );
    }

    return el('section', { className: 'po-card po-zones' }, [
      el('div', { className: 'po-card-head' }, [
        el('h2', { text: 'Zona' }),
        el('span', { text: enabled ? `${zoneCount(settings, selected)} aktif` : 'Platform nonaktif' }),
      ]),
      ...(enabled
        ? rows
        : [
            el('p', {
              className: 'po-note',
              text: 'Nyalakan platform di atas untuk memilih bagian yang ingin disembunyikan.',
            }),
          ]),
    ]);
  };

  const renderLevel = (): HTMLElement => {
    const segmented = createSegmented(
      LEVELS.map((value) => ({ value, label: LEVEL_LABELS[value] })),
      settings.level,
      (value) => persist(applyPreset(settings, value)),
    );
    return el('section', { className: 'po-level' }, [segmented]);
  };

  const renderAdvanced = (): HTMLElement => {
    const intensity = createSegmented(
      INTENSITIES.map((item) => ({ value: item.value, label: item.label })),
      settings.blurIntensity,
      (value) => persist({ ...settings, blurIntensity: value }),
    );

    const hover = createToggle({
      checked: settings.hoverReveal,
      label: 'Hover membuka item',
      onChange: (checked) => persist({ ...settings, hoverReveal: checked }),
    });

    const shortcuts = el('button', { className: 'po-link', attrs: { type: 'button' } }, [
      el('span', { text: 'Pintasan keyboard' }),
      el('span', { className: 'po-link-value', text: 'Alt+Shift+S' }),
    ]);
    shortcuts.addEventListener('click', () => {
      void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    const privacy = el('button', { className: 'po-link', attrs: { type: 'button' } }, [
      el('span', { text: 'Kebijakan privasi' }),
      el('span', { className: 'po-link-value', text: 'Buka' }),
    ]);
    privacy.addEventListener('click', () => {
      void chrome.tabs.create({ url: chrome.runtime.getURL('ui/privacy/index.html') });
    });

    return el('details', { className: 'po-details' }, [
      el('summary', {}, [
        el('span', { text: 'Opsi lanjutan' }),
        el('span', { className: 'po-sum-icon' }, [icon('chevron', 14)]),
      ]),
      el('div', { className: 'po-adv' }, [
        el('div', { className: 'po-adv-block' }, [
          el('div', { className: 'po-adv-title' }, [
            el('span', { text: 'Kekuatan blur' }),
            el('span', { text: 'Berlaku semua platform' }),
          ]),
          intensity,
        ]),
        el('div', { className: 'po-adv-row' }, [
          el('div', { className: 'po-adv-title' }, [
            el('span', { text: 'Hover membuka item' }),
            el('span', { text: 'Hanya item yang disorot' }),
          ]),
          hover,
        ]),
        shortcuts,
        privacy,
      ]),
    ]);
  };

  const renderSupport = (): HTMLElement => {
    const link = el(
      'a',
      {
        className: 'po-support',
        attrs: { href: SUPPORT_URL, target: '_blank', rel: 'noopener noreferrer' },
      },
      [
        el('span', { className: 'po-support-icon' }, [icon('coffee', 18)]),
        el('span', { className: 'po-support-text' }, [
          el('strong', { text: 'Suka Shielded?' }),
          el('span', { text: 'Traktir kopi lewat Tako' }),
        ]),
        el('span', { className: 'po-support-go', text: 'Buka' }),
      ],
    );
    return link;
  };

  const render = (): void => {
    clear(app);
    app.append(
      el('div', { className: 'popup' }, [
        renderHeader(),
        renderGreeting(),
        renderPlatformCard(),
        renderLevel(),
        renderZones(),
        renderAdvanced(),
        renderSupport(),
        el('p', {
          className: 'po-foot',
          text: 'Privasi lokal · Tanpa telemetri',
        }),
      ]),
    );
  };

  render();
}

void main();
