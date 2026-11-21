import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { color } = JSON.parse(readFileSync(new URL('../src/tokens.json', import.meta.url), 'utf8'));

// Relatieve luminantie en contrast volgens WCAG 2.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

// [voorgrond, achtergrond]: tekst die leesbaar moet blijven (WCAG AA, 4,5:1).
// Goud (accent) staat er bewust niet in: dat is nooit een tekstkleur.
const PAIRS = [
  ['text', 'bg'], ['text', 'surface'],
  ['text_strong', 'bg'], ['text_strong', 'surface'],
  ['muted', 'bg'], ['muted', 'surface'],
  ['link', 'bg'], ['link', 'surface'], ['link', 'soft'],
  ['on_bar', 'bar'], ['on_button', 'button'],
  ['error', 'surface'], ['ok', 'surface'],
];

test('de berekening klopt: zwart op wit is 21:1', () => {
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 1e-9);
});

for (const mode of ['light', 'dark']) {
  for (const [fg, bg] of PAIRS) {
    test(`${mode}: ${fg} op ${bg} haalt 4,5:1`, () => {
      const ratio = contrast(color[fg][mode], color[bg][mode]);
      assert.ok(ratio >= 4.5, `${color[fg][mode]} op ${color[bg][mode]} is ${ratio.toFixed(2)}:1`);
    });
  }
}
