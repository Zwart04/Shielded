import type { ResolvedZone, SelectorCandidate, ZoneId } from '../shared/types.ts';

export interface CandidateMatch {
  candidate: SelectorCandidate;
  count: number;
}

/** Batas jumlah item agar overlay tidak membanjiri DOM pada daftar panjang. */
export const MAX_MULTI_ELEMENTS = 120;

/**
 * Batas node yang diperiksa per query. Daftar panjang tanpa virtualisasi bisa
 * berisi ribuan node; memeriksa semuanya memaksa ribuan reflow. Daftar chat di
 * platform target memang virtual (node didaur ulang), jadi 600 node sudah jauh
 * lebih dari cukup, sementara deteksi tetap datar di halaman aneh.
 */
const MAX_SCAN = 600;

/**
 * Memilih kandidat dengan bobot tertinggi yang benar-benar menemukan elemen.
 * Fungsi murni agar mudah diuji tanpa DOM.
 */
export function pickBest(
  candidates: readonly SelectorCandidate[],
  count: (selector: string) => number,
): CandidateMatch | null {
  const ordered = [...candidates].sort((a, b) => b.weight - a.weight);
  for (const candidate of ordered) {
    let found = 0;
    try {
      found = count(candidate.selector);
    } catch {
      found = 0;
    }
    if (found > 0) return { candidate, count: found };
  }
  return null;
}

function viewportArea(): number {
  const width = typeof window === 'undefined' ? 1920 : window.innerWidth;
  const height = typeof window === 'undefined' ? 1080 : window.innerHeight;
  return Math.max(1, width * height);
}

/**
 * Menolak elemen yang menutupi hampir seluruh viewport. Ini pengaman agar
 * root aplikasi (#app / #react-root) tidak pernah ikut dikaburkan.
 */
function isOversizedRect(rect: DOMRect): boolean {
  return rect.width * rect.height > viewportArea() * 0.9;
}

function isOversized(element: Element): boolean {
  return isOversizedRect(element.getBoundingClientRect());
}

function isOverlayElement(element: Element): boolean {
  return (
    element.classList.contains('psx-overlay') ||
    element.tagName === 'STYLE' ||
    element.tagName === 'SCRIPT'
  );
}

/**
 * Satu pembacaan layout per elemen: `getBoundingClientRect` memaksa reflow,
 * jadi memanggilnya dua kali untuk elemen yang sama membuang waktu.
 * Mengembalikan rect agar pemanggil bisa memakainya lagi untuk cek viewport.
 */
function usableRect(element: Element, multi: boolean): DOMRect | null {
  if (!(element instanceof HTMLElement)) return null;
  if (isOverlayElement(element)) return null;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  if (isOversizedRect(rect)) return null;

  // Item (baris chat / nama) boleh kecil; panel harus cukup besar.
  const ok = multi ? rect.width > 8 && rect.height > 10 : rect.width > 40 && rect.height > 40;
  return ok ? rect : null;
}

function isUsableElement(element: Element, multi: boolean): boolean {
  return usableRect(element, multi) !== null;
}

/**
 * Satu layar di atas dan di bawah viewport. Item di rentang ini diprioritaskan
 * agar daftar yang di-scroll tetap terlindungi walau batas item tercapai.
 */
function isNearViewport(rect: DOMRect): boolean {
  const width = typeof window === 'undefined' ? 1920 : window.innerWidth;
  const height = typeof window === 'undefined' ? 1080 : window.innerHeight;
  return rect.bottom > -height && rect.top < height * 2 && rect.right > 0 && rect.left < width;
}

/**
 * Mengumpulkan elemen yang layak, memprioritaskan yang dekat viewport.
 * Sebelumnya urutan DOM dipakai, sehingga pada daftar >120 item, item yang
 * sedang terlihat setelah scroll tidak pernah ter-blur. Pemindaian dibatasi
 * `MAX_SCAN` node supaya halaman raksasa tetap murah.
 */
function queryUsable(
  root: ParentNode,
  selector: string,
  multi: boolean,
): Element[] {
  const limit = multi ? MAX_MULTI_ELEMENTS : 1;
  const near: Element[] = [];
  const far: Element[] = [];
  let found: NodeListOf<Element>;
  try {
    found = root.querySelectorAll(selector);
  } catch {
    return near;
  }

  let scanned = 0;
  for (const element of found) {
    if (near.length >= limit || scanned >= MAX_SCAN) break;
    scanned += 1;

    const rect = usableRect(element, multi);
    if (!rect) continue;

    if (!multi) {
      near.push(element);
      break;
    }
    if (isNearViewport(rect)) near.push(element);
    else if (far.length < limit) far.push(element);
  }

  if (!multi || near.length >= limit) return near;
  return near.concat(far).slice(0, limit);
}

export function resolveZone(
  zone: ZoneId,
  candidates: readonly SelectorCandidate[] | undefined,
  root: ParentNode = document,
): ResolvedZone | null {
  if (!candidates || candidates.length === 0) return null;

  const ordered = [...candidates].sort((a, b) => b.weight - a.weight);
  for (const candidate of ordered) {
    const multi = candidate.multi === true;
    const elements = queryUsable(root, candidate.selector, multi);
    if (elements.length === 0) continue;

    return {
      zone,
      elements: multi ? elements : [elements[0] as Element],
      candidateId: candidate.id,
      score: candidate.weight,
    };
  }

  return null;
}

export { isOversized, isUsableElement };
