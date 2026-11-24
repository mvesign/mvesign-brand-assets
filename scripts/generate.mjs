// Maakt dist/ helemaal opnieuw uit src/. Draai dit na elke wijziging in src/, en commit
// src/ en dist/ samen; de CI faalt als dist/ niet klopt met de bron. Zie README.md.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildCss, buildJson, validateTokens } from './lib/tokens.mjs';
import { buildFontsCss, fontFiles, validateFonts } from './lib/fonts.mjs';
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
  const fonts = validateFonts(await readJson(new URL('fonts/fonts.json', src)), tokens.font);
  const json = buildJson(tokens);

  await rm(dist, { recursive: true, force: true });
  await mkdir(new URL('fonts/', dist), { recursive: true });
  await mkdir(new URL('logo/', dist), { recursive: true });

  await writeFile(new URL('tokens.css', dist), buildCss(tokens));
  await writeFile(new URL('tokens.json', dist), `${JSON.stringify(json, null, 2)}\n`);
  await writeFile(new URL('fonts.css', dist), buildFontsCss(fonts));
  for (const file of fontFiles(fonts)) {
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
