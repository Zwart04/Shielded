# 03 — Fitur Utama & Diferensiasi

## 3.1 A. Perlindungan Konten Obrolan

### Tabel Kemampuan

| Kemampuan | Prioritas | Catatan Teknis |
|---|---|---|
| Blur isi pesan (area pesan) | **P0** | Overlay `backdrop-filter: blur()` pada wrapper zona, bukan `filter` pada seluruh subtree |
| Sembunyikan pratinjau daftar percakapan | **P0** | Rule *cover* pada kontainer ringkasan pesan terakhir |
| Sembunyikan nama kontak | P1 | Rule `hide` terpisah dari isi pesan |
| Sembunyikan avatar / foto profil | P1 | Rule `hide` dengan `visibility`, bukan `display`, agar layout stabil |
| Sembunyikan pratinjau media | P1 | Cover pada kotak media & thumbnail tautan |
| Pilih elemen yang dilindungi per platform | **P0** | Basis konfigurasi |
| Scope: satu kolom chat vs seluruh area pesan | P1 | Dua mode: "kolom aktif" dan "seluruh panel" |
| Reveal via hover | **P0** | CSS murni pada zona |
| Reveal via klik-tahan | P1 | Pointer down/up + fallback |
| Reveal via shortcut (semua zona) | **P0** | `chrome.commands` |
| Pemulihan otomatis saat pointer keluar | **P0** | `mouseleave` + fallback timer 2 detik |

### Keputusan Desain: Overlay, Bukan Manipulasi Teks

Efek diterapkan dengan menambahkan **kelas CSS** pada elemen pembungkus yang dikelola engine. Konsekuensi penting:

- Engine tidak membutuhkan isi pesan untuk bekerja. Identifikasi elemen dilakukan lewat selektor struktur/atribut.
- Kode platform tetap berjalan normal; tidak ada perubahan pada mekanisme kirim/terima pesan.
- **Jujur:** content script tetap beroperasi di dalam DOM halaman dan secara teknis dapat membaca DOM. Komitmen kami: tidak ada pemanggilan pembacaan `textContent` pesan, tidak ada penyimpanan, tidak ada pengiriman. Ini ditegakkan lewat aturan lint dan review kode (lihat `12-keamanan-privasi-performa.md`).

### Efek Visual

| Efek | Implementasi | Kapan dipakai |
|---|---|---|
| `blur` | Overlay `backdrop-filter: blur(Npx)` + lapisan warna semi-transparan | Default mode Privasi |
| `cover` | Overlay warna solid sesuai tema | Mode Maksimum; elemen sangat sensitif |
| `hide` | `visibility: hidden` pada elemen kecil | Avatar, badge, indikator |

`backdrop-filter` dipilih karena hanya membentuk satu lapisan komposit, jauh lebih murah dibanding `filter: blur()` pada subtree besar yang terus berubah (virtual list).

## 3.2 B. Mode Privasi Cerdas

| Pemicu | Perilaku Default | Kontrol Pengguna |
|---|---|---|
| Tab disembunyikan (`visibilitychange`) | Seluruh zona dilindungi | Toggle per platform & global |
| Jendela kehilangan fokus (`window blur`) | Dilindungi | Toggle; opsi "abaikan 60 detik" di popup |
| Kembali ke tab | Pulihkan tampilan otomatis | Pilihan: pulihkan / tetap terlindung |
| Toggle manual | Popup satu klik; badge berubah | Selalu tersedia |
| Pintasan | `Alt+Shift+S` toggle, `Alt+Shift+R` reveal | Remap via `chrome://extensions/shortcuts` |

**Catatan teknis penting [Fakta]:** Chrome tidak mengizinkan ekstensi memetakan ulang shortcut secara programatik. UI ekstensi hanya dapat menampilkan shortcut aktif dan membuka halaman pengaturan resmi Chrome. Jangan menjanjikan pemetaan di dalam UI sendiri.

**Prinsip anti-mengganggu:**
- Otomasi hanya boleh *menyembunyikan* dan *memulihkan*.
- Tidak pernah ada state terkunci tanpa jalan keluar satu langkah.
- Tidak ada popup modal yang menghalangi chat.

## 3.3 C. Pengaturan Perlindungan Personal

### Preset

| Preset | Isi | Untuk siapa |
|---|---|---|
| **Normal** | Tidak ada efek | Di rumah / lingkungan aman |
| **Privasi** (default) | Blur isi pesan, preview pesan, nama kontak, dan foto profil; tiap item terpisah; reveal via hover hanya pada item yang disorot | Penggunaan sehari-hari |
| **Maksimum** | Cover isi pesan, preview, dan media; nama + foto profil disembunyikan; kotak ketik dikaburkan; baris chat tetap utuh agar daftar terbaca; reveal hanya lewat pintasan | Ruang publik / berbagi layar |

### Pengaturan lanjutan per platform

- Toggle per zona: isi pesan, seluruh baris chat, preview pesan, nama kontak, foto profil, preview media, galeri media, kotak ketik.
- Perilaku tambahan: tanpa jeda transisi, buka semua saat aplikasi di-hover, kunci otomatis saat aplikasi diam (idle) 1-30 menit.
- Setiap zona diterapkan per item: mengaktifkan nama saja tidak ikut mengaburkan avatar atau preview.
- Hover hanya membuka item yang disorot; item lain tetap terlindungi.
- Pilihan efek per zona: blur / cover / hide.
- Intensitas blur: ringan (5px) / normal (7px) / kuat (10px). Radius kecil menjaga bentuk huruf tetap menyatu halus, bukan melebar jadi balok. Foto/avatar otomatis memakai radius 2x karena area gambarnya jauh lebih besar dari teks.
- Logo platform memakai mark resmi (WhatsApp, Telegram, Instagram, dst.), bukan ikon gambar tangan.

Prinsip: **pengaturan sederhana di permukaan, detail tersedia saat dibutuhkan**. Jangan tampilkan 20 toggle di halaman pertama.

## 3.4 D. Fitur Tambahan yang Layak

| Fitur | Prioritas | Alasan |
|---|---|---|
| Indikator status mini di halaman | P1 | Memberi umpan balik bahwa proteksi aktif; mengurangi kebingungan |
| Panic blur (sembunyikan semua seketika) | P1 | Nilai tinggi saat situasi mendadak; implementasi murah (shortcut ketiga) |
| Element picker (pilih area sendiri) | P2 | Sangat berguna saat selektor rusak, tetapi kompleks |
| i18n (id/en) | P1 | Jangkauan pengguna |
| Halaman About yang transparan | **P0** | Kepercayaan adalah fitur utama produk privasi |

### Fitur yang Sengaja Tidak Dibuat

- Analitik/telemetri.
- Akun pengguna, sinkronisasi wajib, cloud backup.
- Deteksi "pesan sensitif" dengan AI.
- Pemantauan aktivitas pengguna.
- Tema/kustomisasi visual berlebihan.

Semua hal di atas menambah permukaan risiko tanpa memperkuat nilai inti.

## 3.5 Diferensiasi Ringkas

1. Granularitas per zona, bukan seluruh halaman.
2. Satu model pengaturan untuk banyak platform.
3. Otomasi berbasis fokus dengan kontrol penuh.
4. Transparansi batas perlindungan.
5. Nol pengumpulan data — dapat diverifikasi dari kode.
