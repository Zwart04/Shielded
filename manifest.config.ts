import { CONTENT_MATCH_PATTERNS } from './src/shared/platform-ids.ts';

const manifest = {
  manifest_version: 3,
  name: 'Shielded',
  version: '0.1.1',
  description:
    'Sembunyikan isi obrolan di WhatsApp, Telegram, Instagram, Facebook, X, Threads, dan TikTok dari layar. Semua diproses lokal.',
  minimum_chrome_version: '110',
  permissions: ['storage'],
  host_permissions: [...CONTENT_MATCH_PATTERNS],
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
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
} as const;

export default manifest;
