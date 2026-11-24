import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildFontsCss, firstFamily, fontFiles, validateFonts, weightRange } from '../scripts/lib/fonts.mjs';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

// Een klein manifest met twee families, zodat de verwachte CSS hier helemaal te lezen is.
const mini = {
  families: [
    { family: 'Sans', source: 'test', weight: '100 700', license: 'sans-OFL.txt', files: [{ file: 'sans.woff2', unicode_range: 'U+0000-00FF' }] },
    { family: 'Mono', source: 'test', weight: '400', license: 'mono-OFL.txt', files: [{ file: 'mono.woff2', unicode_range: 'U+0000-00FF' }] },
  ],
};
const font = { family: 'Sans', mono: "'Mono', monospace", weight: { regular: 400, bold: 700 } };

test('buildFontsCss: een @font-face per bestand, met de familie en het gewicht van zijn blok', () => {
  assert.equal(buildFontsCss(mini), [
    '/* Gegenereerd door scripts/generate.mjs uit src/. Niet met de hand wijzigen. */',
    '@font-face {',
    '  font-family: "Sans";',
    '  font-style: normal;',
    '  font-display: swap;',
    '  font-weight: 100 700;',
    '  src: url("fonts/sans.woff2") format("woff2");',
    '  unicode-range: U+0000-00FF;',
    '}',
    '',
    '@font-face {',
    '  font-family: "Mono";',
    '  font-style: normal;',
    '  font-display: swap;',
    '  font-weight: 400;',
    '  src: url("fonts/mono.woff2") format("woff2");',
    '  unicode-range: U+0000-00FF;',
    '}',
    '',
  ].join('\n'));
});

test('fontFiles: per blok de lettertypen en de licentie', () => {
  assert.deepEqual(fontFiles(mini), ['sans.woff2', 'sans-OFL.txt', 'mono.woff2', 'mono-OFL.txt']);
});

test('weightRange leest "100 700" en "400", en weigert de rest', () => {
  assert.deepEqual(weightRange('100 700'), [100, 700]);
  assert.deepEqual(weightRange('400'), [400, 400]);
  assert.equal(weightRange('bold'), null);
});

test('firstFamily geeft de eerste naam zonder aanhalingstekens', () => {
  assert.equal(firstFamily("'IBM Plex Mono', ui-monospace, monospace"), 'IBM Plex Mono');
  assert.equal(firstFamily('ui-monospace, monospace'), 'ui-monospace');
});

test('validateFonts accepteert een familie in font.family en een vooraan in font.mono', () => {
  assert.doesNotThrow(() => validateFonts(mini, font));
});

test('validateFonts weigert een familie die niet in de stack staat', () => {
  assert.throws(
    () => validateFonts(mini, { ...font, mono: 'monospace' }),
    /^Error: src\/fonts\/fonts\.json: families\[1\]\.family: "Mono" staat niet in font\.family of vooraan in font\.mono$/,
  );
});

test('validateFonts weigert een gewicht dat het lettertype niet heeft', () => {
  assert.throws(
    () => validateFonts(mini, { ...font, weight: { bold: 700, extrabold: 800 } }),
    /^Error: src\/tokens\.json: font\.weight\.extrabold: 800 valt buiten Sans \(100 700\)/,
  );
});

test('validateFonts weigert een blok zonder licentie', () => {
  const { license: _, ...withoutLicense } = mini.families[0];
  assert.throws(() => validateFonts({ families: [withoutLicense] }, font), /families\[0\]: ontbreekt: license$/);
});

test('de bronnen passen bij elkaar: src/fonts/fonts.json en de letters in src/tokens.json', () => {
  assert.doesNotThrow(() => validateFonts(readJson('src/fonts/fonts.json'), readJson('src/tokens.json').font));
});

test('elk bestand uit src/fonts/fonts.json staat in src/fonts/', () => {
  for (const name of fontFiles(readJson('src/fonts/fonts.json'))) {
    assert.ok(existsSync(new URL(`../src/fonts/${name}`, import.meta.url)), `src/fonts/${name} ontbreekt`);
  }
});
