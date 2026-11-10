# Hasil Verifikasi Selector

> **Status: DIJALANKAN (2026-11-10).**
> Verifikasi live pada Brave Origin 157 (profil uji, ekstensi 0.1.0) lewat CDP.
> Tabel detail di bawah masih templat; ringkasan hasil ada di bagian berikut.

## Ringkasan Verifikasi Live 2026-11-10

| Platform | Permukaan diuji | Hasil | Catatan |
|---|---|---|---|
| WhatsApp Web | daftar chat, chat terbuka, panel Diarsipkan | Lolos | nama/avatar/preview, gelembung, header, komposer terblur |
| Telegram Web | daftar chat, percakapan | Lolos | semua zona terblur |
| Instagram | feed, panel saran, story chip, DM thread | Lolos | `main div[role="group"]` bubble, `multi` komposer, `li:has(img)` chip |
| Facebook | feed, Messenger (daftar chat + bubble) | Lolos | `div[role="row"]` tanpa prefix `main`, media 4x |
| Threads | feed, saran | Lolos | `[role="region"]` difilter dari navigasi |
| TikTok | daftar pesan, thread | Lolos | atribut `inbox-list-item`, `dm-new-chat-item`, `dm-new-input-editor` |
| X | halaman publik | Tidak dapat diuji penuh | profil uji masih login wall; DM/timeline belum diverifikasi |

Zona baru skema v7: **Konten feed** (`feedContent`). Post feed Instagram/Facebook/Threads
dipisah dari zona percakapan dan **nonaktif secara bawaan**, jadi teks/gambar feed
terlihat sampai pengguna menyalakannya di Dashboard → Platform → zona "Konten feed".
Bila dinyalakan, seluruh post dikaburkan 3x (kelas `psx-zone--heavy`).

Ambang elemen kecil `multi`: `width > 8 && height > 10` (nama pendek tetap terlindungi).

> Catatan lama: tabel templat di bawah belum diisi per baris.

## Aturan

1. Jangan menulis kredensial, isi pesan, nama kontak, atau data pribadi apa pun di file ini.
2. Hanya catat struktur DOM: selector, jumlah elemen, ukuran, dan catatan.
3. Jalankan `tools/selector-probe.js` di DevTools pada halaman yang sudah login.
4. Uji pada tema terang **dan** gelap.
5. Uji setelah navigasi SPA (buka chat lain, kembali ke inbox).

## Ringkasan Status

| Platform | Tanggal uji | Browser | Versi ekstensi | Status |
|---|---|---|---|---|
| WhatsApp Web | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| Telegram Web | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| Instagram (feed + DM) | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| Facebook (feed + Messenger) | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| Threads | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| TikTok (pesan) | 2026-11-10 | Brave Origin 157 | 0.1.0 | Lolos |
| X (Twitter) | 2026-11-10 | Brave Origin 157 | 0.1.0 | Sebagian (login wall) |

Legenda status: `Lolos` / `Sebagian` / `Gagal` / `Belum dijalankan`.

---

## WhatsApp Web

### Lingkungan

- Tanggal: —
- Browser & versi: —
- URL saat uji: `https://web.whatsapp.com/`
- Catatan build WhatsApp (jika terlihat): —

### Hasil

| Zona | Kandidat | Selector | Jumlah | Terlihat | Ukuran | Catatan |
|---|---|---|---|---|---|---|
| messages | wa-msg-container | `#main [data-testid="msg-container"]` | — | — | — | per pesan |
| messages | wa-msg-bubble | `#main .message-in, #main .message-out` | — | — | — | per pesan |
| messages | wa-messages-testid | `#main [data-testid="conversation-panel-messages"]` | — | — | — | — |
| messages | wa-message-list | `#main div[role="application"]` | — | — | — | — |
| messages | wa-copyable-area | `#main .copyable-area` | — | — | — | — |
| messages | wa-main-id | `#main` | — | — | — | cadangan; termasuk header |
| chatList | wa-listitem | `#pane-side [role="listitem"]` | — | — | — | per item |
| chatList | wa-list-row | `#pane-side [role="row"]` | — | — | — | per item |
| chatList | wa-cell-frame | `#pane-side [data-testid="cell-frame-container"]` | — | — | — | per item |
| names | wa-header-name | `#main header span[title]` | — | — | — | per item |
| avatars | wa-header-avatar | `#main header img` | — | — | — | per item |
| fallback | wa-main-role-fallback | `div[role="main"]` | — | — | — | bukan root aplikasi |

### Kesimpulan

- Kandidat messages terbaik: —
- Kandidat chatList terbaik: —
- Apakah fallback diperlukan: —
- Perubahan yang harus dilakukan di adapter: —

---

## Telegram Web

### Lingkungan

- Tanggal: —
- Browser & versi: —
- Basis klien (WebK/WebZ): —
- URL saat uji: `https://web.telegram.org/`

### Hasil

| Zona | Kandidat | Selector | Jumlah | Terlihat | Ukuran | Catatan |
|---|---|---|---|---|---|---|
| messages | tg-bubble-webk | `#column-center .bubbles .bubble, #column-center .bubble` | — | — | — | per pesan |
| messages | tg-message-item | `#column-center .message-list-item, #column-center .Message` | — | — | — | per pesan, Web A |
| messages | tg-bubbles | `#column-center .bubbles` | — | — | — | WebK |
| messages | tg-messages-container | `#column-center .messages-container` | — | — | — | Web A |
| messages | tg-message-list | `.MessageList, .messages-layout` | — | — | — | Web A |
| messages | tg-chat | `#column-center .chat` | — | — | — | cadangan |
| chatList | tg-chat-item | `#column-left .chatlist a.chat-item, .chat-item` | — | — | — | per item |
| chatList | tg-chat-list-item | `.chat-list .chat-item, .chat-list a` | — | — | — | per item |
| chatList | tg-chatlist-link | `#column-left .chatlist a` | — | — | — | per item |
| chatList | tg-dialog-row | `#column-left .chatlist .row` | — | — | — | per item |
| names | tg-header-title | `.peer-title` di header | — | — | — | per item |
| avatars | tg-header-avatar | `.avatar img` di header | — | — | — | per item |
| fallback | tg-column-center | `#column-center` | — | — | — | area pesan |
| fallback | tg-chat-container | `.chat-container` | — | — | — | WebZ |

### Kesimpulan

- Basis klien yang diuji: —
- Kandidat terbaik: —
- Perubahan adapter: —

---

## Instagram DM

### Lingkungan

- Tanggal: —
- Browser & versi: —
- URL saat uji: `https://www.instagram.com/direct/inbox/`

### Hasil

| Zona | Kandidat | Selector | Jumlah | Terlihat | Ukuran | Catatan |
|---|---|---|---|---|---|---|
| messages | ig-main-section | `div[role="main"] section` | — | — | — | — |
| messages | ig-main | `main[role="main"]` | — | — | — | — |
| chatList | ig-thread-link | `a[href^="/direct/t/"]` | — | — | — | per item |
| chatList | ig-list-item | `div[role="list"] > div` | — | — | — | per item |
| chatList | ig-grid-item | `div[role="grid"] > div` | — | — | — | per item |
| names | ig-header-title | `div[role="main"] header h1/h2` | — | — | — | per item |
| avatars | ig-header-avatar | `div[role="main"] header img` | — | — | — | per item |
| fallback | ig-main-fallback | `main[role="main"]` | — | — | — | — |

### Kesimpulan

- Kandidat terbaik: —
- Apakah `div[role="main"] section` cocok: —
- Perubahan adapter: —

---

## Templat JSON dari Probe

Tempel keluaran `tools/selector-probe.js` di bawah ini (satu blok per platform). Hapus bagian ini setelah diisi.

```json
{
  "platform": "whatsapp",
  "url": "https://web.whatsapp.com/",
  "capturedAt": "YYYY-MM-DDTHH:mm:ss.sssZ",
  "note": "Data struktur DOM saja. Tidak ada isi pesan yang dikumpulkan.",
  "rows": []
}
```

## Tindak Lanjut Setelah Pengisian

1. Perbarui bobot/urutan kandidat di `src/adapters/<platform>/index.ts`.
2. Tambahkan fixture DOM tersanitasi di `tests/fixtures/dom/<platform>/`.
3. Jalankan ulang checklist `docs/06-analisis-kompatibilitas-platform.md` bagian 6.5.
4. Catat tanggal dan versi di tabel ringkasan.
