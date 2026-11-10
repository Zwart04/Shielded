import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: hanya permukaan publik yang terverifikasi (2026-11-10); DM belum.
 * X memakai data-testid yang cukup stabil di halaman
 * Direct Messages. Bila testid berubah, baris chat tetap dicari lewat struktur
 * (role listitem) dan nama/preview/avatar diturunkan per baris.
 */
export const xAdapter: PlatformAdapter = {
  id: 'x',
  name: 'X (Twitter)',
  hosts: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  selectors: {
    messages: [
      {
        id: 'x-message-entry',
        selector: '[data-testid="messageEntry"]',
        weight: 10,
        note: 'Satu entri pesan DM',
        multi: true,
      },
      {
        id: 'x-dm-cell',
        selector: '[data-testid="DMDrawer"] [data-testid="cellInnerDiv"]',
        weight: 7,
        note: 'Sel pesan di panel DM',
        multi: true,
      },
    ],
    chatList: [
      {
        id: 'x-conversation',
        selector: '[data-testid="conversation"]',
        weight: 9,
        note: 'Baris percakapan DM',
        multi: true,
      },
      {
        id: 'x-listitem',
        selector: '[data-testid="DMDrawer"] [role="listitem"]',
        weight: 6,
        note: 'Baris daftar percakapan',
        multi: true,
      },
      {
        id: 'x-dm-link',
        selector: 'a[href^="/messages/"]',
        weight: 5,
        note: 'Tautan percakapan',
        multi: true,
      },
    ],
    names: [
      {
        id: 'x-conversation-name',
        selector: '[data-testid="conversation"] [dir="ltr"]',
        weight: 5,
        note: 'Nama kontak di daftar',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'x-media-preview',
        selector: '[data-testid="conversation"] img, [data-testid="conversation"] video',
        weight: 5,
        note: 'Thumbnail media di daftar',
        multi: true,
      },
    ],
    media: [
      {
        id: 'x-media-photo',
        selector: '[data-testid="messageEntry"] img, [data-testid="messageEntry"] video',
        weight: 6,
        note: 'Media di dalam percakapan',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'x-compose',
        selector:
          '[data-testid="dmComposerTextInput"], [contenteditable="true"][role="textbox"]',
        weight: 8,
        note: 'Kotak ketik pesan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'x-avatar',
        selector: '[data-testid="conversation"] img',
        weight: 5,
        note: 'Foto profil di daftar',
        multi: true,
      },
    ],
  },
  quirks: ['Testid utama: messageEntry, conversation, dmComposerTextInput'],
};
