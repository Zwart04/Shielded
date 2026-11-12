import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveRowParts, withoutNames } from '../../src/adapters/contract.ts';
import { whatsappAdapter } from '../../src/adapters/whatsapp/index.ts';
import { telegramAdapter } from '../../src/adapters/telegram/index.ts';
import { instagramAdapter } from '../../src/adapters/instagram/index.ts';
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
