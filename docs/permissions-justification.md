# Justifikasi Izin Ekstensi

Dokumen ini menjelaskan setiap izin yang diminta Shielded, alasannya, dan mengapa alternatif yang lebih luas ditolak. Dipakai untuk review Chrome Web Store dan audit internal.

## 1. Ringkasan Izin

| Izin | Jenis | Wajib | Alasan satu kalimat |
|---|---|---|---|
| `storage` | API permission | Ya | Menyimpan preferensi tampilan secara lokal |
| Host permission 7 domain | Host permission | Ya | Menjalankan skrip visual di platform yang didukung |
| `commands` | Manifest key | Ya | Mendaftarkan pintasan keyboard |

Tidak ada izin lain.

## 2. Detail per Izin

### 2.1 `storage`

**Dipakai untuk:** menyimpan level, toggle per platform, pilihan zona, intensitas blur, dan tema.

**Tidak dipakai untuk:** menyimpan konten halaman, riwayat, atau data pribadi.

**Alternatif yang ditolak:**

- `storage.sync` sebagai default → data bisa keluar dari perangkat; ditunda menjadi opt-in (P2).
- `localStorage` halaman → tidak dapat diakses dari halaman ekstensi dan tidak sesuai model.

### 2.2 Host Permissions

Daftar domain:

- `https://web.whatsapp.com/*`
- `https://web.telegram.org/*`
- `https://www.instagram.com/*`
- `https://www.facebook.com/*`
- `https://x.com/*`
- `https://twitter.com/*`
- `https://www.threads.net/*`, `https://www.threads.com/*`
- `https://www.tiktok.com/*`

**Dipakai untuk:** menyuntikkan content script yang menambahkan lapisan visual.

**Tidak dipakai untuk:** membaca isi pesan, mengirim permintaan jaringan, atau mengubah alur aplikasi.

**Alternatif yang ditolak:**

- `<all_urls>` → bertentangan dengan least privilege dan memicu review ketat.
- `activeTab` saja → membutuhkan klik pengguna setiap kali; tidak cocok untuk proteksi otomatis.
- `scripting` → tidak diperlukan karena content script dideklarasikan di manifest.

### 2.3 `commands`

**Dipakai untuk:** mendaftarkan shortcut toggle dan reveal.

**Batasan [Fakta]:** Chrome tidak mengizinkan ekstensi memetakan ulang shortcut secara programatik; pengguna mengubahnya di `chrome://extensions/shortcuts`.

## 3. Izin yang Sengaja Tidak Diminta

| Izin | Alasan ditolak |
|---|---|
| `tabs` | Status per tab dapat diketahui dari content script sendiri; tidak perlu membaca metadata semua tab |
| `webRequest` | Tidak ada kebutuhan jaringan |
| `cookies` | Tidak relevan dan berisiko |
| `history` | Tidak relevan |
| `downloads` | Tidak relevan |
| `scripting` | Content script deklaratif sudah cukup |
| `management` | Tidak relevan |
| `notifications` | Tidak ada notifikasi sistem |
| `idle` | Deteksi fokus cukup via `visibilitychange` / `window blur` |

## 4. Pernyataan Penggunaan Data

- Tidak ada data pengguna yang dikumpulkan.
- Tidak ada data yang dijual atau ditransfer.
- Tidak ada data yang digunakan untuk menentukan kelayakan kredit atau tujuan tidak terkait.
- Tidak ada kode jarak jauh.

## 5. Checklist Review

- [ ] Manifest tidak memuat `<all_urls>`.
- [ ] Tidak ada `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`.
- [ ] Tidak ada `eval` atau `new Function`.
- [ ] Semua permission ada di dokumen ini.
- [ ] Kebijakan privasi dipublikasikan.
- [ ] Deskripsi toko menyebut batasan perlindungan.
