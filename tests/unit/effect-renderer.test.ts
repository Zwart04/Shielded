import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipForBox, pickHovered, pruneCovered } from '../../src/core/effect-renderer.ts';
import type { ZoneId } from '../../src/shared/types.ts';

function node(parent: Element | null = null): Element {
  return { parentElement: parent } as unknown as Element;
}

test('pruneCovered membuang nama di dalam baris chat yang dikaburkan utuh', () => {
  const row = node();
  const name = node(row);
  const desired = new Map<Element, ZoneId>([
    [row, 'chatList'],
    [name, 'names'],
  ]);

  assert.deepEqual([...pruneCovered(desired)], [name]);
});

test('pruneCovered mempertahankan media di dalam gelembung pesan yang diblur', () => {
  const bubble = node();
  const photo = node(bubble);
  const desired = new Map<Element, ZoneId>([
    [bubble, 'messages'],
    [photo, 'media'],
  ]);

  assert.equal(pruneCovered(desired).size, 0);
});

test('pruneCovered tetap membuang elemen dari zona yang sama di dalam induknya', () => {
  const outer = node();
  const inner = node(outer);
  const desired = new Map<Element, ZoneId>([
    [outer, 'media'],
    [inner, 'media'],
  ]);

  assert.deepEqual([...pruneCovered(desired)], [inner]);
});

function box(left: number, top: number, width: number, height: number): Element {
  return {
    isConnected: true,
    getBoundingClientRect: () =>
      ({ left, top, width, height, right: left + width, bottom: top + height }) as DOMRect,
  } as unknown as Element;
}

test('pickHovered memilih zona terkecil yang memuat kursor', () => {
  const row = box(0, 0, 300, 60);
  const avatar = box(8, 6, 44, 44);

  assert.equal(pickHovered([row, avatar], 20, 20), avatar);
  assert.equal(pickHovered([row, avatar], 200, 20), row);
  assert.equal(pickHovered([row, avatar], 500, 500), null);
});

test('clipForBox menahan halo di dalam kotak elemen', () => {
  assert.equal(clipForBox('50%'), 'inset(0 round 50%)');
  assert.equal(clipForBox('18px'), 'inset(0 round 18px)');
  assert.equal(clipForBox('12px 12px 0px 0px'), 'inset(0 round 12px 12px 0px 0px)');
  // Teks tidak bersudut: tetap dipotong ke kotaknya, tanpa radius.
  assert.equal(clipForBox('0px'), 'inset(0)');
  assert.equal(clipForBox('0'), 'inset(0)');
  assert.equal(clipForBox(''), 'inset(0)');
});
