import type { PlatformId, Settings, ZoneId } from '../../../shared/types.ts';
import { PLATFORM_IDS, MVP_PLATFORMS, PLATFORM_LABELS } from '../../../shared/platform-ids.ts';
import {
  MVP_ZONES,
  ZONE_DESCRIPTIONS,
  ZONE_ICONS,
  ZONE_IDS,
  ZONE_LABELS,
} from '../../../shared/defaults.ts';
import { el } from '../../components/dom.ts';
import { chevronDown, icon, platformIcon, type IconName } from '../../components/icons.ts';
import { createToggle } from '../../components/toggle.ts';
import type { SectionContext } from './shared.ts';
import { card, pageHead } from './shared.ts';

const expanded = new Set<PlatformId>();

function zoneCount(settings: Settings, id: PlatformId): number {
  return MVP_ZONES.filter((zone) => settings.platforms[id].zones[zone].protected).length;
}

function platformStatus(settings: Settings, id: PlatformId): string {
  if (!MVP_PLATFORMS.includes(id)) return 'Belum tersedia';
  const platform = settings.platforms[id];
  if (!platform.enabled) return 'Nonaktif';
  const count = zoneCount(settings, id);
  return count === 0 ? 'Aktif · belum ada zona' : `Aktif · ${count} zona`;
}

function zoneRow(ctx: SectionContext, id: PlatformId, zoneId: ZoneId): HTMLElement {
  const platform = ctx.settings.platforms[id];
  const rule = platform.zones[zoneId];

  const label = el('div', { className: 'row-label row-label--icon' }, [
    el('span', { className: 'zone-icon' }, [icon(ZONE_ICONS[zoneId] as IconName, 15)]),
    el('div', { className: 'row-label-text' }, [
      el('strong', { text: ZONE_LABELS[zoneId] }),
      el('span', { text: rule.protected ? 'Dilindungi' : 'Terlihat' }),
    ]),
  ]);

  return el('div', { className: 'row' }, [
    label,
    createToggle({
      checked: rule.protected,
      label: `${ZONE_LABELS[zoneId]} di ${PLATFORM_LABELS[id]}`,
      onChange: (checked) => {
        const next: Settings = {
          ...ctx.settings,
          platforms: {
            ...ctx.settings.platforms,
            [id]: {
              ...platform,
              zones: {
                ...platform.zones,
                [zoneId]: { ...rule, protected: checked },
              },
            },
          },
        };
        ctx.save(next);
        ctx.refresh();
      },
    }),
  ]);
}

export function renderPlatforms(ctx: SectionContext): HTMLElement {
  const wrap = el('div');
  wrap.append(
    pageHead('Platform', 'Aktifkan proteksi per platform dan tentukan zona yang dilindungi.'),
  );

  const list = card('Platform didukung', 'Pengaturan di sini hanya berlaku untuk platform terkait.', []);

  for (const id of PLATFORM_IDS) {
    const available = MVP_PLATFORMS.includes(id);
    const platform = ctx.settings.platforms[id];
    const isExpanded = expanded.has(id);

    const tile = el(
      'div',
      { className: `icon-tile platform-tile platform-tile--${id}` },
      [platformIcon(id, 18)],
    );

    const meta = el('div', { className: 'platform-meta' }, [
      el('strong', { text: PLATFORM_LABELS[id] }),
      el('span', { text: platformStatus(ctx.settings, id) }),
    ]);

    const row = el('div', { className: 'platform-row' }, [
      tile,
      meta,
      available
        ? createToggle({
            checked: platform.enabled,
            label: `Aktifkan ${PLATFORM_LABELS[id]}`,
            onChange: (checked) => {
              ctx.save({
                ...ctx.settings,
                platforms: {
                  ...ctx.settings.platforms,
                  [id]: { ...ctx.settings.platforms[id], enabled: checked },
                },
              });
              ctx.refresh();
            },
          })
        : el('span', { className: 'badge', text: 'Segera' }),
    ]);

    if (available) {
      const expand = el('button', {
        className: 'expand',
        attrs: {
          type: 'button',
          'aria-expanded': isExpanded ? 'true' : 'false',
          'aria-label': `Atur ${PLATFORM_LABELS[id]}`,
        },
      }, [chevronDown()]);
      expand.addEventListener('click', () => {
        if (expanded.has(id)) expanded.delete(id);
        else expanded.add(id);
        ctx.refresh();
      });
      row.append(expand);
    }

    list.append(row);

    if (available && isExpanded) {
      list.append(renderPlatformPanel(ctx, id));
    }
  }

  wrap.append(list);
  return wrap;
}

function renderPlatformPanel(ctx: SectionContext, id: PlatformId): HTMLElement {
  const platform = ctx.settings.platforms[id];
  const panel = el('div', { className: 'platform-panel' });

  for (const zoneId of ZONE_IDS) panel.append(zoneRow(ctx, id, zoneId));

  const effectSelect = el('select', { className: 'select' });
  effectSelect.append(
    el('option', { text: 'Kabur (blur)', attrs: { value: 'blur' } }),
    el('option', { text: 'Selimut (cover)', attrs: { value: 'cover' } }),
  );
  const protectedZone = ZONE_IDS.map((zoneId) => platform.zones[zoneId]).find(
    (rule) => rule.protected,
  );
  effectSelect.value = protectedZone?.effect === 'cover' ? 'cover' : 'blur';
  effectSelect.addEventListener('change', () => {
    const effect = effectSelect.value === 'cover' ? 'cover' : 'blur';
    const zones = { ...platform.zones };
    for (const zoneId of ZONE_IDS) {
      const rule = zones[zoneId];
      if (rule.protected) zones[zoneId] = { ...rule, effect };
    }
    ctx.save({
      ...ctx.settings,
      platforms: {
        ...ctx.settings.platforms,
        [id]: { ...platform, zones },
      },
    });
  });

  panel.append(
    el('div', { className: 'row' }, [
      el('div', { className: 'row-label' }, [
        el('strong', { text: 'Efek' }),
        el('span', { text: 'Berlaku untuk zona yang dilindungi.' }),
      ]),
      effectSelect,
    ]),
  );

  return panel;
}
