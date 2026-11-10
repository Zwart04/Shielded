import { LEVEL_DESCRIPTIONS, LEVEL_LABELS, applyPreset } from '../../../shared/defaults.ts';
import { el } from '../../components/dom.ts';
import { createSegmented } from '../../components/segmented.ts';
import { createToggle } from '../../components/toggle.ts';
import type { SectionContext } from './shared.ts';
import { card, pageHead, settingRow } from './shared.ts';

export function renderPrivacy(ctx: SectionContext): HTMLElement {
  const wrap = el('div');

  wrap.append(pageHead('Privasi', 'Kendalikan apa yang terlihat di layar dan kapan proteksi aktif.'));

  const preset = card('Mode dasar', 'Preset berlaku untuk semua platform dan menimpa penyesuaian per platform.', [
    createSegmented(
      (['normal', 'privacy', 'maximum'] as const).map((value) => ({
        value,
        label: LEVEL_LABELS[value],
      })),
      ctx.settings.level,
      (value) => {
        ctx.save(applyPreset(ctx.settings, value));
        ctx.refresh();
      },
    ),
    el('p', { className: 'small', text: LEVEL_DESCRIPTIONS[ctx.settings.level] }),
  ]);

  const restoreSelect = el('select', { className: 'select' });
  restoreSelect.append(
    el('option', { text: 'Pulihkan otomatis', attrs: { value: 'auto' } }),
    el('option', { text: 'Tetap terlindung', attrs: { value: 'keep' } }),
  );
  restoreSelect.value = ctx.settings.restoreOnFocus ? 'auto' : 'keep';
  restoreSelect.addEventListener('change', () => {
    ctx.save({ ...ctx.settings, restoreOnFocus: restoreSelect.value === 'auto' });
  });

  const idleSelect = el('select', { className: 'select' });
  for (const [value, label] of [
    ['0', 'Mati'],
    ['1', 'Setelah 1 menit'],
    ['5', 'Setelah 5 menit'],
    ['15', 'Setelah 15 menit'],
    ['30', 'Setelah 30 menit'],
  ] as const) {
    idleSelect.append(el('option', { text: label, attrs: { value } }));
  }
  idleSelect.value = String(ctx.settings.idleBlurMinutes);
  idleSelect.addEventListener('change', () => {
    ctx.save({ ...ctx.settings, idleBlurMinutes: Number(idleSelect.value) });
  });

  const automatic = card('Otomatis', 'Proteksi tambahan saat layar tidak sedang Anda perhatikan.', [
    settingRow(
      'Kunci saat aplikasi diam',
      'Kunci proteksi setelah tidak ada interaksi.',
      idleSelect,
    ),
    settingRow(
      'Lindungi saat pindah tab',
      'Aktif ketika tab disembunyikan.',
      createToggle({
        checked: ctx.settings.autoProtectOnHidden,
        label: 'Lindungi saat pindah tab',
        onChange: (checked) => ctx.save({ ...ctx.settings, autoProtectOnHidden: checked }),
      }),
    ),
    settingRow(
      'Lindungi saat jendela kehilangan fokus',
      'Aktif ketika jendela browser tidak aktif.',
      createToggle({
        checked: ctx.settings.autoProtectOnBlur,
        label: 'Lindungi saat jendela kehilangan fokus',
        onChange: (checked) => ctx.save({ ...ctx.settings, autoProtectOnBlur: checked }),
      }),
    ),
    settingRow('Saat kembali ke tab', 'Perilaku ketika tab kembali terlihat.', restoreSelect),
  ]);

  const revealValue = el('span', { className: 'small', text: `${ctx.settings.revealTimeoutSec} detik` });
  const range = el('input', {
    className: 'range',
    attrs: {
      type: 'range',
      min: 1,
      max: 10,
      step: 1,
      value: ctx.settings.revealTimeoutSec,
      'aria-label': 'Durasi tampil sementara',
    },
  });
  range.addEventListener('input', () => {
    revealValue.textContent = `${range.value} detik`;
  });
  range.addEventListener('change', () => {
    ctx.save({ ...ctx.settings, revealTimeoutSec: Number(range.value) });
  });

  const reveal = card('Tampilkan sementara', 'Konten kembali terlindungi secara otomatis.', [
    settingRow(
      'Tampilkan saat hover',
      'Arahkan kursor ke area terlindungi.',
      createToggle({
        checked: ctx.settings.hoverReveal,
        label: 'Tampilkan saat hover',
        onChange: (checked) => ctx.save({ ...ctx.settings, hoverReveal: checked }),
      }),
    ),
    settingRow(
      'Tampilkan saat klik-tahan',
      'Tekan dan tahan untuk melihat.',
      createToggle({
        checked: ctx.settings.clickReveal,
        label: 'Tampilkan saat klik-tahan',
        onChange: (checked) => ctx.save({ ...ctx.settings, clickReveal: checked }),
      }),
    ),
    settingRow(
      'Buka semua saat aplikasi di-hover',
      'Selama kursor berada di jendela aplikasi, semua zona terbuka.',
      createToggle({
        checked: ctx.settings.unblurOnAppHover,
        label: 'Buka semua saat aplikasi di-hover',
        onChange: (checked) => ctx.save({ ...ctx.settings, unblurOnAppHover: checked }),
      }),
    ),
    settingRow(
      'Tanpa jeda transisi',
      'Reveal dan blur berganti seketika, tanpa animasi.',
      createToggle({
        checked: ctx.settings.instantReveal,
        label: 'Tanpa jeda transisi',
        onChange: (checked) => ctx.save({ ...ctx.settings, instantReveal: checked }),
      }),
    ),
    settingRow('Durasi tampil', 'Berlaku untuk pintasan tampilkan-semua.', el('div', { className: 'row-between' }, [revealValue, range])),
    el('p', {
      className: 'small',
      text: 'Pintasan tampilkan-semua: Alt+Shift+R (dapat diubah di halaman Pintasan).',
    }),
  ]);

  wrap.append(preset, automatic, reveal);
  return wrap;
}
