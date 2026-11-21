import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

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

test('elk doel in exports bestaat', () => {
  for (const target of Object.values(pkg.exports)) {
    if (target.endsWith('/*')) {
      const dir = new URL('../' + target.slice(2, -2), import.meta.url);
      assert.ok(existsSync(dir) && readdirSync(dir).length > 0, `lege of ontbrekende map: ${target}`);
    } else {
      assert.ok(existsSync(new URL('../' + target.slice(2), import.meta.url)), `ontbreekt: ${target}`);
    }
  }
});
