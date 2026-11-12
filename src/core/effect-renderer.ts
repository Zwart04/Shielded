import type { BlurIntensity, ResolvedZone, ZoneId, ZoneRule } from '../shared/types.ts';
import { BLUR_PIXELS } from '../shared/defaults.ts';
import { CONTENT_CSS, STYLE_ELEMENT_ID } from './styles.ts';

interface ZoneHandle {
  element: HTMLElement;
  zoneId: ZoneId;
  /** Sidik zona+efek terakhir; mencegah tulis ulang class saat tidak berubah. */
  signature: string;
  overlay: HTMLDivElement | null;
  previousPosition: string | null;
  changedPosition: boolean;
  controller: AbortController;
}

export interface RendererOptions {
  blurIntensity: BlurIntensity;
  coverTone: 'neutral' | 'dark';
  clickReveal: boolean;
  hoverReveal: boolean;
  /** Tanpa animasi transisi (reveal/blur seketika). */
  instantReveal: boolean;
}

const ZONE_CLASSES = [
  'psx-zone',
  'psx-zone--blur',
  'psx-zone--cover',
  'psx-zone--hide',
  'psx-zone--direct',
  'psx-zone--heavy',
  'psx-zone--heavy-media',
];

/** Zona bergambar: butuh radius blur lebih besar agar isi tidak terbaca. */
const HEAVY_ZONES = new Set<ZoneId>(['avatars', 'mediaPreview', 'feedContent']);
const HEAVY_MEDIA_ZONES = new Set<ZoneId>(['media']);

/**
 * Zona bergambar tetap memakai efeknya sendiri walau berada di dalam zona teks
 * yang lebih ringan. Tanpa ini, gambar di dalam gelembung pesan hanya ikut
 * blur 5px milik teks dan isinya masih terbaca.
 */
const KEEPS_OWN_EFFECT = new Set<ZoneId>([...HEAVY_ZONES, ...HEAVY_MEDIA_ZONES]);

/** Menandai elemen yang sudah tercakup efek elemen lain yang juga dilindungi. */
export function pruneCovered(desired: ReadonlyMap<Element, ZoneId>): Set<Element> {
  const covered = new Set<Element>();
  for (const [element, zoneId] of desired) {
    let parent = element.parentElement;
    while (parent) {
      const parentZone = desired.get(parent);
      if (parentZone !== undefined) {
        const keepHeavy = parentZone !== zoneId && KEEPS_OWN_EFFECT.has(zoneId);
        if (!keepHeavy) covered.add(element);
        break;
      }
      parent = parent.parentElement;
    }
  }
  return covered;
}

/** Elemen yang tidak bisa memuat overlay anak (mis. <img>) diberi efek langsung. */
const DIRECT_TAGS = new Set(['IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'SVG', 'VIDEO', 'IFRAME', 'CANVAS']);

function needsDirectEffect(element: Element): boolean {
  return DIRECT_TAGS.has(element.tagName);
}

const LIGHT_COVER = '#f5f5f7';
const DARK_COVER = '#1c1c1e';

/**
 * Warna cover mengikuti latar elemen terdekat. Tanpa ini, cover putih di
 * aplikasi bertema gelap (Telegram malam) tampak seperti blok putih rusak.
 * Hanya dipakai untuk cover, dan hasilnya di-cache per elemen.
 */
function parseRgba(color: string): [number, number, number, number] | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1]!.split(',').map((value) => Number(value));
  if (parts.length < 3) return null;
  return [parts[0]!, parts[1]!, parts[2]!, parts[3] ?? 1];
}

function luminance(color: string): number | null {
  const rgba = parseRgba(color);
  if (!rgba) return null;
  const [r, g, b] = rgba;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function nearestLuminance(element: Element): number | null {
  let node: Element | null = element;
  // WhatsApp memakai banyak lapisan transparan; 6 level tidak cukup untuk
  // mencapai latar panel, jadi telusuri sampai root sebelum menyerah.
  for (let depth = 0; node && depth < 24; depth += 1, node = node.parentElement) {
    const rgba = parseRgba(getComputedStyle(node).backgroundColor);
    if (rgba && rgba[3] >= 0.5) return luminance(getComputedStyle(node).backgroundColor);
  }
  const body = document.body;
  if (body) {
    const rgba = parseRgba(getComputedStyle(body).backgroundColor);
    if (rgba && rgba[3] >= 0.5) return luminance(getComputedStyle(body).backgroundColor);
  }
  return null;
}

function coverColor(tone: 'neutral' | 'dark', element?: Element): string {
  if (tone === 'dark') return DARK_COVER;
  if (!element) return LIGHT_COVER;
  const lum = nearestLuminance(element);
  return lum !== null && lum < 0.42 ? DARK_COVER : LIGHT_COVER;
}

function tintColor(tone: 'neutral' | 'dark'): string {
  return tone === 'dark' ? 'rgba(0, 0, 0, 0.22)' : 'rgba(28, 28, 30, 0.1)';
}

export class EffectRenderer {
  private handles = new Map<Element, ZoneHandle>();
  private options: RendererOptions = {
    blurIntensity: 'normal',
    coverTone: 'neutral',
    clickReveal: false,
    hoverReveal: true,
    instantReveal: false,
  };
  private revealAll = false;

  constructor() {
    this.ensureStyle();
    this.applyVariables();
  }

  private ensureStyle(): void {
    if (document.getElementById(STYLE_ELEMENT_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = CONTENT_CSS;
    (document.head ?? document.documentElement).appendChild(style);
  }

  private applyVariables(): void {
    const root = document.documentElement;
    root.style.setProperty('--psx-blur', `${BLUR_PIXELS[this.options.blurIntensity]}px`);
    root.style.setProperty('--psx-tint', tintColor(this.options.coverTone));
  }

  /**
   * Satu warna cover per siklus render, bukan per elemen. Cukup satu pembacaan
   * latar aplikasi, tetap mengikuti tema terang/gelap, dan bebas cache basi
   * saat pengguna mengganti tema.
   */
  private lastCover: string | null = null;

  /**
   * Menulis CSS variable di root memicu style recalc seluruh dokumen. Karena
   * render berjalan tiap ~120ms, tulis hanya saat warnanya benar-benar berubah.
   */
  private applyCoverTone(sample?: Element | null): void {
    const color = coverColor(this.options.coverTone, sample ?? document.body ?? document.documentElement);
    if (color === this.lastCover) return;
    this.lastCover = color;
    document.documentElement.style.setProperty('--psx-cover', color);
  }

  setOptions(options: RendererOptions): void {
    const clickRevealChanged = this.options.clickReveal !== options.clickReveal;
    this.options = options;
    this.applyVariables();
    document.body?.classList.toggle('psx-hover-off', !options.hoverReveal);
    document.body?.classList.toggle('psx-instant', options.instantReveal);

    if (clickRevealChanged) {
      for (const handle of this.handles.values()) this.detach(handle);
      this.handles.clear();
    }
  }

  /**
   * Menyelaraskan overlay dengan daftar item yang harus dilindungi.
   * Idempoten: aman dipanggil berkali-kali saat DOM berubah.
   */
  render(zones: readonly ResolvedZone[], rules: Record<ZoneId, ZoneRule>): void {
    const desired = new Map<Element, ZoneId>();
    let coverSample: Element | null = null;

    for (const zone of zones) {
      const rule = rules[zone.zone];
      if (!rule?.protected) continue;
      if (rule.effect === 'cover' && !coverSample && zone.elements[0]) coverSample = zone.elements[0];
      for (const element of zone.elements) {
        if (element.isConnected) desired.set(element, zone.zone);
      }
    }

    // Warna cover diambil dari area terlindungi pertama, bukan <body>:
    // panel aplikasi bisa gelap walau body masih terang (dan sebaliknya).
    this.applyCoverTone(coverSample);

    // Lewati elemen yang sudah tercakup elemen lain yang juga dilindungi.
    // Contoh: nama di dalam baris chat yang seluruhnya dikaburkan.
    for (const element of pruneCovered(desired)) desired.delete(element);

    for (const [element, zoneId] of desired) {
      const rule = rules[zoneId];
      if (!rule?.protected) continue;
      this.ensureHandle(element, zoneId, rule);
    }

    for (const [element, handle] of [...this.handles.entries()]) {
      if (!desired.has(element) || !element.isConnected) {
        this.detach(handle);
        this.handles.delete(element);
      }
    }
  }

  private ensureHandle(element: Element, zoneId: ZoneId, rule: ZoneRule): void {
    const target = element as HTMLElement;
    let handle = this.handles.get(element);

    if (!handle) {
      const changedPosition = getComputedStyle(target).position === 'static';
      const previousPosition = changedPosition ? target.style.position : null;
      if (changedPosition) target.style.position = 'relative';

      const controller = new AbortController();
      if (this.options.clickReveal) {
        target.addEventListener('pointerdown', () => target.classList.add('psx-revealed'), {
          signal: controller.signal,
        });
        for (const eventName of ['pointerup', 'pointercancel', 'pointerleave'] as const) {
          target.addEventListener(
            eventName,
            () => target.classList.remove('psx-revealed'),
            { signal: controller.signal },
          );
        }
      }

      handle = {
        element: target,
        zoneId,
        signature: '',
        overlay: null,
        previousPosition,
        changedPosition,
        controller,
      };
      this.handles.set(element, handle);
    }

    // Idempoten dan murah: bila zona+efek sama dan class masih utuh, jangan
    // menyentuh DOM lagi. Tulis ulang class tiap 120ms membuat style recalc
    // terus berjalan dan animasi blur terasa tersendat.
    const signature = `${zoneId}:${rule.effect}`;
    if (handle.signature === signature && target.classList.contains('psx-zone')) {
      if (rule.effect !== 'cover' || needsDirectEffect(target) || handle.overlay?.isConnected) return;
    }

    handle.zoneId = zoneId;
    handle.signature = signature;
    for (const cls of ZONE_CLASSES) target.classList.remove(cls);
    target.classList.add('psx-zone');

    if (rule.effect === 'hide') {
      target.classList.add('psx-zone--hide');
      this.dropOverlay(handle);
      return;
    }

    if (rule.effect === 'blur') {
      // Blur langsung pada elemen: tanpa overlay berarti tanpa node tambahan
      // dan tanpa backdrop-filter, sehingga jauh lebih ringan.
      target.classList.add('psx-zone--blur');
      if (HEAVY_ZONES.has(zoneId)) target.classList.add('psx-zone--heavy');
      else if (HEAVY_MEDIA_ZONES.has(zoneId)) target.classList.add('psx-zone--heavy-media');
      this.dropOverlay(handle);
      return;
    }

    target.classList.add('psx-zone--cover');

    if (needsDirectEffect(target)) {
      target.classList.add('psx-zone--direct');
      this.dropOverlay(handle);
      return;
    }

    if (!handle.overlay || !handle.overlay.isConnected) {
      const overlay = document.createElement('div');
      overlay.className = 'psx-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.dataset.psxZone = zoneId;
      target.appendChild(overlay);
      handle.overlay = overlay;
    }

  }

  private dropOverlay(handle: ZoneHandle): void {
    if (!handle.overlay) return;
    handle.overlay.remove();
    handle.overlay = null;
  }

  private detach(handle: ZoneHandle): void {
    handle.controller.abort();
    for (const cls of [...ZONE_CLASSES, 'psx-revealed']) handle.element.classList.remove(cls);
    if (handle.overlay) handle.overlay.remove();
    if (handle.changedPosition) handle.element.style.position = handle.previousPosition ?? '';
  }

  setRevealAll(value: boolean): void {
    this.revealAll = value;
    document.body?.classList.toggle('psx-reveal-all', value);
  }

  isRevealAll(): boolean {
    return this.revealAll;
  }

  setInteractionLocked(value: boolean): void {
    document.body?.classList.toggle('psx-locked', value);
  }

  clear(): void {
    for (const handle of this.handles.values()) this.detach(handle);
    this.handles.clear();
    document.body?.classList.remove('psx-reveal-all', 'psx-locked');
    this.revealAll = false;
  }

  dispose(): void {
    this.clear();
    document.body?.classList.remove('psx-hover-off');
    document.getElementById(STYLE_ELEMENT_ID)?.remove();
    document.documentElement.style.removeProperty('--psx-blur');
  }
}

export function activeZoneCount(): number {
  return document.querySelectorAll('.psx-zone').length;
}
