# 09 — Design System (Apple-inspired)

> Tujuan: antarmuka **tenang, presisi, dan fungsional**. Referensi adalah prinsip Apple Human Interface Guidelines — hirarki, konsistensi, kejelasan — **bukan** penyalinan visual produk Apple.

## 9.1 Prinsip

1. **Hirarki lewat tipografi & ruang**, bukan kotak berwarna-warni.
2. **Satu aksen tinta.** Kontrol aktif (switch, pill, tombol support) memakai `--ink`; biru hanya untuk tautan.
3. **Komponen sedikit, konsisten.** Button, Switch, Segmented, Toast, Icon.
4. **Motion halus dan singkat** (150–240 ms) dengan easing yang sama.
5. **Anti-slop:** tanpa glassmorphism, tanpa glow, tanpa ikon hias, tanpa metrik palsu, tanpa kartu "bento" kosong.

Setiap elemen UI harus menjawab: *fungsi apa yang dijalankannya?* Jika tidak ada, hapus.

## 9.2 Token Warna

```css
:root {
  color-scheme: light dark;

  /* Light */
  --bg: #f3f3f5;
  --surface: #ffffff;
  --surface-2: #f1f1f4;
  --surface-3: #e5e5ea;
  --text: #151518;
  --text-2: #6c6c75;
  --text-3: #8d8d96;
  --separator: rgba(18, 18, 22, 0.07);
  --ink: #161619;          /* kontrol aktif */
  --on-ink: #ffffff;       /* teks di atas --ink */
  --card-shadow: 0 1px 2px rgba(18, 18, 22, 0.04), 0 10px 26px rgba(18, 18, 22, 0.05);
  --support-bg: linear-gradient(135deg, #f8ebe0, #f0dcc6);
  --support-ink: #5c3a22;
  --accent: #0071e3;       /* hanya tautan */
}
```

Tema gelap membalik `--ink` menjadi `#f5f5f7` dan `--on-ink` menjadi `#141416`, dengan latar `#121214`, permukaan `#1d1d20`, dan bayangan lebih dalam. Palet lengkap ada di `src/ui/styles/tokens.css`.

`color-scheme` mengikuti tema yang dipilih: `:root[data-theme="light"]` → `light`, `:root[data-theme="dark"]` → `dark`. Tanpa ini, kontrol native (scrollbar, chevron `<details>`) tetap terang di tema gelap.

## 9.3 Tipografi

| Token | Nilai | Penggunaan |
|---|---|---|
| `--text-xs` | 11px | Footer, nilai tautan |
| `--text-sm` | 12px | Sub-teks baris, status |
| `--text-md` | 13px | Teks utama popup |
| `--text-lg` | 15px | Judul kecil |
| `--text-xl` | 17px | Judul bagian |
| `--text-2xl` | 21px | Judul halaman privasi |

Sapaan popup memakai 26px/600 dengan letter-spacing −0.035em. Subtitle sapaan memakai **Georgia italic 14.5px** — satu-satunya tempat serif dipakai, sebagai aksen lembut.

## 9.4 Spasi, Radius, Bayangan

- Spasi: `--sp-1` 4px … `--sp-7` 48px (skala 4/8/12/16/24/32/48).
- Radius: `--r-sm` 6px, `--r-md` 10px, `--r-lg` 14px, `--r-full` 999px.
- Kartu popup memakai radius 18–20px dengan `--card-shadow`, bukan border.
- Bayangan hanya untuk memisahkan kartu dari latar; tidak ada shadow berwarna.

## 9.5 Motion

- Perubahan kontrol: `--dur-1` (150 ms).
- Buka/tutup panel: `--dur-2` (240 ms).
- Pressed: `scale(0.94–0.98)`.
- Hormati `prefers-reduced-motion`: animasi skeleton dimatikan.

## 9.6 Ukuran Komponen

```css
:root {
  --ctl-h: 32px;        /* tinggi kontrol */
  --ctl-h-lg: 36px;
  --popup-w: 372px;     /* lebar tetap popup */
}
```

## 9.7 Komponen

### Button (`.btn`)
| Varian | Latar | Teks | Penggunaan |
|---|---|---|---|
| Default | `--surface-2` | `--text` | Tindakan sekunder (mis. "Muat ulang") |
| `.btn-sm` | — | — | Tinggi 26px untuk banner |

Tidak ada tombol primary berwarna di popup: aksi utama adalah switch dan segmented. State: default / hover (`--surface-3`) / pressed (scale 0.98) / disabled (opacity 0.45).

### Switch (`.switch`)
- Ukuran 40×24, knob 20, radius `--r-full`.
- Popup memakai 42×25 dengan knob 21 dan travel 17px.
- Aktif: `--ink`, knob putih.
- Aksen biru `--accent` hanya dipakai bila switch berada di luar popup.

### Segmented (`.segmented`)
- Wadah `--surface-2`, tinggi tombol 28px (34px di popup), radius 12–14px.
- Item aktif: `--ink` + `--on-ink`, tanpa bayangan.
- Item non-aktif: `--text-2`, hover `--text`.

### Chip platform (`.po-chip`)
- 38×38, radius 12px, logo SVG 19px berwarna `currentColor`.
- Terpilih: latar `--surface-2` + inset border.
- Platform aktif: titik 4px `--ink` di bawah logo.

### Toast (`.toast`)
- Muncul di bawah tengah, latar `--text`, teks `--bg`, radius `--r-lg`.
- Hanya untuk kegagalan menyimpan; tidak ada toast sukses.

### Icon (`.icon`)
- Ikon garis 24×24 viewBox, stroke 1.6, `stroke-linecap: round`.
- Logo platform memakai path brand resmi berwarna asli (WhatsApp hijau, Telegram biru, dst.).
- Ukuran pemakaian: 14–22px.

## 9.8 Aksesibilitas

- Semua kontrol memakai elemen native (`button`, `summary`) atau `role` + `aria-checked` / `aria-pressed` / `aria-selected`.
- `:focus-visible` memakai outline `--accent` 2px dengan offset 2px.
- Label switch menjelaskan aksi, mis. "Aktifkan perlindungan di WhatsApp Web".
- Kontras teks minimal mengikuti `--text-2` pada `--surface`; teks footer memakai `--text-3` hanya untuk informasi non-esensial.
