import type { PlatformId, Settings, ZoneId } from '../../shared/types.ts';
import {
  LEVEL_LABELS,
  MVP_ZONES,
  ZONE_ICONS,
  ZONE_IDS,
  ZONE_LABELS,
  applyPreset,
} from '../../shared/defaults.ts';
import { PLATFORM_SHORT_LABELS, PLATFORM_LABELS, platformFromUrl } from '../../shared/platform-ids.ts';
import { loadSettings, updateSettings } from '../../config-store/storage.ts';
import { activeTabUrl, applyTheme, clear, el } from '../components/dom.ts';
import { icon, type IconName } from '../components/icons.ts';
import { brandLogo } from '../components/logo.ts';
import { createSegmented } from '../components/segmented.ts';
import { createToggle } from '../components/toggle.ts';
import { showToast } from '../components/toast.ts';
import { SUPPORT_LABEL, SUPPORT_URL } from '../../shared/links.ts';

const ZONES: Array<{ id: ZoneId; available: boolean }> = ZONE_IDS.map((id) => ({
  id,
  available: MVP_ZONES.includes(id),
}));

function skeleton(): HTMLElement {
  return el('div', { className: 'popup' }, [
    el('div', { className: 'skeleton', attrs: { style: 'width:60%' } }),
    el('div', { className: 'skeleton', attrs: { style: 'width:100%' } }),
    el('div', { className: 'skeleton', attrs: { style: 'width:85%' } }),
  ]);
}

function openDashboard(hash = ''): void {
  const base = chrome.runtime.getURL('ui/dashboard/index.html');
  void chrome.tabs.create({ url: `${base}${hash}` });
  window.close();
}

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  clear(app);
  app.append(skeleton());

  let settings: Settings;
  let platform: PlatformId | null = null;

  try {
    const url = await activeTabUrl();
    platform = url ? platformFromUrl(url) : null;
    settings = await loadSettings();
    applyTheme(settings.theme);
  } catch {
    clear(app);
    const retry = el('button', { className: 'btn btn-secondary btn-sm', text: 'Muat ulang' });
    retry.addEventListener('click', () => location.reload());
    app.append(
      el('div', { className: 'popup' }, [
        el('div', { className: 'banner' }, [
          el('span', { text: 'Preferensi tidak dapat dibaca.' }),
          retry,
        ]),
      ]),
    );
    return;
  }

  const render = (): void => {
    clear(app);
    const platformSettings = platform ? settings.platforms[platform] : null;
    const enabled = platformSettings?.enabled ?? false;
    // Status ringkas: nama platform + jumlah zona. Versi panjang ("Terlindungi ·
    // n zona") terpotong oleh toggle di kanan pada lebar popup 320px.
    const zoneCount = platformSettings
      ? MVP_ZONES.filter((zone) => platformSettings.zones[zone].protected).length
      : 0;
    const statusText = !platform
      ? 'Situs tidak didukung'
      : !enabled
        ? `${PLATFORM_SHORT_LABELS[platform]} · Nonaktif`
        : `${PLATFORM_SHORT_LABELS[platform]} · ${zoneCount} zona`;

    const headTitle = el('div', { className: 'popup-title' }, [
      el('div', { className: 'icon-tile' }, [brandLogo(24)]),
      el('div', {}, [
        el('h1', { text: 'Shielded' }),
        el('div', { className: 'status-line' }, [
          el('span', {
            className: `dot ${enabled ? 'dot--on' : ''}`,
            attrs: { 'aria-hidden': 'true' },
          }),
          el('span', { text: statusText }),
        ]),
      ]),
    ]);

    // Tombol on/off utama di kanan atas, sejajar dengan logo dan nama produk.
    const head = el('div', { className: 'popup-head popup-hero' }, [
      headTitle,
      platform && platformSettings
        ? createToggle({
            checked: enabled,
            label: `Aktifkan perlindungan di ${PLATFORM_LABELS[platform]}`,
            onChange: (checked) => {
              const next: Settings = {
                ...settings,
                platforms: {
                  ...settings.platforms,
                  [platform as PlatformId]: {
                    ...settings.platforms[platform as PlatformId],
                    enabled: checked,
                  },
                },
              };
              void save(next);
            },
          })
        : el('span'),
    ]);

    const body: Array<HTMLElement> = [];

    if (!platform) {
      body.push(
        el('div', { className: 'card' }, [
          el('div', { className: 'card-title', text: 'Situs ini tidak didukung' }),
          el('p', {
            className: 'small',
            text: 'Buka WhatsApp Web, Telegram Web, Instagram, Facebook, Threads, X, atau TikTok untuk menggunakan Shielded.',
          }),
        ]),
      );
      const listButton = el('button', {
        className: 'btn btn-secondary',
        text: 'Lihat daftar platform',
        attrs: { type: 'button' },
      });
      listButton.addEventListener('click', () => openDashboard('#platforms'));
      body.push(listButton);
    } else if (!platformSettings) {
      body.push(el('div', { className: 'card', text: 'Platform ini belum tersedia.' }));
    } else {
      const level = createSegmented(
        (['normal', 'privacy', 'maximum'] as const).map((value) => ({
          value,
          label: LEVEL_LABELS[value],
        })),
        settings.level,
        (value) => {
          void save(applyPreset(settings, value));
        },
      );
      body.push(level);

      const rows: HTMLElement[] = [];

      for (const zone of ZONES) {
        const rule = platformSettings.zones[zone.id];
        const control = zone.available
          ? createToggle({
              checked: rule.protected,
              label: ZONE_LABELS[zone.id],
              disabled: !enabled,
              onChange: (checked) => {
                const next: Settings = {
                  ...settings,
                  platforms: {
                    ...settings.platforms,
                    [platform as PlatformId]: {
                      ...platformSettings,
                      zones: {
                        ...platformSettings.zones,
                        [zone.id]: { ...rule, protected: checked },
                      },
                    },
                  },
                };
                void save(next);
              },
            })
          : el('span', { className: 'badge', text: 'Segera' });

        rows.push(
          el('div', { className: 'row' }, [
            el('div', { className: 'row-label row-label--icon' }, [
              el('span', { className: 'zone-icon' }, [
                icon(ZONE_ICONS[zone.id] as IconName, 15),
              ]),
              el('div', { className: 'row-label-text' }, [
                el('strong', { text: ZONE_LABELS[zone.id] }),
                zone.available
                  ? el('span', { text: rule.protected ? 'Dilindungi' : 'Terlihat' })
                  : el('span', { text: 'Belum tersedia' }),
              ]),
            ]),
            control,
          ]),
        );
      }

      body.push(el('div', { className: 'card' }, rows));
    }

    const support = el(
      'a',
      {
        className: 'btn btn-support',
        attrs: { href: SUPPORT_URL, target: '_blank', rel: 'noopener noreferrer' },
      },
      [icon('coffee', 16), el('span', { text: SUPPORT_LABEL })],
    );

    const footer = el('div', { className: 'popup-foot' }, [
      (() => {
        const button = el('button', {
          className: 'btn btn-ghost',
          attrs: { type: 'button' },
        }, [icon('settings', 15), el('span', { text: 'Pengaturan lengkap' })]);
        button.addEventListener('click', () => openDashboard());
        return button;
      })(),
      support,
      el('p', { className: 'small popup-hint', text: 'Reveal sementara: Alt+Shift+R' }),
    ]);

    app.append(el('div', { className: 'popup' }, [head, ...body, footer]));
  };

  const save = (next: Settings): void => {
    settings = next;
    render();
    void updateSettings(() => next)
      .then((saved) => {
        settings = saved;
      })
      .catch(() => showToast('Gagal menyimpan pengaturan.'));
  };

  render();
}

void main();
