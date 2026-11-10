# 05 — Lingkup MVP & Prioritas

## 5.1 Prinsip Penentuan Prioritas

1. **MVP harus kecil tetapi utuh secara alur.** Pengguna harus bisa: instal → onboarding → membuka platform → melihat proteksi → reveal → ubah pengaturan → menonaktifkan.
2. **Satu platform sulit lebih berharga daripada lima platform rapuh.** Kualitas adapter > jumlah adapter.
3. **Fitur yang menambah permukaan risiko tanpa nilai inti ditunda**, bukan dikerjakan setengah.

## 5.2 Matriks Prioritas

| Area | P0 (MVP) | P1 (1.1) | P2 (1.2+) |
|---|---|---|---|
| **Platform** | WhatsApp Web, Telegram Web, Instagram DM | Facebook Messenger, X DM | Threads, TikTok, Discord Web (evaluasi) |
| **Zona perlindungan** | Isi pesan, daftar percakapan | Nama, avatar, media, scope per-kolom | Element picker, aturan kustom |
| **Efek** | Blur, cover, hide | Intensitas blur (3 level) | Efek per-zona lanjutan |
| **Reveal** | Hover, shortcut reveal-all | Klik-tahan, reveal per-zona | Gesture khusus |
| **Otomasi** | Tab hidden, window blur, pulih otomatis | — | Jadwal berbasis jam kerja |
| **UI** | Popup, dashboard 1 halaman, onboarding | Indikator halaman, halaman pintasan & tentang penuh | Kustomisasi tema terbatas |
| **Infrastruktur** | Storage lokal, skema versi | i18n, CI penuh | Sync opt-in, port Firefox |

## 5.3 Definisi MVP (Checklist Rilis)

MVP dinyatakan selesai jika semua poin berikut terpenuhi:

- [ ] Ekstensi dapat dipasang di Chrome stabil terbaru.
- [ ] Onboarding berjalan ≤ 2 langkah dan dapat dilewati.
- [ ] Proteksi bekerja di 3 platform P0 pada mode Privasi.
- [ ] Reveal hover bekerja < 150 ms.
- [ ] Shortcut toggle & reveal berfungsi.
- [ ] Auto-protect pada tab hidden dan window blur berfungsi.
- [ ] Popup menampilkan status & toggle yang benar.
- [ ] Dashboard mengubah pengaturan dan efek langsung terlihat tanpa reload.
- [ ] Menonaktifkan platform benar-benar menghapus semua efek.
- [ ] Audit privasi: tidak ada `fetch`/XHR, tidak ada `<all_urls>`.
- [ ] Tidak ada error console selama sesi uji 30 menit per platform.
- [ ] Kebijakan privasi & justifikasi izin tersedia.

## 5.4 Yang Sengaja Dikeluarkan dari MVP

| Item | Alasan | Kapan |
|---|---|---|
| Element picker | Kompleks, butuh UI pemilihan & penyimpanan selektor | 1.2 |
| Sinkronisasi lintas perangkat | Menambah permukaan data keluar | 1.2 (opt-in) |
| Dukungan Firefox | Perbedaan MV3 signifikan | 2.0 |
| Jadwal otomatis | Kebutuhan belum terbukti | 1.2 (evaluasi) |
| Statistik penggunaan | Melanggar prinsip tanpa telemetri | Tidak direncanakan |
| Tema kustom lanjutan | Tidak menambah nilai inti | Tidak direncanakan |

## 5.5 Ketergantungan Antar Fitur

```
Core engine ──► Adapter platform ──► Popup toggle
     │                 │
     ├──► Effect renderer ──► Dashboard rules
     ├──► Focus watcher ──► Auto-protect
     └──► Selector resolver ──► Fallback area
```

- Dashboard tidak dapat diuji tanpa engine + minimal satu adapter.
- Auto-protect tidak dapat diuji tanpa focus watcher dan adapter.
- Karena itu urutan kerja Fase 1–2 harus mendahului Fase 3–4.

## 5.6 Estimasi Relatif (bukan waktu kalender)

Estimasi waktu sengaja tidak diberikan karena bergantung pada hasil verifikasi selektor dan ketersediaan tim. Yang dapat diberikan adalah bobot relatif:

| Pekerjaan | Bobot |
|---|---|
| Core engine + renderer | Tinggi |
| Adapter WhatsApp | Tinggi (DOM paling sulit) |
| Adapter Telegram | Sedang |
| Adapter Instagram | Sedang-tinggi |
| Popup | Rendah-sedang |
| Dashboard + design system | Sedang |
| Testing & hardening | Tinggi |
| Persiapan rilis toko | Sedang |
