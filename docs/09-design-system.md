# 09 — Design System (Apple-inspired)

> Tujuan: antarmuka **tenang, presisi, dan fungsional**. Referensi adalah prinsip Apple Human Interface Guidelines — hirarki, konsistensi, kejelasan — **bukan** penyalinan visual produk Apple.

## 9.1 Prinsip

1. **Hirarki lewat tipografi & ruang**, bukan kotak berwarna-warni.
2. **Satu aksen biru.** Selebihnya netral.
3. **Komponen sedikit, konsisten.** Button, Toggle, Segmented, Select, Row, Card, Toast.
4. **Motion halus dan singkat** (150–240 ms) dengan easing yang sama.
5. **Anti-slop:** tanpa gradien dekoratif, tanpa glassmorphism, tanpa glow, tanpa ikon hias, tanpa metrik palsu, tanpa dashboard "bento" kosong.

Setiap elemen UI harus menjawab: *fungsi apa yang dijalankannya?* Jika tidak ada, hapus.

## 9.2 Token Warna

```css
:root {
  color-scheme: light dark;

  /* Light */
  --bg: #f5f5f7;
  --surface: #ffffff;
  --surface-2: #f2f2f4;
  --surface-3: #e8e8ed;
  --text: #1d1d1f;
  --text-2: #6e6e73;
  --text-3: #8e8e93;
  --separator: rgba(0, 0, 0, 0.08);
  --accent: #0071e3;
  --accent-press: #0058b0;
  --accent-soft: rgba(0, 113, 227, 0.10);
  --success: #2e7d32;
  --warn: #b25000;
  --danger: #c0392b;
  --overlay-tint: rgba(28, 28, 30, 0.18);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1c1c1e;
    --surface: #2c2c2e;
    --surface-2: #3a3a3c;
    --surface-3: #48484a;
    --text: #f5f5f7;
    --text-2: #a1a1a6;
    --text-3: #8e8e93;
    --separator: rgba(255, 255, 255, 0.12);
    --accent: #0a84ff;
    --accent-press: #339cff;
    --accent-soft: rgba(10, 132, 255, 0.16);
    --overlay-tint: rgba(0, 0, 0, 0.35);
  }
}

/* Override manual: atribut data-theme pada <html> */
:root[data-theme="light"] { /* nilai yang sama seperti light */ }
:root[data-theme="dark"]  { /* nilai yang sama seperti dark */ }
```

**Aturan pemakaian:**
- Aksen hanya untuk tindakan utama, state aktif, dan tautan.
- Merah hanya untuk tindakan destruktif (menonaktifkan total) dan error.
- Jangan memakai lebih dari dua warna aksen pada satu layar.

## 9.3 Tipografi

```css
:root {
  --font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, system-ui, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  --text-xs: 11px;   /* label kecil, badge */
  --text-sm: 12px;   /* metadata */
  --text-md: 13px;   /* body utama ekstensi */
  --text-lg: 15px;   /* subjudul, tombol besar */
  --text-xl: 17px;   /* judul seksi */
  --text-2xl: 21px;  /* judul halaman */

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;

  --lh-tight: 1.25;
  --lh-normal: 1.45;
}
```

**Aturan:**
- Maksimal tiga ukuran font per layar.
- Judul memakai `semibold`; body `regular`; label `medium`.
- Tidak memakai huruf kapital semua untuk teks panjang.
- Tidak ada letter-spacing dekoratif.

## 9.4 Spasi (grid 4pt)

```css
:root {
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
}
```

Padding kartu: `--sp-5` (24px). Jarak antar-kartu: `--sp-5`. Jarak label-ke-kontrol: `--sp-2`. Tidak ada nilai acak di luar skala.

## 9.5 Radius

```css
:root {
  --r-sm: 6px;    /* badge, chip kecil */
  --r-md: 10px;   /* tombol, input */
  --r-lg: 14px;   /* kartu, panel */
  --r-full: 999px;
}
```

Satu elemen hanya memakai satu radius. Jangan mencampur 8/12/16 secara acak.

## 9.6 Bayangan

```css
:root {
  --shadow-1: 0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-pop: 0 8px 24px rgba(0, 0, 0, 0.18);
}
```

Hanya dua level. Kartu memakai border `--separator`, bukan bayangan besar.

## 9.7 Motion

```css
:root {
  --ease: cubic-bezier(0.2, 0, 0, 1);
  --dur-1: 150ms;
  --dur-2: 240ms;
}
```

- Toggle: `--dur-1`.
- Buka/tutup panel: `--dur-2`.
- Hormati `prefers-reduced-motion`: nonaktifkan transisi non-esensial.

## 9.8 Ukuran Komponen

```css
:root {
  --ctl-h: 32px;        /* tinggi kontrol */
  --ctl-h-lg: 36px;
  --popup-w: 320px;
  --sidebar-w: 216px;
  --content-max: 720px;
}
```

## 9.9 Komponen

### Button
| Varian | Latar | Teks | Penggunaan |
|---|---|---|---|
| Primary | `--accent` | putih | Tindakan utama (1 per layar) |
| Secondary | `--surface-2` | `--text` | Tindakan alternatif |
| Ghost | transparan | `--accent` | Tautan tindakan |
| Destructive | `--danger` | putih | Nonaktifkan total |

State: default / hover (gelap 4%) / pressed (scale 0.98) / disabled (opacity 0.4, cursor not-allowed) / loading (teks diganti "Menyimpan…", tombol disabled).

### Toggle
- Ukuran 40×24, knob 20, radius `--r-full`.
- Aktif: `--accent`.
- `role="switch"`, `aria-checked`.
- Label dapat diklik.

### Segmented Control
- Tiga opsi (Normal / Privasi / Maksimum).
- Item aktif: `--surface` + `--shadow-1`.
- `role="radiogroup"`, navigasi panah.

### Select
- Memakai `<select>` asli yang di-style. Tidak membuat dropdown kustom.
- Alasan: konsisten dengan platform, aksesibel, tanpa bug positioning.

### Row
- Tinggi minimum 44px.
- Label kiri + deskripsi sekunder + kontrol kanan.
- Pemisah `--separator` antar baris.

### Card
- `--surface`, radius `--r-lg`, border `--separator`, padding `--sp-5`.
- Dipakai hemat: satu kartu per topik.

### Toast
- Muncul di bawah, radius `--r-lg`, auto-hide 3 detik.
- Hanya untuk konfirmasi penting.

## 9.10 State Standar

| State | Aturan |
|---|---|
| **Empty** | Satu kalimat + satu tindakan utama. Tanpa ilustrasi dekoratif. |
| **Loading** | Skeleton baris (bukan spinner besar) untuk data lokal; jarang terlihat. |
| **Error** | Pesan inline di tempat kejadian + tombol "Coba lagi". Tidak memblokir seluruh halaman. |
| **Disabled** | Opacity 0.45 + tooltip alasan (mis. "Segera hadir"). |
| **Success** | Toast singkat; tanpa animasi berlebihan. |

## 9.11 Aksesibilitas

- Kontras teks ≥ 4.5:1; teks sekunder ≥ 4.5:1 pada surface.
- Semua kontrol dapat dijangkau Tab; urutan logis.
- Fokus terlihat jelas (outline 2px `--accent` dengan offset 2px).
- `aria-live="polite"` untuk perubahan status.
- Tidak ada informasi yang disampaikan hanya lewat warna.

## 9.12 Anti-Slop Checklist (wajib sebelum rilis UI)

- [ ] Tidak ada gradien dekoratif.
- [ ] Tidak ada glassmorphism / blur dekoratif pada panel UI.
- [ ] Tidak ada ikon tanpa fungsi.
- [ ] Tidak ada metrik/angka palsu.
- [ ] Semua radius konsisten dengan skala.
- [ ] Semua spasi dari skala 4pt.
- [ ] Maksimal satu tombol primary per layar.
- [ ] Tidak ada tombol tanpa aksi.
- [ ] Teks tidak dipotong tanpa alasan.
- [ ] Dark mode diuji di semua layar.
