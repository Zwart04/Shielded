/**
 * Shielded — Selector Probe (alat manual, bukan bagian dari ekstensi)
 *
 * Cara pakai:
 * 1. Login ke platform target dan buka halaman DM/chat.
 * 2. Buka DevTools → Console.
 * 3. Salin seluruh isi file ini, tempel, tekan Enter.
 * 4. Salin hasil JSON ke docs/selector-verification-results.md.
 *
 * Alat ini hanya membaca struktur DOM (jumlah elemen & ukuran), tidak
 * mengumpulkan isi pesan. Tidak ada data yang dikirim ke mana pun.
 */

(() => {
  const ADAPTERS = {
    whatsapp: {
      hosts: ['web.whatsapp.com'],
      zones: {
        messages: [
          { id: 'wa-main-id', selector: '#main', weight: 9 },
          { id: 'wa-messages-testid', selector: '[data-testid="conversation-panel-messages"]', weight: 7 },
          { id: 'wa-role-main', selector: 'div[role="main"]', weight: 4 },
        ],
        conversationList: [
          { id: 'wa-pane-side', selector: '#pane-side', weight: 9 },
          { id: 'wa-side', selector: '#side', weight: 6 },
          { id: 'wa-chat-list-aria', selector: '[aria-label="Chat list"]', weight: 3 },
        ],
        identity: [
          { id: 'wa-main-header', selector: '#main header', weight: 7 },
          { id: 'wa-header-testid', selector: 'header[data-testid="conversation-header"]', weight: 5 },
        ],
        fallback: [{ id: 'wa-app', selector: '#app', weight: 5 }],
      },
    },
    telegram: {
      hosts: ['web.telegram.org'],
      zones: {
        messages: [
          { id: 'tg-bubbles', selector: '.bubbles', weight: 8 },
          { id: 'tg-chat', selector: '#column-center .chat', weight: 6 },
          { id: 'tg-chat-cap', selector: '.Chat', weight: 4 },
        ],
        conversationList: [
          { id: 'tg-chatlist', selector: '#column-left .chatlist', weight: 8 },
          { id: 'tg-chatlist-plain', selector: '.chatlist', weight: 6 },
          { id: 'tg-dialogs', selector: '#dialogs', weight: 4 },
        ],
        identity: [
          { id: 'tg-chat-info', selector: '#column-center .chat-info', weight: 5 },
          { id: 'tg-topbar', selector: '.chat .topbar', weight: 3 },
        ],
        fallback: [{ id: 'tg-column-center', selector: '#column-center', weight: 6 }],
      },
    },
    instagram: {
      hosts: ['www.instagram.com', 'instagram.com'],
      zones: {
        messages: [
          { id: 'ig-main-section', selector: 'div[role="main"] section', weight: 7 },
          { id: 'ig-main', selector: 'main[role="main"]', weight: 6 },
          { id: 'ig-react-root', selector: '#react-root', weight: 3 },
        ],
        conversationList: [
          { id: 'ig-grid', selector: 'div[role="grid"]', weight: 5 },
          { id: 'ig-chats-aria', selector: '[aria-label="Chats"]', weight: 3 },
        ],
        identity: [{ id: 'ig-header', selector: 'div[role="main"] header', weight: 5 }],
        fallback: [{ id: 'ig-main-fallback', selector: 'main[role="main"]', weight: 6 }],
      },
    },
  };

  const platform = Object.keys(ADAPTERS).find((key) =>
    ADAPTERS[key].hosts.some((host) => location.hostname === host),
  );

  if (!platform) {
    console.warn(
      'Shielded probe: host ini tidak cocok dengan adapter mana pun. Buka salah satu platform target.',
    );
    return;
  }

  const rows = [];

  for (const [zone, candidates] of Object.entries(ADAPTERS[platform].zones)) {
    for (const candidate of candidates) {
      let elements = [];
      try {
        elements = Array.from(document.querySelectorAll(candidate.selector));
      } catch (error) {
        rows.push({
          zone,
          id: candidate.id,
          selector: candidate.selector,
          count: 'ERROR',
          visible: 0,
          size: '-',
        });
        continue;
      }

      const visible = elements.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 40 && rect.height > 40;
      });

      const first = visible[0];
      const rect = first ? first.getBoundingClientRect() : null;

      rows.push({
        zone,
        id: candidate.id,
        selector: candidate.selector,
        count: elements.length,
        visible: visible.length,
        size: rect ? `${Math.round(rect.width)}x${Math.round(rect.height)}` : '-',
      });
    }
  }

  console.table(rows);

  const report = {
    platform,
    url: location.href,
    capturedAt: new Date().toISOString(),
    note: 'Data struktur DOM saja. Tidak ada isi pesan yang dikumpulkan.',
    rows,
  };

  const json = JSON.stringify(report, null, 2);
  console.log('Salin JSON berikut ke docs/selector-verification-results.md:\n');
  console.log(json);

  if (typeof copy === 'function') {
    copy(json);
    console.log('(JSON sudah disalin ke clipboard.)');
  }
})();
