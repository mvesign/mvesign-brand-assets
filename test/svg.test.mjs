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
