# 15 — Risiko, Batasan & Ekspansi

## 15.1 Tabel Risiko

| # | Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|---|
| 1 | Perubahan DOM/class platform (terutama WhatsApp) | Tinggi | Proteksi tidak presisi | Multi-kandidat selector, fallback area, health-check, fixture, runbook |
| 2 | Performa pada DOM sibuk | Sedang | Jank, baterai | Observer terpinat, overlay satu lapisan, dormant saat hidden |
| 3 | Overlay menghalangi klik/fokus | Sedang | Produktivitas turun | `pointer-events: none`; uji composer |
| 4 | Ekspektasi berlebih (dianggap enkripsi) | Sedang | Ulasan buruk | Halaman About & deskripsi toko jujur |
| 5 | DM web Threads/TikTok berubah/tidak tersedia | Sedang | Platform tertunda | Verifikasi sebelum komitmen; tandai "Segera" |
| 6 | Review toko lama karena host permission | Sedang | Rilis tertunda | Justifikasi, video, kebijakan privasi |
| 7 | Service worker MV3 berhenti | Tinggi (sifat platform) | State hilang | Tidak menyimpan state di background |
| 8 | Permintaan fitur monitoring/AI | Rendah | Melanggar prinsip | Tolak dengan jelas di dokumentasi |
| 9 | Bug selektor setelah update platform | Tinggi (jangka panjang) | Proteksi gagal | Rilis cepat + runbook + komunitas |
| 10 | Pengguna tidak menyadari proteksi aktif/tidak | Sedang | Kebingungan | Badge + indikator halaman (P1) |

## 15.2 Batasan yang Tidak Dapat Dihilangkan

1. **Blur bukan enkripsi.** Konten tetap ada di DOM.
2. **Screenshot & screen sharing** tidak dapat dicegah oleh ekstensi biasa.
3. **Screen reader** tetap membaca konten yang di-blur (kecuali `hide`).
4. **DevTools** dapat membaca DOM.
5. **Perubahan platform** akan selalu terjadi; pemeliharaan adalah biaya permanen.
6. **Tidak ada jaminan** bahwa selector akan bertahan selamanya.

## 15.3 Strategi Mitigasi Jangka Panjang

### a. Open source
Rekomendasi kuat: publikasikan kode. Manfaat:
- Audit independen.
- Kontribusi perbaikan selector dari komunitas.
- Kepercayaan pengguna meningkat.

Risiko: kompetitor menyalin. Dapat diterima karena keunggulan utama adalah eksekusi dan pemeliharaan.

### b. Element picker (P2)
Memungkinkan pengguna menandai area sendiri ketika selector rusak. Mengurangi ketergantungan pada pembaruan ekstensi.

Desain kasar:
- Mode pilih: kursor khusus, hover menyorot elemen, klik menyimpan selector.
- Selector disimpan lokal per platform.
- Hanya menyimpan selector, bukan konten.

### c. Health report lokal
Engine mencatat kegagalan selector di memori. Pengguna dapat membuka halaman diagnostik dan menyalin laporan secara manual (tanpa pengiriman otomatis).

### d. Rilis cepat
Pipeline build + zip sederhana agar perbaikan selector bisa dirilis dalam hitungan jam, bukan minggu.

## 15.4 Ekspansi Platform

| Platform | Prioritas | Catatan |
|---|---|---|
| Discord Web | Evaluasi | DOM berbasis React; banyak kelas stabil; kandidat kuat |
| Slack Web | Evaluasi | DOM stabil; kebutuhan privasi tinggi di kantor |
| LinkedIn Messaging | Evaluasi | Struktur sederhana |
| Google Chat | Evaluasi | DOM relatif stabil |
| Element/Matrix | Evaluasi | Open source; selector dapat dipelajari dari kode |
| WhatsApp Business Web | Evaluasi | Mirip WhatsApp |

Kriteria menerima platform baru:

1. DM dapat diakses lewat web.
2. DOM dapat diverifikasi.
3. Ada kebutuhan pengguna yang jelas.
4. Tidak menambah permission yang tidak perlu.

## 15.5 Ekspansi Fitur

| Fitur | Nilai | Kompleksitas | Keputusan |
|---|---|---|---|
| Panic blur | Tinggi | Rendah | P1 |
| Indikator halaman | Sedang | Rendah | P1 |
| Element picker | Tinggi | Tinggi | P2 |
| Sync opt-in | Rendah-sedang | Sedang | P2 |
| Jadwal otomatis | Rendah | Sedang | Evaluasi |
| Profil per-lokasi (Wi-Fi) | Sedang | Tinggi + risiko privasi | Tolak |
| Deteksi wajah/orang di sekitar | Tinggi (klaim) | Sangat tinggi + kamera | Tolak |
| AI ringkasan pesan | Tidak relevan | Tinggi | Tolak |

## 15.6 Saran Strategis

1. **Fokus pada keandalan selektor** — ini yang menentukan reputasi jangka panjang.
2. **Jangan menambah platform terlalu cepat** — lebih baik 3 platform solid daripada 7 rapuh.
3. **Pertahankan kesederhanaan UI** — godaan menambah toggle harus dilawan.
4. **Dokumentasikan batasan di setiap titik kontak** — toko, About, onboarding.
5. **Bangun komunitas kecil** — pengguna teknis dapat membantu verifikasi selector.

## 15.7 Kriteria Berhenti / Pivot

Jika setelah beta:

- Bug selektor tidak dapat dikendalikan (lebih dari 1 per platform per minggu), pertimbangkan:
  - Membatasi platform ke yang paling stabil.
  - Memprioritaskan element picker lebih awal.
- Pengguna tidak menggunakan fitur otomasi, pertimbangkan menyederhanakan UI.
- Review toko bermasalah karena permission, pertimbangkan mengurangi platform pada rilis awal.
