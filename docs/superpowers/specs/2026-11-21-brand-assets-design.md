# mvesign-brand-assets: ontwerp

Datum: 21 november 2026. Status: ontwerp, akkoord per onderdeel in de brainstorm; de spec zelf wacht op akkoord.

## Doel

Eén huisstijl voor alles van mvesign: de home server (`mvesign/mvesign-infra-homeserver`, met Homepage, News, Nextcloud, Paperless en Gatus) en de nieuwe website `mvesign-web-www`. De huisstijl staat op één plek, in deze openbare repo. Elke plek die hem gebruikt, krijgt een nieuwe versie als update (een Renovate-PR), niet direct live.

De huisstijl is alleen voor eigen gebruik. Houd alles klein: weinig tekst, weinig ceremonie.

## Vaste keuzes (uit de brainstorm van 20 en 21 november)

Deze keuzes staan vast en worden hier niet opnieuw afgewogen:

- Kleuren afgeleid van mvesign.com, met een waarde voor licht en voor donker (zie *Tokens*). Goud nooit als tekst op wit (1,8:1). Hoeken 5 px.
- Variant A: een blauwe balk met een donkere rand van 8 px eronder, en een wit, vet woordmerk "mvesign" in kleine letters. De "mv" wordt alleen goud bij aanwijzen. De favicon is een blauw vlak met afgeronde hoeken, onderaan een diepblauwe strook en "mv" in goud.
- Open Sans als bestand in de repo; geen Google Fonts en geen CDN.
- Nextcloud: de server zet het thema vast; gebruikers kiezen geen eigen thema.
- Een openbare repo, zodat niemand een token nodig heeft.
- Verspreiden als image, met een update per plek via Renovate.
- Kostenloos, geen derde partijen nodig bij het draaien, images met vaste versie en digest.

## Beslissingen in deze sessie

| Onderwerp | Keuze | Reden |
|---|---|---|
| Taal | README, docs en comments in het Nederlands; namen van bestanden, tokens en de repo in het Engels; commitberichten in het Engels | Gelijk aan de server-repo |
| Licentie | MIT, behalve de naam mvesign, het woordmerk en de favicon (alle rechten voorbehouden); Open Sans onder de OFL | Code en tokens vrij, het merk niet |
| Genereren | Eigen Node-script zonder dependencies, plus resvg (wasm) voor de PNG's | Past op één scherm; Node is toch nodig voor het npm-pakket |
| Release | Zelf een tag pushen; de workflow bouwt het image en maakt een GitHub Release | Eenvoudig, alles in Git |
| Changelog | Per versie een kop en één tot drie korte regels | Alleen eigen gebruik; lange tekst leest niemand |
| Server | Het image uitpakken op de host en die map koppelen, geen image mounts | Image mounts komen na een reboot leeg terug (zie *Afgewezen*) |

## Tokens

### Bron

`src/tokens.json` is de enige bron; die houd je met de hand bij. Alles in `dist/` wordt daaruit gegenereerd. De bron staat in `src/`, zodat hij niet te verwarren is met `dist/tokens.json`, dat een andere vorm heeft.

```json
{
  "color": {
    "bg": { "light": "#FAFAFA", "dark": "#11171A" }
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

(Het voorbeeld toont één kleur; de volledige lijst staat hieronder.)

Regels, gecontroleerd door het script:

- De sleutels op het hoogste niveau zijn precies `color`, `font`, `radius` en `bar_edge_width`.
- Elke kleur heeft precies `light` en `dark`, elk als `#RRGGBB` in hoofdletters.
- Namen zijn snake_case: `^[a-z][a-z0-9_]*$`.

### Kleuren

| Token | Licht | Donker | Waarvoor |
|---|---|---|---|
| `bg` | `#FAFAFA` | `#11171A` | De pagina |
| `surface` | `#FFFFFF` | `#182126` | Kaarten, tegels en vakken |
| `text` | `#525654` | `#C9D1CE` | Lopende tekst |
| `text_strong` | `#2B302E` | `#EEF2F0` | Koppen |
| `muted` | `#6A706D` | `#94A09B` | Bron, tijd en uitleg |
| `line` | `#DDE1DF` | `#2A363C` | Randen en scheidingen |
| `soft` | `#EDF3F6` | `#1E2B33` | Tags, actief menu-item, pictogramvlakken |
| `link` | `#0376A2` | `#5DB4DC` | Links |
| `bar` | `#0376A2` | `#035A88` | De balk |
| `bar_edge` | `#035A88` | `#023F60` | De rand onder de balk |
| `on_bar` | `#FFFFFF` | `#FFFFFF` | Woordmerk en tekst op de balk |
| `button` | `#0376A2` | `#0376A2` | Knoppen |
| `on_button` | `#FFFFFF` | `#FFFFFF` | Tekst op knoppen |
| `accent` | `#EEBB66` | `#EEBB66` | Goud: de "mv" bij aanwijzen en markeringen; nooit als tekst |
| `error` | `#A64452` | `#D98593` | Fout |
| `ok` | `#2A8452` | `#5CC48A` | Werkt |

`text_strong` en `soft` komen van de voorbeeldpagina. `button` staat apart van `bar`, omdat knoppen in donker `#0376A2` blijven terwijl de balk `#035A88` wordt.

## Uitvoer: het pakket (`dist/`)

`dist/` wordt helemaal gegenereerd, staat in Git, en is het hele pakket. Niets in `dist/` wijzig je met de hand.

| Bestand | Inhoud |
|---|---|
| `tokens.css` | Custom properties met het voorvoegsel `--mv-` |
| `tokens.json` | Dezelfde waarden voor Jinja2 en scripts |
| `fonts.css` | `@font-face` voor Open Sans |
| `fonts/open-sans-latin-wght-normal.woff2` | Open Sans, variabel (300–800), latin |
| `fonts/open-sans-latin-ext-wght-normal.woff2` | Open Sans, variabel (300–800), latin-ext |
| `fonts/OFL.txt` | De licentie van Open Sans |
| `logo/favicon.svg` | De favicon |
| `logo/wordmark.svg` | Het woordmerk, wit |
| `logo/apple-touch-icon.png` | 180 × 180, zonder afgeronde hoeken |
| `logo/icon-192.png` | 192 × 192 |
| `logo/icon-512.png` | 512 × 512 |

### `tokens.css`

Bovenaan een regel dat het bestand gegenereerd is. Daarna:

```css
:root {
  --mv-font: 'Open Sans', Arial, sans-serif;
  --mv-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  --mv-font-weight-regular: 400;      /* ook semibold, bold, extrabold */
  --mv-font-size-heading: 22px;       /* ook body, small, code */
  --mv-radius: 5px;
  --mv-bar-edge-width: 8px;

  --mv-light-bg: #FAFAFA;             /* per kleur, alle kleuren */
  --mv-light-bg-rgb: 250 250 250;
  --mv-dark-bg: #11171A;
  --mv-dark-bg-rgb: 17 23 26;

  --mv-bg: var(--mv-light-bg);        /* actief: licht */
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --mv-bg: var(--mv-dark-bg);       /* actief: donker */
  }
}
:root[data-theme="dark"] {
  --mv-bg: var(--mv-dark-bg);
}
```

- Namen in CSS zijn kebab-case: `text_strong` wordt `--mv-text-strong`.
- Elke kleur staat er in drie vormen: vast licht (`--mv-light-*`), vast donker (`--mv-dark-*`), en actief (`--mv-*`), dat de systeemvoorkeur volgt. Met `data-theme="light"` of `"dark"` op `<html>` zet een pagina het vast.
- De vaste sets hebben ook RGB-kanalen (`-rgb`, met spaties). Homepage geeft zijn palet zo op, en kiest licht of donker met een class in plaats van de systeemvoorkeur; met de vaste sets kan de server dat volgen.

### `tokens.json`

```json
{
  "color": {
    "light": { "bg": "#FAFAFA", "surface": "#FFFFFF" },
    "dark":  { "bg": "#11171A", "surface": "#182126" }
  },
  "font": {
    "family": "Open Sans",
    "stack": "'Open Sans', Arial, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
    "weight": { "regular": 400, "semibold": 600, "bold": 700, "extrabold": 800 },
    "size": { "heading": "22px", "body": "16px", "small": "13px", "code": "14px" }
  },
  "radius": "5px",
  "bar_edge_width": "8px"
}
```

(Ingekort: `light` en `dark` bevatten alle kleuren.) Sleutels blijven snake_case, zodat Jinja2 ze zonder haakjes leest: `{{ brand.color.light.link }}`, `{{ brand.font.stack }}`. De lettertypestack gebruikt enkele aanhalingstekens, zodat hij in een `style`-attribuut past.

### Letters

- Open Sans als variabele woff2 (gewicht 300–800, alleen rechtop), de bestanden `open-sans-latin-wght-normal.woff2` (47 KB) en `open-sans-latin-ext-wght-normal.woff2` (34 KB) uit `@fontsource-variable/open-sans` 5.3.0. Ze staan in `src/fonts/` met `OFL.txt` (de `LICENSE` uit dat pakket), en het script kopieert ze naar `dist/fonts/`.
- `fonts.css` heeft een `@font-face` per bestand, met `font-family: "Open Sans"`, `font-weight: 300 800`, `font-style: normal`, `font-display: swap`, de `unicode-range` van Fontsource, en een relatief pad (`url("fonts/…")`). De bestanden, het gewicht en de `unicode-range` staan in `src/fonts/fonts.json`. De browser laadt latin-ext alleen als een tekst die tekens bevat.
- De lettertypen werk je met de hand bij; Renovate doet dat niet.

### Logo's

- **Sjablonen** in `src/logo/`: `favicon.svg` en `wordmark.svg`. Kleuren staan erin als `{{color.light.bar}}`, in de vorm van `dist/tokens.json`; het script vult ze uit `src/tokens.json`. Het favicon-sjabloon heeft daarnaast `{{corner}}`, de straal van de hoeken (zie *PNG's*). Een onbekende verwijzing laat het script stoppen.
- **Letters als paden.** De "mv" en "mvesign" zijn omtrekken uit Open Sans op gewicht 800, gemaakt met fontTools door `scripts/outline-text.py`. Dat Python-script schrijft de twee sjablonen; je draait het alleen als de vorm van het logo verandert (de CI draait het niet). Zo is geen lettertype nodig om de SVG te tonen of om te zetten (Imagick in Nextcloud, resvg hier).
- **Favicon** (64 × 64): een vlak in `bar` (licht) met afgeronde hoeken (straal 12), onderaan een strook in `bar_edge` (licht) vanaf y = 50, en "mv" in `accent`. Dezelfde kleuren in licht en donker.
- **Woordmerk:** "mvesign" in `on_bar`, letterafstand −0,015 em. De "m" en "v" staan in `<g class="mv">`, zodat een pagina die de SVG in de HTML zet hem bij aanwijzen goud kan maken.
- **PNG's** komen uit het favicon-sjabloon: `icon-192.png` en `icon-512.png` met afgeronde hoeken, `apple-touch-icon.png` (180) zonder (straal 0), omdat iOS de hoeken zelf afrondt en doorzichtige hoeken zwart maakt. Ze zijn er voor iOS en het webmanifest van de website; alle apps op de server nemen SVG.

## Repo

```
src/tokens.json          de bron
src/logo/*.svg           sjablonen
src/fonts/               woff2-bestanden, OFL.txt en fonts.json
scripts/generate.mjs     maakt dist/ opnieuw
scripts/lib/*.mjs        de onderdelen van generate.mjs en release-notes.mjs
scripts/outline-text.py  maakt de sjablonen in src/logo/ (alleen bij een nieuwe vorm)
scripts/release-notes.mjs  controles en tekst voor een release
test/*.test.mjs          tests (node --test)
dist/                    gegenereerd, in Git
Dockerfile, .dockerignore
package.json, package-lock.json, .nvmrc
.github/workflows/ci.yml
.github/workflows/release.yml
renovate.json, .gitattributes, .gitignore
README.md, CHANGELOG.md, LICENSE
docs/superpowers/        spec en plan
```

- **`package.json`:** `"name": "mvesign-brand-assets"`, `"private": true` (nooit per ongeluk op npm), `"license": "SEE LICENSE IN LICENSE"`, `"type": "module"`, `"files": ["dist"]`, en `exports` voor `./tokens.css`, `./tokens.json`, `./fonts.css`, `./fonts/*`, `./logo/*` en `./package.json`. Scripts: alleen `generate` en `test`. Geen `build`, `prepare`, `prepack`, `preinstall`, `install` of `postinstall`: met een van die scripts bouwt npm een Git-dependency bij elke installatie opnieuw. De enige devDependency is `@resvg/resvg-wasm`.
- **`.nvmrc`:** de actuele LTS-versie van Node, als major.
- **`.gitattributes`:** `* text=auto eol=lf`, en `*.woff2` en `*.png` binair. Het script schrijft LF; zo is de uitvoer op Windows en in de CI gelijk.
- **`.gitignore`:** `node_modules/`.
- **`README.md`:** kort. Wat er in het pakket zit, hoe je iets wijzigt, hoe je een versie maakt, de versieregels, en hoe de server en de website het gebruiken.
- **`LICENSE`:** de MIT-tekst, met bovenaan dat de naam mvesign, het woordmerk en de favicon (`src/logo/`, `dist/logo/`) er niet onder vallen (all rights reserved), en dat Open Sans onder de OFL valt (`dist/fonts/OFL.txt`). In het Engels, zoals de MIT-tekst.
- **`CHANGELOG.md`:** per versie een kop `## X.Y.Z` en één tot drie korte regels. Geen datum.
- **`renovate.json`:** zoals in de server-repo: `config:recommended`, `Europe/Amsterdam`, maandag voor 7:00, minor/patch/digest samen in één wekelijkse PR, een major pas na akkoord in het Dependency Dashboard. Daarbij `helpers:pinGitHubActionDigests`. Renovate houdt Node (`.nvmrc`), resvg en de actions bij.

## Genereren

`npm run generate` draait `scripts/generate.mjs`:

1. `src/tokens.json` lezen en controleren (zie *Bron*); bij een fout stoppen met een melding die zegt wat en waar.
2. `dist/` leegmaken.
3. `dist/tokens.css`, `dist/tokens.json` en `dist/fonts.css` schrijven, in de volgorde van de bron, met LF en zonder tijdstempel.
4. De lettertypen en `OFL.txt` kopiëren.
5. De SVG-sjablonen vullen en schrijven.
6. De PNG's maken met resvg (wasm), op een vaste breedte, met transparante achtergrond.

De wasm-versie van resvg geeft op Windows en Linux dezelfde bytes. Zo kan de CI de PNG's in Git vergelijken met een nieuwe build.

## Testen

`npm test` draait de testrunner van Node (`node --test`) op `test/`:

- **Contrast:** WCAG AA (4,5:1), in licht en in donker, voor:
  - `text`, `text_strong` en `muted` op `bg` en `surface`;
  - `link` op `bg`, `surface` en `soft`;
  - `on_bar` op `bar` en `on_button` op `button`;
  - `error` en `ok` op `surface`.
- **Uitvoer:**
  - `tokens.css` bevat elke kleur in alle vormen (vast licht en donker, met `-rgb`, en actief);
  - `dist/tokens.json` heeft dezelfde kleuren als de bron;
  - in de SVG's staat geen `{{` meer;
  - de PNG's hebben de juiste afmetingen (uit de PNG-header).

## CI

`.github/workflows/ci.yml`, bij elke push naar `main` en elke pull request:

1. Node volgens `.nvmrc`, `npm ci`.
2. `npm run generate`.
3. `git status --porcelain` moet leeg zijn. Zo niet, dan faalt de stap met: "dist/ klopt niet met de bron: draai npm run generate en commit dist/."
4. `npm test`.
5. De versie in `package.json` moet een kop in `CHANGELOG.md` hebben (`node scripts/release-notes.mjs v<versie>`), zodat een tag daar nooit op faalt.
6. `docker build .`, zonder push.

Actions staan vast op een commit-SHA, met de versie als comment.

## Publiceren

### Image

```dockerfile
FROM scratch
COPY dist/ /brand/
```

- De bestanden staan in `/brand`, niet in `/`: een `docker cp` van `/` geeft ook wat Docker in elke container zet (`.dockerenv`, `etc/`).
- Geen `CMD`: de container draait nooit. Wie de bestanden wil, maakt een container met een willekeurig commando (`docker create <ref> none`) en kopieert eruit.
- Platforms: `linux/amd64` en `linux/arm64`. Alleen `COPY`, dus geen emulatie.
- Labels: `org.opencontainers.image.source` (deze repo), `org.opencontainers.image.version`, `org.opencontainers.image.licenses` en `org.opencontainers.image.description`.
- Alleen de tag `X.Y.Z`; geen `latest`, `X` of `X.Y`. Afnemers zetten tag en digest toch vast.
- Geen provenance en geen SBOM: provenance bevat tijdstippen, en maakt de digest bij elke build anders.

### Workflow

`.github/workflows/release.yml`, bij een push van een tag `v[0-9]+.[0-9]+.[0-9]+`. Rechten: `contents: write`, `packages: write`.

1. Dezelfde stappen als de CI (`npm ci`, `generate`, `git status`, `npm test`).
2. De tag zonder `v` moet gelijk zijn aan `version` in `package.json`.
3. `CHANGELOG.md` moet een kop `## X.Y.Z` hebben.
4. `ghcr.io/mvesign/mvesign-brand-assets:X.Y.Z` mag nog niet bestaan (`docker buildx imagetools inspect` moet falen). Een versie wordt één keer gebouwd, zodat de digest vast blijft.
5. Inloggen bij GHCR met `GITHUB_TOKEN`, bouwen en pushen.
6. Een GitHub Release `vX.Y.Z` maken, met als tekst de regels onder `## X.Y.Z` in `CHANGELOG.md`. Renovate toont die tekst in zijn PR's.

### Versieregels (semver)

- **Major:** een afnemer moet iets aanpassen. Een bestand, token, custom property of JSON-sleutel is hernoemd of weg, of de indeling in het image (`/brand`) verandert.
- **Minor:** er komt iets bij (een token, bestand of PNG-maat), of het uiterlijk verandert bewust (een andere kleur, een ander logo).
- **Patch:** een correctie zonder bedoeld verschil in uiterlijk.
- **Alleen docs, tests of CI:** geen nieuwe versie.

De eerste versie is `1.0.0`.

### Een versie maken

1. Een PR met de wijziging, de nieuwe versie in `package.json` (`npm version minor --no-git-tag-version`, of `major`/`patch`), en een kop met een regel in `CHANGELOG.md`.
2. De PR mergen.
3. Op een bijgewerkte `main`: `git tag vX.Y.Z` en `git push origin vX.Y.Z`.

### Eenmalig in GitHub (door de eigenaar)

- Na de eerste release het pakket openbaar zetten: Package settings → *Change visibility*. Dat kan niet terug. Staat het niet toe, dan eerst in de organisatie openbare pakketten toestaan: Org settings → *Packages*.
- Een ruleset voor tags `v*`: niet verwijderen, niet verplaatsen.
- Controleren met `docker pull ghcr.io/mvesign/mvesign-brand-assets:1.0.0` zonder in te loggen.

## Gebruik door de home server

De wijzigingen in de server-repo komen in het issue daar. Dit is wat de server nodig heeft.

### Ophalen op de host

- **Eén verwijzing in Git**, met tag en digest: `ghcr.io/mvesign/mvesign-brand-assets:1.0.0@sha256:…`. Voorstel: één regel in `host/brand-assets.image`.
- **Een stap die uitpakt.** Wijkt `/srv/brand/.image` af van de verwijzing, dan:
  1. `docker pull <ref>`;
  2. `docker create <ref> none`;
  3. `docker cp <id>:/brand/. <tijdelijke map>`, dan `docker rm <id>`;
  4. de *inhoud* van `/srv/brand` vervangen door die van de tijdelijke map (niet de map zelf: koppelingen van de map tonen dan meteen de nieuwe bestanden);
  5. de verwijzing in `/srv/brand/.image` zetten.

  Met `--check` meldt de stap alleen een verschil. `/srv/brand` is voor iedereen leesbaar, en containers koppelen hem alleen-lezen.
- **Waar de stap komt** (`configure-host` of `deploy.sh`), beslist het issue in de server-repo. Advies: `deploy.sh`. Een nieuwe versie is een uitrol, geen hostwijziging, en met `--pull --check --deploy` zou een stap in `configure-host` elke nieuwe versie als afwijking melden en de uitrol tegenhouden.
- **Renovate** leest de verwijzing met een regex-regel:

  ```json
  {
    "customType": "regex",
    "description": "Huisstijl: het image dat de server uitpakt naar /srv/brand.",
    "managerFilePatterns": ["/(^|/)host/brand-assets\\.image$/"],
    "matchStrings": ["(?<depName>ghcr\\.io/mvesign/mvesign-brand-assets):(?<currentValue>\\d+\\.\\d+\\.\\d+)@(?<currentDigest>sha256:[a-f0-9]{64})"],
    "datasourceTemplate": "docker",
    "versioningTemplate": "docker"
  }
  ```

  Met `currentDigest` werkt Renovate tag en digest samen bij. Minor en patch komen in de wekelijkse PR, een major na akkoord in het Dependency Dashboard (staat al zo in de server-repo).
- **Docker:** geen eisen aan de versie; alleen `pull`, `create` en `cp`.

### Per app

| App | Koppeling (alleen-lezen) | Nodig | Na een nieuwe versie |
|---|---|---|---|
| Homepage | `/srv/brand` → `/app/public/brand` (te zien op `/brand/…`) | `custom.css`: `@import url("/brand/fonts.css")` en `@import url("/brand/tokens.css")`, met absolute paden (relatieve paden wijzen naar `/api/config/`). Een vast palet (`color:` in `settings.yaml`), met `--color-50` … `--color-900` overschreven door de `-rgb`-tokens, per `html.light` en `html.dark`. De balk met het woordmerk. `favicon: /brand/logo/favicon.svg`. Homepage volgt `prefers-color-scheme` niet: standaard donker, en `theme:` zet het vast. | Herstarten: nieuwe bestanden in `/app/public` ziet Homepage pas na een herstart |
| News | `/srv/brand` → `/brand` in `news`; `/srv/brand` → `/usr/share/nginx/html/brand` in `news-web` | De app leest `/brand/tokens.json` en geeft het als `brand` aan de templates. `page.html` laadt `/brand/fonts.css` en `/brand/tokens.css`; favicon `/brand/logo/favicon.svg`. `mail.html`: inline styles uit `brand.color.light`, lettertype `brand.font.stack`, zonder webfont. Kan de app `tokens.json` niet lezen, dan gaat de mail als tekstversie (zoals bij een fout in een template). | Niets: de app leest de bestanden elke ronde |
| Nextcloud | `/srv/brand` → `/brand` in `app` | `occ theming:config`: `name`, `primary_color` en `background_color` (de lichte `bar`, met `jq` uit `/srv/brand/tokens.json`), `background backgroundColor`, `logo /brand/logo/favicon.svg`, `logoheader /brand/logo/wordmark.svg`, `favicon /brand/logo/favicon.svg`, `disable-user-theming yes`. Nextcloud kopieert de bestanden naar appdata; SVG werkt, ook voor de favicon (Imagick met SVG zit in het officiële apache-image). | De `occ`-commando's opnieuw draaien |
| Paperless | Eén bestand: `/srv/brand/logo/favicon.svg` → `/usr/src/paperless/media/logo/mvesign-logo.svg` | `PAPERLESS_APP_TITLE` en `PAPERLESS_APP_LOGO=/logo/mvesign-logo.svg`. Eén bestand, niet de map: de sanity checker meldt elk ander bestand onder media als wees. Een titel of logo uit de webinterface gaat voor de variabelen. Een themakleur kan alleen per gebruiker. | Opnieuw aanmaken: een koppeling van één bestand toont anders het oude |
| Gatus | Geen | `ui.logo: https://homepage.home.mvesign.com/brand/logo/favicon.svg` (Gatus serveert zelf geen bestanden; de browser laadt het logo). Kleuren eventueel via `ui.custom-css`. | Niets |

Open voor het issue in de server-repo: waar de stap komt, de naam van het bestand met de verwijzing, of Homepage een vast thema krijgt, de teksten voor Nextcloud (naam, slogan) en Paperless (titel), en of Gatus eigen kleuren krijgt.

## Gebruik door de website

- `mvesign-web-www` neemt het pakket op als Git-dependency: `"mvesign-brand-assets": "github:mvesign/mvesign-brand-assets#v1.0.0"`. npm haalt de tag op en zet de commit vast in `package-lock.json`. Omdat het pakket geen build-script heeft, bouwt npm niets, en door `files` komt alleen `dist/` mee.
- Gebruik via `exports`, bijvoorbeeld `import "mvesign-brand-assets/fonts.css"` en `import "mvesign-brand-assets/tokens.css"`. De bundler vindt de woff2-bestanden via de relatieve paden in `fonts.css`.
- Renovate kent `github:`-dependencies met een semver-tag (datasource `github-tags`). Het werkt de tag en `package-lock.json` bij, zonder extra configuratie.
- De favicon en de PNG's kopieert de website naar zijn eigen publieke map; hoe, hangt af van de techniek, en die ligt nog open.

## Afgewezen

- **Image mounts (`type: image` in Compose):** komen na een reboot van de host leeg terug (met overlay2 al na een herstart van Docker); alleen de container opnieuw aanmaken helpt ([moby/moby#50999](https://github.com/moby/moby/issues/50999), nog open). Officieel alleen met de containerd image store. `docker compose pull` haalt ze niet op, en Renovate leest `source:` niet.
- **`COPY --from` bij het bouwen:** Homepage zou een eigen image nodig hebben, en Paperless en `news-web` toch een andere route.
- **Style Dictionary:** een grote dependency voor zo'n 16 kleuren; licht/donker en de RGB-kanalen vragen eigen configuratie, en de PNG's moeten toch apart.
- **Een Python-script:** de PNG's vragen een systeembibliotheek (cairo), en voor de website is er toch een `package.json`.
- **release-please:** een extra action van derden, en de CI draait niet vanzelf op PR's die met `GITHUB_TOKEN` gemaakt zijn.
- **De Release in de webinterface maken:** de tekst staat dan niet in Git.
- **`tokens.env` voor shellscripts:** scripts op de host lezen `/srv/brand/tokens.json` met `jq`.
- **Zwevende tags (`latest`, `1`, `1.2`):** afnemers zetten tag en digest vast; een zwevende tag voegt niets toe.
- **Cursief en een blauw woordmerk voor een lichte achtergrond:** nu nergens nodig; zo nodig later als minor.

## Bronnen

- Image mounts: https://docs.docker.com/engine/storage/image-mounts/, https://github.com/moby/moby/issues/50999, https://github.com/docker/compose/blob/v5.7.0/pkg/compose/pull.go
- Renovate: https://docs.renovatebot.com/modules/manager/regex/, https://github.com/renovatebot/renovate/blob/main/lib/modules/manager/npm/extract/common/dependency.ts
- npm Git-dependencies: https://docs.npmjs.com/cli/v11/configuring-npm/package-json#git-urls-as-dependencies
- GHCR: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry, https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility
- Provenance: https://docs.docker.com/build/ci/github-actions/attestations/
- Homepage v2.7.0: https://github.com/gethomepage/homepage/blob/v2.7.0/src/utils/contexts/theme.jsx, https://github.com/gethomepage/homepage/blob/v2.7.0/src/styles/theme.css, https://gethomepage.dev/configs/settings/
- Nextcloud 35: https://github.com/nextcloud/server/blob/v35.0.3/apps/theming/lib/Command/UpdateConfig.php, https://github.com/nextcloud/server/blob/v35.0.3/apps/theming/lib/ImageManager.php, https://github.com/nextcloud/docker/blob/master/35/apache/Dockerfile
- Paperless 3.4.2: https://github.com/paperless-ngx/paperless-ngx/blob/v3.4.2/docs/configuration.md, https://github.com/paperless-ngx/paperless-ngx/blob/v3.4.2/src/documents/sanity_checker.py
- Gatus v5.38.0: https://github.com/TwiN/gatus/blob/v5.38.0/README.md#ui
- Open Sans: https://www.npmjs.com/package/@fontsource-variable/open-sans, https://github.com/google/fonts/tree/main/ofl/opensans
