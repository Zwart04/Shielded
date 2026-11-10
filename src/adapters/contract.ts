import type {
  PlatformId,
  ZoneId,
  SelectorCandidate,
  ResolvedChatArea,
  ResolvedZone,
} from '../shared/types.ts';
import { MAX_MULTI_ELEMENTS, resolveZone } from '../core/selector-resolver.ts';
import { findConversationRows } from '../core/structural.ts';

export type ZoneSelectors = Partial<Record<ZoneId, readonly SelectorCandidate[]>>;

export interface PlatformAdapter {
  id: PlatformId;
  name: string;
  hosts: readonly string[];
  selectors: ZoneSelectors;
  /**
   * Kandidat area pesan jika selector presisi gagal. Jangan pernah memakai
   * root aplikasi (#app / #react-root): itu akan mengaburkan seluruh halaman.
   */
  fallback?: readonly SelectorCandidate[];
  /** Catatan khusus platform, contoh: dua basis klien Telegram. */
  quirks?: readonly string[];
}

interface RowParts {
  names: Element[];
  previews: Element[];
  avatars: Element[];
  mediaPreviews: Element[];
}

const PREVIEW_CLASSES =
  '.last-message, .preview, .chat-preview, [data-testid="last-message"], [data-testid="conversation-preview"]';

/** Elemen teks daun; hanya teks/atribut yang dibaca, tidak pernah isinya. */
const TEXT_SELECTOR = 'span, div, p, a, b, strong, em, small, time';

/**
 * Avatar tidak selalu <img>: Telegram Web A memakai <div class="Avatar">
 * dengan background-image, WhatsApp memakai <img>. Keduanya dicari.
 */
const AVATAR_SELECTOR =
  'img, [class*="avatar" i], [data-testid*="avatar" i], [style*="background-image"]';

/** Thumbnail media di dalam baris chat (bukan foto profil). */
const MEDIA_PREVIEW_SELECTOR =
  '[data-testid="media-preview"], [class*="thumbnail" i], [class*="media-preview" i], video';

/** Batas bagian preview per baris bila pengelompokan gagal. */
const MAX_PREVIEW_PARTS = 8;

/**
 * Teks langsung di dalam elemen. WhatsApp membungkus isi preview dalam
 * <span title> yang berisi teks + ikon anak, sehingga syarat "tanpa elemen
 * anak" membuat preview lolos. Cukup ada satu text node berisi, elemen itu
 * dianggap unit teks.
 */
function hasDirectText(element: Element): boolean {
  for (const node of element.childNodes) {
    if (node.nodeType === 3 && (node.textContent ?? '').trim().length > 0) return true;
  }
  return false;
}

function isTextLeaf(element: Element): boolean {
  if ((element.textContent ?? '').trim().length === 0) return false;
  return element.childElementCount === 0 || hasDirectText(element);
}

function canMeasure(element: Element): boolean {
  return typeof element.getBoundingClientRect === 'function';
}

/** Leluhur terdekat yang memuat semua node, tanpa melewati `limit`. */
function commonAncestor(nodes: readonly Element[], limit: Element): Element | null {
  if (nodes.length === 0) return null;
  let candidate: Element | null = nodes[0]!.parentElement;
  while (candidate && candidate !== limit) {
    if (nodes.every((node) => candidate!.contains(node))) return candidate;
    candidate = candidate.parentElement;
  }
  return null;
}

/**
 * Baris chat biasanya punya dua baris visual: nama di atas, preview di bawah.
 * Teks di bawah garis nama dikumpulkan, lalu digabung ke satu wadah bersama.
 * Hasilnya satu elemen per baris (bukan 5-10 span), jadi jauh lebih ringan,
 * dan area yang dikaburkan tetap mengikuti garis teks (bukan kotak baris).
 */
/**
 * Semua teks di baris selain nama adalah preview. Tidak memakai perbandingan
 * posisi vertikal: pada beberapa build WhatsApp, baris preview punya kotak
 * yang tumpang tindih dengan nama, sehingga filter `top >= name.bottom`
 * membuat preview lolos tanpa blur (bug daftar chat).
 *
 * Jika semua teks preview berada dalam satu wadah, wadah itu yang dipakai
 * supaya jumlah node tetap kecil; jika tidak, tiap teks dilindungi sendiri.
 */
/** Waktu dan lencana di kolom kanan baris; tidak perlu dikaburkan. */
function isRightMeta(element: Element, row: Element): boolean {
  if (typeof row.getBoundingClientRect !== 'function') return false;
  if (typeof element.getBoundingClientRect !== 'function') return false;
  const rowRect = row.getBoundingClientRect();
  if (rowRect.width <= 0) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.left > rowRect.left + rowRect.width * 0.72 &&
    rect.width < rowRect.width * 0.3
  );
}

function previewTargets(row: Element, name: Element | null, texts: readonly Element[]): Element[] {
  const after = texts.filter(
    (element) =>
      element !== name &&
      !(name && name.contains(element)) &&
      !isRightMeta(element, row),
  );

  if (after.length > 1) {
    const group = commonAncestor(after, row);
    if (group && group !== row && !(name && group.contains(name))) return [group];
  }

  return after.slice(0, MAX_PREVIEW_PARTS);
}

/**
 * Menurunkan bagian per baris tanpa membaca isi pesan:
 * - nama    = teks pertama berurutan (span[dir] / .peer-title / [title]) di baris
 * - preview = elemen preview yang dikenal, atau SEMUA teks daun setelah nama
 *             (satu baris chat sering dipecah beberapa span: teks + status + ikon)
 * - avatar  = <img> pertama, atau elemen ber-background avatar
 *
 * Memakai semua teks setelah nama, bukan hanya satu span, agar tidak ada
 * potongan preview yang lolos (mis. "keluar", centang, atau label status).
 */
function deriveRowParts(rows: readonly Element[]): RowParts {
  const names: Element[] = [];
  const previews: Element[] = [];
  const avatars: Element[] = [];
  const mediaPreviews: Element[] = [];

  for (const row of rows) {
    const texts = [...row.querySelectorAll(TEXT_SELECTOR)].filter(isTextLeaf);
    // `[dir="auto"]` berlaku untuk span maupun div: Web A memakai div.
    const named = [
      ...row.querySelectorAll('span[dir], [dir="auto"], .peer-title, [class*="peer-title" i], h3, h4, [title]'),
    ];
    const name =
      named.find((element) => (element.textContent ?? '').trim().length > 0) ?? texts[0] ?? null;
    if (name) names.push(name);

    const avatar = row.querySelector(AVATAR_SELECTOR);
    if (avatar) avatars.push(avatar);

    // Thumbnail media: img/element bergambar di baris yang bukan avatar.
    const media =
      row.querySelector(MEDIA_PREVIEW_SELECTOR) ??
      [...row.querySelectorAll('img, [style*="background-image"]')].find(
        (element) => element !== avatar && !(avatar && avatar.contains(element)),
      );
    if (media && media !== avatar) mediaPreviews.push(media);

    // Label preview eksplisit tetap dipakai, tetapi teks lain di baris yang
    // sama juga dilindungi. Sebelumnya `continue` membuat sebagian baris
    // (mis. pesan sistem "keluar") lolos tanpa blur.
    const label = row.querySelector(PREVIEW_CLASSES);
    if (label) previews.push(label);

    const targets = previewTargets(row, name, texts);
    for (const element of targets) {
      if (element === avatar || (avatar && avatar.contains(element))) continue;
      previews.push(element);
    }
  }

  return { names, previews, avatars, mediaPreviews };
}

/** Elemen tanpa kotak layout (tersembunyi / node lama) tidak layak dilindungi. */
function isVisible(element: Element): boolean {
  return typeof element.getClientRects !== 'function' || element.getClientRects().length > 0;
}

function dedupe(elements: readonly Element[]): Element[] {
  const seen = new Set<Element>();
  const result: Element[] = [];
  for (const element of elements) {
    if (seen.has(element)) continue;
    if (!isVisible(element)) continue;
    seen.add(element);
    result.push(element);
    if (result.length >= MAX_MULTI_ELEMENTS) break;
  }
  return result;
}

function mergeZone(
  zone: ZoneId,
  explicit: ResolvedZone | null,
  derived: readonly Element[],
): ResolvedZone | null {
  // Bagian turunan per baris didahulukan: selalu elemen yang benar-benar
  // terlihat, sehingga kuota tidak habis oleh node tersembunyi dari selector.
  const elements = dedupe([...derived, ...(explicit?.elements ?? [])]);
  if (elements.length === 0) return null;

  return {
    zone,
    elements,
    candidateId: explicit ? `${explicit.candidateId}+derived` : 'derived',
    score: explicit?.score ?? 1,
  };
}

export function detectChatArea(adapter: PlatformAdapter, root: ParentNode = document): ResolvedChatArea {
  const messages = resolveZone('messages', adapter.selectors.messages, root);
  const media = resolveZone('media', adapter.selectors.media, root);
  let usedHeuristic = false;

  let conversationList = resolveZone('chatList', adapter.selectors.chatList, root);
  if (!conversationList) {
    const rows = findConversationRows(root);
    if (rows.length >= 3) {
      conversationList = {
        zone: 'chatList',
        elements: rows,
        candidateId: 'structural-rows',
        score: 1,
      };
      usedHeuristic = true;
    }
  }

  const rows = conversationList?.elements ?? [];
  const parts = deriveRowParts(rows);

  const names = mergeZone('names', resolveZone('names', adapter.selectors.names, root), parts.names);
  const mediaPreview = mergeZone(
    'mediaPreview',
    resolveZone('mediaPreview', adapter.selectors.mediaPreview, root),
    parts.mediaPreviews,
  );
  const feedContent = resolveZone('feedContent', adapter.selectors.feedContent, root);
  const textInput = resolveZone('textInput', adapter.selectors.textInput, root);
  const avatars = mergeZone(
    'avatars',
    resolveZone('avatars', adapter.selectors.avatars, root),
    parts.avatars,
  );
  const chatPreview = mergeZone(
    'chatPreview',
    resolveZone('chatPreview', adapter.selectors.chatPreview, root),
    parts.previews,
  );

  let fallbackMessages: ResolvedZone | null = messages;
  let usedFallback = false;
  if (!messages && adapter.fallback && adapter.fallback.length > 0) {
    fallbackMessages = resolveZone('messages', adapter.fallback, root);
    usedFallback = fallbackMessages !== null;
  }

  return {
    messages: fallbackMessages,
    chatList: conversationList,
    chatPreview,
    names,
    avatars,
    mediaPreview,
    media,
    feedContent,
    textInput,
    usedFallback,
    usedHeuristic,
  };
}

export { deriveRowParts };
