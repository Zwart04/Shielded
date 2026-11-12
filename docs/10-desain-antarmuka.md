# 10 — Desain Antarmuka

> Semua layar memakai token dari `09-design-system.md`. Tidak ada warna, radius, atau spasi di luar skala.

Ada **dua** permukaan UI di versi 0.1.0: popup (satu-satunya panel pengaturan) dan halaman kebijakan privasi statis. Dashboard dan onboarding sudah dihapus; jangan menambahkannya kembali tanpa alasan produk yang kuat.

---

## 10.1 Browser Popup

### Ukuran & Struktur
- Lebar tetap **372px** (`--popup-w`), tinggi mengikuti konten.
- Satu kolom, padding 14px, jarak antar-kartu 12px.
- Saat platform nonaktif, tinggi popup ± 559px sehingga tidak perlu scroll.
- Saat platform aktif, daftar zona muncul dan popup memanjang (scroll di dalam popup).

### Layout (atas ke bawah)

1. **Header brand** — logo Shielded 24px di tile 32px, teks "Shielded", dan tombol tema bulat 34px (ikon matahari/bulan sesuai tema yang akan dipilih).
2. **Kartu platform**
   - Tile logo platform 42px, nama platform, status kecil ("Nonaktif" / "Aktif · N zona terlindungi"), switch master di kanan.
   - Baris chip berisi **7 logo platform** dengan pemisah garis di atasnya. Chip terpilih memakai latar `--surface-2`; chip yang platformnya aktif menampilkan titik kecil `--ink` di bawah logo.
3. **Segmented level** — Normal / Privasi / Maksimum dalam kartu putih. Pilihan aktif memakai latar `--ink` (hitam di tema terang, putih di tema gelap) dengan teks `--on-ink`.
4. **Kartu zona** — 9 baris berikon: Isi pesan, Seluruh baris chat, Preview pesan, Nama kontak, Foto profil, Preview media, Galeri media, Konten feed, Kotak ketik. Setiap baris punya switch sendiri dan sub-teks "Dilindungi" / "Terlihat".
   - Bila platform nonaktif, daftar baris **disembunyikan** dan diganti satu catatan: "Nyalakan platform di atas untuk memilih bagian yang ingin disembunyikan."
5. **Opsi lanjutan** (`<details>`) — kekuatan blur (Ringan/Sedang/Kuat), hover membuka item, tautan pintasan keyboard, tautan kebijakan privasi. Ikon chevron berputar 180° saat terbuka.
6. **Kartu support** — latar hangat, ikon kopi, "Suka Shielded?" / "Traktir kopi lewat Tako", tombol pil "Buka" menuju `https://tako.id/Zwart04/gift`.
7. **Footer** — "Privasi lokal · Tanpa telemetri" (`10.5px`, `--text-3`, rata tengah).

### Interaksi
- Semua perubahan langsung disimpan ke `chrome.storage.local` dan diterapkan tanpa reload.
- Switch master mengaktifkan/menonaktifkan proteksi hanya untuk platform yang dipilih di kartu, bukan seluruh platform.
- Klik chip mengganti platform yang sedang diatur tanpa menutup popup.
- Tombol tema menulis preferensi eksplisit `light`/`dark` (bukan `system`) agar pilihan tidak berubah sendiri.
- Klik di luar popup menutup popup (perilaku browser).

### State

| State | Tampilan |
|---|---|
| **Bawaan (semua nonaktif)** | 7 chip tanpa titik, status "Nonaktif", kartu zona berisi catatan singkat |
| **Platform aktif** | Status "Aktif · 9 zona terlindungi", 9 baris zona dengan switch aktif |
| **Loading** | Tiga skeleton (kartu lebar, baris, baris pendek); muncul < 150 ms |
| **Error storage** | Kartu banner "Preferensi tidak dapat dibaca." + tombol "Muat ulang" |

### Desktop
- Popup selalu 372px; tidak ada adaptasi khusus.

---

## 10.2 Halaman Privasi

- Halaman statis `ui/privacy/index.html`, tanpa JavaScript.
- Kolom maksimum 720px, padding `--sp-7`/`--sp-4`.
- Isi: ringkasan, data yang disimpan, data yang tidak diakses, izin (`storage` + host platform + `commands`), batas perlindungan.
- Tidak ada banner, toast, atau state dinamis.

---

## 10.3 Zona Per Item

Sembilan zona, masing-masing berdiri sendiri:

| Zona | Ikon | Perilaku bawaan (Privasi) |
|---|---|---|
| Isi pesan | balon pesan | Blur |
| Seluruh baris chat | daftar | Terlihat |
| Preview pesan | balon dengan garis | Blur |
| Nama kontak | pengguna | Blur |
| Foto profil | gambar | Blur (intensitas lebih kuat) |
| Preview media | gambar kecil | Blur |
| Galeri media | gambar besar | Blur |
| Konten feed | feed | Terlihat (feed bukan percakapan) |
| Kotak ketik | kotak teks | Blur |

Aturan:
- Zona yang bertumpuk tidak digandakan; elemen di dalam item terlindungi tidak diproses ulang.
- Hover hanya membuka item yang disorot, bukan seluruh zona.
- Menonaktifkan platform menghapus semua kelas efek dan menghentikan observer.

---

## 10.4 Level Perlindungan

| Level | Ringkasan |
|---|---|
| Normal | Tidak ada zona yang dilindungi |
| Privasi | 7 zona: pesan, preview, nama, avatar, preview media, galeri media, kotak ketik |
| Maksimum | Pesan/preview/media memakai cover; nama dan avatar disembunyikan |

- Segmented di popup menerapkan preset ke **semua** platform, tetapi status aktif/nonaktif tiap platform dipertahankan.
- Setelah preset diterapkan, pengguna masih bisa menyalakan/mematikan zona satu per satu.

---

## 10.5 Pengaturan Lanjutan (di dalam popup)

| Kontrol | Nilai | Catatan |
|---|---|---|
| Kekuatan blur | Ringan / Sedang / Kuat | Berlaku semua platform |
| Hover membuka item | aktif/nonaktif | Bila mati, item hanya terbuka lewat pintasan |
| Pintasan keyboard | membuka `chrome://extensions/shortcuts` | Chrome tidak mengizinkan remap programatik |
| Kebijakan privasi | membuka `ui/privacy/index.html` | Halaman statis |

Auto-protect (tab tersembunyi, jendela kehilangan fokus) tetap aktif dan disimpan di preferensi, tetapi tidak diekspos sebagai kontrol popup agar panel tetap ringkas.

---

## 10.6 Prinsip Error

Error selalu **lokal** di dalam popup (toast atau banner), tidak pernah modal penuh yang memblokir seluruh UI.
