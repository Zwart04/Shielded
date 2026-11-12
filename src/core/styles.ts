export const CONTENT_CSS = `
:root {
  --psx-blur: 7px;
  --psx-tint: rgba(28, 28, 30, 0.1);
  --psx-cover: #f5f5f7;
}

/*
 * Blur diterapkan langsung ke elemen, bukan lewat kotak overlay.
 * Hasilnya mengikuti bentuk teks/isi, bukan persegi selebar baris.
 * Tanpa backdrop-filter: satu lapisan paint lebih murah dan tidak
 * membuat stacking context tambahan untuk setiap item.
 */
.psx-zone--blur {
  --psx-blur-eff: var(--psx-blur);
  filter: blur(var(--psx-blur-eff));
  transition: filter 120ms cubic-bezier(0.2, 0, 0, 1);
}

/*
 * Avatar/foto jauh lebih besar dari teks, jadi butuh radius lebih kuat agar
 * wajah tidak terbaca. Teks memakai radius kecil supaya bentuk huruf tidak
 * melebar jadi balok.
 */
img.psx-zone--blur,
.psx-zone--blur[class*="avatar" i],
.psx-zone--blur[class*="Avatar"] {
  --psx-blur-eff: calc(var(--psx-blur) * 2);
}

/* Foto penuh dan thumbnail besar: radius 3x supaya tulisan di dalam gambar
 * (promo, tangkapan layar) tidak bisa dibaca, bukan hanya kabur tipis.
 * Media penuh (gambar besar dalam post/pesan) butuh 4x: teks besar di dalam
 * gambar masih terbaca pada 15px. */
.psx-zone--blur.psx-zone--heavy {
  --psx-blur-eff: calc(var(--psx-blur) * 3);
}

.psx-zone--blur.psx-zone--heavy-media {
  --psx-blur-eff: calc(var(--psx-blur) * 4);
}

/* Cover tetap memakai overlay karena tujuannya menutup rapat. */
.psx-zone--cover .psx-overlay {
  position: absolute;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  border-radius: inherit;
  background: var(--psx-cover);
  opacity: 1;
  transition: opacity 120ms cubic-bezier(0.2, 0, 0, 1);
}

/*
 * Sembunyikan lewat opacity, bukan visibility: elemen tetap menerima pointer
 * sehingga hover bisa membukanya. visibility: hidden membuat reveal hover
 * mustahil dan bertentangan dengan kontrol "Hover membuka item".
 */
.psx-zone--hide {
  opacity: 0;
  transition: opacity 120ms cubic-bezier(0.2, 0, 0, 1);
}

.psx-zone--direct.psx-zone--cover {
  opacity: 0;
  transition: opacity 120ms cubic-bezier(0.2, 0, 0, 1);
}

/* Reveal hanya item yang disorot. */
.psx-zone--blur:hover,
.psx-zone--hide:hover,
.psx-zone--direct.psx-zone--cover:hover,
.psx-zone.psx-revealed.psx-zone--blur,
.psx-zone.psx-revealed.psx-zone--hide,
.psx-zone.psx-revealed.psx-zone--direct.psx-zone--cover {
  filter: none;
  opacity: 1;
}

.psx-zone--cover:hover > .psx-overlay,
.psx-zone.psx-revealed.psx-zone--cover > .psx-overlay,
body.psx-reveal-all .psx-overlay {
  opacity: 0;
}

body.psx-reveal-all .psx-zone--blur {
  filter: none;
}

body.psx-reveal-all .psx-zone--direct.psx-zone--cover {
  opacity: 1;
}

body.psx-reveal-all .psx-zone--hide {
  opacity: 1;
}

/* Hover reveal dimatikan / dikunci: tetap tertutup. */
body.psx-hover-off .psx-zone--blur:hover,
body.psx-locked .psx-zone--blur:hover,
body.psx-locked .psx-zone.psx-revealed.psx-zone--blur {
  filter: blur(var(--psx-blur-eff));
}

body.psx-hover-off .psx-zone--hide:hover,
body.psx-locked .psx-zone--hide:hover,
body.psx-locked .psx-zone.psx-revealed.psx-zone--hide {
  opacity: 0;
}

body.psx-hover-off .psx-zone--direct.psx-zone--cover:hover,
body.psx-locked .psx-zone--direct.psx-zone--cover:hover,
body.psx-locked .psx-zone.psx-revealed.psx-zone--direct.psx-zone--cover {
  opacity: 0;
}

body.psx-hover-off .psx-zone--cover:hover > .psx-overlay,
body.psx-locked .psx-zone--cover:hover > .psx-overlay,
body.psx-locked .psx-zone.psx-revealed.psx-zone--cover > .psx-overlay {
  opacity: 1;
}

body.psx-locked.psx-reveal-all .psx-zone--blur {
  filter: none;
}

body.psx-locked.psx-reveal-all .psx-zone--direct.psx-zone--cover {
  opacity: 1;
}

body.psx-locked.psx-reveal-all .psx-overlay {
  opacity: 0;
}

/* Reveal tanpa transisi (opsi "tanpa jeda transisi"). */
body.psx-instant .psx-zone--blur,
body.psx-instant .psx-zone--heavy,
body.psx-instant .psx-zone--heavy-media,
body.psx-instant .psx-zone--cover .psx-overlay,
body.psx-instant .psx-zone--direct.psx-zone--cover {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .psx-zone--blur,
  .psx-zone--cover .psx-overlay,
  .psx-zone--direct.psx-zone--cover {
    transition: none;
  }
}
`;

export const STYLE_ELEMENT_ID = 'psx-style';
