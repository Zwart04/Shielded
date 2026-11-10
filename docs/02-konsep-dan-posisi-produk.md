# 02 — Konsep & Posisi Produk

## 2.1 Definisi Satu Kalimat

> "Kendali atas apa yang terlihat di layar Anda saat Anda mengobrol di browser."

## 2.2 Pemosisian

Shielded berada di kategori **presentation-layer privacy tool**.

- **Bukan** alat keamanan komunikasi. Kami tidak menambah enkripsi dan tidak mengubah jalur pengiriman pesan.
- **Bukan** alat pemantauan atau moderasi. Kami tidak menganalisis isi pesan.
- Kami memodifikasi **tampilan DOM** — bukan logika aplikasi platform.

Analogi yang tepat: Shielded seperti **filter privasi pada layar**, bukan seperti brankas. Brankas melindungi isi; filter layar hanya mengatur siapa yang bisa melihat dari sudut pandang tertentu.

## 2.3 Mengapa Ekstensi Browser

- **[Fakta]** Semua platform target menyediakan antarmuka web; DM Instagram dapat diakses lewat `instagram.com` (login diperlukan).
- Ekstensi berjalan lokal dan tidak memerlukan kredensial pengguna — berbeda dari pendekatan bot/proxy yang berisiko mencuri sesi.
- **[Fakta]** Manifest V3 melarang pemuatan kode jarak jauh, sehingga klaim "tidak ada kode dari server" dapat ditegakkan secara struktural, bukan hanya janji.

## 2.4 Target Pengguna

### Segmen primer
1. **Profesional kantor** — meja terbuka, monitor terlihat orang lain, sering memakai web chat untuk klien/rekan.
2. **Mahasiswa / pekerja lepas** — bekerja di kafe, perpustakaan, transportasi.
3. **Pengguna rapat daring** — sering berbagi layar dan tidak ingin notifikasi pribadi ikut tampil.

### Segmen sekunder
4. **Pengguna dengan kebutuhan privasi tinggi** — jurnalis, pekerja sosial, individu yang membutuhkan lapisan tambahan saat bekerja di ruang bersama.
5. **Pengguna teknis** — ingin kontrol detail per platform dan dapat mengaudit kode.

### Anti-persona
- Pengguna yang mencari enkripsi tambahan → bukan produk ini.
- Pengguna yang ingin memantau orang lain → bukan produk ini (tidak ada fitur monitoring).

## 2.5 Pain Point

| Pain Point | Situasi Konkret | Dampak |
|---|---|---|
| Isi pesan terbaca | Orang di samping melihat bubble chat | Kebocoran informasi pribadi/pekerjaan |
| Daftar chat memperlihatkan nama + pratinjau | Berpindah tab memunculkan daftar | Terlihat siapa yang sedang dihubungi |
| Media termuat otomatis | Foto sensitif muncul tanpa diklik | Malu / risiko sosial |
| Lupa melindungi saat meninggalkan meja | Tidak ada mekanisme otomatis | Kebocoran tak disengaja |
| Alat yang ada terlalu kasar/rumit | Blur seluruh halaman atau pengaturan berlapis | Pengguna berhenti memakai |

## 2.6 Nilai Inti

1. **Kendali granular** — pilih elemen, bukan seluruh halaman.
2. **Konsisten lintas platform** — satu mental model.
3. **Otomatis tetapi dapat diprediksi** — perilaku default jelas, selalu ada jalan keluar satu langkah.
4. **Local-first** — tidak ada data keluar dari perangkat.
5. **Jujur** — batas perlindungan dinyatakan terbuka.

## 2.7 Positioning Statement

> Untuk profesional dan pelajar yang memakai web chat di ruang yang dapat dilihat orang lain, Shielded adalah ekstensi browser yang menyembunyikan elemen sensitif di layar dengan kontrol per-elemen dan otomasi berbasis fokus. Berbeda dari alat blur seluruh halaman, Shielded tidak mengganggu navigasi dan tidak pernah membaca isi pesan.

## 2.8 Nama & Merek (sementara)

- Nama kerja: **Shielded**.
- Nada merek: tenang, teknis, tidak menakut-nakuti. Hindari bahasa "mata-mata", "hacker", atau klaim absolut.
- Sebelum rilis: cek ketersediaan nama di Chrome Web Store dan domain.
