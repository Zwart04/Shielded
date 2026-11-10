# 06 — Analisis Kompatibilitas Platform

> **Penting:** Bagian ini membedakan karakter umum SPA (fakta teknis yang berlaku luas) dari detail DOM spesifik per situs yang **harus diverifikasi langsung**. Tidak ada nama kelas atau struktur DOM yang diklaim pasti di dokumen ini.

## 6.1 Karakter Umum Platform Target

Semua platform target adalah **Single Page Application (SPA)** yang:

- Memuat konten secara dinamis setelah halaman awal.
- Mengubah URL tanpa reload penuh (`history.pushState`).
- Meng-unmount dan me-render ulang sebagian DOM (virtual list pada daftar pesan).
- Memakai nama kelas CSS yang dihasilkan build tool (sering berubah antar rilis).
- Memiliki tema terang dan gelap.

**Implikasi arsitektur:** proteksi tidak boleh bergantung pada satu selektor statis. Harus ada resolver multi-kandidat dan fallback.

## 6.2 Tingkat Risiko per Platform

### WhatsApp Web — Risiko TINGGI

- **Karakter:** SPA React dengan nama kelas yang di-obfuscate dan berubah antar build. Sebagian besar identifikasi harus mengandalkan atribut semantik (`role`, `aria-label`), hierarki struktural, dan geometri layout.
- **Risiko utama:** selektor cepat rusak setelah update WhatsApp.
- **Mitigasi:** beberapa kandidat selektor; fallback mode area (blur panel chat penuh); health-check; fixture DOM untuk regresi.

### Telegram Web — Risiko SEDANG

- **Karakter:** Ada dua basis klien web (WebK dan WebZ) dengan DOM berbeda. Perlu verifikasi keduanya.
- **Risiko utama:** perbedaan struktur antar basis klien.
- **Mitigasi:** dua set selektor dalam satu adapter; deteksi basis klien lewat penanda di DOM/URL.

### Instagram DM — Risiko SEDANG

- **Karakter:** SPA React; DM berada di route `/direct/*`. Media dimuat progresif.
- **Risiko utama:** perubahan struktur pada halaman DM; perilaku modal.
- **Mitigasi:** selektor berbasis struktur kolom; verifikasi route change.

### Facebook Messenger — Risiko TINGGI

- **Karakter:** SPA besar dengan DOM sangat dinamis dan class generator.
- **Mitigasi:** fallback area-first; verifikasi menyeluruh sebelum rilis P1.

### X / Twitter DM — Risiko SEDANG-RENDAH

- **Karakter:** SPA React dengan `aria-label` yang relatif deskriptif dan class berprefix konsisten.
- **Mitigasi:** standar; verifikasi tetap diperlukan.

### Threads DM — Risiko SEDANG

- **Karakter:** SPA React; ketersediaan DM di web dapat berbeda per wilayah/versi.
- **Catatan:** **[Perlu Verifikasi]** apakah DM web tersedia penuh; jika tidak, platform ini ditunda.

### TikTok DM — Risiko SEDANG-TINGGI

- **Karakter:** SPA dengan komponen terfragmentasi; beberapa bagian mungkin dimuat dalam modal/overlay.
- **Catatan:** **[Perlu Verifikasi]** struktur DM dan perilaku modal.

## 6.3 Matriks Kompatibilitas

| Platform | Domain | Status MVP | Zona yang ditargetkan | Verifikasi |
|---|---|---|---|---|
| WhatsApp Web | `web.whatsapp.com` | P0 | Kolom pesan, daftar chat | Wajib |
| Telegram Web | `web.telegram.org` | P0 | Kolom pesan, daftar chat | Wajib (2 basis) |
| Instagram DM | `instagram.com` | P0 | Kolom pesan, daftar DM | Wajib |
| Facebook | `facebook.com` | P1 | Kolom pesan, daftar chat | Wajib |
| X / Twitter | `x.com`, `twitter.com` | P1 | Kolom pesan, daftar DM | Wajib |
| Threads | `threads.net`, `threads.com` | P2 | Kolom pesan, daftar DM | Wajib + cek ketersediaan |
| TikTok | `tiktok.com` | P2 | Kolom pesan, daftar DM | Wajib |

## 6.4 Pola Teknis yang Harus Ditangani

### a. Routing SPA

Perubahan halaman tidak memicu event `load`. Deteksi dilakukan dengan:

1. Pengecekan `location.href` berkala (250–500 ms) **hanya saat tab terlihat**.
2. `MutationObserver` pada root aplikasi.

**Opsi lanjutan (ditunda):** patch `history.pushState` di MAIN world. Tidak dipakai pada MVP karena menambah permukaan interaksi dengan kode situs. Hanya dipertimbangkan jika polling terbukti tidak cukup untuk platform tertentu.

### b. Virtual list pesan

Hanya sebagian pesan ada di DOM. Karena efek diterapkan pada **container zona**, bukan per bubble, pesan yang di-mount/di-unmount tidak memengaruhi stabilitas efek.

### c. Lazy media

Media dimuat setelah terlihat. Overlay berada di atas kotak media, sehingga waktu pemuatan tidak relevan.

### d. Portal / modal

Beberapa platform me-render dialog lewat root terpisah. Adapter harus mendeklarasikan apakah ada portal yang perlu ditangani.

### e. Tema situs

Overlay harus menyesuaikan tema terang/gelap situs. Solusi: warna overlay memakai `color-scheme` dan media query, atau varian kelas yang dipilih dari preferensi pengguna.

## 6.5 Checklist Verifikasi per Platform

Dijalankan manual sebelum adapter dinyatakan selesai:

- [ ] Zona terdeteksi saat first-load.
- [ ] Zona terdeteksi setelah navigasi SPA (buka chat lain, kembali ke inbox).
- [ ] Zona terdeteksi saat deep-link langsung.
- [ ] Pesan baru muncul → tetap terlindungi.
- [ ] Scroll jauh (virtual list) → tetap terlindungi.
- [ ] Media lambat dimuat → overlay menutup area dengan benar.
- [ ] Composer tetap dapat difokuskan dan diketik.
- [ ] Klik pada elemen lain tidak terblokir overlay.
- [ ] Tema terang dan gelap situs.
- [ ] Tidak ada error console 30 menit pemakaian.
- [ ] Menonaktifkan platform menghapus semua efek.

## 6.6 Prosedur Jika Platform Tidak Dapat Diverifikasi

Jika DM web tidak tersedia atau struktur tidak stabil:

1. Tandai platform sebagai **"Segera"** di dashboard (disabled, dengan penjelasan).
2. Jangan rilis adapter setengah jadi.
3. Catat temuan di `selectors-runbook.md`.

## 6.7 Ekspansi Platform Baru (mis. Discord Web)

Langkah menambahkan platform:

1. Verifikasi DOM dengan checklist 6.5.
2. Buat folder `src/adapters/<platform>/` berisi `index.ts`, `selectors.ts`, `rules.ts`.
3. Daftarkan di `src/adapters/registry.ts`.
4. Tambahkan pola host di `manifest.config.ts`.
5. Tambahkan baris platform di `src/ui/dashboard/sections/platforms.ts`.
6. Tambahkan fixture DOM di `tests/fixtures/dom/<platform>/`.

Tidak ada perubahan pada `src/core/` — ini kriteria utama keberhasilan arsitektur.
