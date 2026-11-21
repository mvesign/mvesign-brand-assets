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
