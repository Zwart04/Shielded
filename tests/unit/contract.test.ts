import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveRowParts,
  detectChatArea,
  isDmContext,
  resolveDmScope,
  withoutNames,
} from '../../src/adapters/contract.ts';
import { whatsappAdapter } from '../../src/adapters/whatsapp/index.ts';
import { telegramAdapter } from '../../src/adapters/telegram/index.ts';
import { instagramAdapter } from '../../src/adapters/instagram/index.ts';
import { facebookAdapter } from '../../src/adapters/facebook/index.ts';
import { threadsAdapter } from '../../src/adapters/threads/index.ts';
import { xAdapter } from '../../src/adapters/x/index.ts';
import type { PlatformAdapter } from '../../src/adapters/contract.ts';

interface RowPartsInput {
  texts?: Element[];
  named?: Element[];
  preview?: Element | null;
  img?: Element | null;
}

function fakeRow({ texts = [], named = [], preview = null, img = null }: RowPartsInput): Element {
  return {
    querySelectorAll: (selector: string) => (selector.includes('dir') ? named : texts),
    querySelector: (selector: string) =>
      selector.startsWith('img') ? img : selector.includes('last-message') ? preview : null,
  } as unknown as Element;
}

function label(name: string): Element {
  return {
    nodeName: name,
    childElementCount: 0,
    textContent: name,
    contains: () => false,
  } as unknown as Element;
}

test('deriveRowParts mengambil nama, avatar, dan seluruh teks preview', () => {
  const name = label('NAME');
  const reply = label('REPLY');
  const status = label('STATUS');
  const avatar = label('AVATAR');

  const parts = deriveRowParts([
    fakeRow({ texts: [name, reply, status], named: [name], img: avatar }),
  ]);

  assert.deepEqual(parts.names, [name]);
  assert.deepEqual(parts.previews, [reply, status]);
  assert.deepEqual(parts.avatars, [avatar]);
});

test('deriveRowParts memakai elemen preview eksplisit bila ada', () => {
  const name = label('NAME');
  const preview = label('PREVIEW');
  const extra = label('EXTRA');

  const parts = deriveRowParts([
    fakeRow({ texts: [name, extra], named: [name], preview }),
  ]);

  assert.deepEqual(parts.names, [name]);
  // Label eksplisit tetap dipakai, dan teks lain di baris yang sama ikut
  // dilindungi agar tidak ada preview yang lolos.
  assert.deepEqual(parts.previews, [preview, extra]);
});

function measured(name: string, top: number, height: number): Element {
  return {
    nodeName: name,
    childElementCount: 0,
    textContent: name,
    contains: () => false,
    getClientRects: () => [{}],
    getBoundingClientRect: () => ({ top, bottom: top + height, left: 0, width: 100, height }),
  } as unknown as Element;
}

test('preview yang tumpang tindih dengan nama tetap dilindungi', () => {
  const name = measured('NAME', 0, 20);
  // Kotak preview mulai di tengah nama: dulu filter top >= name.bottom
  // membuangnya sehingga preview tampil tanpa blur.
  const preview = measured('PREVIEW', 10, 18);

  const parts = deriveRowParts([fakeRow({ texts: [name, preview], named: [name] })]);

  assert.deepEqual(parts.names, [name]);
  assert.deepEqual(parts.previews, [preview]);
});

test('deriveRowParts tetap melindungi baris tanpa span[dir]', () => {
  const name = label('PEER');
  const preview = label('SECOND');

  const parts = deriveRowParts([fakeRow({ texts: [name, preview], named: [name] })]);

  assert.deepEqual(parts.names, [name]);
  assert.deepEqual(parts.previews, [preview]);
  assert.deepEqual(parts.avatars, []);
});

test('deriveRowParts tidak menghasilkan apa pun untuk baris tanpa bagian dikenal', () => {
  const parts = deriveRowParts([fakeRow({})]);
  assert.deepEqual(parts, { names: [], previews: [], avatars: [], mediaPreviews: [] });
});

test('adapter tidak pernah memakai root aplikasi sebagai target', () => {
  const adapters: PlatformAdapter[] = [whatsappAdapter, telegramAdapter, instagramAdapter];
  const forbidden = ['#app', '#react-root', 'body', 'html'];

  for (const adapter of adapters) {
    const candidates = [
      ...Object.values(adapter.selectors).flat(),
      ...(adapter.fallback ?? []),
    ];
    for (const candidate of candidates) {
      for (const selector of forbidden) {
        assert.ok(
          !candidate.selector.includes(selector),
          `${adapter.id} memakai selector terlarang ${selector}`,
        );
      }
    }
  }
});

test('adapter MVP menandai zona per item sebagai multi', () => {
  const adapters: PlatformAdapter[] = [whatsappAdapter, telegramAdapter, instagramAdapter];
  for (const adapter of adapters) {
    assert.ok(
      adapter.selectors.chatList?.some((candidate) => candidate.multi),
      `${adapter.id} tidak punya baris chat multi`,
    );
  }
});

function fakeNode(children: Element[] = []): Element {
  return {
    contains: (element: Element) => children.includes(element),
  } as unknown as Element;
}

test('withoutNames membuang nama dan wadah yang memuat nama dari zona preview', () => {
  const name = fakeNode();
  const preview = fakeNode();
  const row = fakeNode([name, preview]);

  assert.deepEqual(withoutNames([name, preview, row], [name]), [preview]);
  assert.deepEqual(withoutNames([preview], []), [preview]);
});

test('isDmContext hanya benar di route pesan Instagram', () => {
  const url = (pathname: string) => ({ hostname: 'www.instagram.com', pathname });
  assert.equal(isDmContext(instagramAdapter, url('/direct/t/123')), true);
  assert.equal(isDmContext(instagramAdapter, url('/direct/inbox/')), true);
  assert.equal(isDmContext(instagramAdapter, url('/')), false);
  assert.equal(isDmContext(instagramAdapter, url('/reels/abc/')), false);
  assert.equal(isDmContext(instagramAdapter, url('/p/abc/')), false);
});

test('isDmContext Threads hanya di /direct', () => {
  const url = (pathname: string) => ({ hostname: 'www.threads.com', pathname });
  assert.equal(isDmContext(threadsAdapter, url('/direct/t/1')), true);
  assert.equal(isDmContext(threadsAdapter, url('/direct/inbox')), true);
  assert.equal(isDmContext(threadsAdapter, url('/messages')), true);
  assert.equal(isDmContext(threadsAdapter, url('/@zwart/post/1')), false);
  assert.equal(isDmContext(threadsAdapter, url('/')), false);
});

test('isDmContext Facebook mencakup /messages dan messenger.com', () => {
  const fb = (hostname: string, pathname: string) => ({ hostname, pathname });
  assert.equal(isDmContext(facebookAdapter, fb('www.facebook.com', '/messages/t/1')), true);
  assert.equal(isDmContext(facebookAdapter, fb('www.facebook.com', '/')), false);
  assert.equal(isDmContext(facebookAdapter, fb('web.facebook.com', '/groups/1')), false);
  assert.equal(isDmContext(facebookAdapter, fb('www.messenger.com', '/t/1')), true);
  assert.equal(isDmContext(facebookAdapter, fb('messenger.com', '/')), true);
});

test('isDmContext X hanya di /messages', () => {
  const url = (pathname: string) => ({ hostname: 'x.com', pathname });
  assert.equal(isDmContext(xAdapter, url('/messages/1-2')), true);
  assert.equal(isDmContext(xAdapter, url('/messages')), true);
  assert.equal(isDmContext(xAdapter, url('/home')), false);
  assert.equal(isDmContext(xAdapter, url('/Zwart04')), false);
});

test('platform tanpa dmPaths dianggap selalu ruang pesan', () => {
  assert.equal(
    isDmContext(whatsappAdapter, { hostname: 'web.whatsapp.com', pathname: '/' }),
    true,
  );
});

test('detectChatArea dengan only=feedContent hanya menjalankan selector feed', () => {
  const asked: string[] = [];
  const root = {
    querySelectorAll: (selector: string) => {
      asked.push(selector);
      return [];
    },
  } as unknown as ParentNode;

  detectChatArea(instagramAdapter, root, ['feedContent']);

  const igFeedSelectors = new Set(
    instagramAdapter.selectors.feedContent?.map((candidate) => candidate.selector),
  );
  const allNonFeed = Object.entries(instagramAdapter.selectors)
    .filter(([zone]) => zone !== 'feedContent')
    .flatMap(([, candidates]) => candidates?.map((candidate) => candidate.selector) ?? []);

  assert.ok(asked.length > 0, 'tidak ada selector yang dijalankan');
  for (const selector of asked) assert.ok(igFeedSelectors.has(selector), selector);
  for (const selector of allNonFeed) assert.ok(!asked.includes(selector), selector);
});

test('resolveDmScope hanya menerima panel pesan yang benar-benar tampil', () => {
  const dock = {
    getBoundingClientRect: () => ({ width: 320, height: 640 }),
  } as unknown as Element;
  const hidden = {
    getBoundingClientRect: () => ({ width: 0, height: 0 }),
  } as unknown as Element;

  const root = (element: Element | null) =>
    ({ querySelector: () => element }) as unknown as ParentNode;

  assert.equal(resolveDmScope(facebookAdapter, root(dock)), dock);
  assert.equal(resolveDmScope(facebookAdapter, root(hidden)), null);
  assert.equal(resolveDmScope(facebookAdapter, root(null)), null);
  // Adapter tanpa dmScopes tidak punya panel mengambang.
  assert.equal(resolveDmScope(instagramAdapter, root(dock)), null);
});
