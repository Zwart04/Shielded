import type { ThemePreference } from '../../shared/types.ts';

export interface ElOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string | number | boolean | undefined>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElOptions = {},
  children: Array<Node | string> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) {
    for (const [key, value] of Object.entries(options.attrs)) {
      if (value === undefined || value === false) continue;
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

export function clear(node: Element): void {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = preference;
}

/**
 * URL situs yang sedang dilihat. Bila popup dibuka sebagai tab ekstensi
 * (mis. dari tab yang di-pin), tab aktif bukan situs web; dalam kasus itu
 * pakai tab web pertama di jendela yang sama agar platform tetap terdeteksi.
 */
export async function activeTabUrl(): Promise<string | null> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && /^https?:/i.test(tab.url)) return tab.url;

    const tabs = await chrome.tabs.query({ currentWindow: true });
    const web = tabs.find((item) => item.url && /^https?:/i.test(item.url));
    return web?.url ?? tab?.url ?? null;
  } catch {
    return null;
  }
}
