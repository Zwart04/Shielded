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

| Metrik | Anggaran | Cara ukur |
|---|---|---|
| Inisialisasi content script | ≤ 300 ms setelah `document_idle` | Performance panel |
| Reapply per batch mutasi | ≤ 10 ms | Profiling dengan fixture |
| Memori tambahan per tab | ≤ 15 MB | Heap snapshot 10 menit |
| CPU saat tab hidden | ~0 (listener tidur) | Performance monitor |
| Ukuran paket ekstensi | ≤ 2 MB (tanpa aset berat) | `du -sh dist` |

Angka ini adalah target awal, bukan hasil pengukuran. Harus divalidasi pada Fase 2.

## 12.6 Teknik Optimasi

1. **Observer terpinat:** setelah zona ditemukan, amati subtree zona saja.
2. **Coalescing:** callback dibungkus `requestAnimationFrame`.
3. **Cache selektor:** per route, bukan per mutasi.
4. **Overlay satu lapisan:** `backdrop-filter` pada satu elemen, bukan filter pada subtree.
5. **`contain: layout paint`** pada wrapper zona untuk membatasi reflow.
6. **Tanpa `will-change` permanen:** hanya saat animasi aktif.
7. **Detach saat nonaktif:** lepas observer dan listener ketika platform dimatikan.

## 12.7 Audit Privasi Otomatis

Skrip `scripts/verify-privacy.ts` dijalankan di CI dan gagal jika menemukan:

- `<all_urls>` atau `*://*/*` di manifest.
- `fetch(`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`.
- `eval(`, `new Function(`.
- Permission di luar daftar putih: `storage`, host 7 domain.
- Import dari URL eksternal.

## 12.8 Izin Ekstensi

| Izin | Alasan |
|---|---|
| `storage` | Menyimpan preferensi lokal |
| `host_permissions` 7 domain | Menjalankan content script di platform target |
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
