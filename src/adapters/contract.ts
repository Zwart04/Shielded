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
  /**
   * Route yang dianggap ruang pesan. Di luar route ini hanya zona `feedContent`
   * yang dijalankan, sehingga feed/beranda tidak pernah tersentuh zona lain.
   * Tanpa properti ini adapter dianggap selalu berada di ruang pesan.
   */
  dmPaths?: readonly string[];
  /** Host yang seluruhnya dianggap ruang pesan (mis. web.messenger.com). */
  dmHosts?: readonly string[];
  /**
   * Wadah pesan yang juga muncul di luar route DM, contoh panel "Chats" di
   * facebook.com. Bila ditemukan, zona pesan hanya dijalankan di dalam wadah
   * ini sehingga feed di sekitarnya tetap terlihat.
   */
  dmScopes?: readonly SelectorCandidate[];
  /** Catatan khusus platform, contoh: dua basis klien Telegram. */
  quirks?: readonly string[];
}

const EMPTY_PARTS: RowParts = {
  names: [],
  previews: [],
  avatars: [],
  mediaPreviews: [],
};

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
const AVATAR_SELECTOR = [
  'img',
  '[class*="avatar" i]',
  '[data-testid*="avatar" i]',
  '[style*="background-image"]',
  // Avatar bawaan WhatsApp (tanpa foto): ikon grup/kontak di dalam span.
  // Wrapper-nya yang dikaburkan agar lingkaran berwarna ikut tertutup.
  'div:has(> [data-icon*="default" i])',
  '[data-icon="default-group"]',
  '[data-icon="default-user"]',
].join(', ');

/**
 * Slot foto profil. Avatar selalu kotak kecil (32-64 px) di sisi kiri baris,
 * jadi geometri dipakai lebih dulu: itu menangkap avatar yang digambar lewat
 * background-image dari stylesheet, ikon bawaan, atau cincin status yang
 * membungkus foto. Selector hanya dipakai bila geometri tidak menemukan.
 *
 * Batas 64 px penting: pembungkus baris setinggi 72 px juga persegi, dan
 * memblur pembungkus itu menghasilkan bulatan besar yang menutupi seluruh
 * baris, bukan hanya foto.
 */
const AVATAR_MIN = 32;
const AVATAR_MAX = 64;
const AVATAR_SCAN = 14;

function findAvatarSlot(row: Element): Element | null {
  if (typeof row.getBoundingClientRect !== 'function') return row.querySelector(AVATAR_SELECTOR);
  const rowRect = row.getBoundingClientRect();
  if (rowRect.width <= 0) return row.querySelector(AVATAR_SELECTOR);
  if (typeof row.querySelectorAll !== 'function') return null;

  let best: Element | null = null;
  let bestLeft = Number.POSITIVE_INFINITY;
  let bestSize = 0;
  const nodes = row.querySelectorAll('*');
  const limit = Math.min(nodes.length, AVATAR_SCAN);

  for (let index = 0; index < limit; index += 1) {
    const node = nodes[index]!;
    if (typeof node.getBoundingClientRect !== 'function') continue;
    const rect = node.getBoundingClientRect();
    if (rect.width < AVATAR_MIN || rect.width > AVATAR_MAX) continue;
    // Toleransi kecil: pembungkus cincin/status kadang beberapa px lebih
    // tinggi. Longgar (8 px) membuat avatar tampak lonjong setelah dipotong.
    if (Math.abs(rect.width - rect.height) > 3) continue;
    const left = rect.left - rowRect.left;
    if (left < 0 || left > 40) continue;
    // Kandidat paling kiri menang; bila sama, ambil yang terluar (lebih besar)
    // supaya cincin dan ikon ikut terbawa, bukan hanya foto di dalamnya.
    if (left < bestLeft - 1 || (Math.abs(left - bestLeft) <= 1 && rect.width > bestSize)) {
      best = node;
      bestLeft = left;
      bestSize = rect.width;
    }
  }

  return best ?? row.querySelector(AVATAR_SELECTOR);
}

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

    const avatar = findAvatarSlot(row);
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

/**
 * Buang elemen yang sama dengan, berada di dalam, atau membungkus elemen nama.
 * Tanpa ini, selector preview yang longgar (mis. `span[dir="auto"]`) ikut
 * mengaburkan nama kontak padahal zona Nama sedang dimatikan.
 */
export function withoutNames(
  elements: readonly Element[],
  names: readonly Element[],
): Element[] {
  if (names.length === 0) return [...elements];
  return elements.filter(
    (element) => !names.some((name) => name === element || name.contains(element) || element.contains(name)),
  );
}

function normalizeHost(hostname: string): string {
  return hostname.replace(/^www\./, '').toLowerCase();
}

/**
 * Apakah URL saat ini berada di ruang pesan platform.
 * Platform tanpa `dmPaths`/`dmHosts` selalu dianggap ruang pesan.
 */
export function isDmContext(
  adapter: PlatformAdapter,
  url: { hostname: string; pathname: string },
): boolean {
  if (!adapter.dmPaths && !adapter.dmHosts) return true;

  const host = normalizeHost(url.hostname);
  if (adapter.dmHosts?.some((item) => normalizeHost(item) === host)) return true;

  const path = url.pathname.toLowerCase();
  return (adapter.dmPaths ?? []).some((prefix) => path.startsWith(prefix.toLowerCase()));
}

/**
 * Wadah pesan mengambang (mis. panel Chats Facebook) yang bisa dipakai sebagai
 * batas zona pesan di luar route DM. `null` bila platform tidak menyediakannya
 * atau panelnya sedang tertutup.
 */
export function resolveDmScope(
  adapter: PlatformAdapter,
  root: ParentNode = document,
): Element | null {
  const candidates = adapter.dmScopes;
  if (!candidates || candidates.length === 0) return null;

  for (const candidate of [...candidates].sort((a, b) => b.weight - a.weight)) {
    let found: Element | null = null;
    try {
      found = root.querySelector(candidate.selector);
    } catch {
      found = null;
    }
    if (!found) continue;
    const rect = found.getBoundingClientRect();
    // Panel tertutup atau tersembunyi tidak boleh dipakai: zona pesan akan
    // kosong dan feed tetap aman.
    if (rect.width < 120 || rect.height < 160) continue;
    return found;
  }

  return null;
}

/**
 * Baris chat untuk menurunkan nama/preview/avatar, walau zona baris utuh tidak
 * ikut dilindungi. Selector eksplisit dulu, lalu jaring pengaman geometri.
 */
function listRows(adapter: PlatformAdapter, root: ParentNode): Element[] {
  const explicit = resolveZone('chatList', adapter.selectors.chatList, root);
  if (explicit) return explicit.elements;
  const rows = findConversationRows(root);
  return rows.length >= 3 ? rows : [];
}

export function detectChatArea(
  adapter: PlatformAdapter,
  root: ParentNode = document,
  only?: readonly ZoneId[],
): ResolvedChatArea {
  const wanted = (zone: ZoneId): boolean => !only || only.includes(zone);
  const pick = (zone: ZoneId): ResolvedZone | null =>
    wanted(zone) ? resolveZone(zone, adapter.selectors[zone], root) : null;

  // Di luar route pesan, `only` hanya berisi `feedContent`, sehingga semua
  // query selector DM dilewati. Ini yang menjaga feed tidak tersentuh.
  const messages = pick('messages');
  const media = pick('media');

  let usedHeuristic = false;
  let conversationList = pick('chatList');
  if (wanted('chatList') && !conversationList) {
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

  // Turunan baris hanya berguna kalau salah satu zona per item diminta.
  const rowsWanted = (['names', 'chatPreview', 'avatars', 'mediaPreview'] as const).some((zone) =>
    wanted(zone),
  );
  // Baris tetap dicari walau zona "Seluruh baris chat" dimatikan (bawaan level
  // Privasi). Tanpa ini, nama/preview hanya bergantung pada selector platform,
  // sehingga baris hasil pencarian — yang nama/preview-nya tanpa `title` —
  // lolos tanpa blur.
  const rowSource =
    conversationList?.elements ?? (rowsWanted ? listRows(adapter, root) : []);
  const parts = rowsWanted ? deriveRowParts(rowSource) : EMPTY_PARTS;

  const names = mergeZone('names', pick('names'), parts.names);
  const nameElements = names?.elements ?? [];
  const mediaPreview = mergeZone('mediaPreview', pick('mediaPreview'), parts.mediaPreviews);
  const avatars = mergeZone('avatars', pick('avatars'), parts.avatars);
  // Zona preview tidak boleh menyentuh nama: selector platform sering memakai
  // `span[dir="auto"]` untuk keduanya.
  const previewExplicit = pick('chatPreview');
  const chatPreview = mergeZone(
    'chatPreview',
    previewExplicit
      ? { ...previewExplicit, elements: withoutNames(previewExplicit.elements, nameElements) }
      : null,
    withoutNames(parts.previews, nameElements),
  );

  let fallbackMessages: ResolvedZone | null = messages;
  let usedFallback = false;
  if (!messages && wanted('messages') && adapter.fallback && adapter.fallback.length > 0) {
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
    feedContent: pick('feedContent'),
    textInput: pick('textInput'),
    usedFallback,
    usedHeuristic,
  };
}

export { deriveRowParts };
