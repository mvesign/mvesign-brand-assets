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
