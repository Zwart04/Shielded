import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: diverifikasi live 2026-11-10 (feed + Messenger). Class obfuscated, jadi selector
 * semantik (role/testid/aria-label) dipakai lebih dulu. Baris daftar chat dan
 * pesan dicari per item; nama/preview/avatar diturunkan dari tiap baris.
 * Berlaku untuk www.messenger.com dan facebook.com/messages.
 */
export const facebookAdapter: PlatformAdapter = {
  id: 'facebook',
  name: 'Facebook',
  hosts: [
    'www.facebook.com',
    'facebook.com',
    'web.facebook.com',
    'www.messenger.com',
    'messenger.com',
  ],
  // Hanya ruang pesan: /messages/* dan seluruh messenger.com.
  dmPaths: ['/messages'],
  dmHosts: ['messenger.com'],
  // Panel "Chats" yang mengambang di beranda. Zona pesan dibatasi di dalam
  // panel ini, jadi unggahan feed di sekitarnya tidak ikut ter-blur.
  dmScopes: [
    {
      id: 'fb-dock-scope',
      selector: '[aria-label="Chats"], [aria-label="Obrolan"], [aria-label="Chat"]',
      weight: 9,
      note: 'Panel Chats',
    },
    {
      id: 'fb-dock-scope-pagelet',
      selector: '[data-pagelet="Chats"], .fbChatSidebar',
      weight: 5,
      note: 'Panel Chats (data-pagelet lama)',
    },
  ],
  selectors: {
    messages: [
      {
        id: 'fb-message-unit',
        selector: 'div[role="main"] [role="article"][style*="--chat-composer"]',
        weight: 9,
        note: 'Gelembung pesan (memuat variabel --chat-composer)',
        multi: true,
      },
      {
        id: 'fb-message-row',
        selector: 'div[role="main"] div[role="grid"] div[role="row"]',
        weight: 8,
        note: 'Baris pesan di percakapan',
        multi: true,
      },
      {
        id: 'fb-message-dir',
        selector: 'div[role="main"] div[dir="auto"]:not(article *):not([role="article"] *)',
        weight: 3,
        note: 'Teks pesan percakapan (post feed tidak termasuk)',
        multi: true,
      },
    ],
    chatList: [
      {
        id: 'fb-row',
        selector: 'div[role="row"]',
        weight: 9,
        note: 'Baris daftar percakapan Messenger',
        multi: true,
      },
      {
        id: 'fb-listitem',
        selector: 'div[role="main"] [role="listitem"]',
        weight: 8,
        note: 'Baris daftar alternatif',
        multi: true,
      },
      {
        id: 'fb-thread-link',
        selector: 'div[role="main"] a[href*="/t/"]',
        weight: 6,
        note: 'Tautan percakapan',
        multi: true,
      },
      {
        id: 'fb-dock-row',
        selector: '[role="listitem"], a[href*="/t/"]',
        weight: 7,
        note: 'Baris percakapan di panel Chats',
        multi: true,
      },
    ],
    chatPreview: [
      {
        id: 'fb-preview',
        selector: 'div[role="row"] span[dir="auto"]',
        weight: 6,
        note: 'Teks pesan terakhir di baris percakapan',
        multi: true,
      },
    ],
    names: [
      {
        id: 'fb-names',
        selector:
          'div[role="row"] h4, div[role="main"] a[href*="/t/"] span[dir="auto"], [role="listitem"] span[dir="auto"], [role="row"] span[dir="auto"]',
        weight: 5,
        note: 'Nama kontak di baris percakapan',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'fb-media-preview',
        selector:
          'div[role="row"] img, [role="listitem"] img, [role="listitem"] video',
        weight: 5,
        note: 'Thumbnail media di baris',
        multi: true,
      },
    ],
    media: [
      {
        id: 'fb-media-photo',
        selector:
          'div[role="main"] [role="grid"] img:not(article *):not([role="article"] *), div[role="main"] [role="grid"] video:not(article *):not([role="article"] *)',
        weight: 6,
        note: 'Media di dalam percakapan',
        multi: true,
      },
    ],
    feedContent: [
      {
        id: 'fb-feed-post',
        selector:
          'div[role="main"] article, div[role="main"] [role="article"]:not([style*="--chat-composer"]), div[role="feed"] article',
        weight: 9,
        note: 'Satu unggahan feed (teks + media)',
        multi: true,
      },
      {
        id: 'fb-feed-row',
        selector: 'div[role="feed"] div[dir="auto"]',
        weight: 6,
        note: 'Teks post feed tanpa role article',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'fb-compose',
        selector:
          'div[role="main"] [contenteditable="true"][role="textbox"], div[role="main"] [aria-label="Message"][contenteditable="true"], div[role="main"] [aria-label="Pesan"][contenteditable="true"]',
        weight: 8,
        note: 'Kotak ketik pesan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'fb-avatar',
        selector: 'div[role="row"] img, [role="listitem"] img',
        weight: 5,
        note: 'Foto profil di baris percakapan (listitem atau row)',
        multi: true,
      },
    ],
  },
  quirks: [
    'Class CSS di-obfuscate; prioritaskan role dan aria-label',
    'Messenger web juga dilayani di www.messenger.com',
  ],
};
