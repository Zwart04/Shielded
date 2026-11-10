# 13 — Rencana Pengujian & Acceptance Criteria

## 13.1 Strategi

- **Unit test** untuk logika murni: resolver selektor, rules, storage migrate, state machine, derivasi bagian baris chat.
- **Smoke DOM** untuk memastikan overlay per item stabil di deteksi berulang (`zones` tidak berubah-ubah).
- **Fixture replay** untuk regresi selektor tanpa membuka situs asli: snapshot DOM tersanitasi.
- **E2E Playwright** untuk alur pengguna pada halaman fixture.
- **Uji manual terstruktur** pada platform asli sebelum setiap rilis.
- **Audit privasi otomatis** di CI.

## 13.2 Matriks Pengujian

| Area | Metode | Kriteria Lolos |
|---|---|---|
| Chat normal tiap platform | Manual + e2e fixture | Zona terdeteksi; efek terlihat |
| DOM dinamis (pesan baru) | E2E + unit | Idempoten; tidak ada duplikasi overlay |
| SPA route change | E2E navigasi simulasi | State reset & rescan benar |
| Reload halaman | E2E | Proteksi kembali otomatis |
| Lazy media | Fixture media muncul setelah 3 s | Overlay tetap menutup |
| Hover reveal | E2E `page.hover` | Muncul < 150 ms; kembali ≤ 400 ms |
| Hover per item | E2E `page.hover` pada satu nama | Hanya item itu terbuka; preview/avatar/item lain tetap tertutup |
| Proteksi terpisah | Unit + e2e | Nama aktif tanpa ikut mengaburkan avatar/preview |
| Deteksi berulang | Smoke DOM + unit | Jumlah zona stabil; elemen berkelas `psx-zone` tetap valid |
| Klik-tahan | E2E mouse down/up | Sesuai durasi tahan |
| Shortcut | E2E + manual | Dua command berfungsi |
| Tab switch | E2E context switching | Protected sebelum frame terlihat |
| Window blur | Manual + e2e | Sesuai preferensi |
| Dark/light | E2E `colorScheme` | Kontras overlay memadai |
| Performa | DevTools Performance | Sesuai anggaran 12.5 |
| Memori | Heap snapshot | ≤ 15 MB tambahan |
| Regresi selektor | Unit fixture | Semua fixture lolos |
| Privasi | `verify-privacy.ts` | Nol temuan |
| Izin minimal | Review manifest | Sesuai daftar putih |

## 13.3 Fixture DOM

- Disimpan di `tests/fixtures/dom/<platform>/`.
- Berisi struktur minimal yang meniru area chat.
- **Tanpa** teks pesan nyata, nama, atau gambar pribadi.
- Diambil manual dari DOM publik setelah login uji, lalu disanitasi.

## 13.4 Uji Manual per Platform (wajib sebelum rilis)

Checklist dari `06` bagian 6.5, dijalankan pada:

- Chrome stabil terbaru (wajib).
- Edge (wajib untuk P1).
- Brave (opsional untuk MVP).

Durasi minimum: 30 menit pemakaian nyata per platform, termasuk scroll, kirim pesan, buka media, pindah tab.

## 13.5 Acceptance Criteria MVP

| ID | Kriteria | Bukti |
|---|---|---|
| AC-01 | Ekstensi terpasang dan popup terbuka | Screenshot + log |
| AC-02 | Onboarding ≤ 2 langkah, dapat dilewati | Rekaman |
| AC-03 | Proteksi aktif di 3 platform P0 | Uji manual |
| AC-04 | Hover reveal bekerja | Rekaman + E2E |
| AC-05 | Shortcut toggle & reveal bekerja | Uji manual |
| AC-06 | Auto-protect tab hidden & window blur | Uji manual |
| AC-07 | Popup toggle mengubah efek tanpa reload | E2E |
| AC-08 | Dashboard mengubah aturan tanpa reload | E2E |
| AC-09 | Nonaktifkan platform menghapus semua efek | Uji manual |
| AC-10 | Fail-open: situs tetap normal jika selector gagal | Uji dengan selector rusak |
| AC-11 | Tidak ada `fetch`/`<all_urls>`/`eval` | CI hijau |
| AC-12 | Tidak ada error console 30 menit | Log sesi |
| AC-13 | Kebijakan privasi & justifikasi izin siap | Dokumen ada |
| AC-14 | Dark mode lolos checklist aksesibilitas | Audit manual |
| AC-15 | Performa dalam anggaran | Profiling |

## 13.6 Definisi Selesai (Definition of Done)

Sebuah fitur dianggap selesai jika:

1. Kode di-review.
2. Unit test atau e2e terkait ada dan lolos.
3. Dokumentasi diperbarui (`docs/`).
4. Tidak menambah permission baru tanpa justifikasi.
5. Lolos `verify-privacy.ts`.
6. Diuji di minimal satu platform asli.

## 13.7 Gerbang Rilis

Sebelum beta:

- Semua AC-01…AC-15 hijau.
- Tidak ada bug P0 terbuka.
- Checklist anti-slop UI lolos.
- Kebijakan privasi dipublikasikan.

Sebelum stable:

- Beta 2 minggu tanpa bug kritis.
- Minimal 3 laporan bug selektor ditangani.
- Review toko diterima.

## 13.8 Pengujian Regresi Selektor

Setiap kali platform target berubah:

1. Jalankan fixture replay.
2. Jika ada fixture yang gagal, perbarui selector.
3. Tambahkan fixture baru dari DOM terbaru.
4. Catat perubahan di `selectors-runbook.md`.

## 13.9 Yang Tidak Diuji (dan alasannya)

- Kebocoran lewat screenshot: di luar cakupan teknis.
- Screen reader: dapat diuji untuk memastikan *hide* berfungsi, tetapi tidak dijanjikan untuk *blur*.
- Lingkungan jaringan: ekstensi tidak melakukan permintaan jaringan.
