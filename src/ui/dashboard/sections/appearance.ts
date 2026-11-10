import { el } from '../../components/dom.ts';
import { createSegmented } from '../../components/segmented.ts';
import type { SectionContext } from './shared.ts';
import { card, pageHead, settingRow } from './shared.ts';

export function renderAppearance(ctx: SectionContext): HTMLElement {
  const wrap = el('div');
  wrap.append(pageHead('Tampilan', 'Preferensi visual untuk antarmuka ekstensi.'));

  const theme = card('Tema', 'Ikuti sistem atau pilih sendiri.', [
    createSegmented(
      [
        { value: 'system', label: 'Sistem' },
        { value: 'light', label: 'Terang' },
        { value: 'dark', label: 'Gelap' },
      ] as const,
      ctx.settings.theme,
      (value) => {
        ctx.save({ ...ctx.settings, theme: value });
        ctx.refresh();
      },
    ),
  ]);

  const intensity = card('Intensitas blur', 'Seberapa kuat konten dikaburkan.', [
    settingRow(
      'Kekuatan',
      'Nilai ini berlaku di semua platform.',
      createSegmented(
        [
          { value: 'light', label: 'Ringan' },
          { value: 'normal', label: 'Normal' },
          { value: 'strong', label: 'Kuat' },
        ] as const,
        ctx.settings.blurIntensity,
        (value) => {
          ctx.save({ ...ctx.settings, blurIntensity: value });
          ctx.refresh();
        },
      ),
    ),
  ]);

  const tone = card('Warna selimut', 'Dipakai saat efek "Selimut" aktif.', [
    createSegmented(
      [
        { value: 'neutral', label: 'Netral' },
        { value: 'dark', label: 'Gelap' },
      ] as const,
      ctx.settings.coverTone,
      (value) => {
        ctx.save({ ...ctx.settings, coverTone: value });
      },
    ),
  ]);

  wrap.append(theme, intensity, tone);
  return wrap;
}
