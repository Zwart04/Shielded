import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: diverifikasi live 2026-11-10 (feed + /direct/*).
 * Selector struktural dipakai lebih dulu karena class dihasilkan build tool.
 * Baris percakapan dikenali dari tautan /direct/t/<id> bila memungkinkan.
 */
export const instagramAdapter: PlatformAdapter = {
  id: 'instagram',
  name: 'Instagram',
  hosts: ['www.instagram.com', 'instagram.com'],
  selectors: {
    messages: [
      {
        id: 'ig-dm-bubble',
        selector: 'main div[role="group"]',
        weight: 9,
        note: 'Satu baris pesan DM',
        multi: true,
      },
      {
        id: 'ig-dm-text',
        selector: 'main div[dir="auto"]:not(article *), main span[dir="auto"]:not(article *)',
        weight: 8,
        note: 'Teks pesan DM (caption feed tidak termasuk)',
        multi: true,
      },
      {
        id: 'ig-main-section',
        selector: 'div[role="main"] section',
        weight: 7,
        note: 'Bagian utama DM',
      },
      { id: 'ig-main', selector: 'main[role="main"]', weight: 6, note: 'Kontainer role main' },
    ],
    chatList: [
      {
        id: 'ig-thread-link',
        selector: 'a[href^="/direct/t/"]',
        weight: 9,
        note: 'Baris percakapan berdasarkan tautan',
        multi: true,
      },
      {
        id: 'ig-list-item',
        selector: 'div[role="list"] > div',
        weight: 6,
        note: 'Baris daftar generik',
        multi: true,
      },
      {
        id: 'ig-grid-item',
        selector: 'div[role="grid"] > div',
        weight: 5,
        note: 'Kandidat grid percakapan',
        multi: true,
      },
    ],
    names: [
      {
        id: 'ig-post-author',
        selector:
          'article header a[href^="/"], article header h2, article h1, main a[href^="/"][role="link"], main span[dir="auto"]:not(article *)',
        weight: 8,
        note: 'Nama pengunggah di feed + panel saran (bukan di dalam unggahan)',
        multi: true,
      },
      {
        id: 'ig-header-title',
        selector: 'main header h2, main header h1, div[role="main"] header h2',
        weight: 6,
        note: 'Nama di header percakapan',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'ig-media-preview',
        selector: 'a[href^="/direct/t/"] img[src*="cdninstagram"], [class*="thumbnail" i]',
        weight: 5,
        note: 'Thumbnail media di daftar',
        multi: true,
      },
    ],
    media: [
      {
        id: 'ig-media-photo',
        selector:
          'div[role="main"] img[src*="cdninstagram"]:not(article *), div[role="main"] video:not(article *)',
        weight: 5,
        note: 'Media di percakapan',
        multi: true,
      },
    ],
    feedContent: [
      {
        id: 'ig-feed-post',
        selector: 'main article, main [role="article"]',
        weight: 9,
        note: 'Satu unggahan feed (teks + media)',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'ig-compose-input',
        selector:
          'div[role="main"] textarea, div[role="main"] [contenteditable="true"][role="textbox"], textarea[aria-label], [contenteditable="true"][role="textbox"]',
        weight: 7,
        note: 'Kotak ketik pesan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'ig-post-avatar',
        selector:
          'article header img, main a[href^="/"][role="link"] img, img[alt*="avatar" i], img[alt*="profil" i], main canvas:not(article *), main li:has(canvas), main li:has(img):not(article *)',
        weight: 7,
        note: 'Avatar pengunggah, foto profil (alt terlokalisasi), dan item cerita',
        multi: true,
      },
      {
        id: 'ig-header-avatar',
        selector: 'main header img, div[role="main"] header img',
        weight: 5,
        note: 'Foto profil di header',
        multi: true,
      },
    ],
  },
  fallback: [
    { id: 'ig-main-fallback', selector: 'main[role="main"]', weight: 6, note: 'Area utama' },
  ],
  quirks: [
    'Route DM: /direct/*',
    'Class dihasilkan build tool; baris memakai tautan percakapan',
  ],
};
