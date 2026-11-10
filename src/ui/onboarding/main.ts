import type { ProtectionLevel, Settings } from '../../shared/types.ts';
import { LEVEL_DESCRIPTIONS, LEVEL_LABELS, applyPreset } from '../../shared/defaults.ts';
import { MVP_PLATFORMS, PLATFORM_LABELS } from '../../shared/platform-ids.ts';
import { loadSettings, updateSettings } from '../../config-store/storage.ts';
import { applyTheme, clear, el } from '../components/dom.ts';

async function closeTab(): Promise<void> {
  try {
    const tab = await chrome.tabs.getCurrent();
    if (tab?.id != null) {
      await chrome.tabs.remove(tab.id);
      return;
    }
  } catch {
    // Lanjut ke window.close sebagai fallback.
  }
  window.close();
}

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  let settings: Settings;
  try {
    settings = await loadSettings();
  } catch {
    app.append(el('div', { className: 'banner', text: 'Preferensi tidak dapat dibaca.' }));
    return;
  }

  applyTheme(settings.theme);

  let step: 1 | 2 = 1;
  let chosen: ProtectionLevel = settings.level;

  const finish = (level: ProtectionLevel | null): void => {
    void updateSettings((current) => {
      const next = level ? applyPreset(current, level) : current;
      return { ...next, onboardingDone: true };
    }).then(() => closeTab());
  };

  const render = (): void => {
    clear(app);

    const meta = el('div', { className: 'step-meta' }, [
      el('span', { text: `Langkah ${step} dari 2` }),
      (() => {
        const skip = el('button', {
          className: 'btn btn-ghost btn-sm',
          text: 'Lewati',
          attrs: { type: 'button' },
        });
        skip.addEventListener('click', () => finish(null));
        return skip;
      })(),
    ]);

    if (step === 1) {
      const choices = el('div', { className: 'choices' });
      for (const level of ['normal', 'privacy', 'maximum'] as const) {
        const choice = el('button', {
          className: 'choice',
          attrs: { type: 'button', 'aria-pressed': level === chosen ? 'true' : 'false' },
        }, [
          el('strong', { text: LEVEL_LABELS[level] }),
          el('span', { text: LEVEL_DESCRIPTIONS[level] }),
        ]);
        choice.addEventListener('click', () => {
          chosen = level;
          render();
        });
        choices.append(choice);
      }

      const next = el('button', {
        className: 'btn btn-primary',
        text: 'Lanjut',
        attrs: { type: 'button' },
      });
      next.addEventListener('click', () => {
        step = 2;
        render();
      });

      app.append(
        el('header', { className: 'page-head' }, [
          el('h1', { text: 'Pilih tingkat perlindungan' }),
          el('p', { text: 'Anda dapat mengubahnya kapan saja di pengaturan.' }),
        ]),
        meta,
        choices,
        el('div', { className: 'actions' }, [el('span'), next]),
      );
      return;
    }

    const platforms = el('div', { className: 'card' }, [
      el('div', { className: 'card-title', text: 'Platform aktif' }),
      el('p', {
        className: 'card-desc',
        text: MVP_PLATFORMS.map((id) => PLATFORM_LABELS[id]).join(' · '),
      }),
      el('p', { className: 'small', text: 'Proteksi aktif otomatis saat platform dibuka.' }),
      el('p', { className: 'small', text: 'Hover untuk melihat sementara. Alt+Shift+R untuk tampilkan semua.' }),
    ]);

    const back = el('button', {
      className: 'btn btn-secondary',
      text: 'Kembali',
      attrs: { type: 'button' },
    });
    back.addEventListener('click', () => {
      step = 1;
      render();
    });

    const start = el('button', {
      className: 'btn btn-primary',
      text: 'Mulai',
      attrs: { type: 'button' },
    });
    start.addEventListener('click', () => finish(chosen));

    app.append(
      el('header', { className: 'page-head' }, [
        el('h1', { text: 'Siap digunakan' }),
        el('p', { text: 'Shielded berjalan lokal dan tidak mengirim data ke mana pun.' }),
      ]),
      meta,
      platforms,
      el('div', { className: 'actions' }, [back, start]),
    );
  };

  render();
}

void main();
