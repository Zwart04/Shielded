/**
 * Perbedaan kecil antar-browser yang perlu diketahui UI.
 *
 * Firefox menyediakan namespace `browser` (Promise) di samping `chrome`
 * (callback). Bundel sudah dialiaskan ke API bergaya Promise lewat banner
 * build, tetapi beberapa URL internal tetap khusus per browser.
 */
export const IS_FIREFOX = typeof (globalThis as { browser?: unknown }).browser !== 'undefined';

/** Halaman pengaturan pintasan: Chrome punya URL khusus; Firefox lewat add-ons. */
export const SHORTCUTS_URL = IS_FIREFOX ? 'about:addons' : 'chrome://extensions/shortcuts';

/**
 * Cadangan bila browser menolak membuka halaman internal (beberapa versi
 * Firefox membatasi navigasi ke about:addons dari ekstensi).
 */
export const SHORTCUTS_FALLBACK_URL = IS_FIREFOX
  ? 'https://support.mozilla.org/kb/manage-extension-shortcuts-firefox'
  : 'chrome://extensions/shortcuts';
