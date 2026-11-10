import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: diverifikasi live 2026-11-10. Telegram Web memiliki beberapa basis klien
 * (WebK, WebZ, dan Web A di web.telegram.org/a) dengan DOM berbeda.
 * Web A memakai CSS module obfuscated: baris `.Chat` di dalam `.chat-list`,
 * nama `.peer-title`, avatar berupa `<div class="Avatar">` (background-image),
 * bukan `<img>`. Bila selector tetap gagal, baris chat dicari lewat geometri.
 */
export const telegramAdapter: PlatformAdapter = {
  id: 'telegram',
  name: 'Telegram Web',
  hosts: ['web.telegram.org'],
  selectors: {
    messages: [
      {
        id: 'tg-bubble-webk',
        selector: '#column-center .bubbles .bubble, #column-center .bubble',
        weight: 10,
        note: 'Satu gelembung pesan (WebK/Web A)',
        multi: true,
      },
      {
        id: 'tg-message-item',
        selector: '#column-center .message-list-item, #column-center .Message',
        weight: 9,
        note: 'Satu pesan Web A',
        multi: true,
      },
      { id: 'tg-bubbles', selector: '#column-center .bubbles', weight: 6, note: 'Kontainer pesan WebK' },
      {
        id: 'tg-messages-container',
        selector: '#column-center .messages-container, #column-center .MessageList',
        weight: 6,
        note: 'Kontainer pesan Web A',
      },
      { id: 'tg-message-list', selector: '.MessageList, .messages-layout', weight: 5, note: 'Varian Web A' },
      { id: 'tg-chat', selector: '#column-center .chat', weight: 3, note: 'Cadangan; dapat mencakup header' },
    ],
    chatList: [
      {
        id: 'tg-chat-item',
        selector: '#column-left .chatlist a.chat-item, #column-left .chatlist .chat-item',
        weight: 9,
        note: 'Baris chat WebK',
        multi: true,
      },
      {
        id: 'tg-web-a-chat',
        selector: '#column-left .chat-list .Chat, #column-left .Chat, #column-left .chat-list a',
        weight: 9,
        note: 'Baris chat Web A (.Chat)',
        multi: true,
      },
      {
        id: 'tg-chat-list-item',
        selector: '#column-left .chat-list [role="listitem"], .chat-list .chat-item, .chat-list a',
        weight: 8,
        note: 'Baris chat Web A varian listitem',
        multi: true,
      },
      {
        id: 'tg-chatlist-link',
        selector: '#column-left .chatlist a',
        weight: 7,
        note: 'Semua tautan baris di panel kiri',
        multi: true,
      },
      {
        id: 'tg-dialog-row',
        selector: '#column-left .chatlist .row',
        weight: 6,
        note: 'Varian WebZ',
        multi: true,
      },
    ],
    names: [
      {
        id: 'tg-peer-title',
        selector:
          '#column-center .peer-title, .chat-info .peer-title, .chat-header .peer-title, #column-left .peer-title, #column-left .chat-item .peer-title, .chat-list .peer-title',
        weight: 8,
        note: 'Nama di header dan tiap baris chat',
        multi: true,
      },
      {
        id: 'tg-title-heading',
        selector: '#column-left .chat-list .title, #column-left .Chat .peer-title, .chat-info .title',
        weight: 7,
        note: 'Nama baris Web A varian .title',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'tg-avatar',
        selector:
          '#column-center .avatar img, .chat-info .avatar img, .chat-header img, #column-left .chat-item img, .chat-list .avatar img',
        weight: 7,
        note: 'Foto profil di header dan tiap baris chat',
        multi: true,
      },
      {
        id: 'tg-avatar-web-a',
        selector:
          '#column-left .chat-list .Avatar, #column-left .Chat .Avatar, #column-left .Avatar__media, .chat-info .Avatar',
        weight: 7,
        note: 'Avatar Web A berupa div ber-background',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'tg-media-preview',
        selector:
          '#column-left [class*="thumbnail" i], #column-left [class*="media-preview" i], #column-left video',
        weight: 6,
        note: 'Thumbnail media di baris chat',
        multi: true,
      },
    ],
    media: [
      {
        id: 'tg-media-photo',
        selector:
          '#column-center [class*="MediaPhoto" i], #column-center [class*="photo" i][style*="background-image"], #column-center .media-photo, #column-center .bubbles img, #column-center .message img',
        weight: 7,
        note: 'Foto di dalam percakapan',
        multi: true,
      },
      { id: 'tg-media-video', selector: '#column-center video', weight: 6, note: 'Video', multi: true },
    ],
    textInput: [
      {
        id: 'tg-compose-input',
        selector:
          '#column-center [contenteditable="true"], #column-center .input-message-input, #column-center .MessageInput input',
        weight: 8,
        note: 'Kotak ketik pesan',
      },
    ],
    chatPreview: [
      {
        id: 'tg-last-message',
        selector: '#column-left .chat-list .last-message, #column-left .Chat .last-message',
        weight: 7,
        note: 'Preview pesan baris Web A',
        multi: true,
      },
    ],
  },
  fallback: [
    { id: 'tg-column-center', selector: '#column-center', weight: 6, note: 'Kolom utama' },
    { id: 'tg-chat-container', selector: '.chat-container', weight: 4, note: 'Varian WebZ' },
  ],
  quirks: [
    'Basis klien berbeda: WebK, WebZ, Web A',
    'Web A: avatar berupa div, bukan img',
    'Baris chat memakai pencarian geometri bila selector gagal',
  ],
};
