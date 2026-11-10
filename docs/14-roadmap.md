# 14 — Roadmap Pengembangan

> Estimasi waktu kalender sengaja tidak dicantumkan. Urutan dan ketergantungan yang menjadi acuan.

## 14.1 Fase 1 — Fondasi & Kerangka

**Isi:**
- Scaffold proyek, bundler, `manifest.config.ts`.
- `shared/types`, `defaults`, `platform-ids`.
- `config-store/storage` + skema versi.
- Skeleton `core/engine` dan `adapters/contract`.
- Popup minimal yang dapat membaca status.

**Deliverable:** ekstensi dapat dimuat unpacked; popup berfungsi; storage baca/tulis.

**Dependensi:** tidak ada.

**Kriteria selesai:**
- `npm run build` menghasilkan paket valid.
- `verify-privacy.ts` hijau.
- Popup menampilkan status dan toggle tersimpan.

## 14.2 Fase 2 — Mesin Perlindungan Inti

**Isi:**
- `effect-renderer`, `dom-watcher`, `focus-watcher`, `route-watcher`, `selector-resolver`.
- Reveal hover & shortcut.
- Adapter pertama: **Telegram** (DOM lebih stabil) sebagai proof-of-concept.
- Adapter kedua: **WhatsApp** (kasus tersulit).

**Deliverable:** proteksi nyata pada 2 platform.

**Dependensi:** Fase 1.

**Kriteria selesai:**
- US-02, US-03, US-04 lolos di Telegram dan WhatsApp.
- Performa dalam anggaran.
- Fail-open terbukti.

## 14.3 Fase 3 — Adapter Multi-Platform

**Isi:**
- Adapter Instagram DM.
- Registry final dengan 3 adapter.
- Fallback area.
- Fixture DOM untuk ketiga platform.
- Runbook selektor.

**Deliverable:** 3 platform P0 beroperasi.

**Dependensi:** Fase 2.

**Kriteria selesai:**
- Checklist verifikasi `06` lolos di 3 platform.
- Regresi selektor ter-cover test.

## 14.4 Fase 4 — UI/UX Lengkap

**Isi:**
- Popup final.
- Dashboard 5 halaman.
- Onboarding 2 langkah.
- Design system diterapkan penuh.
- Dark/light mode.
- Halaman About & Privacy.

**Deliverable:** produk terasa siap dipasang.

**Dependensi:** Fase 3 (butuh data status nyata).

**Kriteria selesai:**
- US-01, US-07, US-10 lolos.
- Checklist anti-slop lolos.
- Audit aksesibilitas dasar lolos.

## 14.5 Fase 5 — Pengemasan & Rilis Beta

**Isi:**
- E2E penuh.
- Audit privasi CI.
- Ikon, screenshot, deskripsi toko.
- Kebijakan privasi & justifikasi izin.
- Distribusi beta terbatas.

**Deliverable:** rilis beta di Chrome Web Store.

**Dependensi:** Fase 4.

**Kriteria selesai:**
- Semua AC P0 hijau.
- Review toko diterima.
- Mekanisme umpan balik tersedia (formulir/issue tracker, bukan telemetri).

## 14.6 Pasca-Beta (1.1)

- Adapter Facebook dan X.
- Zona nama/avatar/media.
- i18n id/en.
- Indikator mini di halaman.
- Panic blur.

Alasan penundaan: butuh data nyata dari beta tentang stabilitas selector sebelum menambah permukaan.

## 14.7 1.2

- Threads dan TikTok (setelah verifikasi ketersediaan DM web).
- Element picker.
- Sync opt-in.

## 14.8 2.0

- Port Firefox (setelah MV3 Firefox stabil untuk kebutuhan kita).
- Evaluasi Discord Web.

## 14.9 Ringkasan Ketergantungan

```
Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5 ──► Beta
                                                    │
                                                    ▼
                                                 1.1 ──► 1.2 ──► 2.0
```

## 14.10 Prinsip Penjadwalan

1. Jangan menambah platform sebelum mesin stabil.
2. Jangan membangun UI final sebelum data status nyata tersedia.
3. Setiap fase harus menghasilkan sesuatu yang dapat diuji pengguna.
4. Jika selektor platform gagal diverifikasi, tunda platform tersebut, bukan mengecilkan kualitas mesin.
