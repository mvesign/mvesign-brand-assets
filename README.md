# mvesign-brand-assets

De huisstijl van mvesign op één plek: kleuren, lettertype en logo. De home server en de website gebruiken een vaste versie, en krijgen een nieuwe versie als Renovate-PR.

Het ontwerp en de redenen staan in [de spec van 1.0](docs/superpowers/specs/2026-11-21-brand-assets-design.md), en wat 2.0 veranderde (kleuren, letters en logo) in [de spec van 2.0](docs/superpowers/specs/2026-11-24-brand-v2-design.md).

## Wat erin zit

Het pakket is de map `dist/`. Die wordt gegenereerd uit `src/`; wijzig hem niet met de hand.

| Bestand | Inhoud |
|---|---|
| `tokens.css` | Custom properties (`--mv-…`). Elke kleur vast licht (`--mv-light-link`), vast donker (`--mv-dark-link`), beide ook als RGB-kanalen (`--mv-light-link-rgb`), en actief (`--mv-link`). Actief volgt de systeemvoorkeur; `<html data-theme="light">` of `"dark"` zet het vast. |
| `tokens.json` | Dezelfde waarden voor Jinja2 en scripts: `{{ brand.color.light.link }}`, `{{ brand.font.stack }}` |
| `fonts.css`, `fonts/` | IBM Plex Sans (variabel, gewicht 100–700) en IBM Plex Mono (400), met de licenties in `fonts/ibm-plex-sans-OFL.txt` en `fonts/ibm-plex-mono-OFL.txt` |
| `logo/favicon.svg` | De favicon: een vlak in de kleur van de balk, met "mv" in goud |
| `logo/wordmark.svg` | Het woordmerk, licht, voor op de donkere balk |
| `logo/apple-touch-icon.png`, `logo/icon-192.png`, `logo/icon-512.png` | Voor iOS en een webmanifest |

Goud (`accent`) is nooit een tekstkleur: op wit haalt het maar 1,8:1.

## Iets wijzigen

1. Pas de bron aan: `src/tokens.json` (kleuren en maten), `src/logo/` of `src/fonts/`.
2. Draai `npm ci` (eenmalig), daarna `npm run generate` en `npm test`.
3. Commit de bron en `dist/` samen, in een PR. De CI faalt als `dist/` niet klopt met de bron, of als een kleur het contrast van 4,5:1 breekt.

**De vorm van het logo** staat in `scripts/outline-text.py`. Dat Python-script schrijft de sjablonen in `src/logo/`; hoe je het draait, staat bovenaan het script.

**De lettertypen** werk je met de hand bij. Pak de pakketten van Fontsource uit in een lege map:

```bash
rm -rf /tmp/fontsource && mkdir -p /tmp/fontsource/sans /tmp/fontsource/mono
cd /tmp/fontsource
npm pack @fontsource-variable/ibm-plex-sans@5.3.0 @fontsource/ibm-plex-mono@5.3.0
tar -xzf fontsource-variable-ibm-plex-sans-5.3.0.tgz -C sans
tar -xzf fontsource-ibm-plex-mono-5.3.0.tgz -C mono
```

Kopieer naar `src/fonts/` in de repository:

- uit `sans/package/files/`: `ibm-plex-sans-latin-wght-normal.woff2` en `ibm-plex-sans-latin-ext-wght-normal.woff2`, en `sans/package/LICENSE` als `ibm-plex-sans-OFL.txt`;
- uit `mono/package/files/`: `ibm-plex-mono-latin-400-normal.woff2` en `ibm-plex-mono-latin-ext-400-normal.woff2`, en `mono/package/LICENSE` als `ibm-plex-mono-OFL.txt`.

Neem de `unicode-range` uit `sans/package/wght.css` en `mono/package/400.css` over in `src/fonts/fonts.json`, en zet de nieuwe versies bij `source`. `npm run generate` controleert dat elke familie in de lettertokens staat en dat geen gewicht buiten het lettertype valt.

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

Is het image gepubliceerd maar de GitHub Release mislukt, dan stopt een nieuwe run bij "bestaat al". Maak de Release dan zelf, vanuit de root van de repository, met een account dat schrijfrechten heeft:

```bash
version=1.1.0
node scripts/release-notes.mjs "v$version" > /tmp/notes.md
gh release create "v$version" --title "$version" --notes-file /tmp/notes.md --verify-tag
```

## Gebruiken

**Home server.** De server pakt het image uit naar een map op de host, en koppelt die map in de containers; zie de docs in de server-repo. Het image heeft de bestanden in `/brand` en geen `CMD`:

```bash
image=ghcr.io/mvesign/mvesign-brand-assets:2.0.0
id=$(docker create "$image" none)
docker cp "$id:/brand/." ./brand
docker rm "$id"
```

**Website.** Als Git-dependency met de tag; Renovate werkt de tag bij:

```json
{
  "dependencies": {
    "mvesign-brand-assets": "github:mvesign/mvesign-brand-assets#v2.0.0"
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

MIT, behalve de naam mvesign, het woordmerk en de favicon: alle rechten voorbehouden. IBM Plex Sans en IBM Plex Mono vallen onder de SIL Open Font License 1.1. Zie [LICENSE](LICENSE).
