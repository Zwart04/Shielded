import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: Threads memakai basis Meta yang mirip Instagram. Class dihasilkan
 * build tool dan tidak ada `[role="main"]`; kolom konten ditandai
 * `[role="region"]` ("Bodi kolom"). DM berada pada route /direct/*.
 * Verifikasi live: feed desktop memakai region + teks `dir="auto"` per post.
 */
export const threadsAdapter: PlatformAdapter = {
  id: 'threads',
  name: 'Threads',
  hosts: ['www.threads.net', 'threads.net', 'www.threads.com', 'threads.com'],
  // Feed Threads bukan ruang pesan. Dua pola diterima karena URL inbox web
  // bisa berupa /direct/* maupun /messages/*.
  dmPaths: ['/direct', '/messages'],
  selectors: {
    messages: [
      {
        id: 'th-dm-text',
        // Inbox dan panel percakapan tampil bersamaan; satu kandidat gabungan
        // perluas cakupan tanpa saling menutupi. Navigasi kiri dikecualikan
        // supaya label menu tidak ikut kabur.
        selector: [
          'div[dir="auto"]:not(nav *):not([role="navigation"] *)',
          'span[dir="auto"]:not(nav *):not([role="navigation"] *)',
        ].join(', '),
        weight: 9,
        note: 'Teks pesan DM: baris inbox + gelembung percakapan',
        multi: true,
      },
    ],
    feedContent: [
      {
        id: 'th-feed-post',
        selector: '[role="region"] article, [role="region"] [role="article"]',
        weight: 9,
        note: 'Post feed bila build memakai role article',
        multi: true,
      },
      {
        id: 'th-feed-text',
        selector: '[role="region"] span[dir="auto"], [role="region"] div[dir="auto"]',
        weight: 7,
        note: 'Teks post feed (per item)',
        multi: true,
      },
      {
        id: 'th-feed-media',
        selector: '[role="region"] img, [role="region"] video',
        weight: 6,
        note: 'Media di post feed',
        multi: true,
      },
    ],
    chatList: [
      {
        id: 'th-thread-link',
        selector: 'a[href*="/direct/t/"]',
        weight: 9,
        note: 'Baris percakapan DM',
        multi: true,
      },
      {
        id: 'th-listitem',
        selector: '[role="listitem"]',
        weight: 7,
        note: 'Baris daftar percakapan',
        multi: true,
      },
      {
        id: 'th-row',
        selector: '[role="row"]',
        weight: 5,
        note: 'Baris daftar alternatif (inbox web)',
        multi: true,
      },
    ],
    names: [
      {
        id: 'th-post-author',
        selector:
          'a[href*="/direct/t/"] span[dir="auto"], [role="listitem"] span[dir="auto"], [role="region"] [role="listitem"] span[dir="auto"], header span[dir="auto"]',
        weight: 7,
        note: 'Nama kontak di daftar percakapan',
        multi: true,
      },
      {
        id: 'th-header-title',
        selector:
          'div[role="main"] header h1, div[role="main"] header h2, [role="main"] h1, [role="main"] h2, main header h1, main header h2, header h1, header h2, a[href^="/@"] span[dir="auto"]',
        weight: 6,
        note: 'Nama di header percakapan',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'th-media-preview',
        selector:
          'a[href*="/direct/"] img, [role="listitem"] img, [class*="thumbnail" i]',
        weight: 5,
        note: 'Thumbnail media di daftar',
        multi: true,
      },
    ],
    media: [
      {
        id: 'th-media-photo',
        selector: '[role="region"] video, div[role="main"] video, main video, [role="main"] img, main img',
        weight: 6,
        note: 'Media di percakapan',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'th-compose',
        selector:
          'div[role="main"] [contenteditable="true"][role="textbox"], div[role="main"] textarea, [role="region"] [contenteditable="true"][role="textbox"], [contenteditable="true"][role="textbox"], [contenteditable="true"]',
        weight: 7,
        note: 'Kotak ketik pesan / balasan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'th-avatars',
        selector: [
          'a[href*="/direct/t/"] img',
          '[role="listitem"] img',
          'a[href^="/@"] img',
          '[role="region"] img',
          'main header img',
          'header img',
        ].join(', '),
        weight: 5,
        note: 'Foto profil kontak dan header percakapan',
        multi: true,
      },
    ],
  },
  quirks: [
    'Route DM: /direct/*',
    'Kolom konten ditandai [role="region"]; tidak ada [role="main"]',
    'Selector mengikuti pola Instagram (Meta)',
  ],
};
