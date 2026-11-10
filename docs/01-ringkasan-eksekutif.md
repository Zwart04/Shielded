# 01 — Ringkasan Eksekutif

## 1.1 Masalah

Pengguna membuka WhatsApp Web, Telegram Web, Instagram DM, Facebook Messenger, Threads DM, TikTok DM, dan X DM di komputer. Di lingkungan dengan orang lain di sekitar — kantor terbuka, kafe, perpustakaan, transportasi umum — **isi obrolan, nama kontak, avatar, dan pratinjau media terbaca langsung dari layar**.

Tiga skenario pemicu yang paling sering:

1. **Meja terbuka / kolam kantor:** monitor menghadap lorong; satu notifikasi masuk memperlihatkan nama dan potongan pesan.
2. **Berpindah tab:** pengguna membuka tab lain untuk bekerja; tab obrolan tetap terbuka dan terlihat saat kembali.
3. **Meninggalkan meja:** pengguna berdiri sebentar tanpa mengunci layar.

Alat yang ada di pasaran umumnya menawarkan dua ekstrem: blur seluruh halaman (mengganggu navigasi) atau tidak ada proteksi sama sekali. Tidak ada kontrol granular per elemen, dan tidak ada perilaku konsisten antar platform.

## 1.2 Solusi

Shielded adalah ekstensi Chromium (Manifest V3) yang:

- **Menerapkan efek visual** (blur / cover / hide) pada elemen yang dipilih pengguna di area pesan.
- **Memulihkan tampilan sementara** lewat hover, klik-tahan, atau pintasan keyboard.
- **Mengaktifkan proteksi otomatis** saat tab tersembunyi atau jendela kehilangan fokus, dengan opsi pulih otomatis.
- **Menyimpan pengaturan secara lokal** (`chrome.storage.local`) tanpa server.

## 1.3 Diferensiasi

| Aspek | Alat blur umum | Shielded |
|---|---|---|
| Granularitas | Seluruh halaman | Per zona: isi pesan, daftar chat, identitas, media |
| Konsistensi | Satu situs | Satu model pengaturan untuk banyak platform |
| Otomasi | Manual | Tab hidden + window blur, dengan kontrol penuh |
| Transparansi | Klaim berlebihan | Menyatakan batas perlindungan secara eksplisit |

## 1.4 Cakupan MVP

**Termasuk (P0):**

- Mesin privasi inti + kerangka adapter platform.
- 7 platform: **WhatsApp Web, Telegram Web, Instagram DM, Facebook Messenger, X DM, Threads DM, TikTok DM**.
- Efek blur/cover/hide pada isi pesan dan daftar percakapan.
- Reveal: hover, shortcut, pemulihan otomatis.
- Auto-protect: tab tersembunyi + jendela kehilangan fokus.
- Satu popup sebagai satu-satunya panel pengaturan. Semua platform nonaktif saat instalasi.
- Penyimpanan lokal untuk preferensi.

**Tidak termasuk MVP:**

- Element picker kustom (P2).
- Sinkronisasi lintas perangkat (P2, opt-in).
- Dukungan Firefox (P3).

## 1.5 Prinsip Kejujuran

Dokumen ini membedakan secara tegas:

- **Apa yang dilindungi:** tampilan visual elemen di layar browser.
- **Apa yang tidak dilindungi:** tangkapan layar, screen recording, berbagi layar, pembaca layar, akses DevTools, salin-tempel, keamanan akun, enkripsi komunikasi, keamanan perangkat.

Klaim ini harus muncul di halaman *About & Privacy* dan deskripsi Chrome Web Store.

## 1.6 Ukuran Keberhasilan (indikator, bukan target karangan)

Karena produk tanpa telemetri, keberhasilan diukur dari sinyal yang tersedia secara lokal/komunitas:

- Rasio penyiapan awal (menyalakan platform pertama) diukur manual lewat sesi uji terbatas.
- Jumlah laporan bug selektor per platform per rilis (semakin sedikit semakin baik).
- Ulasan toko yang menyebut "tidak mengganggu" vs "tidak berfungsi".
- Retensi 7 hari pada kelompok beta terbatas (survei, bukan tracking).

Tidak ada metrik yang membutuhkan pengumpulan data pengguna.
