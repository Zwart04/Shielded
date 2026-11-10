# 07 — Arsitektur Teknis & Modul

> Tujuan: arsitektur yang **bertahan lama**, mudah diuji, dan mudah ditambah platform baru tanpa menyentuh mesin inti.

## 7.1 Gambaran Besar

```
┌─────────────────────────────────────────────────────────────┐
│ Halaman Web (web.whatsapp.com, dst.)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Content Script (isolated world)                       │  │
│  │  bootstrap → Adapter Registry → PlatformAdapter       │  │
│  │                 │                                     │  │
│  │                 ▼                                     │  │
│  │         PrivacyEngine (state machine)                 │  │
│  │          ├─ DomWatcher (MutationObserver terpinat)    │  │
│  │          ├─ FocusWatcher (visibility / blur)          │  │
│  │          ├─ RouteWatcher (URL polling ringan)         │  │
│  │          ├─ SelectorResolver (multi-kandidat)         │  │
│  │          └─ EffectRenderer (1 stylesheet + kelas)     │  │
│  └───────────────────────▲───────────────────────────────┘  │
│                          │ runtime messaging                 │
└──────────────────────────│──────────────────────────────────┘
                           ▼
┌───────────────────────────────┐    ┌─────────────────────────┐
│ Background Service Worker     │◀──▶│ Popup / Dashboard       │
│ (commands, badge, relay)      │    │ (halaman ekstensi)      │
└───────────────────────────────┘    └───────────┬─────────────┘
                                                 ▼
                                      chrome.storage.local
                                      (preferensi saja)
```

## 7.2 Mengapa Pembagian Ini

- **Content script** adalah satu-satunya komponen yang boleh menyentuh DOM halaman. Semua logika DOM terkurung di sini.
- **Background service worker** di MV3 bersifat sementara (dapat dihentikan kapan saja) — **[Fakta]**. Karena itu ia **tidak menyimpan state penting**; fungsinya hanya:
  - menerima perintah keyboard (`chrome.commands`),
  - memperbarui badge ikon,
  - meneruskan pesan popup ↔ content script.
- **Popup & dashboard** adalah halaman ekstensi biasa. Mereka membaca/menulis preferensi dan mengirim perintah, tanpa logika proteksi.

## 7.3 Peran Setiap Modul

| Modul | Tanggung jawab | Tidak boleh melakukan |
|---|---|---|
| `core/engine.ts` | State machine per tab; attach/detach adapter; terapkan level; kelola reveal | Mengetahui selector platform |
| `core/effect-renderer.ts` | Suntik satu stylesheet; tambah/hapus kelas efek | Membaca teks pesan |
| `core/dom-watcher.ts` | MutationObserver terpinat + kebijakan rescan | Mengamati seluruh `body` terus-menerus |
| `core/focus-watcher.ts` | `visibilitychange`, `window blur/focus`, `mouseleave` | Mengubah preferensi |
| `core/route-watcher.ts` | Polling `location.href` + callback | Melakukan patch `history` (ditunda) |
| `core/selector-resolver.ts` | Evaluasi kandidat selector, skor, cache | Menyimpan hasil permanen |
| `adapters/*` | Data selector + rules + quirk platform | Logika efek |
| `config-store/storage.ts` | Baca/tulis preferensi + migrasi skema | Menyimpan konten pesan |
| `background/service-worker.ts` | Commands, badge, relay | Menyimpan state |
| `ui/*` | Rendering antarmuka pengaturan | Menyentuh DOM halaman web |

## 7.4 Kontrak `PlatformAdapter`

Setiap adapter mendeklarasikan:

```ts
interface PlatformAdapter {
  id: PlatformId;                      // "whatsapp" | "telegram" | ...
  hosts: readonly string[];            // dicocokkan lewat location.hostname
  selectors: Partial<Record<ZoneId, readonly SelectorCandidate[]>>;
  fallback?: readonly SelectorCandidate[]; // hanya area pesan, bukan root aplikasi
  quirks?: readonly string[];          // portal, iframe, dua basis klien
}

interface SelectorCandidate {
  id: string;
  selector: string;
  weight: number;
  note: string;
  multi?: boolean;                     // true = satu elemen per item (baris, nama, avatar)
}

interface ResolvedChatArea {
  messages: ResolvedZone | null;
  chatList: ResolvedZone | null;
  chatPreview: ResolvedZone | null;
  names: ResolvedZone | null;
  avatars: ResolvedZone | null;
  media: ResolvedZone | null;
  usedFallback: boolean;
  usedHeuristic: boolean;
}

interface ResolvedZone {
  zone: ZoneId;
  elements: Element[];                 // satu entri per item
  candidateId: string;
  score: number;
}
```

**Prinsip:** adapter mendeskripsikan **di mana** dan **apa**, engine memutuskan **bagaimana**.

Zona per item (`chatList`, `chatPreview`, `names`, `avatars`, `mediaPreview`, `media`) memakai `multi: true`; `messages`/`textInput` menyasar satu elemen panel atau kotak ketik. Untuk platform yang tidak menyediakan selector nama/preview/avatar yang stabil, bagian tersebut diturunkan dari setiap baris chat tanpa membaca teks pesan: hanya atribut `title`, kelas preview yang dikenal, dan elemen `img`. Elemen yang sudah tercakup zona induk (mis. nama di dalam baris chat) dilewati agar overlay tidak bertumpuk dan hover tetap per item.

## 7.5 State Machine Engine

```
idle
  │ platform terdeteksi
  ▼
active ──(level Normal)──► passthrough
  │ level Privasi/Maksimum
  ▼
protected ──(hover / shortcut)──► revealed_temp
  │                                       │
  │◄────────(timeout / mouseleave)────────┘
  │
  ├──(tab hidden / window blur)──► protected_forced
  │                                      │
  │◄──(fokus kembali + opsi pulih)───────┘
  │
  └──(platform dinonaktifkan)──► idle
```

State disimpan di memori content script; preferensi persisten ada di storage. Tidak ada state di background.

## 7.6 Strategi Selektor Anti-Rentan

Urutan kandidat:

1. **Atribut semantik / ARIA** — `role`, `aria-label`, `data-*` yang stabil.
2. **Struktur hierarkis** — parent/child relatif, posisi kolom.
3. **Class generator** — pilihan terakhir.
4. **Geometri** — ukuran/posisi sebagai heuristik tambahan.

Setiap kandidat dievaluasi dengan skor. Kandidat yang elemennya menutupi >90% viewport ditolak, dan root aplikasi (`#app`, `#react-root`, `body`) tidak pernah dipakai. Jika skor terbaik < ambang, engine masuk **fallback area**: melindungi container panel chat (bukan seluruh halaman) dan melaporkan status `degraded`.

Deteksi diulang maksimal 2-3x per detik (throttle 400 ms) plus heartbeat 2 detik agar daftar virtual dan perubahan DOM tetap tertangkap. Elemen yang sudah berkelas `psx-zone` tetap dianggap valid pada deteksi berikutnya; overlay ekstensi (`psx-overlay`) yang diabaikan.

**Health check:** engine mencatat (di memori) jika selector gagal berulang. Hasilnya hanya dipakai untuk diagnostik lokal; tidak dikirim ke mana pun.

**Mengapa bukan satu selector:** satu selector = satu titik kegagalan. Multi-kandidat + fallback memastikan proteksi tidak hilang total saat situs berubah.

## 7.7 Performa MutationObserver

- Satu observer global **hanya selama fase pencarian awal**.
- Setelah zona ditemukan, observer dipindahkan ke subtree zona — bukan `document.body`.
- Callback di-*coalesce* dengan `requestAnimationFrame` (maksimal sekali per frame).
- Query selector di-cache per route; rescan hanya ketika route berubah atau root zona ter-unmount.
- `attributes: false` bila cukup `childList + subtree`.

## 7.8 Isolasi CSS

- Semua kelas berprefix `psx-` (`psx-zone`, `psx-overlay`, `psx-on`).
- Satu `<style data-psx>` disuntikkan sekali per halaman.
- `!important` hanya untuk properti kunci overlay (`position`, `z-index`).
- Shadow DOM **hanya** untuk indikator mini di halaman (P1), karena perlu isolasi dua arah dari style situs.

## 7.9 Teknologi: Dipakai vs Ditolak

| Teknologi | Keputusan | Alasan |
|---|---|---|
| TypeScript + bundler (Vite/CRXJS/wxt) | Dipakai | Type safety, multi-entry, manifest generation |
| `chrome.storage.local` | Dipakai | Cukup untuk preferensi, local-first |
| `chrome.storage.sync` | P2 opt-in | Sinkronisasi bukan kebutuhan MVP; kuota kecil |
| `chrome.commands` | Dipakai | Satu-satunya cara shortcut resmi |
| MutationObserver | Dipakai | API standar untuk DOM dinamis |
| Shadow DOM | Dipakai terbatas (HUD) | Isolasi style; tidak untuk seluruh proteksi |
| MAIN-world injection | **Ditolak (default)** | Menambah permukaan interaksi dengan kode situs |
| `all_frames` | **Ditolak** | Kolom chat utama bukan iframe (verifikasi per platform) |
| Remote code / CDN | **Ditolak** | Dilarang MV3; melanggar prinsip |
| Framework UI berat (React di popup) | **Ditolak** | Popup kecil; vanilla/DOM ringan lebih cepat |
| `webRequest` / `cookies` / `history` | **Ditolak** | Tidak dibutuhkan; melanggar least privilege |

## 7.10 Aliran Data

1. Manifest mendeklarasikan `content_scripts` untuk 7 domain + `commands` + `storage`.
2. Halaman dibuka → bootstrap → registry memilih adapter → `detect()`.
3. Engine membangun zona dan menerapkan level dari storage.
4. Popup mengubah preferensi → `storage.local` → `storage.onChanged` di content script → re-apply.
5. Perintah transien (reveal-all, panic) lewat `chrome.runtime.sendMessage`.
6. Background hanya meneruskan dan memperbarui badge.

**Kenapa `storage.onChanged` untuk preferensi, bukan messaging:** preferensi bersifat persisten dan banyak konsumen; storage event lebih sederhana, idempoten, dan tidak bergantung pada siklus hidup service worker.

## 7.11 Penanganan Kegagalan

| Kegagalan | Perilaku |
|---|---|
| Adapter tidak ditemukan | Tidak ada efek; situs normal; log lokal |
| Selector gagal | Fallback area; jika tetap gagal, tidak ada efek |
| Storage gagal dibaca | Gunakan default; tampilkan error di popup |
| Content script gagal inject | Situs tetap normal; badge tidak aktif |

Prinsip: **fail-open untuk situs, fail-safe untuk privasi pengguna** — jika proteksi tidak bisa dipastikan, jangan menampilkan status "terlindungi" secara palsu.
