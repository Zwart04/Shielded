import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: selector memakai atribut data-e2e TikTok, yang relatif stabil.
 * Kotak pesan baru memakai awalan `dm-new-*`; daftar chat memakai
 * `inbox-list-item` / `dm-new-conversation-item`. Keduanya dicantumkan
 * supaya perubahan nama modul tidak langsung mematikan proteksi.
 */
export const tiktokAdapter: PlatformAdapter = {
  id: 'tiktok',
  name: 'TikTok',
  hosts: ['www.tiktok.com', 'tiktok.com'],
  selectors: {
    messages: [
      {
        id: 'tt-chat-item',
        selector: '[data-e2e="dm-new-chat-item"], [data-e2e="chat-item"], [data-e2e="message-item"]',
        weight: 9,
        note: 'Satu baris pesan di percakapan',
        multi: true,
      },
      {
        id: 'tt-message-text',
        selector:
          '[data-e2e="dm-new-message-text"], [data-e2e="message-text"], [data-e2e="chat-item"] [dir="auto"]',
        weight: 7,
        note: 'Teks pesan',
        multi: true,
      },
    ],
    chatList: [
      {
        id: 'tt-chat-list-item',
        selector:
          '[data-e2e="inbox-list-item"], [data-e2e="dm-new-conversation-item"], [data-e2e="chat-list-item"]',
        weight: 9,
        note: 'Baris daftar chat',
        multi: true,
      },
      {
        id: 'tt-listitem',
        selector: 'div[role="listitem"], [role="list"] > div',
        weight: 5,
        note: 'Baris daftar generik',
        multi: true,
      },
    ],
    chatPreview: [
      {
        id: 'tt-chat-preview',
        selector: '[data-e2e="inbox-content"], [data-e2e="dm-new-conversation-item"] p',
        weight: 6,
        note: 'Cuplikan pesan terakhir di daftar',
        multi: true,
      },
    ],
    names: [
      {
        id: 'tt-chat-title',
        selector:
          '[data-e2e="inbox-title"], [data-e2e="dm-new-conversation-nickname"], [data-e2e="dm-new-chat-nickname"], [data-e2e="chat-uniqueid"], [data-e2e="chat-title"]',
        weight: 8,
        note: 'Nama kontak di daftar dan header percakapan',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'tt-media-preview',
        selector:
          '[data-e2e="inbox-list-item"] img, [data-e2e="dm-new-conversation-item"] img, [data-e2e="chat-list-item"] img',
        weight: 5,
        note: 'Thumbnail media di daftar',
        multi: true,
      },
    ],
    media: [
      {
        id: 'tt-media-photo',
        selector:
          '[data-e2e="dm-new-shared-video"], [data-e2e="dm-new-chat-item"] img, [data-e2e="dm-new-chat-item"] video, [data-e2e="chat-item"] img, [data-e2e="chat-item"] video',
        weight: 8,
        note: 'Media dan kartu video di dalam percakapan',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'tt-compose',
        selector:
          '[data-e2e="dm-new-input-editor"], [data-e2e="message-input"], [contenteditable="true"][role="textbox"], textarea[placeholder]',
        weight: 8,
        note: 'Kotak ketik pesan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'tt-avatar',
        selector:
          '[data-e2e="inbox-avatar-multiple"], [data-e2e="dm-new-conversation-avatar"], [data-e2e="top-chat-avatar"], [data-e2e="chat-avatar"], [data-e2e="dm-new-conversation-avatar"] img',
        weight: 7,
        note: 'Foto profil di daftar dan header',
        multi: true,
      },
    ],
  },
  quirks: ['Testid: inbox-list-item / dm-new-chat-item / dm-new-input-editor'],
};
