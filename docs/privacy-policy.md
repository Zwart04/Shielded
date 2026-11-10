# Kebijakan Privasi — Shielded

> **Draf.** Wajib ditinjau sebelum publikasi. Tanggal berlaku diisi saat rilis.

## 1. Ringkasan

Shielded adalah ekstensi browser yang menyembunyikan elemen tertentu pada antarmuka pesan web. **Shielded tidak mengumpulkan, menyimpan, mengirim, atau menjual data pengguna.** Semua pemrosesan terjadi di perangkat pengguna.

## 2. Data yang Kami Simpan

Shielded menyimpan **preferensi tampilan** di penyimpanan lokal browser (`chrome.storage.local`):

- Tingkat perlindungan yang dipilih (Normal / Privasi / Maksimum).
- Status aktif/nonaktif per platform.
- Pilihan elemen yang dilindungi.
- Intensitas blur dan warna selimut.
- Preferensi tema.

Data ini tidak pernah dikirim ke server mana pun. Data ini tidak berisi isi pesan, nama kontak, atau informasi akun.

## 3. Data yang Kami Tidak Akses

Shielded **tidak**:

- Membaca isi pesan, nama kontak, atau riwayat obrolan.
- Mengakses kredensial, cookie, atau token sesi.
- Merekam aktivitas penjelajahan.
- Mengambil tangkapan layar.
- Mengirim data ke pihak ketiga.
- Menggunakan analitik, telemetri, atau pelacakan.

## 4. Cara Kerja Teknis

Ekstensi menjalankan skrip di halaman platform yang didukung untuk menambahkan lapisan visual (blur/selimut) pada elemen tertentu. Skrip ini:

- Hanya berjalan di domain yang dideklarasikan.
- Tidak melakukan permintaan jaringan.
- Tidak mengubah mekanisme pengiriman atau penerimaan pesan platform.

## 5. Izin yang Digunakan

| Izin | Tujuan |
|---|---|
| `storage` | Menyimpan preferensi lokal |
| Host permission platform | Menjalankan skrip visual di situs yang didukung |
| `commands` (manifest key, bukan izin tambahan) | Mendaftarkan pintasan keyboard |

Tidak ada izin lain yang diminta. `commands` tidak menambah akses ke data atau situs; ia hanya mendaftarkan pintasan keyboard.

## 6. Batasan Perlindungan

Shielded melindungi **tampilan visual** elemen di layar browser. Shielded **tidak** melindungi dari:

- Tangkapan layar atau rekaman layar.
- Berbagi layar (Zoom, Google Meet, Microsoft Teams).
- Pembaca layar (screen reader).
- Akses melalui DevTools.
- Salin-tempel.
- Keamanan akun, enkripsi komunikasi, atau keamanan perangkat.

Shielded bukan pengganti enkripsi ujung-ke-ujung atau praktik keamanan akun.

## 7. Retensi Data

Preferensi disimpan sampai pengguna menghapus ekstensi atau menghapus data ekstensi secara manual. Tidak ada data di server, sehingga tidak ada retensi di pihak kami.

## 8. Hak Pengguna

Pengguna dapat:

- Melihat dan mengubah semua preferensi lewat popup ekstensi.
- Menghapus semua data dengan menghapus ekstensi.
- Menggunakan ekstensi tanpa akun.

## 9. Perubahan Kebijakan

Jika kebijakan berubah, versi baru akan diterbitkan bersama pembaruan ekstensi dan tanggal berlaku diperbarui.

## 10. Kontak

Alamat surel kontak akan diisi sebelum publikasi.

## 11. Kepatuhan

Shielded dirancang untuk memenuhi persyaratan Chrome Web Store terkait penggunaan data dan izin minimal. Tidak ada penjualan data, tidak ada transfer data, tidak ada penggunaan untuk tujuan yang tidak terkait fungsi ekstensi.
