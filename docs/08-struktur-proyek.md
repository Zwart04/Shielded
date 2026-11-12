# 08 — Struktur Proyek

> **Status:** scaffold sudah dibuat di folder `Shielded/` sesuai pohon di bawah. Bagian yang belum ada ditandai `(rencana)`.

## 8.1 Pohon Direktori

```
shielded/
├─ .gitignore                      # node_modules, dist, *.zip tidak di-commit
├─ manifest.config.ts              # generator manifest MV3 (sumber tunggal permission)
├─ package.json
├─ tsconfig.json                   # typecheck kode src (tipe browser, tanpa Node)
├─ tsconfig.test.json              # typecheck tes (menambah tipe Node)
├─ README.md
├─ dist/                           # hasil build; tidak di-commit
├─ public/
│  ├─ icons/
│  │  ├─ icon16.png
│  │  ├─ icon32.png
│  │  ├─ icon48.png
│  │  └─ icon128.png
│  └─ fonts/
│     ├─ inter-latin.woff2         # font UI yang dibundel (tanpa CDN)
│     └─ OFL.txt
├─ src/
│  ├─ shared/
│  │  ├─ types.ts                  # tipe domain (Settings, PlatformId, ZoneId, ...)
│  │  ├─ defaults.ts               # preset Normal/Privasi/Maksimum
│  │  ├─ messaging.ts              # tipe pesan runtime + helper status
│  │  └─ platform-ids.ts           # label, host, deteksi platform, match pattern
│  ├─ config-store/
│  │  ├─ schema.ts                 # normalisasi & validasi data storage
│  │  └─ storage.ts                # pembungkus chrome.storage.local
│  ├─ core/
│  │  ├─ engine.ts                 # state machine per tab
│  │  ├─ effect-renderer.ts        # injeksi stylesheet + overlay blur/cover/hide
│  │  ├─ dom-watcher.ts            # MutationObserver + coalescing rAF
│  │  ├─ focus-watcher.ts          # visibilitychange / window blur / focus
│  │  ├─ route-watcher.ts          # polling URL SPA
│  │  ├─ selector-resolver.ts      # pemilihan kandidat selector berbobot
│  │  ├─ health.ts                 # pencatat kegagalan selector (memori)
│  │  └─ styles.ts                 # CSS content script
│  ├─ adapters/
│  │  ├─ contract.ts               # interface PlatformAdapter + detectChatArea
│  │  ├─ registry.ts               # daftar adapter aktif
│  │  ├─ whatsapp/index.ts
│  │  ├─ telegram/index.ts
│  │  ├─ instagram/index.ts
│  │  ├─ facebook/index.ts
│  │  ├─ x/index.ts
│  │  ├─ threads/index.ts
│  │  └─ tiktok/index.ts
│  ├─ content/
│  │  └─ main.ts                   # bootstrap content script
│  ├─ background/
│  │  └─ service-worker.ts         # commands, badge, relay
│  └─ ui/
│     ├─ styles/
│     │  ├─ tokens.css            # palet terang/gelap, --ink, --popup-w
│     │  ├─ base.css
│     │  ├─ components.css        # btn, switch, segmented, toast, icon
│     │  └─ popup.css             # seluruh desain popup
│     ├─ components/
│     │  ├─ dom.ts                 # helper el(), clear(), applyTheme()
│     │  ├─ logo.ts                # logo Shielded (SVG)
│     │  ├─ toggle.ts
│     │  ├─ segmented.ts
│     │  ├─ toast.ts
│     │  └─ icons.ts               # ikon garis + logo 7 platform
│     ├─ popup/
│     │  ├─ index.html
│     │  └─ main.ts               # satu-satunya panel pengaturan
│     └─ privacy/
│        └─ index.html            # kebijakan privasi statis
├─ tests/
│  └─ unit/
│     ├─ defaults.test.ts
│     ├─ schema.test.ts
│     ├─ selector-resolver.test.ts
│     ├─ messaging.test.ts
│     ├─ contract.test.ts
│     └─ platform-ids.test.ts
│  └─ (rencana) e2e/ + fixtures/dom/
├─ scripts/
│  ├─ build.mjs                   # esbuild + salin aset + manifest
│  ├─ verify-privacy.mjs          # audit izin & pola berbahaya
│  └─ build-zip.mjs               # paket rilis (ZIP ditulis via node:zlib)
├─ tools/
│  └─ selector-probe.js           # alat manual DevTools
└─ docs/                          # dokumen perencanaan & operasional
   ├─ 00-daftar-isi.md
   ├─ 01-ringkasan-eksekutif.md
   ├─ 02-konsep-dan-posisi-produk.md
   ├─ 03-fitur-utama-dan-diferensiasi.md
   ├─ 04-prd.md
   ├─ 05-lingkup-mvp-dan-prioritas.md
   ├─ 06-analisis-kompatibilitas-platform.md
   ├─ 07-arsitektur-teknis.md
   ├─ 08-struktur-proyek.md
   ├─ 09-design-system.md
   ├─ 10-desain-antarmuka.md
   ├─ 11-alur-pengguna.md
   ├─ 12-keamanan-privasi-performa.md
   ├─ 13-rencana-pengujian.md
   ├─ 14-roadmap.md
   ├─ 15-risiko-dan-ekspansi.md
   ├─ privacy-policy.md
   ├─ permissions-justification.md
   ├─ selectors-runbook.md
   ├─ selector-verification-results.md
   └─ glossary.md
```

## 8.2 Tanggung Jawab Tiap Direktori

| Direktori | Tanggung jawab | Aturan |
|---|---|---|
| `src/shared/` | Tipe, default, pesan runtime, ID platform | Tidak boleh mengimpor `core` atau `adapters` |
| `src/config-store/` | Persistensi preferensi + normalisasi skema | Tidak menyimpan konten halaman |
| `src/core/` | Mesin privasi, platform-agnostic | Tidak boleh mengimpor adapter konkret |
| `src/adapters/` | Data selector & aturan per platform | Tidak boleh mengimpor UI |
| `src/content/` | Bootstrap content script | Tipis, hanya wiring |
| `src/background/` | Commands, badge, relay | Tanpa state persisten |
| `src/ui/` | Halaman ekstensi | Tidak menyentuh DOM web |
| `tests/unit/` | Logika murni | Tanpa DOM/Chrome API |
| `tools/` | Alat manual pengembang | Tidak ikut dibundel ke `dist` |
| `design/` | Mockup statis | Tidak ikut dibundel ke `dist` |
| `docs/` | Dokumentasi internal | Sinkron dengan kode |

## 8.3 Penjelasan File Penting

### `manifest.config.ts`
Sumber tunggal untuk `permissions`, `host_permissions`, `content_scripts`, `commands`, dan `action`. Diimpor oleh `scripts/build.mjs` lalu ditulis ke `dist/manifest.json`.

### `shared/defaults.ts`
Berisi daftar zona (`messages`, `chatList`, `chatPreview`, `names`, `avatars`, `mediaPreview`, `media`, `textInput`), label/deskripsi/ikon per zona, dan preset Normal/Privasi/Maksimum. Preset menimpa zona semua platform agar perilaku mudah diprediksi, tetapi **tidak** mengubah status aktif/nonaktif platform.

### `config-store/schema.ts`
`normalizeSettings()` selalu mengembalikan objek lengkap yang valid, sehingga data korup atau dari versi lama tidak merusak UI. Skema 2 memetakan zona gabungan lama: `conversationList` → `chatPreview` + `names`, `identity` → `names` + `avatars`.

### `core/selector-resolver.ts`
Memilih kandidat dengan bobot tertinggi yang menemukan elemen. Menolak elemen >90% viewport dan overlay ekstensi; elemen yang sudah berproteksi tetap valid pada deteksi berikutnya.

### `core/structural.ts`
Heuristik geometri untuk menemukan baris percakapan ketika selector platform gagal. Hanya membaca posisi/ukuran, tidak pernah teks.

### `core/engine.ts`
Titik masuk logika. Menerima adapter + settings, menghasilkan state `inactive | protected | degraded`. Tidak tahu nama DOM spesifik.

### `core/effect-renderer.ts`
Menyuntik satu stylesheet, menambahkan overlay pada setiap elemen zona, dan mengelola reveal (hover CSS per item, klik-tahan, reveal-all). Elemen void seperti `<img>` memakai filter/opacity langsung. Idempoten saat DOM berubah.

### `ui/components/icons.ts`
Ikon SVG inline: navigasi, zona, dan brand platform. Tidak ada aset eksternal maupun font ikon.

### `adapters/registry.ts`
Daftar adapter yang diimpor statis. Menambah platform = menambah entri di sini.

### `content/main.ts`
Wiring: pilih adapter dari `location.hostname`, buat engine, dengarkan `storage.onChanged` dan pesan runtime, kirim status ke background.

### `background/service-worker.ts`
Meneruskan command ke tab aktif, mengatur badge, dan menyegarkan badge saat tab berganti.

### `scripts/verify-privacy.mjs`
Audit yang gagal jika menemukan:
- `<all_urls>` atau host di luar daftar,
- `fetch(`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`,
- `eval(`, `new Function(`,
- permission di luar daftar putih.

## 8.4 Cara Menambah Platform Baru

Contoh: Discord Web.

1. **Verifikasi DOM** — jalankan checklist `06` bagian 6.5 dan isi `docs/selector-verification-results.md`.
2. **Buat folder** `src/adapters/discord/` dengan `index.ts` berisi objek adapter (selector + fallback + quirks).
3. **Daftarkan** di `src/adapters/registry.ts`.
4. **Tambah host** di `src/shared/platform-ids.ts` dan `manifest.config.ts` (match pattern dibuat otomatis dari `CONTENT_MATCH_PATTERNS`).
5. **Tambah label** di `PLATFORM_LABELS` dan masukkan ke `MVP_PLATFORMS` bila siap.
6. **Tambah fixture** di `tests/fixtures/dom/discord/` (setelah e2e dibuat).
7. **Uji** dengan checklist, probe, dan audit privasi.

**Tidak perlu mengubah** `src/core/`. Jika sampai perlu, itu tanda kontrak adapter kurang lengkap dan harus dievaluasi.

## 8.5 Yang Sengaja Tidak Ada

| Tidak ada | Alasan |
|---|---|
| Folder `utils/` serba guna | Menjadi tempat sampah; fungsi diberi nama sesuai domain |
| State manager global (Redux/Zustand) | State kecil; cukup storage + state machine |
| Folder `hooks/` | Bukan React |
| UI framework di popup | Overhead tidak sepadan |
| Folder aset dekoratif | Anti-slop; ikon dibuat sebagai SVG inline |
| `_locales/` pada MVP | i18n masuk P1; menambahkannya sekarang hanya menambah file tanpa fungsi |
