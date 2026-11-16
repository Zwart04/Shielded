import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUsableElement, pickBest, resolveZone } from '../../src/core/selector-resolver.ts';
import type { SelectorCandidate } from '../../src/shared/types.ts';

class FakeElement {
  tagName = 'DIV';
  width: number;
  height: number;
  top: number;
  left: number;
  classList: DOMTokenList;

  constructor(classes: string[] = [], width = 100, height = 100, top = 0, left = 0) {
    this.width = width;
    this.height = height;
    this.top = top;
    this.left = left;
    this.classList = {
      contains: (name: string) => classes.includes(name),
    } as unknown as DOMTokenList;
  }

  getBoundingClientRect(): DOMRect {
    return {
      width: this.width,
      height: this.height,
      top: this.top,
      left: this.left,
      right: this.left + this.width,
      bottom: this.top + this.height,
    } as DOMRect;
  }
}

function withFakeDom(run: () => void): void {
  const globals = globalThis as unknown as { HTMLElement?: unknown };
  const previous = globals.HTMLElement;
  globals.HTMLElement = FakeElement;
  try {
    run();
  } finally {
    globals.HTMLElement = previous;
  }
}

function fake(
  classes: string[] = [],
  width = 100,
  height = 100,
  top = 0,
  left = 0,
): Element {
  return new FakeElement(classes, width, height, top, left) as unknown as Element;
}

test('element yang sudah dilindungi tetap dianggap usable pada deteksi berikutnya', () => {
  withFakeDom(() => {
    assert.equal(isUsableElement(fake(['psx-zone', 'psx-zone--blur']), false), true);
  });
});

test('overlay milik ekstensi dan elemen raksasa ditolak', () => {
  withFakeDom(() => {
    assert.equal(isUsableElement(fake(['psx-overlay']), false), false);
    assert.equal(isUsableElement(fake([], 5000, 5000), false), false);
  });
});

test('zona panel butuh ukuran minimum, zona per item boleh lebih kecil', () => {
  withFakeDom(() => {
    const small = fake([], 60, 20);
    assert.equal(isUsableElement(small, false), false);
    assert.equal(isUsableElement(small, true), true);
  });
});

test('nama pendek (mis. "Ali") tetap ikut dilindungi sebagai item', () => {
  withFakeDom(() => {
    const short = fake([], 18, 18);
    assert.equal(isUsableElement(short, true), true);
    assert.equal(isUsableElement(short, false), false);
  });
});

function candidate(id: string, weight: number): SelectorCandidate {
  return { id, selector: `#${id}`, weight, note: 'test' };
}

test('pickBest memilih bobot tertinggi yang punya elemen', () => {
  const candidates = [candidate('low', 1), candidate('high', 9), candidate('mid', 5)];
  const counts: Record<string, number> = { '#low': 3, '#high': 1, '#mid': 2 };

  const match = pickBest(candidates, (selector) => counts[selector] ?? 0);
  assert.equal(match?.candidate.id, 'high');
  assert.equal(match?.count, 1);
});

test('pickBest melewati kandidat yang tidak menemukan elemen', () => {
  const candidates = [candidate('high', 9), candidate('mid', 5)];
  const match = pickBest(candidates, (selector) => (selector === '#mid' ? 2 : 0));
  assert.equal(match?.candidate.id, 'mid');
});

test('pickBest mengembalikan null jika semua kosong', () => {
  const match = pickBest([candidate('a', 3), candidate('b', 1)], () => 0);
  assert.equal(match, null);
});

test('pickBest menangani selector yang melempar error', () => {
  const candidates = [candidate('broken', 9), candidate('ok', 1)];
  const match = pickBest(candidates, (selector) => {
    if (selector === '#broken') throw new Error('invalid selector');
    return 1;
  });
  assert.equal(match?.candidate.id, 'ok');
});

test('pickBest mempertahankan urutan asli untuk bobot sama', () => {
  const candidates = [candidate('first', 5), candidate('second', 5)];
  const match = pickBest(candidates, () => 1);
  assert.equal(match?.candidate.id, 'first');
});

test('resolveZone memprioritaskan item dekat viewport saat batas item tercapai', () => {
  withFakeDom(() => {
    const globals = globalThis as unknown as { window?: unknown };
    const previousWindow = globals.window;
    globals.window = { innerWidth: 1200, innerHeight: 800 };

    try {
      // 130 baris: 129 jauh di bawah layar, 1 terlihat di layar.
      const rows = Array.from({ length: 129 }, () => fake([], 300, 52, 5000));
      const visible = fake([], 300, 52, 100);
      rows.push(visible);

      const root = { querySelectorAll: () => rows } as unknown as ParentNode;
      const zone = resolveZone(
        'chatList',
        [{ id: 'rows', selector: '.row', weight: 1, note: 'test', multi: true }],
        root,
      );

      assert.equal(zone?.elements.length, 120);
      assert.ok(zone?.elements.includes(visible), 'baris yang terlihat harus ikut terlindungi');
      assert.ok(!zone?.elements.includes(rows[128]!), 'baris jauh terakhir harus dikorbankan');
    } finally {
      globals.window = previousWindow;
    }
  });
});

test('resolveZone mengembalikan semuanya bila item di bawah batas', () => {
  withFakeDom(() => {
    const rows = [fake([], 300, 52, 0), fake([], 300, 52, 60), fake([], 300, 52, 120)];
    const root = { querySelectorAll: () => rows } as unknown as ParentNode;
    const zone = resolveZone(
      'chatList',
      [{ id: 'rows', selector: '.row', weight: 1, note: 'test', multi: true }],
      root,
    );

    assert.equal(zone?.elements.length, 3);
  });
});
