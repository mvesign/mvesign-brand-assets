// Controleert de uitvoer in dist/. De CI draait eerst npm run generate, en controleert
// daarna ook dat dist/ in Git gelijk is aan wat de generator maakt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { hexToRgb, kebab, MODES } from '../scripts/lib/tokens.mjs';
import { pngSize } from '../scripts/lib/png.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const list = (dir) => readdirSync(new URL(`../dist/${dir}`, import.meta.url)).sort();
const source = JSON.parse(read('src/tokens.json'));

test('dist/ bevat precies de bestanden van het pakket', () => {
  assert.deepEqual(list(''), ['fonts', 'fonts.css', 'logo', 'tokens.css', 'tokens.json']);
  assert.deepEqual(list('fonts'), ['OFL.txt', 'open-sans-latin-ext-wght-normal.woff2', 'open-sans-latin-wght-normal.woff2']);
  assert.deepEqual(list('logo'), ['apple-touch-icon.png', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'wordmark.svg']);
});

test('tokens.css heeft elke kleur vast licht, vast donker, met -rgb, en actief', () => {
  const css = read('dist/tokens.css').toString();
  for (const name of Object.keys(source.color)) {
    const cssName = kebab(name);
    for (const mode of MODES) {
      assert.ok(css.includes(`--mv-${mode}-${cssName}: ${source.color[name][mode]};`), `${mode} ${name}`);
      assert.ok(css.includes(`--mv-${mode}-${cssName}-rgb: ${hexToRgb(source.color[name][mode])};`), `rgb ${mode} ${name}`);
      assert.ok(css.includes(`--mv-${cssName}: var(--mv-${mode}-${cssName});`), `actief ${mode} ${name}`);
    }
  }
});

test('dist/tokens.json heeft dezelfde kleuren als de bron', () => {
  const json = JSON.parse(read('dist/tokens.json'));
  for (const mode of MODES) {
    const expected = Object.fromEntries(Object.entries(source.color).map(([name, pair]) => [name, pair[mode]]));
    assert.deepEqual(json.color[mode], expected);
  }
});

test('fonts.css verwijst naar de lettertypen in fonts/', () => {
  const css = read('dist/fonts.css').toString();
  for (const file of list('fonts').filter((name) => name.endsWith('.woff2'))) {
    assert.ok(css.includes(`url("fonts/${file}")`), file);
  }
});

test('de SVG\'s hebben geen verwijzingen en geen comments meer', () => {
  for (const file of ['favicon.svg', 'wordmark.svg']) {
    const svg = read(`dist/logo/${file}`).toString();
    assert.ok(!svg.includes('{{'), `${file} bevat nog {{`);
    assert.ok(!svg.includes('<!--'), `${file} bevat nog een comment`);
    assert.match(svg, /^<svg /);
  }
});

test('de PNG\'s hebben de juiste maat', () => {
  for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    assert.deepEqual(pngSize(read(`dist/logo/${file}`)), { width: size, height: size }, file);
  }
});
