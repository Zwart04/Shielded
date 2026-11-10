export type PlatformId =
  | 'whatsapp'
  | 'telegram'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'threads'
  | 'tiktok';

export type ProtectionLevel = 'normal' | 'privacy' | 'maximum';

export type ZoneId =
  | 'messages'
  | 'chatList'
  | 'chatPreview'
  | 'names'
  | 'avatars'
  | 'mediaPreview'
  | 'media'
  | 'feedContent'
  | 'textInput';

export type EffectKind = 'blur' | 'cover' | 'hide';

export type ThemePreference = 'system' | 'light' | 'dark';

export type BlurIntensity = 'light' | 'normal' | 'strong';

export interface ZoneRule {
  protected: boolean;
  effect: EffectKind;
}

export interface PlatformSettings {
  enabled: boolean;
  zones: Record<ZoneId, ZoneRule>;
}

export interface Settings {
  schemaVersion: number;
  level: ProtectionLevel;
  autoProtectOnHidden: boolean;
  autoProtectOnBlur: boolean;
  restoreOnFocus: boolean;
  hoverReveal: boolean;
  clickReveal: boolean;
  revealTimeoutSec: number;
  /** Tanpa animasi transisi: reveal/blur berganti seketika. */
  instantReveal: boolean;
  /** Buka semua zona selama kursor berada di jendela aplikasi. */
  unblurOnAppHover: boolean;
  /** Kunci proteksi setelah sekian menit tanpa interaksi. 0 = mati. */
  idleBlurMinutes: number;
  blurIntensity: BlurIntensity;
  coverTone: 'neutral' | 'dark';
  theme: ThemePreference;
  onboardingDone: boolean;
  platforms: Record<PlatformId, PlatformSettings>;
}

export interface SelectorCandidate {
  id: string;
  selector: string;
  weight: number;
  note: string;
  /** true = semua elemen yang cocok dilindungi satu per satu (baris chat, nama). */
  multi?: boolean;
}

export interface ResolvedZone {
  zone: ZoneId;
  /** Satu elemen per item. Untuk zona panel, array berisi satu elemen. */
  elements: Element[];
  candidateId: string;
  score: number;
}

export interface ResolvedChatArea {
  messages: ResolvedZone | null;
  chatList: ResolvedZone | null;
  chatPreview: ResolvedZone | null;
  names: ResolvedZone | null;
  avatars: ResolvedZone | null;
  mediaPreview: ResolvedZone | null;
  media: ResolvedZone | null;
  feedContent: ResolvedZone | null;
  textInput: ResolvedZone | null;
  usedFallback: boolean;
  usedHeuristic: boolean;
}
