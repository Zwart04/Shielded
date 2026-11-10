import type { PlatformAdapter } from '../contract.ts';

/**
 * CATATAN: diverifikasi live 2026-11-10 (Brave Origin 157).
 * Urutan bobot: atribut semantik > struktur > class generator.
 * Zona chatList/names/avatars/chatPreview bersifat per item (`multi`).
 *
 * Verifikasi wajib dengan tools/selector-probe.js sebelum rilis.
 */
export const whatsappAdapter: PlatformAdapter = {
  id: 'whatsapp',
  name: 'WhatsApp Web',
  hosts: ['web.whatsapp.com'],
  selectors: {
    messages: [
      {
        id: 'wa-msg-container',
        selector: '#main [data-testid="msg-container"], #main .copyable-text',
        weight: 9,
        note: 'Gelembung pesan + kutipan balasan di kotak ketik',
        multi: true,
      },
      {
        id: 'wa-msg-bubble',
        selector: '#main .message-in, #main .message-out',
        weight: 8,
        note: 'Gelembung pesan per item',
        multi: true,
      },
      {
        id: 'wa-messages-testid',
        selector: '#main [data-testid="conversation-panel-messages"]',
        weight: 7,
        note: 'Kontainer daftar pesan',
      },
      {
        id: 'wa-message-list',
        selector: '#main div[role="application"]',
        weight: 6,
        note: 'Daftar pesan (bukan header/komposer)',
      },
      {
        id: 'wa-copyable-area',
        selector: '#main .copyable-area',
        weight: 5,
        note: 'Kontainer pesan historis',
      },
      {
        id: 'wa-main-id',
        selector: '#main',
        weight: 3,
        note: 'Cadangan terakhir; termasuk header',
      },
    ],
    chatList: [
      {
        id: 'wa-listitem',
        selector: '#pane-side [role="listitem"]',
        weight: 9,
        note: 'Baris chat (role listitem)',
        multi: true,
      },
      {
        id: 'wa-list-row',
        selector: '#pane-side [role="row"]',
        weight: 8,
        note: 'Varian role row',
        multi: true,
      },
      {
        id: 'wa-cell-frame',
        selector: '#pane-side [data-testid="cell-frame-container"]',
        weight: 7,
        note: 'Test id historis',
        multi: true,
      },
    ],
    names: [
      {
        id: 'wa-header-texts',
        selector:
          '#main header span[title], #main [data-testid="conversation-info-header-chat-title"], #main [data-testid="conversation-info-header-chat-title-name"] span[dir], #main [data-testid="chat-subtitle"] span',
        weight: 9,
        note: 'Nama header, subjudul grup, dan daftar anggota (satu kandidat agar tidak saling menutup)',
        multi: true,
      },
      {
        id: 'wa-row-name',
        selector:
          '#pane-side [role="listitem"] span[title], #pane-side [role="row"] span[title], #main [role="listitem"] span[title]',
        weight: 6,
        note: 'Nama kontak di tiap baris chat',
        multi: true,
      },
    ],
    chatPreview: [
      {
        id: 'wa-row-preview',
        selector:
          '#pane-side [role="listitem"] span[dir="ltr"], #pane-side [role="listitem"] span[dir="auto"], #main [role="listitem"] span[dir="ltr"], #main [role="listitem"] span[dir="auto"]',
        weight: 5,
        note: 'Baris preview pesan terakhir',
        multi: true,
      },
    ],
    mediaPreview: [
      {
        id: 'wa-media-preview',
        selector:
          '#pane-side [data-testid="media-preview"], #pane-side [class*="thumbnail" i]',
        weight: 6,
        note: 'Thumbnail media di baris chat',
        multi: true,
      },
    ],
    media: [
      {
        id: 'wa-media-thumb',
        selector:
          '#main [data-testid="image-thumb"], #main [data-testid="media-image"], #main .message-in img, #main .message-out img, #main img[src^="blob:"], #main [data-testid="msg-container"] img',
        weight: 7,
        note: 'Gambar di dalam percakapan',
        multi: true,
      },
      {
        id: 'wa-media-video',
        selector: '#main video, #main [data-testid="msg-container"] video',
        weight: 6,
        note: 'Video',
        multi: true,
      },
    ],
    textInput: [
      {
        id: 'wa-compose-input',
        selector:
          '#main footer [contenteditable="true"], #main [contenteditable="true"][role="textbox"], #main [data-testid="conversation-compose-box-input"]',
        weight: 8,
        note: 'Kotak ketik pesan',
        multi: true,
      },
    ],
    avatars: [
      {
        id: 'wa-avatars',
        selector:
          '#main header img, #main [data-testid="conversation-header-avatar"] img, #main [data-testid="group-chat-profile-picture"] img, #main [role="listitem"] img, #pane-side [role="listitem"] img, #pane-side [role="row"] img',
        weight: 8,
        note: 'Avatar header, avatar pengirim di grup, dan foto baris chat (satu kandidat)',
        multi: true,
      },
    ],
  },
  fallback: [
    {
      id: 'wa-main-role-fallback',
      selector: 'div[role="main"]',
      weight: 4,
      note: 'Area utama; tidak pernah memakai root aplikasi',
    },
  ],
  quirks: [
    'Class CSS di-obfuscate dan berubah antar build',
    'Nama, preview, dan foto diturunkan dari setiap baris chat',
  ],
};
