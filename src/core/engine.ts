import type { PlatformId, Settings, ResolvedChatArea, ResolvedZone, ZoneId } from '../shared/types.ts';
import { MVP_ZONES } from '../shared/defaults.ts';
import type { PlatformAdapter } from '../adapters/contract.ts';
import { detectChatArea } from '../adapters/contract.ts';
import { EffectRenderer } from './effect-renderer.ts';
import { DomWatcher } from './dom-watcher.ts';
import { FocusWatcher } from './focus-watcher.ts';
import { RouteWatcher } from './route-watcher.ts';
import { SelectorHealth } from './health.ts';

export type EngineStatus = 'inactive' | 'protected' | 'degraded';

export interface EngineCallbacks {
  onStatus: (status: EngineStatus, detail: string) => void;
}

const ZONE_ORDER: readonly ZoneId[] = [
  'messages',
  'chatList',
  'chatPreview',
  'names',
  'avatars',
  'mediaPreview',
  'media',
  'feedContent',
  'textInput',
];

/** Deteksi ulang cepat agar item baru (baris virtual, pesan masuk) tidak sempat
 * tampil jelas. 120ms masih jauh di bawah ambang mata untuk kilasan. */
const DETECT_THROTTLE_MS = 120;
/** Jaring pengaman bila observer tidak menangkap perubahan (timer platform, dsb). */
const HEARTBEAT_MS = 1200;

export class PrivacyEngine {
  private readonly renderer = new EffectRenderer();
  private readonly domWatcher: DomWatcher;
  private readonly focusWatcher: FocusWatcher;
  private readonly routeWatcher: RouteWatcher;
  private readonly health = new SelectorHealth();

  private current: ResolvedChatArea | null = null;
  private running = false;
  private interactionLocked = false;
  private revealTimer: number | null = null;
  private detectTimer: number | null = null;
  private heartbeat: number | null = null;
  private lastDetect = 0;
  private idleTimer: number | null = null;
  private idleLocked = false;
  private activityBound = false;

  constructor(
    private readonly adapter: PlatformAdapter,
    private readonly platform: PlatformId,
    private settings: Settings,
    private readonly callbacks: EngineCallbacks,
  ) {
    this.domWatcher = new DomWatcher(() => this.scheduleDetect());
    this.focusWatcher = new FocusWatcher({
      onHidden: () => this.handleHidden(),
      onVisible: () => this.handleVisible(),
      onWindowBlur: () => this.handleWindowBlur(),
      onWindowFocus: () => this.handleWindowFocus(),
    });
    this.routeWatcher = new RouteWatcher(() => this.detectAndRender());
  }

  start(): void {
    this.renderer.setOptions(this.rendererOptions());
    this.focusWatcher.start();
    this.routeWatcher.start();
    this.bindActivity();

    if (this.isEnabled()) this.activate();
    else this.report('inactive', 'Dinonaktifkan untuk platform ini.');
  }

  setSettings(next: Settings): void {
    const wasEnabled = this.isEnabled();
    this.settings = next;
    this.renderer.setOptions(this.rendererOptions());

    const isEnabled = this.isEnabled();
    if (!isEnabled) {
      if (wasEnabled) this.deactivate();
      this.report('inactive', 'Dinonaktifkan untuk platform ini.');
      return;
    }

    if (!wasEnabled) this.activate();
    else this.detectNow();

    this.armIdle();
  }

  private rendererOptions() {
    return {
      blurIntensity: this.settings.blurIntensity,
      coverTone: this.settings.coverTone,
      clickReveal: this.settings.clickReveal,
      hoverReveal: this.settings.hoverReveal,
      instantReveal: this.settings.instantReveal,
    };
  }

  private isEnabled(): boolean {
    return this.settings.platforms[this.platform].enabled;
  }

  private activate(): void {
    if (this.running) {
      this.detectNow();
      return;
    }
    this.running = true;
    this.domWatcher.start();
    this.detectAndRender();
    this.armIdle();
    this.heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') this.scheduleDetect();
    }, HEARTBEAT_MS);
  }

  private deactivate(): void {
    this.running = false;
    this.domWatcher.stop();
    if (this.detectTimer !== null) window.clearTimeout(this.detectTimer);
    this.detectTimer = null;
    if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
    this.heartbeat = null;
    this.renderer.clear();
    this.renderer.setInteractionLocked(false);
    this.interactionLocked = false;
    this.clearRevealTimer();
    this.clearIdle();
    this.current = null;
  }

  private scheduleDetect(): void {
    if (!this.running || this.detectTimer !== null) return;
    const elapsed = performance.now() - this.lastDetect;
    const wait = Math.max(0, DETECT_THROTTLE_MS - elapsed);
    if (wait === 0) {
      this.detectAndRender();
      return;
    }
    this.detectTimer = window.setTimeout(() => {
      this.detectTimer = null;
      this.detectAndRender();
    }, wait);
  }

  private detectNow(): void {
    if (this.detectTimer !== null) window.clearTimeout(this.detectTimer);
    this.detectTimer = null;
    this.detectAndRender();
  }

  private detectAndRender(): void {
    if (!this.running) return;
    this.lastDetect = performance.now();
    this.current = detectChatArea(this.adapter);
    if (this.current.usedFallback) this.health.reportFailure('fallback-mode');
    if (this.current.usedHeuristic) this.health.reportFailure('structural-rows');
    this.renderCurrent();
  }

  private renderCurrent(): void {
    const area = this.current;
    if (!area) {
      this.report('inactive', 'Area chat belum terdeteksi.');
      return;
    }

    const rules = this.settings.platforms[this.platform].zones;
    const zones: ResolvedZone[] = [];

    for (const zoneId of ZONE_ORDER) {
      const zone = area[zoneId];
      if (zone && zone.elements.length > 0 && rules[zoneId]?.protected) zones.push(zone);
    }

    this.renderer.render(zones, rules);
    this.renderer.setInteractionLocked(this.interactionLocked);

    if (zones.length === 0) {
      this.report('inactive', 'Tidak ada zona yang dilindungi.');
      return;
    }

    const expected = MVP_ZONES.filter((zoneId) => rules[zoneId]?.protected);
    const covered = expected.filter((zoneId) =>
      zones.some((zone) => zone.zone === zoneId),
    );
    const degraded = area.usedFallback || area.usedHeuristic || covered.length < expected.length;

    if (degraded) {
      this.report('degraded', `Terlindungi sebagian · ${covered.length}/${expected.length} zona`);
      return;
    }

    this.report('protected', `Terlindungi · ${expected.length} zona`);
  }

  revealAllTemporarily(): void {
    if (this.renderer.isRevealAll()) {
      this.renderer.setRevealAll(false);
      this.clearRevealTimer();
      return;
    }
    this.renderer.setRevealAll(true);
    this.clearRevealTimer();
    const seconds = Math.max(1, Math.min(10, this.settings.revealTimeoutSec));
    this.revealTimer = window.setTimeout(() => {
      this.renderer.setRevealAll(false);
      this.revealTimer = null;
    }, seconds * 1000);
  }

  panic(): void {
    this.clearRevealTimer();
    this.renderer.setRevealAll(false);
    this.interactionLocked = true;
    this.renderer.setInteractionLocked(true);
  }

  private handleHidden(): void {
    this.renderer.setRevealAll(false);
    this.clearRevealTimer();
    if (this.settings.autoProtectOnHidden) {
      this.interactionLocked = true;
      this.renderer.setInteractionLocked(true);
    }
  }

  private handleVisible(): void {
    if (this.settings.restoreOnFocus) this.unlock();
  }

  private handleWindowBlur(): void {
    if (this.settings.autoProtectOnBlur) {
      this.interactionLocked = true;
      this.renderer.setInteractionLocked(true);
    }
  }

  private handleWindowFocus(): void {
    if (this.settings.restoreOnFocus) this.unlock();
  }

  private unlock(): void {
    this.interactionLocked = false;
    this.renderer.setInteractionLocked(false);
  }

  /**
   * Opsi "buka semua saat aplikasi di-hover": begitu kursor bergerak di
   * dalam halaman, semua zona dibuka; keluar jendela, semuanya tertutup lagi.
   */
  private readonly onPointerMove = (): void => {
    if (!this.settings.unblurOnAppHover || this.interactionLocked) return;
    if (!this.renderer.isRevealAll()) this.renderer.setRevealAll(true);
    this.touchActivity();
  };

  private readonly onPointerLeave = (): void => {
    if (!this.settings.unblurOnAppHover) return;
    this.clearRevealTimer();
    this.renderer.setRevealAll(false);
  };

  private readonly onActivity = (): void => {
    if (this.idleLocked) {
      this.idleLocked = false;
      this.unlock();
    }
    this.armIdle();
  };

  /** Pemasangan sekali; handler membaca settings terbaru saat dipanggil. */
  private bindActivity(): void {
    if (this.activityBound) return;
    this.activityBound = true;
    document.addEventListener('pointermove', this.onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
      document.addEventListener(type, this.onActivity, { passive: true });
    }
  }

  private unbindActivity(): void {
    if (!this.activityBound) return;
    this.activityBound = false;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) {
      document.removeEventListener(type, this.onActivity);
    }
  }

  /** Kunci otomatis setelah sekian menit tanpa interaksi. */
  private armIdle(): void {
    this.clearIdle();
    const minutes = this.settings.idleBlurMinutes;
    if (!this.running || minutes <= 0) return;
    this.idleTimer = window.setTimeout(() => {
      this.idleTimer = null;
      this.idleLocked = true;
      this.panic();
    }, minutes * 60_000);
  }

  private touchActivity(): void {
    if (this.idleTimer === null && this.settings.idleBlurMinutes > 0) this.armIdle();
  }

  private clearIdle(): void {
    if (this.idleTimer !== null) window.clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  private clearRevealTimer(): void {
    if (this.revealTimer !== null) window.clearTimeout(this.revealTimer);
    this.revealTimer = null;
  }

  private report(status: EngineStatus, detail: string): void {
    this.callbacks.onStatus(status, detail);
  }

  dispose(): void {
    this.deactivate();
    this.unbindActivity();
    this.focusWatcher.stop();
    this.routeWatcher.stop();
    this.renderer.dispose();
  }
}
