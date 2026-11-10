# 04 — Product Requirements Document (PRD)

> **Produk:** Shielded — Ekstensi Perlindungan Privasi Pesan Web
> **Versi dokumen:** 1.0
> **Platform:** Chromium (Chrome, Edge, Brave)
> **Status:** Siap eksekusi untuk Fase 1–2

---

## 4.1 Ikhtisar Produk

Shielded adalah ekstensi Manifest V3 yang memberi pengguna kendali visual atas antarmuka pesan web. Ekstensi menerapkan blur/cover/hide pada elemen yang dipilih, menyediakan reveal sementara, dan mengaktifkan proteksi otomatis saat tab atau jendela kehilangan fokus.

**Di luar cakupan produk:** enkripsi, keamanan akun, perlindungan dari screenshot/screen sharing, pemantauan, moderasi konten.

## 4.2 Visi & Nilai Inti

**Visi:** Pengguna dapat mengobrol di web tanpa khawatir isi layar terbaca orang lain, tanpa mengorbankan kenyamanan.

**Nilai inti:**

1. Privasi visual sebagai hak pengguna.
2. Local-first sebagai arsitektur, bukan slogan.
3. Kejujuran tentang batas perlindungan.
4. Tidak mengganggu alur kerja pengguna.

## 4.3 Target Pengguna

| Segmen | Karakteristik | Kebutuhan utama |
|---|---|---|
| Profesional kantor | Meja terbuka, banyak chat klien | Proteksi cepat, otomatis saat pindah tab |
| Mahasiswa/pekerja lepas | Ruang publik, sering ganti lokasi | Preset cepat, kontrol shortcut |
| Peserta rapat daring | Sering share screen | Mode maksimum, panic blur |
| Pengguna teknis | Peduli audit | Transparansi kode & izin |

## 4.4 Pain Point

Lihat `02-konsep-dan-posisi-produk.md` bagian 2.5. Ringkasnya: kebocoran visual isi pesan, daftar chat, media, dan ketiadaan alat yang granular serta konsisten.

## 4.5 Skenario Pengguna

1. **S — desainer di kantor terbuka.** Membuka WhatsApp Web, mode Privasi aktif. Isi pesan blur; hover untuk melihat detail; pindah ke Figma → otomatis blur kembali.
2. **R — account executive.** Rapat via screen share. Mode Maksimum: seluruh zona tertutup solid; reveal hanya lewat shortcut yang ditekan saat benar-benar perlu.
3. **D — mahasiswa di kafe.** Pindah tab ke dokumen tugas; tab chat otomatis terlindung; kembali → pulih otomatis.
4. **A — freelancer di rumah.** Mode Normal, tetapi tetap menyembunyikan avatar karena mengganggu.
5. **M — pengguna teknis.** Menonaktifkan proteksi untuk Instagram, mempertahankannya untuk WhatsApp.

## 4.6 User Stories & Acceptance Criteria

| ID | Sebagai | Saya ingin | Sehingga | Acceptance Criteria |
|---|---|---|---|---|
| US-01 | pengguna baru | langsung bisa mengatur dari popup setelah instal | tidak membuang waktu | Semua platform nonaktif setelah instal; popup terbuka < 1 detik; tidak ada halaman pengaturan kedua |
| US-02 | pengguna WA Web | isi pesan otomatis blur saat halaman dibuka | tanpa klik | ≤ 5 detik setelah load, zona isi pesan terlindungi pada mode Privasi |
| US-03 | pengguna | melihat sementara dengan hover | tanpa klik | Reveal < 150 ms; kembali blur ≤ 400 ms setelah pointer keluar |
| US-04 | pengguna | konten terlindungi saat pindah tab | tidak terlihat sekilas | Setelah `visibilitychange → hidden`, proteksi aktif sebelum frame berikutnya; diverifikasi dengan uji screenshot terjadwal |
| US-05 | pengguna | toggle manual satu klik | kendali total | Klik ikon → popup → toggle; badge berubah; efek berubah tanpa reload |
| US-06 | pengguna | shortcut reveal & toggle | tanpa mouse | Dua command terdaftar; berfungsi di tab platform aktif; remap lewat halaman Chrome |
| US-07 | pengguna | mengelola aturan per platform | fleksibel | Popup menampilkan 7 logo platform; platform aktif ditandai titik; zona diatur per platform |
| US-08 | pengguna | proteksi tidak mengganggu mengetik/klik | pekerjaan normal | Fokus masuk ke composer; klik tidak terblokir; navigasi SPA normal |
| US-09 | pengguna | data tidak dikirim ke mana pun | tenang | Manifest tanpa `<all_urls>`; tidak ada `fetch`/XHR; lolos audit CI |
| US-10 | pengguna | memahami batas perlindungan | ekspektasi realistis | Halaman Tentang menyebut screenshot, screen sharing, screen reader, perangkat fisik |

## 4.7 Persyaratan Fungsional

| ID | Persyaratan | Prioritas |
|---|---|---|
| FR-01 | Deteksi platform & inisialisasi adapter pada tab yang cocok | P0 |
| FR-02 | Terapkan rule (blur/cover/hide) termasuk pada elemen dinamis | P0 |
| FR-03 | Reveal: hover (P0), shortcut (P0), klik-tahan (P1) | P0/P1 |
| FR-04 | Auto-protect pada `visibilitychange` & `window blur`, dengan opsi pulih | P0 |
| FR-05 | Popup: status + toggle cepat | P0 |
| FR-06 | Popup: platform, level, zona, tampilan, pintasan, tentang | P0 |
| FR-07 | Persistensi via `chrome.storage.local`; sync opt-in (P2) | P0/P2 |
| FR-08 | Nonaktifkan proteksi per platform | P0 |
| FR-09 | Indikator mini di halaman | P1 |
| FR-10 | i18n id/en | P1 |
| FR-11 | Element picker | P2 |
| FR-12 | Panic blur (shortcut) | P1 |

## 4.8 Persyaratan Non-Fungsional

| Kategori | Target | Cara verifikasi |
|---|---|---|
| Performa inisialisasi | ≤ 300 ms setelah `document_idle` | DevTools Performance |
| Performa reapply | ≤ 10 ms per batch mutasi | Profiling dengan fixture |
| Memori | ≤ 15 MB tambahan per tab aktif | Heap snapshot 10 menit |
| Fail-open | Situs tetap berfungsi meski selektor gagal | Uji dengan selektor sengaja dirusak |
| Aksesibilitas | Kontras ≥ 4.5:1; navigasi keyboard penuh | axe / uji manual |
| Keandalan | Tidak ada error console yang dipicu ekstensi selama 30 menit | Sesi uji manual |
| Kompatibilitas | Chrome stabil terbaru, Edge, Brave | Uji di 3 browser |

## 4.9 Persyaratan Privasi & Keamanan

1. Semua logika berjalan lokal; tidak ada server.
2. `chrome.storage.local` hanya menyimpan preferensi tampilan.
3. Tidak ada telemetri, analitik, atau crash reporting ke server.
4. Tidak ada pembacaan konten pesan; tidak ada penyimpanan teks.
5. Least privilege: hanya `storage` + host permission 7 domain.
6. Content script hanya didaftarkan untuk domain target.
7. Tidak ada remote code (**Fakta:** dilarang MV3); semua JS dibundel.
8. Halaman ekstensi tidak memuat resource eksternal.
9. Kebijakan privasi & justifikasi izin tersedia sebelum rilis.

## 4.10 Kompatibilitas Browser

| Browser | Status | Catatan |
|---|---|---|
| Chrome (stabil terbaru) | **P0** | Target utama |
| Edge | P1 | Chromium; perlu uji toko |
| Brave | P1 | Chromium; perlu uji |
| Opera / Vivaldi | P2 | Uji ad-hoc |
| Firefox | P3 | Perbedaan MV3 (event page vs service worker, host permission saat instal) |
| Safari | Di luar cakupan | API berbeda |

## 4.11 Matriks Kompatibilitas Platform

| Platform | URL | Risiko DOM | Status |
|---|---|---|---|
| WhatsApp Web | `web.whatsapp.com` | Tinggi (class ter-obfuscate) | Tersedia |
| Telegram Web | `web.telegram.org` | Sedang (dua basis klien) | Tersedia |
| Instagram (feed + DM) | `instagram.com` | Sedang | Tersedia |
| Facebook (feed + Messenger) | `facebook.com` | Tinggi | Tersedia |
| X / Twitter DM | `x.com`, `twitter.com` | Sedang-rendah | Tersedia (verifikasi sebagian) |
| Threads DM | `threads.net`, `threads.com` | Sedang | Tersedia |
| TikTok DM | `tiktok.com` | Sedang-tinggi | Tersedia |

Detail risiko & checklist verifikasi ada di `06-analisis-kompatibilitas-platform.md`.

## 4.12 Lingkup MVP

Lihat `05-lingkup-mvp-dan-prioritas.md` untuk rincian P0/P1/P2.

Ringkas: 7 platform, efek blur/cover/hide, reveal hover + shortcut, auto-protect, satu popup, storage lokal.

## 4.13 Rencana Versi

| Versi | Isi |
|---|---|
| **1.0 (MVP)** | 7 platform, fitur inti, popup (tanpa halaman pengaturan kedua) |
| **1.1** | Facebook + X, nama/avatar/media, i18n, indikator halaman, panic |
| **1.2** | Threads + TikTok, element picker, sync opt-in |
| **2.0** | Port Firefox, evaluasi platform lain (Discord Web) |

## 4.14 Acceptance Criteria Umum

- Semua US-01…US-10 lolos.
- Semua FR P0 terimplementasi dan teruji.
- Audit privasi CI hijau (tanpa fetch, tanpa `<all_urls>`).
- Tidak ada regresi pada situs (fail-open terbukti).
- Dokumen kebijakan privasi & justifikasi izin siap.

## 4.15 Risiko Teknis

Lihat `15-risiko-dan-ekspansi.md`. Risiko tertinggi: perubahan DOM platform, performa pada SPA sibuk, dan review toko untuk host permission.

## 4.16 Prioritas Pengembangan

Urutan eksekusi: **core engine → adapter WhatsApp → UX toggle & reveal → adapter Instagram → adapter Telegram → popup → hardening → rilis beta**.

Alasan: WhatsApp adalah kasus tersulit (class ter-obfuscate). Jika arsitektur bertahan di sana, platform lain lebih mudah. Namun untuk validasi cepat, adapter Telegram (DOM lebih stabil) dapat dikerjakan lebih dulu sebagai proof-of-concept engine.
