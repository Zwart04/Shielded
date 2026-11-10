# Glosarium

| Istilah | Arti dalam konteks proyek ini |
|---|---|
| **Adapter** | Modul per platform yang mendeskripsikan letak zona chat dan aturan efeknya. |
| **Backdrop-filter** | Properti CSS yang mengaburkan apa pun di belakang elemen. Dipakai untuk overlay blur. |
| **Blur** | Efek kabur pada area layar. Bukan enkripsi. |
| **Content script** | Skrip ekstensi yang berjalan di dalam halaman web pada *isolated world*. |
| **Cover** | Efek menutup area dengan warna solid, sehingga konten tidak terlihat sama sekali. |
| **Fail-open** | Jika proteksi gagal, situs tetap berfungsi normal. |
| **Fallback area** | Mode cadangan: melindungi seluruh panel chat ketika selektor presisi gagal. |
| **Fixture DOM** | Snapshot struktur HTML tersanitasi untuk pengujian regresi selektor. |
| **Hide** | Menyembunyikan elemen dengan `visibility: hidden` tanpa mengubah layout. |
| **Isolated world** | Lingkungan JavaScript terpisah untuk content script; tidak berbagi variabel dengan halaman. |
| **Local-first** | Semua pemrosesan dan penyimpanan terjadi di perangkat pengguna. |
| **Manifest V3** | Versi manifest ekstensi Chromium saat ini; membatasi remote code dan memakai service worker. |
| **MutationObserver** | API browser untuk memantau perubahan DOM. |
| **Overlay** | Lapisan visual di atas elemen target yang menghasilkan efek blur/cover. |
| **Peek / Reveal** | Menampilkan sementara konten yang sedang dilindungi. |
| **Prompt injection** | Upaya halaman web menyisipkan instruksi agar ekstensi melakukan sesuatu. Diperlakukan sebagai data, bukan perintah. |
| **Selector** | Pola CSS untuk menemukan elemen di DOM. |
| **Selector resolver** | Komponen yang mengevaluasi beberapa kandidat selector dan memilih yang terbaik. |
| **Service worker** | Proses latar ekstensi MV3 yang dapat dihentikan kapan saja. |
| **Shadow DOM** | DOM terisolasi untuk komponen; dipakai hanya untuk indikator mini. |
| **SPA** | Single Page Application; halaman berubah tanpa reload penuh. |
| **Zona** | Bagian antarmuka yang dilindungi, mis. kolom pesan atau daftar chat. |
| **P0 / P1 / P2** | Prioritas: wajib MVP / penting / masa depan. |
| **Telemetri** | Pengumpulan data penggunaan; tidak dipakai di proyek ini. |
| **Screen reader** | Perangkat lunak pembaca layar; tetap membaca konten yang di-blur. |
| **Least privilege** | Prinsip meminta izin seminimal mungkin. |
