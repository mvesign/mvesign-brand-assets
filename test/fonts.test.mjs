import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildFontsCss } from '../scripts/lib/fonts.mjs';

test('buildFontsCss: één @font-face per bestand, met een relatief pad', () => {
  const css = buildFontsCss('Open Sans', { weight: '300 800', files: [{ file: 'a.woff2', unicode_range: 'U+0000-00FF' }] });
  assert.equal(css, [
    '/* Gegenereerd door scripts/generate.mjs uit src/. Niet met de hand wijzigen. */',
    '@font-face {',
    '  font-family: "Open Sans";',
    '  font-style: normal;',
    '  font-display: swap;',
    '  font-weight: 300 800;',
    '  src: url("fonts/a.woff2") format("woff2");',
    '  unicode-range: U+0000-00FF;',
    '}',
    '',
  ].join('\n'));
});

test('elk bestand uit src/fonts/fonts.json staat in src/fonts/, met OFL.txt', () => {
  const manifest = JSON.parse(readFileSync(new URL('../src/fonts/fonts.json', import.meta.url), 'utf8'));
  for (const name of [...manifest.files.map((font) => font.file), 'OFL.txt']) {
    assert.ok(existsSync(new URL(`../src/fonts/${name}`, import.meta.url)), `src/fonts/${name} ontbreekt`);
  }
});
