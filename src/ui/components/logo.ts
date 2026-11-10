/**
 * Logo Shielded: ghost dengan bar sensor (aset raster resmi, latar transparan).
 * Ukuran tampil kecil (20-24px), jadi satu berkas 128px sudah tajam di DPR 2x.
 * `icons/logo.png` adalah master 256px, `icons/icon*.png` dipakai manifest.
 */
/** Path absolut lewat runtime; fallback relatif untuk halaman uji tanpa chrome.*/
function logoSrc(): string {
  try {
    return chrome.runtime.getURL('icons/icon128.png');
  } catch {
    return '../../icons/icon128.png';
  }
}

export function brandLogo(size = 20): HTMLImageElement {
  const img = document.createElement('img');
  img.setAttribute('src', logoSrc());
  img.width = size;
  img.height = size;
  img.alt = '';
  img.decoding = 'async';
  img.className = 'brand-logo';
  img.setAttribute('aria-hidden', 'true');
  return img;
}
