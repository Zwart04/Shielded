import { CONTENT_MATCH_PATTERNS } from './src/shared/platform-ids.ts';

/**
 * Satu sumber kebenaran untuk manifest. Chromium (Chrome, Edge, Brave, Opera,
 * Vivaldi) memakai service worker ESM; Firefox belum mendukung
 * `background.service_worker`, jadi target Firefox memakai event page
 * `background.scripts` dengan bundel IIFE.
 */
export type BrowserTarget = 'chromium' | 'firefox';

export const EXTENSION_VERSION = '0.1.17';

const SHARED = {
  manifest_version: 3,
  name: 'Shielded',
  description:
    'Sembunyikan isi obrolan di WhatsApp, Telegram, Instagram, Facebook, X, Threads, dan TikTok dari layar. Semua diproses lokal.',
  permissions: ['storage', 'scripting'],
  host_permissions: [...CONTENT_MATCH_PATTERNS],
  action: {
    default_popup: 'ui/popup/index.html',
    default_title: 'Shielded',
    default_icon: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
  },
  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png',
  },
  content_scripts: [
    {
      matches: [...CONTENT_MATCH_PATTERNS],
      js: ['content.js'],
      run_at: 'document_idle',
      all_frames: false,
    },
  ],
  commands: {
    'toggle-protection': {
      suggested_key: { default: 'Alt+Shift+S' },
      description: 'Aktifkan atau nonaktifkan perlindungan',
    },
    'reveal-all': {
      suggested_key: { default: 'Alt+Shift+R' },
      description: 'Tampilkan semua zona sementara',
    },
    panic: {
      description: 'Sembunyikan semua zona segera',
    },
  },
  // Eksplisit, walau MV3 sudah memakai nilai ini sebagai default. Tidak ada
  // skrip inline, tidak ada eval, dan tidak ada kode dari jaringan.
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
};

export function createManifest(browser: BrowserTarget = 'chromium') {
  if (browser === 'firefox') {
    return {
      ...SHARED,
      version: EXTENSION_VERSION,
      background: { scripts: ['background.js'] },
      browser_specific_settings: {
        gecko: {
          id: 'shielded@zwart04.github.io',
          strict_min_version: '140.0',
          // Deklarasi resmi AMO: ekstensi tidak mengumpulkan data apa pun.
          data_collection_permissions: { required: ['none'] },
        },
      },
    };
  }

  return {
    ...SHARED,
    version: EXTENSION_VERSION,
    minimum_chrome_version: '110',
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
  };
}

export default createManifest('chromium');
