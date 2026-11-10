# Runbook Selektor Platform

Prosedur operasional ketika selektor rusak karena platform memperbarui DOM.

> Alat bantu:
> - `tools/selector-probe.js` — tempel di DevTools untuk mengukur kandidat selector.
> - `docs/selector-verification-results.md` — templat pencatatan hasil (status saat ini: belum dijalankan).

## 1. Gejala

- Proteksi tidak muncul di area yang seharusnya.
- Overlay muncul di tempat yang salah.
- Fallback area aktif terus-menerus (proteksi terlalu luas).
- Error di console content script (hanya saat mode debug).

## 2. Prinsip

1. **Jangan menebak.** Selalu verifikasi di DOM nyata.
2. **Prioritaskan atribut semantik** (`role`, `aria-label`) di atas class generator.
3. **Selalu sediakan fallback** — lebih baik proteksi luas daripada tidak ada.
4. **Catat setiap perubahan** di dokumen ini dan di commit message.

## 3. Langkah Diagnosis

1. Buka platform di Chrome dengan ekstensi dalam mode unpacked.
2. Buka DevTools → Elements.
3. Cari kontainer area pesan. Perhatikan:
   - `role` dan `aria-label`.
   - Struktur parent/child.
   - Class yang terlihat stabil (hindari yang mengandung hash acak).
4. Uji selector di console:
   ```js
   document.querySelectorAll('SELECTOR')
   ```
5. Periksa apakah elemen bertahan setelah navigasi SPA.
6. Periksa apakah elemen di-mount ulang saat scroll.

## 4. Menambahkan Kandidat Selektor

Edit `src/adapters/<platform>/selectors.ts`:

```ts
export const candidates: SelectorCandidate[] = [
  {
    id: 'message-column-aria',
    selector: '[role="main"] [aria-label]',
    weight: 10,
    note: 'Atribut semantik; prioritas tertinggi',
  },
  {
    id: 'message-column-structural',
    selector: 'main > div > div:nth-child(2)',
    weight: 6,
    note: 'Struktur; bisa berubah',
  },
  {
    id: 'message-column-class',
    selector: '.some-generated-class',
    weight: 1,
    note: 'Terakhir; class dapat berubah',
  },
];
```

Aturan:

- `weight` lebih tinggi = lebih dipercaya.
- Setiap kandidat wajib punya `note` yang menjelaskan asal-usul.
- Jangan menambahkan selector yang belum diuji.

## 5. Memperbarui Rules

Jika zona berubah struktur, perbarui `src/adapters/<platform>/rules.ts` agar efek tetap menempel pada wrapper yang benar.

## 6. Fixture Baru

1. Simpan snapshot DOM minimal (tanpa data pribadi) di `tests/fixtures/dom/<platform>/`.
2. Tambahkan test unit yang memuat fixture dan memastikan selector cocok.
3. Jalankan `npm test`.

## 7. Validasi

Checklist dari `06` bagian 6.5 harus dijalankan ulang.

## 8. Rilis Perbaikan

1. Bump versi patch.
2. Catat perubahan di changelog.
3. Unggah ke toko.
4. Perbarui dokumen ini dengan tanggal dan ringkasan.

## 9. Log Insiden

| Tanggal | Platform | Gejala | Perbaikan | Versi |
|---|---|---|---|---|
| — | — | — | — | — |

## 10. Catatan per Platform

### WhatsApp Web
- Class sangat dinamis. Prioritaskan `role`, `aria-label`, dan struktur kolom.
- Verifikasi setelah setiap update WhatsApp.

### Telegram Web
- Ada dua basis klien. Pastikan selector bekerja di keduanya atau deteksi basis klien lebih dulu.
- Web A (`web.telegram.org/a`) memakai CSS module: baris `.Chat` di dalam `.chat-list`, nama `.peer-title`, preview `.last-message`.
- Avatar Web A adalah `<div class="Avatar">` ber-`background-image`, bukan `<img>`. Selector avatar harus mencakup keduanya.
- Bila nama/preview tidak terdeteksi, bagian baris diturunkan dari teks di bawah nama (lihat `deriveRowParts`), jadi kelas eksplisit hanya mempercepat, bukan syarat mutlak.

### Instagram DM
- Verifikasi route `/direct/*` dan perilaku modal.

### Facebook
- DOM sangat dinamis; fallback area hampir selalu diperlukan.

### X / Twitter
- `aria-label` relatif deskriptif; mulai dari sana.

### Threads
- Verifikasi ketersediaan DM web sebelum memulai.

### TikTok
- Verifikasi apakah DM dirender dalam modal.
