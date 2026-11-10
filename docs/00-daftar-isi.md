# 00 — Daftar Isi

Dokumen perencanaan Shielded disusun dalam 15 bagian utama plus dokumen pendukung untuk keperluan rilis.

## Bagian Utama

1. [Ringkasan Eksekutif](01-ringkasan-eksekutif.md)
2. [Konsep & Posisi Produk](02-konsep-dan-posisi-produk.md)
3. [Fitur Utama & Diferensiasi](03-fitur-utama-dan-diferensiasi.md)
4. [PRD (Product Requirements Document)](04-prd.md)
5. [Lingkup MVP & Prioritas](05-lingkup-mvp-dan-prioritas.md)
6. [Analisis Kompatibilitas Platform](06-analisis-kompatibilitas-platform.md)
7. [Arsitektur Teknis & Modul](07-arsitektur-teknis.md)
8. [Struktur Proyek](08-struktur-proyek.md)
9. [Design System (Apple-inspired)](09-design-system.md)
10. [Desain Antarmuka per Layar](10-desain-antarmuka.md)
11. [Alur Pengguna & Diagram Mermaid](11-alur-pengguna.md)
12. [Keamanan, Privasi & Performa](12-keamanan-privasi-performa.md)
13. [Rencana Pengujian & Acceptance Criteria](13-rencana-pengujian.md)
14. [Roadmap Pengembangan](14-roadmap.md)
15. [Risiko, Batasan & Ekspansi](15-risiko-dan-ekspansi.md)

## Dokumen Pendukung

- [Kebijakan Privasi (draf)](privacy-policy.md)
- [Justifikasi Izin Ekstensi](permissions-justification.md)
- [Runbook Selektor Platform](selectors-runbook.md)
- [Hasil Verifikasi Selektor](selector-verification-results.md)
- [Glosarium](glossary.md)

## Cara Membaca Dokumen Ini

- **Product Manager / pemilik produk:** baca 01, 02, 03, 04, 05, 14, 15.
- **Arsitek / developer:** baca 06, 07, 08, 12, 13, plus `selectors-runbook.md`.
- **Desainer UI/UX:** baca 09, 10, 11, 03, 05.
- **Reviewer toko / legal:** baca 04, 12, `privacy-policy.md`, `permissions-justification.md`.

## Status Tiap Bagian

| Bagian | Status | Catatan |
|---|---|---|
| 01–05 | Final untuk perencanaan | Dapat dieksekusi |
| 06 | Sebagian **[Perlu Verifikasi]** | Butuh uji langsung terhadap DOM tiap situs |
| 07–08 | Final untuk perencanaan | Siap scaffold |
| 09–10 | Final tingkat token & layout | Butuh desain visual high-fidelity sebelum rilis |
| 11 | Final | Diagram dapat langsung dipakai tim QA |
| 12–13 | Final | Anggaran performa perlu diukur ulang saat implementasi |
| 14–15 | Final | Estimasi waktu sengaja tidak dibuat (lihat 14) |
