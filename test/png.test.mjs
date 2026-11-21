import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pngSize, renderPng } from '../scripts/lib/png.mjs';

const SQUARE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0376A2"/></svg>';

test('renderPng maakt een PNG van de gevraagde breedte', async () => {
  const png = await renderPng(SQUARE, 180);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual(pngSize(png), { width: 180, height: 180 });
});

test('renderPng geeft bij dezelfde SVG dezelfde bytes', async () => {
  const a = await renderPng(SQUARE, 64);
  const b = await renderPng(SQUARE, 64);
  assert.deepEqual(Buffer.from(a), Buffer.from(b));
});
