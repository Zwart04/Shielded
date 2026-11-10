# 10 — Desain Antarmuka per Layar

> Semua layar memakai token dari `09-design-system.md`. Tidak ada warna, radius, atau spasi di luar skala.

---

## 10.1 Browser Popup

### Ukuran & Struktur
- Lebar tetap **320px**; tinggi mengikuti konten, maksimum 560px.
- Satu kolom, padding `--sp-4`.
- Tanpa scroll kecuali daftar zona melebihi 5 baris.

### Layout (atas ke bawah)

1. **Header status**
   - Tile ikon brand platform (34px, latar warna brand lembut) di kiri judul.
   - Nama platform aktif, mis. "WhatsApp Web" (`--text-lg`, semibold).
   - Status: titik 6px + teks kecil (`--text-sm`, `--text-2`): "Terlindungi · 3 zona" / "Nonaktif".
   - Bila situs tidak didukung, tile memakai logo Shielded (ghost dengan bar sensor).

2. **Segmented preset** — Normal / Privasi / Maksimum.
   - Penuh lebar.
   - Perubahan langsung disimpan.

3. **Toggle utama** — "Perlindungan di situs ini".
   - Baris `Row` dengan switch di kanan.
   - Sub-teks: ringkasan efek aktif, mis. "Blur 2 zona".

4. **Daftar zona** (maks. 5 baris + media)
   - Setiap baris memakai ikon zona 26px: Isi pesan, Seluruh baris chat, Preview pesan, Nama kontak, Foto profil.
   - Masing-masing switch kecil dan berdiri sendiri; tidak ada penggabungan nama+avatar atau baris+preview.
   - Media ditandai "Segera" dan "Belum tersedia" → **badge, bukan switch mati**.

5. **Footer**
   - Ghost button dengan ikon gear: "Pengaturan lengkap" (membuka dashboard).
   - Teks kecil: "Reveal sementara: Alt+Shift+R".

### Interaksi
- Semua perubahan langsung tersimpan dan diterapkan.
- Toggle utama mematikan/menyalakan proteksi untuk platform di tab aktif saja.
- Klik di luar popup menutup popup (perilaku browser).

### State

| State | Tampilan |
|---|---|
| **Normal** | Seperti di atas |
| **Tab bukan platform** | Pesan 2 baris: "Situs ini tidak didukung." + tombol sekunder "Buka daftar platform" |
| **Platform dinonaktifkan** | Segmented dan daftar zona disabled; teks "Aktifkan untuk mengubah aturan" |
| **Loading** | Skeleton 2 baris; muncul < 150 ms |
| **Error storage** | Banner inline merah: "Preferensi tidak dapat dibaca" + tombol "Muat ulang" |

### Desktop
- Popup selalu 320px; tidak ada adaptasi khusus.

---

## 10.2 Dashboard (halaman penuh)

### Layout Desktop (≥ 720px)
- **Sidebar kiri** 216px: nama produk, nav vertikal (Privasi, Platform, Tampilan, Pintasan, Tentang).
- **Konten** maksimum 720px, rata kiri, padding `--sp-6`.
- **Tanpa topbar dekoratif.** Judul halaman langsung di konten.

### Layout Sempit (< 720px)
- Sidebar berubah menjadi segmented horizontal di atas konten.
- Konten padding `--sp-4`.

### Hirarki
1. Judul halaman (`--text-2xl`, semibold).
2. Deskripsi satu baris (`--text-md`, `--text-2`).
3. Maksimal 2–3 kartu per halaman.

### Navigasi
- Item aktif: latar `--surface-2`, teks `--text`, radius `--r-md`.
- Item non-aktif: teks `--text-2`, hover `--surface-2`.
- Setiap item memakai ikon garis 16–17px (shield, platform, tampilan, keyboard, info) + label; brand memakai logo Shielded (ghost + bar sensor, vektor).
- Ikon brand platform berwarna lembut di tile 34px (WhatsApp hijau, Telegram biru, Instagram merah muda), bukan warna teks penuh.

---

## 10.3 Privacy Settings

### Kartu 1 — Mode dasar
- Segmented preset (sama seperti popup).
- Di bawahnya, satu kalimat penjelasan per tier, berubah sesuai pilihan:
  - Normal: "Tidak ada yang disembunyikan."
  - Privasi: "Pesan, preview, dan nama kontak dikaburkan per item."
  - Maksimum: "Semua zona ditutup. Tampilkan hanya lewat pintasan."

### Kartu 2 — Otomatis
- Toggle: "Lindungi saat pindah tab" (default aktif).
- Toggle: "Lindungi saat jendela kehilangan fokus" (default aktif).
- Select: "Saat kembali ke tab" → Pulihkan otomatis / Tetap terlindung.
- Toggle (P1): "Tampilkan indikator mini di halaman".

### Kartu 3 — Reveal
- Toggle: "Tampilkan saat hover" (default aktif).
- Toggle: "Tampilkan saat klik-tahan" (default nonaktif).
- Slider: durasi reveal otomatis 1–10 detik (default 3), dengan nilai numerik di kanan.

### State
- Tidak ada empty state (selalu ada default).
- Error: banner di atas kartu + tombol "Coba lagi".

---

## 10.4 Platform Management

### Struktur
Satu kartu berisi daftar baris platform.

Setiap baris (`PlatformRow`):
- Tile ikon brand 34px di kiri.
- Nama platform (`--text-md`, medium).
- Status kecil di bawah: "Aktif · 3 zona" atau "Nonaktif" atau "Segera".
- Switch di kanan.
- Chevron untuk memperluas aturan (hanya jika platform tersedia).

### Panel yang diperluas
- Panel berlatar `--bg`, radius `--r-md`, menjorok sejajar teks (bukan di bawah ikon).
- Enam baris zona berikon: Isi pesan, Seluruh baris chat, Preview pesan, Nama kontak, Foto profil, Media.
- Setiap baris menjelaskan status "Dilindungi" / "Terlihat"; media memakai badge "Segera".
- Select efek: Blur / Selimut (cover). Intensitas blur diatur di halaman Tampilan.

### Daftar platform
| Urutan | Platform | Status MVP |
|---|---|---|
| 1 | WhatsApp | Aktif |
| 2 | Telegram | Aktif |
| 3 | Instagram | Aktif |
| 4 | Facebook | Segera (P1) |
| 5 | X | Segera (P1) |
| 6 | Threads | Segera (P2) |
| 7 | TikTok | Segera (P2) |

### Interaksi
- Switch platform → aktif/nonaktif total, langsung diterapkan.
- Perubahan aturan → disimpan instan; efek terlihat di tab platform yang terbuka.
- Baris "Segera" disabled dengan tooltip "Belum tersedia".

### State
- **Empty:** tidak berlaku.
- **Error:** toast "Gagal menyimpan" + nilai kembali ke sebelumnya.

---

## 10.5 Appearance Settings

### Kartu 1 — Tema
- Segmented: Sistem / Terang / Gelap.
- Default: Sistem.
- Perubahan langsung diterapkan ke seluruh UI ekstensi.

### Kartu 2 — Intensitas blur (P1)
- Segmented: Ringan (8px) / Normal (12px) / Kuat (20px).
- Berlaku pada semua platform yang memakai efek blur.
- Pada MVP, nilai tetap 12px dan kontrol ini berstatus disabled dengan keterangan "Segera".

### Kartu 3 — Warna selimut
- Segmented: Netral / Gelap.
- Hanya memengaruhi efek `cover`, bukan UI.

### Tidak ada
- Pilihan font.
- Pilihan ukuran UI.
- Warna aksen kustom.

Alasan: konsistensi dan anti-slop.

---

## 10.6 Keyboard Shortcuts

### Struktur
Tabel 3 baris:

| Aksi | Pintasan | Tombol |
|---|---|---|
| Aktif/nonaktifkan proteksi | Alt+Shift+S | Ubah |
| Tampilkan semua sementara | Alt+Shift+R | Ubah |
| Panic blur (P1) | — | Ubah |

### Perilaku tombol "Ubah"
- Membuka `chrome://extensions/shortcuts` di tab baru.
- **[Fakta]** Chrome tidak mengizinkan ekstensi mengubah shortcut secara programatik; UI harus menjelaskan ini.

### Catatan bawah
- "Pintasan harus unik. Jika bentrok, Chrome akan menandainya."

### State
- **Error:** jika `chrome.commands.getAll` gagal, tampilkan baris "Tidak dapat membaca pintasan" + tombol "Coba lagi".

---

## 10.7 About & Privacy

### Struktur
1. **Identitas:** nama, versi, tautan situs (jika ada).
2. **Dua kolom teks:**
   - "Yang Shielded lakukan" (✓): memblur elemen di layar; menyimpan pengaturan secara lokal; bekerja tanpa server.
   - "Yang Shielded tidak lakukan" (✗): membaca isi pesan; mengirim data; mengubah pengiriman pesan; melindungi dari screenshot/screen sharing/screen reader.
3. **Daftar izin:** setiap permission + satu kalimat alasan.
4. **Tautan:** Kebijakan Privasi, Lisensi, Sumber kode (jika open source).
5. **Batas perlindungan:** paragraf eksplisit.

### State
- Statis; tidak ada loading/error kecuali tautan gagal dibuka (tangani dengan pesan kecil).

---

## 10.8 Onboarding

### Langkah 1 — Pilih mode
- Judul: "Pilih tingkat perlindungan".
- Tiga kartu pilihan (Normal / Privasi / Maksimum) dengan satu kalimat masing-masing.
- Default terpilih: Privasi.
- Tombol primary: "Lanjut".

### Langkah 2 — Ringkasan
- Daftar platform yang aktif.
- Tiga baris penjelasan: "Aktif otomatis di tab ini", "Hover untuk melihat", "Alt+Shift+R untuk reveal".
- Tombol primary: "Mulai".
- Tautan ghost: "Lewati".

### Aturan
- Tidak ada langkah akun.
- Tidak ada layar marketing.
- Maksimal 2 langkah.

---

## 10.9 Ringkasan State Semua Layar

| Layar | Empty | Loading | Error |
|---|---|---|---|
| Popup | Tab non-platform | Skeleton 2 baris | Banner storage |
| Dashboard | — | — | Toast simpan |
| Privacy | — | — | Banner storage |
| Platforms | — | — | Toast simpan |
| Appearance | — | — | Toast simpan |
| Shortcuts | — | — | Baris error commands |
| About | — | — | Toast tautan |
| Onboarding | — | — | Banner storage |

Prinsip: error **lokal**, tidak pernah modal penuh yang memblokir seluruh UI.
