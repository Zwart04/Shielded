# 11 — Alur Pengguna & Diagram

Semua diagram memakai Mermaid. Setiap langkah dijelaskan setelah diagram.

---

## 11.1 Alur 1 — Instalasi & Pengaturan Awal

```mermaid
flowchart TD
    A["Pengguna instal ekstensi"] --> B["Service worker: event onInstalled"]
    B --> C["Tulis preferensi default: mode Privasi, semua platform nonaktif"]
    C --> D["Pengguna membuka platform web"]
    D --> E["Tidak ada perubahan tampilan"]
    E --> F["Klik ikon Shielded di toolbar"]
    F --> G["Popup: pilih platform lalu nyalakan switch"]
    G --> H["Proteksi langsung aktif di tab platform"]
```

**Penjelasan:**
1. `onInstalled` menulis default sekali dan tidak membuka tab apa pun. Jika ini update, migrasi skema dijalankan.
2. Tidak ada onboarding: popup adalah satu-satunya panel pengaturan dan langsung bisa dipakai.
3. Tidak ada permintaan izin tambahan di luar yang sudah dideklarasikan manifest.
4. Karena semua platform nonaktif, instalasi baru tidak mengubah halaman apa pun sampai pengguna menyalakannya.

---

## 11.2 Alur 2 — Deteksi Platform & Proteksi Otomatis

```mermaid
flowchart TD
    A["Tab platform dibuka"] --> B["Content script bootstrap"]
    B --> C["Registry mencocokkan host"]
    C --> D{"Adapter ditemukan?"}
    D -- "Tidak" --> E["Tidak ada efek; halaman normal"]
    D -- "Ya" --> F["Inisialisasi engine"]
    F --> G["SelectorResolver memindai zona"]
    G --> H{"Zona inti terdeteksi ≤ 8 detik?"}
    H -- "Ya" --> I["Terapkan level dari storage"]
    H -- "Tidak" --> J["Fallback: lindungi panel utama"]
    I --> K["Pasang observer pada subtree zona"]
    J --> K
    K --> L["Status: Terlindungi"]
```

**Penjelasan:**
1. `registry` hanya berisi adapter yang sudah diverifikasi. Tidak ada tebakan.
2. Ambang 8 detik adalah nilai awal yang dapat disesuaikan setelah pengukuran.
3. Fallback memastikan perlindungan terjadi walau selektor tidak presisi.
4. Setelah zona ditemukan, observer dipindahkan ke subtree zona untuk menghemat biaya.

---

## 11.3 Alur 3 — Reveal Sementara

```mermaid
flowchart TD
    A["Zona terlindung"] --> B{"Pemicu reveal"}
    B -- "Hover" --> C["Overlay opacity 0 via CSS"]
    B -- "Klik-tahan" --> C
    B -- "Shortcut" --> C
    C --> D{"Pemicu berakhir?"}
    D -- "Mouse keluar" --> E["Kembali terlindung ≤ 400 ms"]
    D -- "Tombol dilepas" --> E
    D -- "Timeout / tombol shortcut ditekan lagi" --> E
    E --> A
```

**Penjelasan:**
1. Hover memakai CSS murni (`:hover` pada zona) — tanpa listener per elemen.
2. Klik-tahan memakai `pointerdown`/`pointerup` pada zona.
3. Shortcut mengubah state global sementara di engine, bukan per zona.
4. Fallback timer 2 detik mencegah state "terbuka" tertinggal jika event keluar tidak terpicu.

---

## 11.4 Alur 4 — Pindah Tab & Pemulihan

```mermaid
flowchart TD
    A["Pengguna pindah tab"] --> B["visibilitychange → hidden"]
    B --> C["Engine: protected_forced"]
    C --> D["Pengguna kembali ke tab"]
    D --> E["visibilitychange → visible"]
    E --> F{"Pengaturan: pulihkan otomatis?"}
    F -- "Ya" --> G["Kembali ke protected"]
    F -- "Tidak" --> H["Tetap protected_forced"]
    H --> I["Pengguna menekan shortcut atau toggle popup"]
    I --> G
```

**Penjelasan:**
1. `visibilitychange` adalah sinyal paling andal untuk tab tersembunyi.
2. `window blur` menangani kasus jendela browser kehilangan fokus tetapi tab masih terlihat.
3. "Tetap terlindung" berguna saat pengguna ingin membaca dokumen lain di samping tanpa membuka chat.
4. Selalu ada jalan keluar satu langkah.

---

## 11.5 Alur 5 — Mengubah Aturan

```mermaid
flowchart TD
    A["Klik ikon ekstensi"] --> B["Popup"]
    B --> C["Pengaturan lengkap"]
    C --> D["Halaman Platform"]
    D --> E["Perluas baris platform"]
    E --> F["Ubah toggle atau efek"]
    F --> G["storage.local ditulis"]
    G --> H["storage.onChanged di content script"]
    H --> I["Engine menerapkan ulang"]
    I --> J["Tab platform berubah tanpa reload"]
```

**Penjelasan:**
1. Tidak ada tombol "Simpan". Perubahan bersifat langsung.
2. `storage.onChanged` dipakai agar semua tab platform yang terbuka ikut memperbarui.
3. Jika tab tidak terbuka, perubahan tetap tersimpan untuk kunjungan berikutnya.

---

## 11.6 Alur 6 — Menonaktifkan Platform

```mermaid
flowchart TD
    A["Popup → kartu platform"] --> B["Matikan switch platform"]
    B --> C["Simpan enabled=false"]
    C --> D["Content script menerima perubahan"]
    D --> E["Hapus semua kelas efek"]
    E --> F["Hentikan observer & listener"]
    F --> G["Adapter idle; halaman normal"]
```

**Penjelasan:**
1. Menonaktifkan harus benar-benar menghentikan pekerjaan, bukan hanya menyembunyikan efek.
2. Observer dan listener dilepas untuk menghemat CPU.
3. Mengaktifkan kembali menjalankan ulang deteksi dari awal.

---

## 11.7 Alur 7 — Platform Tidak Dikenali

```mermaid
flowchart TD
    A["Tab dibuka"] --> B{"Host cocok dengan adapter?"}
    B -- "Tidak" --> C["Content script tidak berjalan"]
    C --> D["Popup: pesan situs tidak didukung"]
    D --> E["Tombol: buka daftar platform"]
```

**Penjelasan:**
1. Content script tidak dijalankan di luar 7 domain (least privilege).
2. Popup tetap dapat dibuka dan memberikan penjelasan, bukan error.

---

## 11.8 Alur 8 — Panic Blur (P1)

```mermaid
flowchart TD
    A["Pengguna menekan pintasan panic"] --> B["Engine: protected_forced semua zona"]
    B --> C["Overlay solid pada semua platform aktif"]
    C --> D["Status badge: darurat"]
    D --> E["Pengguna menekan lagi atau toggle popup"]
    E --> F["Kembali ke level sebelumnya"]
```

**Penjelasan:**
1. Panic tidak mengubah preferensi permanen.
2. Hanya berlaku pada tab platform yang aktif agar tidak mengunci seluruh browser.
