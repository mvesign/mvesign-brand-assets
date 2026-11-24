// fonts.css en de controle van src/fonts/fonts.json. Elk blok in fonts.json is één familie,
// met zijn bestanden, zijn gewicht en zijn licentie. De paden in fonts.css zijn relatief,
// zodat het pakket overal kan staan (/brand op de server, node_modules bij de website).
import { HEADER } from './tokens.mjs';

const FAMILY_KEYS = ['family', 'source', 'weight', 'license', 'files'];
const WEIGHT = /^(\d{3})(?: (\d{3}))?$/;

function fail(where, message) {
  throw new Error(`src/fonts/fonts.json: ${where}: ${message}`);
}

/** Het gewicht van een blok als [laagste, hoogste]: "100 700" of "400". Anders null. */
export function weightRange(weight) {
  const match = WEIGHT.exec(String(weight));
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? match[1])];
}

/** De eerste naam in een lettertypestack, zonder aanhalingstekens. */
export function firstFamily(stack) {
  return stack.split(',')[0].trim().replace(/^(['"])(.*)\1$/, '$2');
}

/** Controleert fonts.json tegen de lettertokens (tokens.font) en geeft het ongewijzigd terug.
 *  Elke familie staat in font.family of vooraan in font.mono, en elk gewicht in font.weight
 *  valt binnen de familie van font.family. Een fout zegt wat en waar. */
export function validateFonts(manifest, font) {
  if (!Array.isArray(manifest?.families) || manifest.families.length === 0) {
    fail('families', 'verwacht een lijst met minstens één familie');
  }
  const stack = [font.family, firstFamily(font.mono)];
  manifest.families.forEach((block, index) => {
    const where = `families[${index}]`;
    const missing = FAMILY_KEYS.filter((key) => !Object.hasOwn(block ?? {}, key));
    if (missing.length) fail(where, `ontbreekt: ${missing.join(', ')}`);
    if (!stack.includes(block.family)) {
      fail(`${where}.family`, `"${block.family}" staat niet in font.family of vooraan in font.mono`);
    }
    if (!weightRange(block.weight)) {
      fail(`${where}.weight`, `verwacht "400" of "100 700", gevonden ${JSON.stringify(block.weight)}`);
    }
    if (!Array.isArray(block.files) || block.files.length === 0) fail(`${where}.files`, 'verwacht minstens één bestand');
  });
  const text = manifest.families.find((block) => block.family === font.family);
  if (!text) fail('families', `geen blok voor font.family ("${font.family}")`);
  const [low, high] = weightRange(text.weight);
  for (const [name, weight] of Object.entries(font.weight)) {
    if (weight < low || weight > high) {
      throw new Error(`src/tokens.json: font.weight.${name}: ${weight} valt buiten ${text.family} (${text.weight}) in src/fonts/fonts.json`);
    }
  }
  return manifest;
}

/** Een @font-face per bestand, met de familie en het gewicht van zijn blok. */
export function buildFontsCss(manifest) {
  const blocks = manifest.families.flatMap((block) => block.files.map((font) => [
    '@font-face {',
    `  font-family: "${block.family}";`,
    '  font-style: normal;',
    '  font-display: swap;',
    `  font-weight: ${block.weight};`,
    `  src: url("fonts/${font.file}") format("woff2");`,
    `  unicode-range: ${font.unicode_range};`,
    '}',
  ].join('\n')));
  return `/* ${HEADER} */\n${blocks.join('\n\n')}\n`;
}

/** De bestanden voor dist/fonts/: per blok de lettertypen en de licentie. */
export function fontFiles(manifest) {
  return manifest.families.flatMap((block) => [...block.files.map((font) => font.file), block.license]);
}
