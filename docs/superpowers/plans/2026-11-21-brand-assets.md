# mvesign-brand-assets: implementatieplan

> **Voor agents die dit uitvoeren:** gebruik superpowers:subagent-driven-development (aanbevolen) of superpowers:executing-plans, taak voor taak. Elke stap heeft een selectievakje (`- [ ]`) om bij te houden.

**Doel:** de eerste versie (1.0.0) van de gedeelde huisstijl van mvesign: één bron met tokens, daaruit CSS, JSON, logo's en PNG's in `dist/`, gecontroleerd door de CI en gepubliceerd als image in `ghcr.io`.

**Architectuur:** `src/` is de bron (tokens, lettertypen, logo-sjablonen). `scripts/generate.mjs` maakt `dist/` opnieuw met kleine, zuivere functies in `scripts/lib/`. `dist/` staat in Git en is het hele pakket; de CI genereert opnieuw en faalt bij een verschil. Een tag `vX.Y.Z` laat `release.yml` een `FROM scratch`-image bouwen en een GitHub Release maken.

**Techniek:** Node 26 (ES-modules, `node:test`), `@resvg/resvg-wasm` 2.6.2 voor de PNG's, Python 3 met fontTools (alleen voor `scripts/outline-text.py`), Docker Buildx, GitHub Actions, Renovate.

**Spec:** [docs/superpowers/specs/2026-11-21-brand-assets-design.md](../specs/2026-11-21-brand-assets-design.md). Lees die eerst; dit plan volgt hem.

## Algemene regels

Deze regels gelden voor elke taak:

- **Taal:** README, docs, comments en meldingen in het Nederlands. Namen van bestanden, tokens, functies en de repo in het Engels. Commitberichten in het Engels: `feat: <Werkwoord met hoofdletter> ...`, of `docs: ...` voor alleen documentatie.
- **Git:** commit alleen als onderdeel van dit plan, nadat de gebruiker de uitvoering heeft goedgekeurd. Push, tag en PR alleen in taak 9, en alleen na een expliciet akkoord van de gebruiker. "Merge" betekent een merge-commit (`--no-ff`).
- **Accounts:** push, PR en release gaan met het account `mvesign`. Gebruik `gh` op deze pc alleen om te lezen.
- **Node:** `.nvmrc` bevat `26` (de LTS "Lithium"). Op deze pc staat Node 22; de code moet op 22 en 26 werken.
- **Dependencies:** alleen de devDependency `@resvg/resvg-wasm` op precies `2.6.2`. In `package.json` geen script met de naam `build`, `prepare`, `prepack`, `preinstall`, `install` of `postinstall`: dan bouwt npm een Git-dependency bij elke installatie opnieuw.
- **Namen:** in de bron en in JSON snake_case (`text_strong`). In CSS het voorvoegsel `--mv-` en kebab-case (`--mv-text-strong`).
- **Regeleinden:** alles LF. `.gitattributes` komt in taak 1, vóór alle andere bestanden.
- **Actions** vast op een commit-SHA, met de versie als comment:
  - `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`
  - `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`
  - `docker/login-action@8aa5831fb8d48d8f76594c7ddde61ae58019f550 # v4.8.0`
  - `docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1`
  - `docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0`
- **Downloads** (het npm-pakket van Fontsource) gaan in een eigen, lege map buiten de repo. Kopieer alleen de bestanden die je nodig hebt; draai niets uit die map.
- **Shell:** de commando's zijn voor Git Bash (de Bash-tool). Variabelen blijven niet bewaard tussen twee aanroepen; daarom gebruiken de stappen vaste tijdelijke mappen onder `/tmp`. Voor de Read-tool zet je zo'n pad om met `cygpath -w`.

---

## Overzicht van de bestanden

| Bestand | Verantwoordelijkheid | Taak |
|---|---|---|
| `.gitattributes`, `.gitignore`, `.nvmrc`, `package.json`, `package-lock.json` | Repo-basis | 1 |
| `src/tokens.json` | De bron: kleuren, letter, maten | 1 |
| `scripts/lib/tokens.mjs` | Bron controleren; omzetten naar CSS en JSON | 1 |
| `test/tokens.test.mjs`, `test/contrast.test.mjs`, `test/package.test.mjs` | Tests van de bron en van `package.json` | 1 |
| `src/fonts/*.woff2`, `src/fonts/OFL.txt`, `src/fonts/fonts.json` | Open Sans en de lijst van bestanden | 2 |
| `scripts/lib/fonts.mjs`, `test/fonts.test.mjs` | `fonts.css` maken | 2 |
| `scripts/outline-text.py`, `src/logo/favicon.svg`, `src/logo/wordmark.svg` | Logo-sjablonen met letters als paden | 3 |
| `scripts/lib/svg.mjs`, `test/svg.test.mjs` | Sjablonen vullen | 3 |
| `scripts/lib/png.mjs`, `test/png.test.mjs` | SVG naar PNG | 4 |
| `scripts/generate.mjs`, `dist/**`, `test/dist.test.mjs` | `dist/` opnieuw maken | 5 |
| `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml` | Image en CI | 6 |
| `scripts/lib/release.mjs`, `scripts/release-notes.mjs`, `test/release.test.mjs`, `CHANGELOG.md`, `.github/workflows/release.yml` | Release | 7 |
| `README.md`, `LICENSE`, `renovate.json` | Inrichting van de repo | 8 |

---

### Taak 0: Werkruimte

**Bestanden:** geen nieuwe; `docs/superpowers/` bestaat al (spec en plan).

- [ ] **Stap 1: Controleer de stand**

Run: `git status --short && git branch --show-current`
Verwacht: alleen `?? docs/` als wijziging, op branch `main`, nog zonder commits.

- [ ] **Stap 2: Eerste commit op main, met alleen de docs**

Een lege repo heeft een eerste commit nodig als basis voor de branch en de PR.

```bash
git add docs/superpowers
git commit -m "docs: Add design and implementation plan for the brand assets"
```

- [ ] **Stap 3: Branch voor de eerste versie**

```bash
git switch -c feat/first-version
```

Verwacht: `Switched to a new branch 'feat/first-version'`.

---

### Taak 1: Repo-basis en tokens

**Bestanden:**
- Maken: `.gitattributes`, `.gitignore`, `.nvmrc`, `package.json`, `package-lock.json`, `src/tokens.json`, `scripts/lib/tokens.mjs`
- Tests: `test/tokens.test.mjs`, `test/contrast.test.mjs`, `test/package.test.mjs`

**Interfaces:**
- Gebruikt: niets.
- Levert (`scripts/lib/tokens.mjs`):
  - `MODES`: `['light', 'dark']`
  - `HEADER: string`, de tekst voor de comment bovenaan gegenereerde bestanden
  - `validateTokens(raw: object): object`: geeft `raw` terug, of gooit een `Error` die begint met `src/tokens.json: <plek>: `
  - `kebab(name: string): string`
  - `hexToRgb(hex: string): string`, bijvoorbeeld `'3 118 162'`
  - `fontStack(font: object): string`, bijvoorbeeld `"'Open Sans', Arial, sans-serif"`
  - `buildCss(tokens: object): string`
  - `buildJson(tokens: object): object`, met de vorm `{ color: { light, dark }, font: { family, stack, mono, weight, size }, radius, bar_edge_width }`

- [ ] **Stap 1: Repo-basis**

`.gitattributes`:

```gitattributes
# Alles LF, ook op Windows (core.autocrlf=true): de CI vergelijkt dist/ byte voor byte.
* text=auto eol=lf
*.woff2 binary
*.png binary
```

`.gitignore`:

```gitignore
node_modules/
```

`.nvmrc`:

```text
26
```

`package.json`:

```json
{
  "name": "mvesign-brand-assets",
  "version": "1.0.0",
  "private": true,
  "description": "Huisstijl van mvesign: kleuren, lettertype en logo.",
  "license": "SEE LICENSE IN LICENSE",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/mvesign/mvesign-brand-assets.git"
  },
  "type": "module",
  "files": [
    "dist"
  ],
  "exports": {
    "./tokens.css": "./dist/tokens.css",
    "./tokens.json": "./dist/tokens.json",
    "./fonts.css": "./dist/fonts.css",
    "./fonts/*": "./dist/fonts/*",
    "./logo/*": "./dist/logo/*",
    "./package.json": "./package.json"
  },
  "scripts": {
    "generate": "node scripts/generate.mjs",
    "test": "node --test"
  }
}
```

Run: `npm install`
Verwacht: `package-lock.json` is gemaakt, zonder packages ("up to date").

- [ ] **Stap 2: De bron**

`src/tokens.json`, met precies deze waarden uit de spec:

```json
{
  "color": {
    "bg": { "light": "#FAFAFA", "dark": "#11171A" },
    "surface": { "light": "#FFFFFF", "dark": "#182126" },
    "text": { "light": "#525654", "dark": "#C9D1CE" },
    "text_strong": { "light": "#2B302E", "dark": "#EEF2F0" },
    "muted": { "light": "#6A706D", "dark": "#94A09B" },
    "line": { "light": "#DDE1DF", "dark": "#2A363C" },
    "soft": { "light": "#EDF3F6", "dark": "#1E2B33" },
    "link": { "light": "#0376A2", "dark": "#5DB4DC" },
    "bar": { "light": "#0376A2", "dark": "#035A88" },
    "bar_edge": { "light": "#035A88", "dark": "#023F60" },
    "on_bar": { "light": "#FFFFFF", "dark": "#FFFFFF" },
    "button": { "light": "#0376A2", "dark": "#0376A2" },
    "on_button": { "light": "#FFFFFF", "dark": "#FFFFFF" },
    "accent": { "light": "#EEBB66", "dark": "#EEBB66" },
    "error": { "light": "#A64452", "dark": "#D98593" },
    "ok": { "light": "#2A8452", "dark": "#5CC48A" }
  },
  "font": {
    "family": "Open Sans",
    "fallback": "Arial, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    "weight": { "regular": 400, "semibold": 600, "bold": 700, "extrabold": 800 },
    "size": { "heading": "22px", "body": "16px", "small": "13px", "code": "14px" }
  },
  "radius": "5px",
  "bar_edge_width": "8px"
}
```

- [ ] **Stap 3: Schrijf de tests die falen**

`test/tokens.test.mjs`:

```js
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
```

`test/contrast.test.mjs`:

```js
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
```

`test/package.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('package.json heeft geen script waarmee npm een Git-dependency opnieuw bouwt', () => {
  const forbidden = ['build', 'prepare', 'prepack', 'preinstall', 'install', 'postinstall'];
  const found = Object.keys(pkg.scripts ?? {}).filter((name) => forbidden.includes(name));
  assert.deepEqual(found, [], `verboden scripts: ${found.join(', ')}`);
});

test('package.json levert alleen dist/ en komt nooit op npm', () => {
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.files, ['dist']);
});
```

- [ ] **Stap 4: Draai de tests en zie ze falen**

Run: `npm test`
Verwacht: FAIL in `test/tokens.test.mjs`, met `ERR_MODULE_NOT_FOUND` voor `scripts/lib/tokens.mjs`. `contrast.test.mjs` en `package.test.mjs` slagen al.

- [ ] **Stap 5: Schrijf `scripts/lib/tokens.mjs`**

```js
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
```

- [ ] **Stap 6: Draai de tests en zie ze slagen**

Run: `npm test`
Verwacht: alle tests PASS, waaronder 26 contrasttests (13 paren, licht en donker). Het krapst is `light: link op soft` (4,56:1).

- [ ] **Stap 7: Commit**

```bash
git add .gitattributes .gitignore .nvmrc package.json package-lock.json src/tokens.json scripts/lib/tokens.mjs test/
git commit -m "feat: Add the design tokens with CSS and JSON output"
```

---

### Taak 2: Open Sans

**Bestanden:**
- Maken: `src/fonts/open-sans-latin-wght-normal.woff2`, `src/fonts/open-sans-latin-ext-wght-normal.woff2`, `src/fonts/OFL.txt`, `src/fonts/fonts.json`, `scripts/lib/fonts.mjs`
- Test: `test/fonts.test.mjs`

**Interfaces:**
- Gebruikt: `HEADER` uit `scripts/lib/tokens.mjs`.
- Levert (`scripts/lib/fonts.mjs`): `buildFontsCss(family: string, manifest: { weight: string, files: { file: string, unicode_range: string }[] }): string`. Het manifest is `src/fonts/fonts.json`.

- [ ] **Stap 1: Download het pakket van Fontsource in een eigen, lege map**

```bash
rm -rf /tmp/mv-fontsource && mkdir -p /tmp/mv-fontsource
( cd /tmp/mv-fontsource && npm pack @fontsource-variable/open-sans@5.3.0 && tar -xzf fontsource-variable-open-sans-5.3.0.tgz )
wc -c /tmp/mv-fontsource/package/files/open-sans-latin-wght-normal.woff2 /tmp/mv-fontsource/package/files/open-sans-latin-ext-wght-normal.woff2 /tmp/mv-fontsource/package/LICENSE
```

Verwacht: de drie bestanden bestaan; de woff2-bestanden zijn 48320 en 35156 bytes.

- [ ] **Stap 2: Kopieer alleen de drie bestanden**

```bash
mkdir -p src/fonts
cp /tmp/mv-fontsource/package/files/open-sans-latin-wght-normal.woff2 src/fonts/
cp /tmp/mv-fontsource/package/files/open-sans-latin-ext-wght-normal.woff2 src/fonts/
cp /tmp/mv-fontsource/package/LICENSE src/fonts/OFL.txt
head -3 src/fonts/OFL.txt
grep -c "SIL OPEN FONT LICENSE Version 1.1" src/fonts/OFL.txt
```

Verwacht: `OFL.txt` begint met de copyright-regel van de Open Sans Project Authors, en de `grep` telt minstens 1.

- [ ] **Stap 3: Schrijf `src/fonts/fonts.json`**

```json
{
  "source": "@fontsource-variable/open-sans 5.3.0: files/*-wght-normal.woff2, en LICENSE als OFL.txt",
  "weight": "300 800",
  "files": [
    {
      "file": "open-sans-latin-ext-wght-normal.woff2",
      "unicode_range": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"
    },
    {
      "file": "open-sans-latin-wght-normal.woff2",
      "unicode_range": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
    }
  ]
}
```

Controleer of de bereiken gelijk zijn aan die in het pakket:

```bash
grep -o 'unicode-range: *[^;]*' /tmp/mv-fontsource/package/wght.css | grep -E 'U\+0100-02BA|U\+0000-00FF'
```

Verwacht: precies de twee bereiken uit `fonts.json`. Het bereik voor latin-ext begint met `U+0100-02BA`, dat voor latin met `U+0000-00FF`. Wijkt een bereik af, neem dan dat uit `wght.css` over.

- [ ] **Stap 4: Schrijf de test die faalt**

`test/fonts.test.mjs`:

```js
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
```

- [ ] **Stap 5: Draai de test en zie hem falen**

Run: `node --test test/fonts.test.mjs`
Verwacht: FAIL, `ERR_MODULE_NOT_FOUND` voor `scripts/lib/fonts.mjs`.

- [ ] **Stap 6: Schrijf `scripts/lib/fonts.mjs`**

```js
// fonts.css: een @font-face per bestand uit src/fonts/fonts.json. De paden zijn relatief,
// zodat het pakket overal kan staan (/brand op de server, node_modules bij de website).
import { HEADER } from './tokens.mjs';

export function buildFontsCss(family, manifest) {
  const blocks = manifest.files.map((font) => [
    '@font-face {',
    `  font-family: "${family}";`,
    '  font-style: normal;',
    '  font-display: swap;',
    `  font-weight: ${manifest.weight};`,
    `  src: url("fonts/${font.file}") format("woff2");`,
    `  unicode-range: ${font.unicode_range};`,
    '}',
  ].join('\n'));
  return `/* ${HEADER} */\n${blocks.join('\n\n')}\n`;
}
```

- [ ] **Stap 7: Draai alle tests en zie ze slagen**

Run: `npm test`
Verwacht: alle tests PASS.

- [ ] **Stap 8: Ruim de download op en commit**

```bash
rm -rf /tmp/mv-fontsource
git add src/fonts scripts/lib/fonts.mjs test/fonts.test.mjs
git commit -m "feat: Add Open Sans as a variable woff2 with its license"
```

---

### Taak 3: Logo-sjablonen

**Bestanden:**
- Maken: `scripts/outline-text.py`, `src/logo/favicon.svg` en `src/logo/wordmark.svg` (beide geschreven door het script), `scripts/lib/svg.mjs`
- Test: `test/svg.test.mjs`

**Interfaces:**
- Gebruikt: `src/fonts/open-sans-latin-wght-normal.woff2` (taak 2); `validateTokens` en `buildJson` (taak 1).
- Levert:
  - `src/logo/favicon.svg`, met de verwijzingen `{{color.light.bar}}`, `{{color.light.bar_edge}}`, `{{color.light.accent}}` en `{{corner}}`
  - `src/logo/wordmark.svg`, met de verwijzing `{{color.light.on_bar}}`, en `<g class="mv">` om de "m" en de "v"
  - `scripts/lib/svg.mjs`:
    - `flatten(value: object, prefix?: string): Record<string, string>`, bijvoorbeeld `{ 'color.light.bar': '#0376A2' }`
    - `fillTemplate(template: string, values: Record<string, string>, name: string): string`. Haalt `<!-- … -->` weg en vult `{{pad}}`. Bij een onbekend pad gooit hij `Error('<name>: onbekende verwijzing {{pad}}')`.

- [ ] **Stap 1: Schrijf `scripts/outline-text.py`**

```python
"""Maakt de logo-sjablonen src/logo/favicon.svg en src/logo/wordmark.svg.

Draai dit alleen als de vorm van het logo verandert; scripts/generate.mjs gebruikt de
sjablonen bij elke build, en de CI draait dit script niet. Het zet de letters van Open
Sans (gewicht 800) om in paden, zodat een SVG geen lettertype nodig heeft. De kleuren
blijven verwijzingen ({{color.light.bar}}); die vult scripts/generate.mjs uit
src/tokens.json, net als {{corner}}, de straal van de hoeken van de favicon.

Nodig: Python 3 met fontTools en brotli (voor woff2). Vanuit de root van de repository:

    python -m pip install "fonttools>=4.50,<5" brotli
    python scripts/outline-text.py
"""

from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "src" / "fonts" / "open-sans-latin-wght-normal.woff2"
LOGO = ROOT / "src" / "logo"
WEIGHT = 800


def number(value):
    """Twee decimalen, zonder nullen achteraan en zonder '-0'."""
    text = f"{value:.2f}".rstrip("0").rstrip(".")
    return "0" if text in ("-0", "") else text


def outline(font, text, size, tracking, dx=0.0, dy=0.0):
    """De letters van `text` als SVG-paden, `size` px groot, met `tracking` em tussen de
    letters. De eerste letter begint op x = dx, de basislijn ligt op y = dy, en y wijst
    omlaag. Geeft een lijst (letter, pad) en de omhullende (xmin, ymin, xmax, ymax)."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    units = font["head"].unitsPerEm
    scale = size / units
    x = 0.0
    paths, boxes = [], []
    for char in text:
        name = cmap[ord(char)]
        transform = (scale, 0, 0, -scale, dx + x * scale, dy)
        pen = SVGPathPen(glyphs, ntos=number)
        glyphs[name].draw(TransformPen(pen, transform))
        bounds = BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(bounds, transform))
        paths.append((char, pen.getCommands()))
        boxes.append(bounds.bounds)
        x += font["hmtx"][name][0] + tracking * units
    box = (
        min(b[0] for b in boxes),
        min(b[1] for b in boxes),
        max(b[2] for b in boxes),
        max(b[3] for b in boxes),
    )
    return paths, box


def favicon(font):
    """64 x 64. "mv" is 31 px groot met -1 px tussen de letters, en staat in het midden
    van het blauwe vlak boven de strook (x 32, y 25)."""
    size, tracking = 31, -1 / 31
    _, (xmin, ymin, xmax, ymax) = outline(font, "mv", size, tracking)
    paths, _ = outline(font, "mv", size, tracking, 32 - (xmin + xmax) / 2, 25 - (ymin + ymax) / 2)
    return "\n".join([
        "<!-- Favicon van mvesign: een blauw vlak met afgeronde hoeken, onderaan een diepblauwe",
        "     strook, en mv in goud. Gemaakt met scripts/outline-text.py. scripts/generate.mjs vult",
        "     de kleuren uit src/tokens.json, en {{corner}} met de straal van de hoeken. -->",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
        '  <clipPath id="mv-favicon-shape"><rect width="64" height="64" rx="{{corner}}"/></clipPath>',
        '  <g clip-path="url(#mv-favicon-shape)">',
        '    <rect width="64" height="64" fill="{{color.light.bar}}"/>',
        '    <rect y="50" width="64" height="14" fill="{{color.light.bar_edge}}"/>',
        "  </g>",
        '  <g fill="{{color.light.accent}}">',
        *[f'    <path d="{d}"/>' for _, d in paths],
        "  </g>",
        "</svg>",
        "",
    ])


def wordmark(font):
    """mvesign, 100 px groot, met -0,015 em tussen de letters. De viewBox sluit precies om
    de letters. De m en de v staan in een eigen groep (class mv)."""
    size, tracking = 100, -0.015
    _, (xmin, ymin, xmax, ymax) = outline(font, "mvesign", size, tracking)
    paths, _ = outline(font, "mvesign", size, tracking, -xmin, -ymin)
    width, height = number(xmax - xmin), number(ymax - ymin)
    return "\n".join([
        "<!-- Woordmerk van mvesign: wit, voor op de blauwe balk. De m en de v staan in een",
        "     groep met class mv, zodat een pagina die de SVG in de HTML zet ze bij aanwijzen",
        "     goud kan maken. Gemaakt met scripts/outline-text.py. scripts/generate.mjs vult",
        "     de kleuren uit src/tokens.json. -->",
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        '  <g class="mv" fill="{{color.light.on_bar}}">',
        *[f'    <path d="{d}"/>' for _, d in paths[:2]],
        "  </g>",
        '  <g fill="{{color.light.on_bar}}">',
        *[f'    <path d="{d}"/>' for _, d in paths[2:]],
        "  </g>",
        "</svg>",
        "",
    ])


def main():
    font = instantiateVariableFont(TTFont(FONT), {"wght": WEIGHT})
    LOGO.mkdir(parents=True, exist_ok=True)
    for name, build in (("favicon.svg", favicon), ("wordmark.svg", wordmark)):
        target = LOGO / name
        target.write_text(build(font), encoding="utf-8", newline="\n")
        print(f"geschreven: {target.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
```

- [ ] **Stap 2: Draai het script in een eigen venv, buiten de repo**

Op deze pc start `py` Python 3.12; `python` zelf bestaat niet.

```bash
rm -rf /tmp/mv-outline-venv
py -m venv /tmp/mv-outline-venv
/tmp/mv-outline-venv/Scripts/python.exe -m pip install --quiet "fonttools>=4.50,<5" brotli
/tmp/mv-outline-venv/Scripts/python.exe scripts/outline-text.py
```

Verwacht:
```text
geschreven: src/logo/favicon.svg
geschreven: src/logo/wordmark.svg
```

Controleer de sjablonen:

```bash
grep -c '<path d=' src/logo/favicon.svg src/logo/wordmark.svg
grep -oh '{{[^}]*}}' src/logo/*.svg | sort -u
```

Verwacht: 2 paden in `favicon.svg` en 7 in `wordmark.svg`. De verwijzingen zijn alleen `{{color.light.accent}}`, `{{color.light.bar_edge}}`, `{{color.light.bar}}`, `{{color.light.on_bar}}` en `{{corner}}`.

- [ ] **Stap 3: Schrijf de tests die falen**

`test/svg.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fillTemplate, flatten } from '../scripts/lib/svg.mjs';
import { buildJson, validateTokens } from '../scripts/lib/tokens.mjs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('flatten maakt paden met punten, met tekst als waarde', () => {
  assert.deepEqual(
    flatten({ color: { light: { bar: '#0376A2' } }, font: { weight: { bold: 700 } }, radius: '5px' }),
    { 'color.light.bar': '#0376A2', 'font.weight.bold': '700', radius: '5px' },
  );
});

test('fillTemplate vult de verwijzingen en haalt comments weg', () => {
  const template = '<!-- uitleg\n     over twee regels -->\n<rect fill="{{color.light.bar}}" rx="{{corner}}"/>\n';
  assert.equal(
    fillTemplate(template, { 'color.light.bar': '#0376A2', corner: '12' }, 'test.svg'),
    '<rect fill="#0376A2" rx="12"/>\n',
  );
});

test('fillTemplate stopt bij een onbekende verwijzing, met de naam van het sjabloon', () => {
  assert.throws(
    () => fillTemplate('<rect fill="{{color.light.nope}}"/>', {}, 'favicon.svg'),
    /^Error: favicon\.svg: onbekende verwijzing \{\{color\.light\.nope\}\}$/,
  );
});

test('de sjablonen in src/logo/ gebruiken alleen bestaande verwijzingen', () => {
  const values = { ...flatten(buildJson(validateTokens(JSON.parse(read('src/tokens.json'))))), corner: '12' };
  for (const name of ['favicon.svg', 'wordmark.svg']) {
    const svg = fillTemplate(read(`src/logo/${name}`), values, name);
    assert.ok(!svg.includes('{{'), `${name} bevat nog {{`);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  }
});

test('het woordmerk heeft de m en de v in een groep met class mv', () => {
  const svg = read('src/logo/wordmark.svg');
  const group = svg.match(/<g class="mv"[^>]*>([\s\S]*?)<\/g>/);
  assert.ok(group, 'geen <g class="mv">');
  assert.equal(group[1].match(/<path /g).length, 2);
});
```

- [ ] **Stap 4: Draai de test en zie hem falen**

Run: `node --test test/svg.test.mjs`
Verwacht: FAIL, `ERR_MODULE_NOT_FOUND` voor `scripts/lib/svg.mjs`.

- [ ] **Stap 5: Schrijf `scripts/lib/svg.mjs`**

```js
// Sjablonen vullen: {{pad.naar.waarde}} wordt een waarde uit dist/tokens.json (via flatten),
// of een eigen waarde zoals {{corner}}. Comments gaan eruit: die zijn voor de bron.

export function flatten(value, prefix = '') {
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item !== null && typeof item === 'object') Object.assign(out, flatten(item, path));
    else out[path] = String(item);
  }
  return out;
}

export function fillTemplate(template, values, name) {
  return template
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
      if (!Object.hasOwn(values, key)) throw new Error(`${name}: onbekende verwijzing {{${key}}}`);
      return values[key];
    });
}
```

- [ ] **Stap 6: Draai alle tests en zie ze slagen**

Run: `npm test`
Verwacht: alle tests PASS.

- [ ] **Stap 7: Ruim de venv op en commit**

```bash
rm -rf /tmp/mv-outline-venv
git add scripts/outline-text.py src/logo scripts/lib/svg.mjs test/svg.test.mjs
git commit -m "feat: Add the favicon and wordmark templates with outlined letters"
```

---

### Taak 4: PNG's met resvg

**Bestanden:**
- Wijzigen: `package.json`, `package-lock.json` (devDependency)
- Maken: `scripts/lib/png.mjs`
- Test: `test/png.test.mjs`

**Interfaces:**
- Gebruikt: niets uit eerdere taken.
- Levert (`scripts/lib/png.mjs`):
  - `renderPng(svg: string, width: number): Promise<Uint8Array>`
  - `pngSize(png: Uint8Array): { width: number, height: number }`

- [ ] **Stap 1: Installeer resvg (wasm) op een vaste versie**

```bash
npm install --save-dev --save-exact @resvg/resvg-wasm@2.6.2
node --input-type=module -e "const m = await import('@resvg/resvg-wasm'); console.log(typeof m.initWasm, typeof m.Resvg, import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))"
```

Verwacht: `package.json` heeft `"devDependencies": { "@resvg/resvg-wasm": "2.6.2" }`. De controle print `function function file:///…/node_modules/@resvg/resvg-wasm/index_bg.wasm`.

- [ ] **Stap 2: Schrijf de tests die falen**

`test/png.test.mjs`:

```js
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
```

- [ ] **Stap 3: Draai de test en zie hem falen**

Run: `node --test test/png.test.mjs`
Verwacht: FAIL, `ERR_MODULE_NOT_FOUND` voor `scripts/lib/png.mjs`.

- [ ] **Stap 4: Schrijf `scripts/lib/png.mjs`**

```js
// SVG naar PNG met resvg. De wasm-versie geeft op Windows en Linux dezelfde bytes, zodat
// de CI de PNG's in Git kan vergelijken met een nieuwe build.
import { readFile } from 'node:fs/promises';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

let ready;

export async function renderPng(svg, width) {
  ready ??= readFile(new URL(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))).then((wasm) => initWasm(wasm));
  await ready;
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/** Breedte en hoogte uit de IHDR-chunk, die altijd direct na de handtekening komt. */
export function pngSize(png) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
```

- [ ] **Stap 5: Draai alle tests en zie ze slagen**

Run: `npm test`
Verwacht: alle tests PASS.

- [ ] **Stap 6: Commit**

```bash
git add package.json package-lock.json scripts/lib/png.mjs test/png.test.mjs
git commit -m "feat: Render PNG icons with the wasm build of resvg"
```

---

### Taak 5: De generator en `dist/`

**Bestanden:**
- Maken: `scripts/generate.mjs`, `dist/**` (gegenereerd)
- Test: `test/dist.test.mjs`

**Interfaces:**
- Gebruikt: `validateTokens`, `buildCss`, `buildJson`, `kebab` en `MODES` (taak 1); `buildFontsCss` (taak 2); `flatten` en `fillTemplate` (taak 3); `renderPng` en `pngSize` (taak 4).
- Levert: `npm run generate` schrijft `dist/` helemaal opnieuw:
  - `tokens.css`, `tokens.json`, `fonts.css`;
  - `fonts/open-sans-latin-ext-wght-normal.woff2`, `fonts/open-sans-latin-wght-normal.woff2`, `fonts/OFL.txt`;
  - `logo/favicon.svg`, `logo/wordmark.svg`, `logo/apple-touch-icon.png`, `logo/icon-192.png`, `logo/icon-512.png`.

- [ ] **Stap 1: Schrijf de test die faalt**

`test/dist.test.mjs`:

```js
// Controleert de uitvoer in dist/. De CI draait eerst npm run generate, en controleert
// daarna ook dat dist/ in Git gelijk is aan wat de generator maakt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { kebab, MODES } from '../scripts/lib/tokens.mjs';
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
      assert.match(css, new RegExp(`--mv-${mode}-${cssName}-rgb: \\d{1,3} \\d{1,3} \\d{1,3};`));
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
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `node --test test/dist.test.mjs`
Verwacht: FAIL met `ENOENT` voor `dist/`.

- [ ] **Stap 3: Schrijf `scripts/generate.mjs`**

```js
// Maakt dist/ helemaal opnieuw uit src/. Draai dit na elke wijziging in src/, en commit
// src/ en dist/ samen; de CI faalt als dist/ niet klopt met de bron. Zie README.md.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildCss, buildJson, validateTokens } from './lib/tokens.mjs';
import { buildFontsCss } from './lib/fonts.mjs';
import { fillTemplate, flatten } from './lib/svg.mjs';
import { renderPng } from './lib/png.mjs';

const root = new URL('../', import.meta.url);
const src = new URL('src/', root);
const dist = new URL('dist/', root);

// Per logo: het bestand in dist/logo/, het sjabloon in src/logo/, de straal van de hoeken
// ({{corner}}, alleen bij de favicon), en de breedte als het een PNG wordt. De
// apple-touch-icon heeft geen afgeronde hoeken: iOS rondt die zelf af, en maakt
// doorzichtige hoeken zwart.
const LOGOS = [
  { out: 'favicon.svg', template: 'favicon.svg', corner: 12 },
  { out: 'wordmark.svg', template: 'wordmark.svg' },
  { out: 'apple-touch-icon.png', template: 'favicon.svg', corner: 0, width: 180 },
  { out: 'icon-192.png', template: 'favicon.svg', corner: 12, width: 192 },
  { out: 'icon-512.png', template: 'favicon.svg', corner: 12, width: 512 },
];

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

async function main() {
  const tokens = validateTokens(await readJson(new URL('tokens.json', src)));
  const fonts = await readJson(new URL('fonts/fonts.json', src));
  const json = buildJson(tokens);

  await rm(dist, { recursive: true, force: true });
  await mkdir(new URL('fonts/', dist), { recursive: true });
  await mkdir(new URL('logo/', dist), { recursive: true });

  await writeFile(new URL('tokens.css', dist), buildCss(tokens));
  await writeFile(new URL('tokens.json', dist), `${JSON.stringify(json, null, 2)}\n`);
  await writeFile(new URL('fonts.css', dist), buildFontsCss(tokens.font.family, fonts));
  for (const file of [...fonts.files.map((font) => font.file), 'OFL.txt']) {
    await cp(new URL(`fonts/${file}`, src), new URL(`fonts/${file}`, dist));
  }

  const values = flatten(json);
  for (const logo of LOGOS) {
    const template = await readFile(new URL(`logo/${logo.template}`, src), 'utf8');
    const extra = logo.corner === undefined ? {} : { corner: String(logo.corner) };
    const svg = fillTemplate(template, { ...values, ...extra }, logo.template);
    await writeFile(new URL(`logo/${logo.out}`, dist), logo.width ? await renderPng(svg, logo.width) : svg);
  }

  console.log('dist/ is bijgewerkt.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
```

- [ ] **Stap 4: Genereer en draai alle tests**

Run: `npm run generate && npm test`
Verwacht: `dist/ is bijgewerkt.`, daarna alle tests PASS.

- [ ] **Stap 5: Controleer dat een fout in de bron duidelijk stopt**

```bash
cp src/tokens.json /tmp/mv-tokens.json.bak
sed -i 's/"#FAFAFA"/"#fafafa"/' src/tokens.json
npm run generate; echo "exitcode: $?"
cp /tmp/mv-tokens.json.bak src/tokens.json && rm /tmp/mv-tokens.json.bak
git diff --stat src/tokens.json
```

Verwacht: `src/tokens.json: color.bg.light: verwacht #RRGGBB in hoofdletters, gevonden "#fafafa"` en `exitcode: 1`. Daarna staat de bron weer goed: `git diff --stat` print niets.

- [ ] **Stap 6: Bekijk de logo's**

Render het woordmerk tijdelijk in blauw, zodat het wit zichtbaar wordt op een lichte achtergrond:

```bash
rm -rf /tmp/mv-preview && mkdir -p /tmp/mv-preview
node --input-type=module -e "
import { readFileSync, writeFileSync } from 'node:fs';
import { renderPng } from './scripts/lib/png.mjs';
const svg = readFileSync('dist/logo/wordmark.svg', 'utf8').replaceAll('#FFFFFF', '#0376A2');
writeFileSync(process.argv[1], await renderPng(svg, 720));
" /tmp/mv-preview/wordmark.png
npm run generate
cygpath -w /tmp/mv-preview/wordmark.png
```

Open met de Read-tool `dist/logo/icon-512.png`, `dist/logo/apple-touch-icon.png` en het Windows-pad dat `cygpath` print. Verwacht:
- een blauw vlak met afgeronde hoeken (de apple-touch-icon met rechte hoeken), onderaan een diepblauwe strook, en een gouden "mv" in het midden van het blauwe deel;
- het woordmerk "mvesign" in kleine, vette letters, niet afgesneden.

Staat de "mv" niet goed (te groot, te klein, niet in het midden), pas dan `size` of het midden aan in `favicon()` in `scripts/outline-text.py`. Draai daarna het script opnieuw (taak 3, stap 2), en dan `npm run generate && npm test`.

- [ ] **Stap 7: Controleer dat de uitvoer vastligt**

```bash
git add dist scripts/generate.mjs test/dist.test.mjs
npm run generate && git status --porcelain
```

Verwacht: `git status --porcelain` print niets. Een tweede build geeft dus exact dezelfde bestanden.

- [ ] **Stap 8: Commit**

```bash
git commit -m "feat: Generate the package in dist from the sources"
rm -rf /tmp/mv-preview
```

---

### Taak 6: Image en CI

**Bestanden:**
- Maken: `Dockerfile`, `.dockerignore`, `.github/workflows/ci.yml`

**Interfaces:**
- Gebruikt: `npm run generate` en `npm test` (taken 1–5).
- Levert: een image met de bestanden in `/brand` en zonder `CMD`. Taak 7 bouwt en publiceert het.

- [ ] **Stap 1: Schrijf het `Dockerfile` en `.dockerignore`**

`Dockerfile`:

```dockerfile
# Het pakket als image: alleen de bestanden uit dist/, in /brand. Geen CMD: de container
# draait nooit. Wie de bestanden wil, maakt een container met een willekeurig commando
# (docker create <image> none) en kopieert eruit (docker cp <id>:/brand/. <map>).
FROM scratch
COPY dist/ /brand/
```

`.dockerignore`:

```gitignore
# Alleen dist/ gaat het image in.
*
!dist
```

- [ ] **Stap 2: Bouw het image en kijk wat erin zit**

Dit kan alleen als Docker Desktop draait: `docker info` mag geen fout geven. Start Docker Desktop zo nodig. Lukt dat niet, sla deze stap dan over en meld het in het verslag; de CI bouwt het image ook.

```bash
docker build -t mvesign-brand-assets:test .
id=$(docker create mvesign-brand-assets:test none)
rm -rf /tmp/mv-image && mkdir -p /tmp/mv-image
docker cp "$id:/brand/." /tmp/mv-image
docker rm "$id"
diff -r dist /tmp/mv-image && echo "gelijk aan dist/"
docker image rm mvesign-brand-assets:test
rm -rf /tmp/mv-image
```

Verwacht: `gelijk aan dist/`.

- [ ] **Stap 3: Schrijf `.github/workflows/ci.yml`**

```yaml
# Bij elke push naar main en elke pull request: dist/ moet kloppen met de bron, de tests
# moeten slagen, en het image moet te bouwen zijn. Publiceren gebeurt in release.yml.
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      - name: dist/ opnieuw genereren
        run: npm run generate

      - name: dist/ moet kloppen met de bron
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            git status --porcelain
            echo "::error::dist/ klopt niet met de bron: draai npm run generate en commit dist/."
            exit 1
          fi

      - run: npm test

      - name: Image bouwen, zonder push
        run: docker build .
```

- [ ] **Stap 4: Controleer de YAML op tabs**

```bash
grep -nP '\t' .github/workflows/ci.yml || echo "geen tabs"
```

Verwacht: `geen tabs`. De echte controle is de eerste run in GitHub (taak 9).

- [ ] **Stap 5: Commit**

```bash
git add Dockerfile .dockerignore .github/workflows/ci.yml
git commit -m "feat: Add the files-only image and the CI workflow"
```

---

### Taak 7: Release

**Bestanden:**
- Maken: `scripts/lib/release.mjs`, `scripts/release-notes.mjs`, `CHANGELOG.md`, `.github/workflows/release.yml`
- Test: `test/release.test.mjs`

**Interfaces:**
- Gebruikt: `version` uit `package.json`; het `Dockerfile` (taak 6).
- Levert:
  - `releaseNotes({ tag: string, packageVersion: string, changelog: string }): { version: string, notes: string }`. Gooit een `Error` met een Nederlandse melding.
  - `node scripts/release-notes.mjs vX.Y.Z` schrijft de tekst naar stdout. Bij een fout: een melding op stderr en exitcode 1.

- [ ] **Stap 1: Schrijf de tests die falen**

`test/release.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { releaseNotes } from '../scripts/lib/release.mjs';

const changelog = [
  '# Changelog',
  '',
  'Per versie een kop en één tot drie korte regels.',
  '',
  '## 1.1.0',
  '',
  '- Groen iets donkerder.',
  '- Een PNG van 32 px erbij.',
  '',
  '## 1.0.0',
  '',
  '- Eerste versie.',
  '',
].join('\n');

test('geeft de versie en de regels onder de kop', () => {
  assert.deepEqual(
    releaseNotes({ tag: 'v1.1.0', packageVersion: '1.1.0', changelog }),
    { version: '1.1.0', notes: '- Groen iets donkerder.\n- Een PNG van 32 px erbij.' },
  );
});

test('werkt ook voor de laatste kop in het bestand', () => {
  assert.equal(releaseNotes({ tag: 'v1.0.0', packageVersion: '1.0.0', changelog }).notes, '- Eerste versie.');
});

test('werkt met CRLF', () => {
  const crlf = changelog.replaceAll('\n', '\r\n');
  assert.equal(releaseNotes({ tag: 'v1.0.0', packageVersion: '1.0.0', changelog: crlf }).notes, '- Eerste versie.');
});

test('een tag zonder v of met een achtervoegsel wordt geweigerd', () => {
  assert.throws(() => releaseNotes({ tag: '1.1.0', packageVersion: '1.1.0', changelog }), /De tag 1\.1\.0 is geen vX\.Y\.Z\./);
  assert.throws(() => releaseNotes({ tag: 'v1.1.0-rc1', packageVersion: '1.1.0', changelog }), /geen vX\.Y\.Z/);
});

test('een tag die niet bij package.json past, wordt geweigerd', () => {
  assert.throws(
    () => releaseNotes({ tag: 'v1.1.0', packageVersion: '1.0.0', changelog }),
    /De tag v1\.1\.0 hoort bij versie 1\.1\.0, maar package\.json zegt 1\.0\.0\./,
  );
});

test('een versie zonder kop in CHANGELOG.md wordt geweigerd', () => {
  assert.throws(
    () => releaseNotes({ tag: 'v2.0.0', packageVersion: '2.0.0', changelog }),
    /CHANGELOG\.md heeft geen kop "## 2\.0\.0"\./,
  );
});

test('een kop zonder regels wordt geweigerd', () => {
  const empty = ['## 1.2.0', '', '## 1.1.0', '- Iets.'].join('\n');
  assert.throws(
    () => releaseNotes({ tag: 'v1.2.0', packageVersion: '1.2.0', changelog: empty }),
    /CHANGELOG\.md heeft onder "## 1\.2\.0" geen regels\./,
  );
});
```

- [ ] **Stap 2: Draai de test en zie hem falen**

Run: `node --test test/release.test.mjs`
Verwacht: FAIL, `ERR_MODULE_NOT_FOUND` voor `scripts/lib/release.mjs`.

- [ ] **Stap 3: Schrijf `scripts/lib/release.mjs` en `scripts/release-notes.mjs`**

`scripts/lib/release.mjs`:

```js
// Controles en tekst voor een release (zie .github/workflows/release.yml): de tag moet
// vX.Y.Z zijn, gelijk aan de versie in package.json, met een kop in CHANGELOG.md.

const TAG = /^v(\d+\.\d+\.\d+)$/;

export function releaseNotes({ tag, packageVersion, changelog }) {
  const match = TAG.exec(tag);
  if (!match) throw new Error(`De tag ${tag} is geen vX.Y.Z.`);
  const version = match[1];
  if (version !== packageVersion) {
    throw new Error(`De tag ${tag} hoort bij versie ${version}, maar package.json zegt ${packageVersion}.`);
  }
  const lines = changelog.replaceAll('\r\n', '\n').split('\n');
  const start = lines.indexOf(`## ${version}`);
  if (start === -1) throw new Error(`CHANGELOG.md heeft geen kop "## ${version}".`);
  const next = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  const notes = lines
    .slice(start + 1, next === -1 ? undefined : next)
    .filter((line) => line.trim() !== '')
    .join('\n');
  if (!notes) throw new Error(`CHANGELOG.md heeft onder "## ${version}" geen regels.`);
  return { version, notes };
}
```

`scripts/release-notes.mjs`:

```js
// Gebruik: node scripts/release-notes.mjs v1.2.3
// Controleert de tag tegen package.json en CHANGELOG.md, en schrijft de tekst voor de
// GitHub Release naar stdout. Bij een fout: een melding op stderr en exitcode 1.
import { readFile } from 'node:fs/promises';
import { releaseNotes } from './lib/release.mjs';

const root = new URL('../', import.meta.url);

try {
  const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const changelog = await readFile(new URL('CHANGELOG.md', root), 'utf8');
  const { notes } = releaseNotes({ tag: process.argv[2] ?? '', packageVersion: version, changelog });
  process.stdout.write(`${notes}\n`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
```

- [ ] **Stap 4: Schrijf `CHANGELOG.md`**

```markdown
# Changelog

Per versie een kop en één tot drie korte regels.

## 1.0.0

- Eerste versie: kleuren voor licht en donker, Open Sans, woordmerk en favicon.
```

- [ ] **Stap 5: Draai de tests en het script**

```bash
npm test
node scripts/release-notes.mjs v1.0.0
node scripts/release-notes.mjs v1.0.1; echo "exitcode: $?"
```

Verwacht: alle tests PASS. Daarna `- Eerste versie: kleuren voor licht en donker, Open Sans, woordmerk en favicon.`. Tot slot `De tag v1.0.1 hoort bij versie 1.0.1, maar package.json zegt 1.0.0.` met `exitcode: 1`.

- [ ] **Stap 6: Schrijf `.github/workflows/release.yml`**

```yaml
# Bij een tag vX.Y.Z: controleren, het image bouwen en publiceren in ghcr.io, en een
# GitHub Release maken met de regels uit CHANGELOG.md. Een versie wordt maar één keer
# gebouwd, zodat de digest vast blijft. Zie README.md → Een versie maken.
name: Release

on:
  push:
    tags: ['v[0-9]+.[0-9]+.[0-9]+']

permissions:
  contents: write   # de GitHub Release
  packages: write   # het image in ghcr.io

env:
  IMAGE: ghcr.io/${{ github.repository }}

jobs:
  release:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      - name: dist/ opnieuw genereren
        run: npm run generate

      - name: dist/ moet kloppen met de bron
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            git status --porcelain
            echo "::error::dist/ klopt niet met de bron: draai npm run generate en commit dist/."
            exit 1
          fi

      - run: npm test

      - name: Tag, package.json en CHANGELOG.md controleren
        id: release
        run: |
          node scripts/release-notes.mjs "$GITHUB_REF_NAME" > "$RUNNER_TEMP/notes.md"
          echo "version=${GITHUB_REF_NAME#v}" >> "$GITHUB_OUTPUT"

      - uses: docker/login-action@8aa5831fb8d48d8f76594c7ddde61ae58019f550 # v4.8.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/setup-buildx-action@f87e5991a6d7451dcb8d9637bfbc97413f497069 # v4.4.1

      - name: Stoppen als deze versie al bestaat
        env:
          VERSION: ${{ steps.release.outputs.version }}
        run: |
          if docker buildx imagetools inspect "$IMAGE:$VERSION" > /dev/null 2>&1; then
            echo "::error::$IMAGE:$VERSION bestaat al. Een versie wordt maar één keer gebouwd: maak een nieuwe versie."
            exit 1
          fi

      - name: Image bouwen en publiceren
        id: build
        uses: docker/build-push-action@c3c9e263c25d99ce0380d002d59b67737d91b0dc # v7.4.0
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          # Geen provenance en geen SBOM: provenance bevat tijdstippen, en geeft dus bij
          # elke build een andere digest.
          provenance: false
          sbom: false
          tags: ${{ env.IMAGE }}:${{ steps.release.outputs.version }}
          labels: |
            org.opencontainers.image.source=${{ github.server_url }}/${{ github.repository }}
            org.opencontainers.image.version=${{ steps.release.outputs.version }}
            org.opencontainers.image.licenses=MIT AND OFL-1.1 AND LicenseRef-mvesign-logo
            org.opencontainers.image.description=Huisstijl van mvesign: kleuren, lettertype en logo.

      - name: GitHub Release maken
        env:
          GH_TOKEN: ${{ github.token }}
          VERSION: ${{ steps.release.outputs.version }}
        run: gh release create "$GITHUB_REF_NAME" --title "$VERSION" --notes-file "$RUNNER_TEMP/notes.md" --verify-tag

      - name: Verwijzing voor de afnemers
        env:
          VERSION: ${{ steps.release.outputs.version }}
          DIGEST: ${{ steps.build.outputs.digest }}
        run: |
          {
            echo "### $IMAGE:$VERSION"
            echo
            echo "Verwijzing met digest, voor de server:"
            echo
            echo "    $IMAGE:$VERSION@$DIGEST"
          } >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Stap 7: Controleer de YAML op tabs**

```bash
grep -nP '\t' .github/workflows/release.yml || echo "geen tabs"
```

Verwacht: `geen tabs`.

- [ ] **Stap 8: Commit**

```bash
git add scripts/lib/release.mjs scripts/release-notes.mjs test/release.test.mjs CHANGELOG.md .github/workflows/release.yml
git commit -m "feat: Add the release workflow that publishes the image"
```

---

### Taak 8: README, licentie en Renovate

**Bestanden:**
- Maken: `README.md`, `LICENSE`, `renovate.json`

**Interfaces:**
- Gebruikt: de namen van bestanden, scripts en workflows uit de taken 1–7.
- Levert: documentatie en configuratie; geen code.

- [ ] **Stap 1: Schrijf `README.md`**

````markdown
# mvesign-brand-assets

De huisstijl van mvesign op één plek: kleuren, lettertype en logo. De home server en de website gebruiken een vaste versie, en krijgen een nieuwe versie als Renovate-PR.

Het ontwerp en de redenen staan in [de spec](docs/superpowers/specs/2026-11-21-brand-assets-design.md).

## Wat erin zit

Het pakket is de map `dist/`. Die wordt gegenereerd uit `src/`; wijzig hem niet met de hand.

| Bestand | Inhoud |
|---|---|
| `tokens.css` | Custom properties (`--mv-…`). Elke kleur vast licht (`--mv-light-link`), vast donker (`--mv-dark-link`), beide ook als RGB-kanalen (`--mv-light-link-rgb`), en actief (`--mv-link`). Actief volgt de systeemvoorkeur; `<html data-theme="light">` of `"dark"` zet het vast. |
| `tokens.json` | Dezelfde waarden voor Jinja2 en scripts: `{{ brand.color.light.link }}`, `{{ brand.font.stack }}` |
| `fonts.css`, `fonts/` | Open Sans (variabel, gewicht 300–800), met de licentie in `fonts/OFL.txt` |
| `logo/favicon.svg` | De favicon: blauw vlak, diepblauwe strook, "mv" in goud |
| `logo/wordmark.svg` | Het woordmerk, wit, voor op de blauwe balk |
| `logo/apple-touch-icon.png`, `logo/icon-192.png`, `logo/icon-512.png` | Voor iOS en een webmanifest |

Goud (`accent`) is nooit een tekstkleur: op wit haalt het maar 1,8:1.

## Iets wijzigen

1. Pas de bron aan: `src/tokens.json` (kleuren en maten), `src/logo/` of `src/fonts/`.
2. Draai `npm ci` (eenmalig), daarna `npm run generate` en `npm test`.
3. Commit de bron en `dist/` samen, in een PR. De CI faalt als `dist/` niet klopt met de bron, of als een kleur het contrast van 4,5:1 breekt.

**De vorm van het logo** staat in `scripts/outline-text.py`. Dat Python-script schrijft de sjablonen in `src/logo/`; hoe je het draait, staat bovenaan het script.

**De lettertypen** werk je met de hand bij. Pak het pakket van Fontsource uit in een lege map:

```bash
rm -rf /tmp/fontsource && mkdir -p /tmp/fontsource
cd /tmp/fontsource
npm pack @fontsource-variable/open-sans@5.3.0
tar -xzf fontsource-variable-open-sans-5.3.0.tgz
```

Kopieer `package/files/open-sans-latin-wght-normal.woff2`, `package/files/open-sans-latin-ext-wght-normal.woff2` en `package/LICENSE` (als `OFL.txt`) naar `src/fonts/`. Neem de `unicode-range` uit `package/wght.css` over in `src/fonts/fonts.json`, en zet de nieuwe versie bij `source`.

## Een versie maken

**Versieregels:**

- **Major:** een afnemer moet iets aanpassen. Een bestand, token, custom property of JSON-sleutel is hernoemd of weg, of de indeling in het image (`/brand`) verandert.
- **Minor:** er komt iets bij, of het uiterlijk verandert bewust (een andere kleur, een ander logo).
- **Patch:** een correctie zonder bedoeld verschil in het uiterlijk.
- Alleen docs, tests of CI: geen nieuwe versie.

**Stappen:**

1. Maak een PR met de wijziging, de nieuwe versie (`npm version minor --no-git-tag-version`, of `major` of `patch`) en een kop met één tot drie korte regels in `CHANGELOG.md`.
2. Merge de PR.
3. Tag `main` en push de tag:

   ```bash
   git switch main
   git pull
   git tag v1.1.0
   git push origin v1.1.0
   ```

De workflow *Release* controleert tag, `package.json` en `CHANGELOG.md`, bouwt `ghcr.io/mvesign/mvesign-brand-assets:1.1.0` en maakt een GitHub Release. Een versie die al bestaat, bouwt hij niet opnieuw. De verwijzing met digest staat in de samenvatting van de run.

## Gebruiken

**Home server.** De server pakt het image uit naar een map op de host, en koppelt die map in de containers; zie de docs in de server-repo. Het image heeft de bestanden in `/brand` en geen `CMD`:

```bash
image=ghcr.io/mvesign/mvesign-brand-assets:1.0.0
id=$(docker create "$image" none)
docker cp "$id:/brand/." ./brand
docker rm "$id"
```

**Website.** Als Git-dependency met de tag; Renovate werkt de tag bij:

```json
{
  "dependencies": {
    "mvesign-brand-assets": "github:mvesign/mvesign-brand-assets#v1.0.0"
  }
}
```

```js
import 'mvesign-brand-assets/fonts.css';
import 'mvesign-brand-assets/tokens.css';
```

**Het woordmerk inline**, met de "mv" goud bij aanwijzen:

```css
.brand:hover .mv { fill: var(--mv-accent); }
```

## Licentie

MIT, behalve de naam mvesign, het woordmerk en de favicon: alle rechten voorbehouden. Open Sans valt onder de SIL Open Font License 1.1. Zie [LICENSE](LICENSE).
````

- [ ] **Stap 2: Schrijf `LICENSE`**

```text
The name "mvesign", the mvesign wordmark and the mvesign favicon, including the
files in src/logo/ and dist/logo/, are not covered by the MIT License below.
All rights reserved.

Open Sans (src/fonts/ and dist/fonts/) is licensed under the SIL Open Font
License, Version 1.1. See dist/fonts/OFL.txt.

Everything else in this repository is licensed under the MIT License:

MIT License

Copyright (c) 2026 mvesign

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Stap 3: Schrijf `renovate.json`**

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "description": "Houdt Node (.nvmrc), resvg en de GitHub Actions bij. De lettertypen werk je met de hand bij (README → Iets wijzigen).",
  "extends": ["config:recommended", "helpers:pinGitHubActionDigests"],
  "timezone": "Europe/Amsterdam",
  "schedule": ["before 7am on monday"],
  "prHourlyLimit": 0,
  "major": {
    "dependencyDashboardApproval": true
  },
  "packageRules": [
    {
      "description": "Alle kleine updates samen in één wekelijkse PR.",
      "matchUpdateTypes": ["minor", "patch", "digest", "pin", "pinDigest"],
      "groupName": "wekelijkse updates",
      "groupSlug": "wekelijks"
    },
    {
      "description": "Een nieuwe resvg kan andere PNG's maken; de CI faalt dan tot dist/ opnieuw gegenereerd is.",
      "matchPackageNames": ["@resvg/resvg-wasm"],
      "prBodyNotes": [
        "Zegt de CI dat `dist/` niet klopt, draai dan `npm run generate` en commit `dist/` in deze PR. Een nieuwe versie van het pakket is dan een patch."
      ]
    }
  ]
}
```

Controleer dat het geldige JSON is:

```bash
node -e "JSON.parse(require('fs').readFileSync('renovate.json', 'utf8')); console.log('geldig')"
```

Verwacht: `geldig`.

- [ ] **Stap 4: Alle tests nog één keer, en dist/ ongewijzigd**

```bash
npm run generate && npm test && git status --porcelain dist
```

Verwacht: alle tests PASS, en `git status` print niets.

- [ ] **Stap 5: Commit**

```bash
git add README.md LICENSE renovate.json
git commit -m "docs: Add the README, license and Renovate configuration"
```

---

### Taak 9: Publiceren en overdragen

Elke stap hier gaat naar buiten. Vraag de gebruiker vóór stap 1, stap 3 en stap 4 om akkoord, en wacht op een duidelijk ja.

**Bestanden:** geen wijzigingen in de repo; een aanvulling op de notitie in de gedeelde notitiemap.

- [ ] **Stap 1: Pushen (na akkoord)**

```bash
git push -u origin main
git push -u origin feat/first-version
```

Verwacht: beide branches staan op GitHub. Git print een link om een PR te maken.

- [ ] **Stap 2: PR en CI**

De gebruiker opent de PR van `feat/first-version` naar `main` in de browser, als `mvesign`. Volg de CI met `gh` (alleen lezen):

```bash
gh run list --repo mvesign/mvesign-brand-assets --workflow CI --limit 3
```

Verwacht: de run voor de PR is `completed` en `success`. Faalt hij, lees dan de log:

```bash
run=$(gh run list --repo mvesign/mvesign-brand-assets --workflow CI --limit 1 --json databaseId -q '.[0].databaseId')
gh run view "$run" --repo mvesign/mvesign-brand-assets --log-failed
```

Los het op met een nieuwe commit op de branch, en push opnieuw (na akkoord).

- [ ] **Stap 3: Mergen (na akkoord)**

Een merge-commit, geen squash:

```bash
git switch main
git pull
git merge --no-ff feat/first-version -m "Merge branch 'feat/first-version'"
git push origin main
```

Verwacht: de PR staat op *Merged*, en de CI-run op `main` slaagt.

- [ ] **Stap 4: Tag v1.0.0 (na akkoord)**

```bash
git switch main
git pull
git tag v1.0.0
git push origin v1.0.0
```

Volg de run:

```bash
gh run list --repo mvesign/mvesign-brand-assets --workflow Release --limit 1
```

Verwacht: de run *Release* is `completed` en `success`. In de samenvatting van de run staat `ghcr.io/mvesign/mvesign-brand-assets:1.0.0@sha256:…`.

- [ ] **Stap 5: Eenmalig in GitHub, door de gebruiker**

Vraag de gebruiker om:
1. het pakket openbaar te zetten: github.com/orgs/mvesign/packages → *mvesign-brand-assets* → *Package settings* → *Change visibility* → *Public*. Dat kan niet terug. Kan het niet, sta dan eerst openbare pakketten toe: *Org settings* → *Packages*.
2. een ruleset voor tags te maken: *Repo settings* → *Rules* → *Rulesets* → *New tag ruleset*, met target `v*`, en *Restrict updates* en *Restrict deletions* aan. Een bestaande tag is dan niet meer te verplaatsen of te verwijderen.
3. te controleren dat de Renovate-app toegang heeft tot deze repo.

- [ ] **Stap 6: Controleer zonder login, en draag over aan de sessie van de home server**

```bash
token=$(curl -fsS "https://ghcr.io/token?scope=repository:mvesign/mvesign-brand-assets:pull" | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).token")
digest=$(curl -fsSI -H "Authorization: Bearer $token" \
  -H "Accept: application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json" \
  https://ghcr.io/v2/mvesign/mvesign-brand-assets/manifests/1.0.0 \
  | awk 'tolower($1) == "docker-content-digest:" { print $2 }' | tr -d '\r')
echo "ghcr.io/mvesign/mvesign-brand-assets:1.0.0@$digest"
```

Verwacht: een regel met `@sha256:` en 64 hexadecimale tekens, gelijk aan de digest in de samenvatting van de run. Is `digest` leeg, dan is het pakket nog niet openbaar (stap 5).

Vul daarna de notitie voor de sessie van de home server aan, in dezelfde aanroep (zodat `digest` nog bestaat) en met `NOTES` op het pad van die notitie:

```bash
# NOTES: het pad van brand-assets-bevindingen.md in de gedeelde notitiemap van de sessies (staat niet in Git).
cat >> "$NOTES" <<EOF

## Eerste versie gepubliceerd

- Verwijzing: ghcr.io/mvesign/mvesign-brand-assets:1.0.0@$digest
- In het image: /brand, met tokens.css, tokens.json, fonts.css, fonts/ en logo/.
- Wat de server nodig heeft: de spec in mvesign-brand-assets,
  docs/superpowers/specs/2026-11-21-brand-assets-design.md, hoofdstuk "Gebruik door de home server".
EOF
```
