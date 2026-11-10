import type { Settings } from '../../shared/types.ts';
import { loadSettings, updateSettings } from '../../config-store/storage.ts';
import { applyTheme, clear, el } from '../components/dom.ts';
import { createShell, type NavItem } from '../components/shell.ts';
import { showToast } from '../components/toast.ts';
import type { SectionContext } from './sections/shared.ts';
import { renderPrivacy } from './sections/privacy.ts';
import { renderPlatforms } from './sections/platforms.ts';
import { renderAppearance } from './sections/appearance.ts';
import { renderShortcuts } from './sections/shortcuts.ts';
import { renderAbout } from './sections/about.ts';

const NAV: readonly NavItem[] = [
  { id: 'privacy', label: 'Privasi', icon: 'privacy' },
  { id: 'platforms', label: 'Platform', icon: 'platforms' },
  { id: 'appearance', label: 'Tampilan', icon: 'appearance' },
  { id: 'shortcuts', label: 'Pintasan', icon: 'keyboard' },
  { id: 'about', label: 'Tentang', icon: 'about' },
];

const SECTION_IDS = new Set(NAV.map((item) => item.id));

async function main(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;

  let settings: Settings;
  try {
    settings = await loadSettings();
  } catch {
    app.append(
      el('div', { className: 'page' }, [
        el('div', { className: 'banner' }, [
          el('span', { text: 'Preferensi tidak dapat dibaca.' }),
          (() => {
            const retry = el('button', { className: 'btn btn-secondary btn-sm', text: 'Muat ulang' });
            retry.addEventListener('click', () => location.reload());
            return retry;
          })(),
        ]),
      ]),
    );
    return;
  }

  applyTheme(settings.theme);

  const shell = createShell(NAV, (id) => navigate(id));
  clear(app);
  app.append(shell.root);

  const ctx: SectionContext = {
    get settings() {
      return settings;
    },
    save(next) {
      settings = next;
      applyTheme(settings.theme);
      void updateSettings(() => next)
        .then((saved) => {
          settings = saved;
        })
        .catch(() => showToast('Gagal menyimpan pengaturan.'));
    },
    refresh() {
      renderSection();
    },
  };

  function currentId(): string {
    const hash = location.hash.slice(1);
    return SECTION_IDS.has(hash) ? hash : 'privacy';
  }

  function navigate(id: string): void {
    if (location.hash.slice(1) === id) renderSection();
    else location.hash = id;
  }

  function renderSection(): void {
    const id = currentId();
    shell.setActive(id);
    clear(shell.content);

    switch (id) {
      case 'privacy':
        shell.content.append(renderPrivacy(ctx));
        break;
      case 'platforms':
        shell.content.append(renderPlatforms(ctx));
        break;
      case 'appearance':
        shell.content.append(renderAppearance(ctx));
        break;
      case 'shortcuts':
        shell.content.append(renderShortcuts(ctx));
        break;
      case 'about':
        shell.content.append(renderAbout(ctx));
        break;
      default:
        shell.content.append(renderPrivacy(ctx));
        break;
    }
  }

  window.addEventListener('hashchange', renderSection);
  renderSection();
}

void main();
