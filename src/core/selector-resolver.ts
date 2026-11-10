import type { ResolvedZone, SelectorCandidate, ZoneId } from '../shared/types.ts';

export interface CandidateMatch {
  candidate: SelectorCandidate;
  count: number;
}

/** Batas jumlah item agar overlay tidak membanjiri DOM pada daftar panjang. */
export const MAX_MULTI_ELEMENTS = 120;

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
function isOversized(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width * rect.height > viewportArea() * 0.9;
}

function isOverlayElement(element: Element): boolean {
  return (
    element.classList.contains('psx-overlay') ||
    element.tagName === 'STYLE' ||
    element.tagName === 'SCRIPT'
  );
}

function isUsableElement(element: Element, multi: boolean): boolean {
  if (!(element instanceof HTMLElement)) return false;
  if (isOverlayElement(element)) return false;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (isOversized(element)) return false;

  // Item (baris chat / nama) boleh kecil; panel harus cukup besar.
  return multi ? rect.width > 8 && rect.height > 10 : rect.width > 40 && rect.height > 40;
}

function queryUsable(
  root: ParentNode,
  selector: string,
  multi: boolean,
): Element[] {
  try {
    return [...root.querySelectorAll(selector)].filter((element) =>
      isUsableElement(element, multi),
    );
  } catch {
    return [];
  }
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
      elements: multi ? elements.slice(0, MAX_MULTI_ELEMENTS) : [elements[0] as Element],
      candidateId: candidate.id,
      score: candidate.weight,
    };
  }

  return null;
}

export { isOversized, isUsableElement };
