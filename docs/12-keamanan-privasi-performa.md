# 12 — Keamanan, Privasi & Performa

## 12.1 Model Ancaman

| Aset | Ancaman | Dampak |
|---|---|---|
| Isi pesan di layar | Orang di sekitar melihat | Kebocoran sosial/pekerjaan |
| Preferensi pengguna | Ekstensi lain membaca storage | Rendah (hanya preferensi) |
| Kode ekstensi | Supply chain berbahaya | Tinggi (dapat membaca DOM) |
| Reputasi produk | Klaim berlebihan | Kepercayaan hilang |

Produk ini **tidak** mengklaim melindungi dari: malware lokal, akses fisik ke perangkat, administrator sistem, screenshot, screen sharing, screen reader, atau DevTools.

## 12.2 Risiko Ekstensi & Mitigasi

| Risiko | Mitigasi Konkret |
|---|---|
| **Supply chain / dependency berbahaya** | Dependensi minimal; lockfile; `npm audit` di CI; pin versi; tanpa CDN saat runtime |
| **Ekstensi membaca teks pesan** | Tidak ada pemanggilan `textContent` pada bubble; aturan lint khusus; review kode |
| **Host permission berlebihan** | Hanya 7 pola domain; tanpa `<all_urls>`; justifikasi tertulis |
| **Prompt injection dari halaman** | String dari halaman diperlakukan sebagai data; tidak ada `eval`; tidak ada aksi otomatis berbasis teks halaman |
| **Remote code** | Dilarang MV3; semua JS dibundel |
| **Resource eksternal di popup** | Tidak ada font/CDN; semua aset lokal |
| **Update tamper** | Distribusi via Web Store (ditandatangani); checksum rilis untuk audit |
| **Storage bocor** | Hanya preferensi; tidak ada konten; sync opt-in |

## 12.3 Prinsip Privasi

1. **Local-first absolut** — tidak ada endpoint jaringan.
2. **Data minimization** — yang disimpan: level, toggle per platform, pilihan zona, intensitas blur, preferensi tema.
3. **No telemetry** — tidak ada analytics, crash reporting, atau remote config.
4. **Transparansi** — kode dapat diaudit; dokumen ini menjelaskan batas.

## 12.4 Yang Tidak Dilindungi (Wajib Dinyatakan)

- Tangkapan layar dan rekaman layar.
- Berbagi layar (Zoom, Meet, Teams).
- Pembaca layar (screen reader) — konten tetap ada di DOM.
- DevTools dan ekstensi lain dengan izin luas.
- Salin-tempel.
- Keamanan akun dan enkripsi komunikasi.
- Keamanan perangkat dan sistem operasi.

Pernyataan ini harus muncul di halaman About dan deskripsi toko.

## 12.5 Anggaran Performa

| Metrik | Anggaran | Hasil ukur (0.1.7) |
|---|---|---|
| Pass selector zona pesan (1.556 node) | ≤ 10 ms | **3,2 ms** (sebelumnya 32,4 ms pada 3.047 node) |
| Reapply per batch mutasi | ≤ 10 ms | ± 4 ms pada fixture yang sama |
| Pemindaian elemen | ≤ 600 node, ≤ 120 item per zona | 600 node dipindai, 120 item dipakai |
| Pemetaan hover (pointermove) | ≤ 1 putaran per frame | 0,24 ms per kejadian; pemindaian 120 kotak hanya sekali per frame (~1,5 ms) |
| Cakupan daftar panjang | Item di layar selalu terlindungi | 400 pesan: 120 dipakai, 14/14 item terlihat ter-blur setelah scroll |
| CPU saat tab hidden | ~0 | 0 — deteksi langsung keluar saat `visibilityState === 'hidden'` |
| Ukuran content script | ≤ 60 KB | 48 KB (`dist/content.js`) |
| Ukuran paket ekstensi | ≤ 2 MB | 256 KB (`du -sh dist`) |

Angka selector diukur dengan `document.querySelectorAll` + filter visibilitas pada
DOM sintetis 3.047 node di Brave (Linux), rata-rata 20 putaran.

## 12.6 Teknik Optimasi

1. **Coalescing:** callback `MutationObserver` dibungkus `requestAnimationFrame`; deteksi dibatasi 120 ms agar beberapa mutasi beruntun jadi satu pass.
2. **Zona yang dimatikan tidak di-query:** engine hanya mengirim zona yang dilindungi ke `detectChatArea`, jadi toggle mati = nol selector dijalankan.
3. **Prioritas viewport:** `queryUsable` mengumpulkan item yang berada dalam satu layar di atas/bawah viewport lebih dulu, lalu berhenti di 120 item. Pada daftar >120 item, item yang sedang dilihat tetap terlindungi (deteksi ulang dipicu event `scroll`).
4. **Satu pembacaan layout per elemen:** `getBoundingClientRect` dipakai sekali untuk cek ukuran sekaligus cek elemen raksasa.
5. **Tanpa overlay untuk blur:** filter diterapkan langsung ke elemen; tidak ada node tambahan maupun `backdrop-filter`, jadi satu lapisan paint lebih murah.
6. **Idempoten:** class tidak ditulis ulang bila zona dan efeknya sama, sehingga tidak ada style recalc tiap 120 ms.
7. **Scroll memicu deteksi ulang:** listener `scroll` pasif (throttle 120 ms) supaya item yang baru masuk layar langsung dikaburkan tanpa menunggu heartbeat.
8. **Tab latar berhenti:** deteksi keluar saat tab tersembunyi dan dijadwalkan ulang pada `visibilitychange`.
9. **Hover tanpa `:hover`:** elemen ber-`pointer-events: none` (avatar TikTok/Instagram) tidak pernah menjadi target hover, jadi posisi kursor dipetakan ke kotak zona terkecil lewat `pickHovered`. Pemetaan di-coalesce dengan `requestAnimationFrame` dan dilewati saat kursor diam.
10. **Halo blur dipotong:** semua zona blur mendapat `clip-path` sesuai kotak elemennya (`inset(0)` untuk teks, `inset(0 round <radius>)` untuk avatar/media), jadi cahaya tidak memancar sebagai glow ke luar bentuk aslinya. Nilai dilepas kembali saat zona berganti ke efek tutup atau saat handle dilepas.
11. **Slot avatar dari geometri:** avatar dicari sebagai kotak 32-64 px paling kiri dalam baris, maksimum 14 node pertama. Batas 64 px mencegah pembungkus baris (72 px) ikut ter-blur dan tampil sebagai bulatan besar. Ini menangkap cincin status, ikon bawaan, dan `background-image` dari stylesheet tanpa `getComputedStyle` per node; selector hanya cadangan bila baris tidak punya layout. Biaya 0,015 ms per baris.
12. **Turunan baris tidak bergantung zona baris utuh:** nama/preview/avatar diturunkan dari baris chat walau "Seluruh baris chat" dimatikan, karena selector platform bisa berhenti cocok (mis. nama hasil pencarian tanpa atribut `title`). Biaya: 0,26 ms per 130 baris.
13. **Tulis pengaturan berurutan:** `saveSettings`/`updateSettings` melewati satu antrean karena Chrome tidak menjamin urutan selesai `storage.local.set`. Tanpa antrean, klik beruntun bisa membuat snapshot lama menang sehingga pengaturan tampak "tidak live".
14. **Detach saat nonaktif:** observer, interval, dan listener dilepas ketika platform dimatikan; handle overlay dibersihkan.

## 12.7 Audit Privasi Otomatis

Skrip `scripts/verify-privacy.ts` dijalankan di CI dan gagal jika menemukan:

- `<all_urls>` atau `*://*/*` di manifest.
- `fetch(`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`.
- `eval(`, `new Function(`.
- Permission di luar daftar putih: `storage`, host 19 pola URL untuk 7 platform.
- Import dari URL eksternal.

## 12.8 Izin Ekstensi

| Izin | Alasan |
|---|---|
| `storage` | Menyimpan preferensi lokal |
| `host_permissions` 19 pola URL (7 platform) | Menjalankan content script di platform target |
| `commands` (manifest) | Mendaftarkan pintasan keyboard |

Tidak ada: `tabs`, `webRequest`, `cookies`, `history`, `downloads`, `scripting`, `management`.

Catatan: `commands` bukan permission terpisah di `permissions`, hanya deklarasi di manifest.

## 12.9 Respons Insiden

Jika ditemukan bug yang membocorkan data:

1. Hentikan distribusi versi terdampak (unpublish jika perlu).
2. Perbaiki dan rilis patch.
3. Publikasikan catatan singkat di halaman rilis.
4. Tidak ada data pengguna untuk diberitahukan karena tidak ada pengumpulan data — ini keuntungan arsitektur.

## 12.10 Kepatuhan Toko

Sebelum unggah ke Chrome Web Store:

- Kebijakan privasi URL aktif.
- Justifikasi setiap permission.
- Deskripsi yang jujur (tanpa klaim enkripsi).
- Video/screenshot yang menunjukkan fungsi nyata.
- Tidak ada remote code.

Lihat `privacy-policy.md` dan `permissions-justification.md`.
