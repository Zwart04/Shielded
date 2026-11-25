# Kompatibilitas Browser

Dokumen ini menjelaskan target browser Shielded, perbedaan manifest, dan batas
verifikasi yang sudah dilakukan.

## 1. Matriks Dukungan

| Browser | Mesin | Paket | Versi minimum | Status |
|---|---|---|---|---|
| Chrome | Chromium | `shielded-<versi>-chromium.zip` | 110 | Didukung |
| Microsoft Edge | Chromium | `shielded-<versi>-chromium.zip` | 110 | Didukung |
| Brave | Chromium | `shielded-<versi>-chromium.zip` | 110 | Didukung + diuji |
| Opera | Chromium | `shielded-<versi>-chromium.zip` | 110 | Didukung |
| Vivaldi | Chromium | `shielded-<versi>-chromium.zip` | 110 | Didukung |
| Firefox | Gecko | `shielded-<versi>-firefox.zip` | 140 | Didukung + diuji pasang |
| Firefox for Android | Gecko | — | — | Tidak ditargetkan |
| Safari (macOS/iOS) | WebKit | — | — | Belum didukung |

Safari memakai format ekstensi sendiri (Xcode + `safari-web-extension-converter`)
dan tidak memuat manifest MV3 secara langsung. Itu pekerjaan terpisah, bukan
sekadar penyesuaian manifest.

## 2. Perbedaan Manifest

Kedua target dibangun dari satu sumber, `manifest.config.ts`, dengan
`createManifest(browser)`:

| Kunci | Chromium | Firefox |
|---|---|---|
| `background` | `service_worker: "background.js"`, `type: "module"` | `scripts: ["background.js"]` (event page) |
| Format bundel background | ESM | IIFE |
| `minimum_chrome_version` | Ada (`"110"`) | Tidak ada (bukan kunci Firefox) |
| `browser_specific_settings.gecko` | Tidak ada | `id`, `strict_min_version: "140.0"`, `data_collection_permissions` |
| `content_security_policy.extension_pages` | `script-src 'self'; object-src 'self'` | Sama |
| Izin | `storage`, `scripting` + 19 host | Sama |

Firefox belum mengimplementasikan `background.service_worker`. Karena itu
bundel background Firefox dibuat IIFE dan dimuat sebagai event page lewat
`background.scripts`.

## 3. Perbedaan API

Firefox menyediakan namespace `browser` berbasis Promise, sedangkan Chromium
hanya `chrome`. Agar satu basis kode tetap jalan di keduanya, setiap bundel
mendapat banner:

```js
var __psxApi = globalThis.browser || globalThis.chrome;
```

dan esbuild mengganti identifier `chrome` menjadi `__psxApi`. Dengan begitu
seluruh `await chrome.storage.local.get(...)` tetap bekerja:

- Chromium: `chrome` (MV3 sudah mengembalikan Promise).
- Firefox: `browser` (Promise).

Banner memakai `var`, bukan `const`, supaya penyuntikan ulang `content.js`
tidak melempar `SyntaxError` karena deklarasi ganda.

Perbedaan lain yang ditangani:

- **Halaman pintasan:** Chromium membuka `chrome://extensions/shortcuts`;
  Firefox membuka `about:addons` dengan cadangan artikel dukungan Mozilla.
- **Query tab:** `tabs.query` di Firefox dapat ditolak sebelum izin situs
  diberikan; semua pemanggilan di background dibungkus `try/catch` agar badge
  atau injeksi yang gagal tidak mematikan event page.

## 4. Izin Situs di Firefox

Di Firefox, `host_permissions` pada MV3 bersifat *opt-in*. Pengguna dapat
memberi atau mencabut akses per situs. Bila blur tidak muncul setelah add-on
dipasang:

1. Buka `about:addons`.
2. Pilih **Shielded**.
3. Buka tab **Izin / Permissions**.
4. Aktifkan akses untuk domain platform yang dipakai.

Content script deklaratif tidak akan berjalan di domain yang izinnya belum
diberikan. Ini berbeda dari Chromium, yang memberikan host permission saat
instalasi.

## 5. Pemasangan Permanen

| Browser | Unpacked / sementara | Permanen |
|---|---|---|
| Chromium | Ya, Mode developer | Perlu publikasi Web Store atau kebijakan enterprise |
| Firefox | Ya, `about:debugging` (hilang saat browser ditutup) | Perlu tanda tangan Mozilla (AMO) |

Firefox menolak add-on tidak bertanda tangan untuk pemasangan permanen, jadi
paket `-firefox.zip` ditujukan untuk pemakaian sementara dan pengujian.

## 6. Bukti Verifikasi

| Pemeriksaan | Hasil |
|---|---|
| `web-ext lint` pada `dist-firefox` | 0 error, 0 notice; 1 peringatan khusus Android (`data_collection_permissions` belum didukung di Android) |
| Pemasangan di Firefox 161 (headless) | `Installed .../dist-firefox as a temporary add-on`, id `shielded@zwart04.github.io` |
| Pemuatan paket Chromium hasil ekstrak zip | Service worker `background.js` aktif (target CDP muncul) |
| Pemuatan folder induk (salah pilih) | Tidak ada ekstensi termuat — inilah penyebab pesan "Tidak dapat memuat manifes" |
| Fungsional Chromium (DOM sintetis WhatsApp) | 12 zona muncul tanpa reload setelah switch dinyalakan |
| `npm run verify:package` | Manifest + seluruh berkas rujukan valid di kedua target |

Yang belum diuji: blur langsung di Firefox pada akun platform asli (butuh
login), dan seluruh keluarga Safari.

## 7. Kesalahan Umum Saat Memasang

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| "Tidak dapat memuat manifes" | Folder yang dipilih tidak berisi `manifest.json` (zip belum diekstrak, atau memilih folder induk) | Pilih folder `shielded-<versi>-<browser>` hasil ekstrak |
| Ekstensi termuat, popup normal, blur tidak muncul (Firefox) | Izin situs belum diberikan | `about:addons` → Shielded → Izin |
| Perubahan kode tidak terlihat | `dist/` belum dibangun ulang atau kartu ekstensi belum dimuat ulang | `npm run build` lalu **Muat ulang** |
| Ikon tidak muncul di toolbar | Belum disematkan | Menu ekstensi → sematkan Shielded |
