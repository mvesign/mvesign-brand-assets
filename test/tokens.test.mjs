import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCss, buildJson, hexToRgb, kebab, validateTokens } from '../scripts/lib/tokens.mjs';

const source = () => JSON.parse(readFileSync(new URL('../src/tokens.json', import.meta.url), 'utf8'));

// Een kleine bron, zodat de verwachte CSS en JSON hier helemaal te lezen zijn.
const mini = {
  color: { text_strong: { light: '#2B302E', dark: '#EEF2F0' } },
  font: {
    family: 'Open Sans',
    fallback: 'Arial, sans-serif',
    mono: 'monospace',
    weight: { bold: 700 },
    size: { body: '16px' },
  },
  radius: '5px',
  bar_edge_width: '8px',
};

test('de bron in src/tokens.json is geldig', () => {
  assert.doesNotThrow(() => validateTokens(source()));
});

test('een kleur in kleine letters wordt geweigerd, met plek en waarde', () => {
  const tokens = source();
  tokens.color.bg.light = '#fafafa';
  assert.throws(() => validateTokens(tokens), /^Error: src\/tokens\.json: color\.bg\.light: verwacht #RRGGBB in hoofdletters, gevonden "#fafafa"$/);
});

test('een kleur zonder donkere waarde wordt geweigerd', () => {
  const tokens = source();
  delete tokens.color.link.dark;
  assert.throws(() => validateTokens(tokens), /color\.link: ontbreekt: dark/);
});

test('een naam die geen snake_case is, wordt geweigerd', () => {
  const tokens = source();
  tokens.color['Bar-Edge'] = { light: '#000000', dark: '#000000' };
  assert.throws(() => validateTokens(tokens), /color\.Bar-Edge: een naam is snake_case/);
});

test('een onbekende sleutel op het hoogste niveau wordt geweigerd', () => {
  const tokens = { ...source(), spacing: '4px' };
  assert.throws(() => validateTokens(tokens), /hoofdniveau: onbekend: spacing/);
});

test('een maat zonder px wordt geweigerd', () => {
  const tokens = source();
  tokens.radius = '5';
  assert.throws(() => validateTokens(tokens), /radius: verwacht een maat in px, zoals "5px", gevonden "5"/);
});

test('een gewicht buiten 100 tot 900 wordt geweigerd', () => {
  const tokens = source();
  tokens.font.weight.bold = 1000;
  assert.throws(() => validateTokens(tokens), /font\.weight\.bold: verwacht een gewicht van 100 tot 900, gevonden 1000/);
});

test('hexToRgb geeft de kanalen met spaties', () => {
  assert.equal(hexToRgb('#0376A2'), '3 118 162');
  assert.equal(hexToRgb('#FFFFFF'), '255 255 255');
});

test('kebab maakt van snake_case kebab-case', () => {
  assert.equal(kebab('bar_edge_width'), 'bar-edge-width');
  assert.equal(kebab('bg'), 'bg');
});

test('buildCss: elke kleur vast licht, vast donker, met -rgb, en actief', () => {
  assert.equal(buildCss(mini), [
    '/* Gegenereerd door scripts/generate.mjs uit src/. Niet met de hand wijzigen. */',
    ':root {',
    "  --mv-font: 'Open Sans', Arial, sans-serif;",
    '  --mv-font-mono: monospace;',
    '  --mv-font-weight-bold: 700;',
    '  --mv-font-size-body: 16px;',
    '  --mv-radius: 5px;',
    '  --mv-bar-edge-width: 8px;',
    '',
    '  --mv-light-text-strong: #2B302E;',
    '  --mv-light-text-strong-rgb: 43 48 46;',
    '',
    '  --mv-dark-text-strong: #EEF2F0;',
    '  --mv-dark-text-strong-rgb: 238 242 240;',
    '',
    '  --mv-text-strong: var(--mv-light-text-strong);',
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    '    --mv-text-strong: var(--mv-dark-text-strong);',
    '  }',
    '}',
    '',
    ':root[data-theme="dark"] {',
    '  --mv-text-strong: var(--mv-dark-text-strong);',
    '}',
    '',
  ].join('\n'));
});

test('buildJson: kleuren per modus, met de lettertypestack', () => {
  assert.deepEqual(buildJson(mini), {
    color: { light: { text_strong: '#2B302E' }, dark: { text_strong: '#EEF2F0' } },
    font: {
      family: 'Open Sans',
      stack: "'Open Sans', Arial, sans-serif",
      mono: 'monospace',
      weight: { bold: 700 },
      size: { body: '16px' },
    },
    radius: '5px',
    bar_edge_width: '8px',
  });
});
