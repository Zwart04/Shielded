import { el } from '../../components/dom.ts';
import { showToast } from '../../components/toast.ts';
import type { SectionContext } from './shared.ts';
import { card, pageHead, settingRow } from './shared.ts';

interface CommandRow {
  name: string;
  label: string;
}

const COMMANDS: readonly CommandRow[] = [
  { name: 'toggle-protection', label: 'Aktif/nonaktifkan perlindungan' },
  { name: 'reveal-all', label: 'Tampilkan semua sementara' },
  { name: 'panic', label: 'Sembunyikan semua segera' },
];

function shorten(key: string): string {
  return key ? key.replace(/\+/g, ' + ') : 'Belum diatur';
}

export function renderShortcuts(_ctx: SectionContext): HTMLElement {
  const wrap = el('div');
  wrap.append(
    pageHead('Pintasan', 'Perintah keyboard untuk mengendalikan proteksi tanpa mouse.'),
  );

  const list = card('Pintasan aktif', 'Pintasan diatur oleh Chrome, bukan oleh ekstensi ini.', []);
  const container = el('div');
  list.append(container);

  container.append(el('p', { className: 'skeleton', attrs: { style: 'width:80%' } }));

  void chrome.commands
    .getAll()
    .then((commands) => {
      container.textContent = '';
      for (const command of COMMANDS) {
        const found = commands.find((item) => item.name === command.name);
        const change = el('button', {
          className: 'btn btn-secondary btn-sm',
          text: 'Ubah',
          attrs: { type: 'button' },
        });
        change.addEventListener('click', () => {
          void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' }).catch(() => {
            showToast('Buka chrome://extensions/shortcuts secara manual.');
          });
        });

        container.append(
          settingRow(
            command.label,
            null,
            el('div', { className: 'row-between' }, [
              el('span', { className: 'small', text: shorten(found?.shortcut ?? '') }),
              change,
            ]),
          ),
        );
      }

      container.append(
        el('p', {
          className: 'small',
          text: 'Pintasan harus unik. Jika bentrok, Chrome akan menandainya di halaman pengaturan pintasan.',
        }),
      );
    })
    .catch(() => {
      container.textContent = 'Tidak dapat membaca pintasan.';
    });

  wrap.append(list);
  return wrap;
}
