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
