// De bron (src/tokens.json) controleren en omzetten naar CSS en JSON.
// Alleen zuivere functies: scripts/generate.mjs leest en schrijft de bestanden.

export const MODES = ['light', 'dark'];
export const HEADER = 'Gegenereerd door scripts/generate.mjs uit src/. Niet met de hand wijzigen.';

const TOP_KEYS = ['color', 'font', 'radius', 'bar_edge_width'];
const FONT_KEYS = ['family', 'fallback', 'mono', 'weight', 'size'];
const NAME = /^[a-z][a-z0-9_]*$/;
const HEX = /^#[0-9A-F]{6}$/;
const PX = /^\d+(\.\d+)?px$/;

function fail(where, message) {
  throw new Error(`src/tokens.json: ${where}: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function expectKeys(value, keys, where) {
  if (!isObject(value)) fail(where, 'verwacht een object');
  const actual = Object.keys(value);
  const missing = keys.filter((key) => !actual.includes(key));
  const extra = actual.filter((key) => !keys.includes(key));
  if (missing.length) fail(where, `ontbreekt: ${missing.join(', ')}`);
  if (extra.length) fail(where, `onbekend: ${extra.join(', ')}`);
}

function expectNames(value, where, check) {
  if (!isObject(value) || Object.keys(value).length === 0) fail(where, 'verwacht een object met minstens één naam');
  for (const [name, item] of Object.entries(value)) {
    if (!NAME.test(name)) fail(`${where}.${name}`, 'een naam is snake_case: kleine letters, cijfers en _');
    check(item, `${where}.${name}`);
  }
}

function expectText(value, where) {
  if (typeof value !== 'string' || value.trim() === '') fail(where, 'verwacht tekst');
}

function expectPx(value, where) {
  if (typeof value !== 'string' || !PX.test(value)) {
    fail(where, `verwacht een maat in px, zoals "5px", gevonden ${JSON.stringify(value)}`);
  }
}

/** Controleert de bron en geeft hem ongewijzigd terug. Een fout zegt wat en waar. */
export function validateTokens(raw) {
  expectKeys(raw, TOP_KEYS, 'hoofdniveau');
  expectNames(raw.color, 'color', (pair, where) => {
    expectKeys(pair, MODES, where);
    for (const mode of MODES) {
      if (typeof pair[mode] !== 'string' || !HEX.test(pair[mode])) {
        fail(`${where}.${mode}`, `verwacht #RRGGBB in hoofdletters, gevonden ${JSON.stringify(pair[mode])}`);
      }
    }
  });
  expectKeys(raw.font, FONT_KEYS, 'font');
  expectText(raw.font.family, 'font.family');
  expectText(raw.font.fallback, 'font.fallback');
  expectText(raw.font.mono, 'font.mono');
  expectNames(raw.font.weight, 'font.weight', (weight, where) => {
    if (!Number.isInteger(weight) || weight < 100 || weight > 900) {
      fail(where, `verwacht een gewicht van 100 tot 900, gevonden ${JSON.stringify(weight)}`);
    }
  });
  expectNames(raw.font.size, 'font.size', expectPx);
  expectPx(raw.radius, 'radius');
  expectPx(raw.bar_edge_width, 'bar_edge_width');
  return raw;
}

export function kebab(name) {
  return name.replaceAll('_', '-');
}

export function hexToRgb(hex) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)).join(' ');
}

export function fontStack(font) {
  return `'${font.family}', ${font.fallback}`;
}

/** tokens.css: vaste waarden, elke kleur vast licht en donker (ook als RGB-kanalen),
 *  en de actieve kleur, die de systeemvoorkeur volgt of data-theme op <html>. */
export function buildCss(tokens) {
  const names = Object.keys(tokens.color);
  const active = (mode, indent) => names.map((name) => `${indent}--mv-${kebab(name)}: var(--mv-${mode}-${kebab(name)});`);
  const lines = [
    `/* ${HEADER} */`,
    ':root {',
    `  --mv-font: ${fontStack(tokens.font)};`,
    `  --mv-font-mono: ${tokens.font.mono};`,
    ...Object.entries(tokens.font.weight).map(([name, value]) => `  --mv-font-weight-${kebab(name)}: ${value};`),
    ...Object.entries(tokens.font.size).map(([name, value]) => `  --mv-font-size-${kebab(name)}: ${value};`),
    `  --mv-radius: ${tokens.radius};`,
    `  --mv-bar-edge-width: ${tokens.bar_edge_width};`,
  ];
  for (const mode of MODES) {
    lines.push('');
    for (const name of names) {
      const hex = tokens.color[name][mode];
      lines.push(`  --mv-${mode}-${kebab(name)}: ${hex};`, `  --mv-${mode}-${kebab(name)}-rgb: ${hexToRgb(hex)};`);
    }
  }
  lines.push(
    '',
    ...active('light', '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme="light"]) {',
    ...active('dark', '    '),
    '  }',
    '}',
    '',
    ':root[data-theme="dark"] {',
    ...active('dark', '  '),
    '}',
  );
  return `${lines.join('\n')}\n`;
}

/** tokens.json: dezelfde waarden, met de kleuren per modus (voor Jinja2 en scripts). */
export function buildJson(tokens) {
  const color = Object.fromEntries(
    MODES.map((mode) => [mode, Object.fromEntries(Object.entries(tokens.color).map(([name, pair]) => [name, pair[mode]]))]),
  );
  const { family, mono, weight, size } = tokens.font;
  return {
    color,
    font: { family, stack: fontStack(tokens.font), mono, weight, size },
    radius: tokens.radius,
    bar_edge_width: tokens.bar_edge_width,
  };
}
