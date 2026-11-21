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
