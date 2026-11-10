import { MAX_MULTI_ELEMENTS } from './selector-resolver.ts';

interface RowCandidate {
  element: HTMLElement;
  left: number;
  width: number;
  top: number;
  height: number;
}

function rowCandidate(element: Element, viewportWidth: number, viewportHeight: number): RowCandidate | null {
  if (!(element instanceof HTMLElement)) return null;
  if (element.classList.contains('psx-overlay')) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width < 140 || rect.height < 34 || rect.height > 130) return null;
  if (rect.left < 0 || rect.bottom <= 0 || rect.top >= viewportHeight) return null;
  // Daftar percakapan selalu berada di kolom kiri.
  if (rect.right > viewportWidth * 0.62) return null;

  return {
    element,
    left: rect.left,
    width: rect.width,
    top: rect.top,
    height: rect.height,
  };
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

/**
 * Mencari kelompok baris percakapan berdasarkan geometri, bukan class.
 * Dipakai hanya sebagai jaring pengaman ketika selector eksplisit gagal,
 * misalnya saat platform merombak nama class (Telegram Web A).
 *
 * Tidak membaca teks apa pun; hanya posisi dan ukuran kotak.
 */
export function findConversationRows(root: ParentNode = document): Element[] {
  if (typeof window === 'undefined') return [];
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  if (viewportWidth < 720 || viewportHeight < 400) return [];

  let best: RowCandidate[] = [];

  for (const parent of root.querySelectorAll('div, ul, ol, section')) {
    if (!(parent instanceof HTMLElement)) continue;
    if (parent.classList.contains('psx-overlay')) continue;

    const rows: RowCandidate[] = [];
    for (const child of parent.children) {
      const candidate = rowCandidate(child, viewportWidth, viewportHeight);
      if (candidate) rows.push(candidate);
    }

    if (rows.length < 3) continue;

    // Baris harus sejajar dan seragam; ini membuang toolbar atau kartu acak.
    const left = median(rows.map((row) => row.left));
    const width = median(rows.map((row) => row.width));
    const height = median(rows.map((row) => row.height));
    const aligned = rows.every(
      (row) => Math.abs(row.left - left) <= 12 && Math.abs(row.width - width) <= width * 0.25,
    );
    const uniform = rows.every((row) => Math.abs(row.height - height) <= 24);
    if (!aligned || !uniform) continue;

    // Harus benar-benar bertumpuk vertikal, bukan baris horizontal.
    const ordered = [...rows].sort((a, b) => a.top - b.top);
    let stacked = true;
    for (let index = 1; index < ordered.length; index += 1) {
      const gap = ordered[index]!.top - (ordered[index - 1]!.top + ordered[index - 1]!.height);
      if (gap < -4 || gap > 18) {
        stacked = false;
        break;
      }
    }
    if (!stacked) continue;

    if (rows.length > best.length) best = rows;
  }

  return best.slice(0, MAX_MULTI_ELEMENTS).map((row) => row.element);
}
