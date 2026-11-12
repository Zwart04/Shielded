import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruneCovered } from '../../src/core/effect-renderer.ts';
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
