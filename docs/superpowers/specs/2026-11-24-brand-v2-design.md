# mvesign-brand-assets 2.0: rustiger palet, IBM Plex en een nieuw logo

Datum: 24 november 2026. Status: ontwerp, akkoord per deel in de brainstorm; de spec wacht op akkoord.

Dit werkt [het ontwerp van 21 november](2026-11-21-brand-assets-design.md) bij. Wat hier niet staat, blijft zoals daar: de bron in `src/tokens.json`, het genereren, de CI, het image, de release en de versieregels.

## Doel

De huisstijl komt nu onrustig en weinig zakelijk over, vooral in het donkere thema: een fel blauwe balk met een rand van 8 px, een verzadigd cyaan voor links, grijzen met een groene zweem, en koppen in Open Sans 800. Versie 2.0 maakt hem rustig, in de lijn van een editor in het donkere thema, zonder dat de afnemers iets hoeven aan te passen, behalve de website voor één token dat vervalt.

## Vaste keuzes (uit de brainstorm van 24 november)

- **Richting "rustig blauw":** koel leigrijs, blauw alleen voor links, knoppen en aanwijzen. Goud blijft de kleur van de "mv" en van markeringen, nooit van tekst.
- **De balk is donker in beide thema's,** met een rand van 1 px. Zo blijft gelden: lichte letters op een donkere balk. Homepage, News en Nextcloud werken zonder aanpassing door.
- **IBM Plex Sans** voor tekst en **IBM Plex Mono** voor code, als bestanden in de repo.
- **Het woordmerk en de "mv"** in Plex Sans 700.
- **De favicon** is een vlak in de kleur van de balk, met een gouden "mv" en zonder strook.
- **Versie 2.0.0.**

## Kleuren

Dezelfde zestien tokens; alleen de waarden veranderen. Een * betekent: gelijk aan 1.0.

| Token | Licht | Donker | Waarvoor |
|---|---|---|---|
| `bg` | `#F6F7F9` | `#0F141A` | De pagina |
| `surface` | `#FFFFFF`* | `#151C24` | Kaarten, tegels en vakken |
| `text` | `#4A5561` | `#BCC6D0` | Lopende tekst |
| `text_strong` | `#1E2630` | `#E8EDF2` | Koppen |
| `muted` | `#5F6B79` | `#8794A2` | Bron, tijd en uitleg |
| `line` | `#DCE1E7` | `#222C37` | Randen en scheidingen |
| `soft` | `#EDF1F5` | `#1A2430` | Tags, actief menu-item, pictogramvlakken |
| `link` | `#1F649E` | `#7DB4E0` | Links |
| `bar` | `#1E2630` | `#131A22` | De balk, en het vlak van de favicon |
| `bar_edge` | `#141B23` | `#243040` | De lijn onder de balk |
| `on_bar` | `#F1F4F7` | `#E8EDF2` | Woordmerk en tekst op de balk |
| `button` | `#1F649E` | `#2B6AA3` | Knoppen |
| `on_button` | `#FFFFFF`* | `#FFFFFF`* | Tekst op knoppen |
| `accent` | `#EEBB66`* | `#EEBB66`* | Goud: de "mv", focus en markeringen; nooit als tekst |
| `error` | `#A64452`* | `#E0909C` | Fout |
| `ok` | `#2A8452`* | `#5CC48A`* | Werkt |

- `bar_edge_width` wordt `1px` (was `8px`).
- Alle grijzen komen uit één koele familie; de groene zweem van 1.0 is weg.
- Contrast (WCAG AA, de paren uit `test/contrast.test.mjs`): alle 26 halen 4,5:1. Het laagste in licht is `ok` op `surface` (4,65), in donker `muted` op `surface` (5,55). `on_bar` op `bar` is 13,8 (licht) en 14,9 (donker).

## Letters

### Tokens

```json
"font": {
  "family": "IBM Plex Sans",
  "fallback": "system-ui, 'Segoe UI', Arial, sans-serif",
  "mono": "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  "weight": { "regular": 400, "semibold": 600, "bold": 700 },
  "size": { "heading": "22px", "body": "16px", "small": "13px", "code": "14px" }
}
```

- **`extrabold` vervalt.** Plex Sans gaat tot 700; een token van 800 zou een gewicht beloven dat het lettertype niet heeft, en op 700 zou de naam liegen. Daarmee verdwijnen ook `--mv-font-weight-extrabold` en `font.weight.extrabold` in `dist/tokens.json`.
- De groottes blijven gelijk.

### Bestanden

| Bestand in `src/fonts/` en `dist/fonts/` | Inhoud | Grootte |
|---|---|---|
| `ibm-plex-sans-latin-wght-normal.woff2` | Plex Sans, variabel (100–700), latin | 46 KB |
| `ibm-plex-sans-latin-ext-wght-normal.woff2` | Plex Sans, variabel (100–700), latin-ext | 31 KB |
| `ibm-plex-mono-latin-400-normal.woff2` | Plex Mono 400, latin | 15 KB |
| `ibm-plex-mono-latin-ext-400-normal.woff2` | Plex Mono 400, latin-ext | 13 KB |
| `ibm-plex-sans-OFL.txt` | De licentie van Plex Sans | |
| `ibm-plex-mono-OFL.txt` | De licentie van Plex Mono | |

- Bronnen: `@fontsource-variable/ibm-plex-sans` 5.3.0 (`files/*-wght-normal.woff2`) en `@fontsource/ibm-plex-mono` 5.3.0 (`files/*-400-normal.woff2`). De licenties zijn de `LICENSE` uit elk pakket. Beide zijn de OFL 1.1, maar met een eigen copyrightregel, dus ze gaan apart mee.
- De bestanden van Open Sans en `OFL.txt` verdwijnen.
- Alleen rechtop. Plex Mono alleen in 400: Shiki gebruikt geen vet of cursief voor code.

### `src/fonts/fonts.json`

Eén blok per familie, in plaats van één familie voor het hele bestand:

```json
{
  "families": [
    {
      "family": "IBM Plex Sans",
      "source": "@fontsource-variable/ibm-plex-sans 5.3.0: files/*-wght-normal.woff2, en LICENSE als ibm-plex-sans-OFL.txt",
      "weight": "100 700",
      "license": "ibm-plex-sans-OFL.txt",
      "files": [{ "file": "ibm-plex-sans-latin-ext-wght-normal.woff2", "unicode_range": "U+0100-02BA,…" }]
    }
  ]
}
```

(Ingekort: Plex Mono heeft een eigen blok met `"weight": "400"`, en elk blok heeft beide bestanden.)

- `fonts.css` krijgt een `@font-face` per bestand, met de `font-family` en het gewicht van zijn blok. Verder zoals in 1.0: `font-style: normal`, `font-display: swap`, de `unicode-range` van Fontsource en een relatief pad.
- Het script kopieert de bestanden en de licentie van elk blok.
- `buildFontsCss` krijgt alleen nog het manifest. De naam van de familie staat in het blok, niet meer in `tokens.font.family`.

## Logo's

- **`scripts/outline-text.py`** leest `ibm-plex-sans-latin-wght-normal.woff2` op gewicht 700, en schrijft de sjablonen opnieuw. De rest werkt zoals in 1.0: de letters worden paden, en de kleuren blijven verwijzingen.
- **Woordmerk:** "mvesign" in `on_bar` (licht), letterafstand −0,01 em, de "m" en "v" in `<g class="mv">`. De kleur blijft licht, want de balk is in beide thema's donker. Een pagina die de SVG in de HTML zet, kan hem nog steeds met CSS kleuren.
- **Favicon** (64 × 64): een vlak in `bar` (licht, `#1E2630`) met afgeronde hoeken (straal 12), en "mv" in `accent`, in het midden. Geen strook meer, en dus geen verwijzing naar `bar_edge`.
- **PNG's:** zoals in 1.0, uit het favicon-sjabloon: `icon-192.png`, `icon-512.png` en `apple-touch-icon.png` (180, zonder afgeronde hoeken).

## Pakket en versie

**2.0.0**, een major: volgens de versieregels is een verdwenen bestand of token een major.

- Weg: `fonts/open-sans-latin-wght-normal.woff2`, `fonts/open-sans-latin-ext-wght-normal.woff2`, `fonts/OFL.txt`, en het token `font.weight.extrabold` (ook `--mv-font-weight-extrabold`).
- Erbij: de zes bestanden uit *Bestanden*.
- Gelijk gebleven: alle andere bestandsnamen, alle `exports` in `package.json`, alle namen van kleuren en maten, en de indeling in het image (`/brand`).
- `CHANGELOG.md`:

  ```
  ## 2.0.0

  - Rustiger palet: koel leigrijs, een donkere balk in beide thema's met een lijn van 1 px, en blauw alleen voor links en knoppen.
  - IBM Plex Sans en IBM Plex Mono in plaats van Open Sans; het token `font.weight.extrabold` vervalt.
  - Woordmerk en favicon in Plex Sans 700; de favicon is een leigrijs vlak met een gouden "mv".
  ```

## Genereren en testen

- **`scripts/lib/tokens.mjs`:** het script controleert ook dat elke familie uit `fonts.json` voorkomt in `font.family` of vooraan in `font.mono`. Zo kan een lettertype niet stil uit de stack vallen.
- **Nieuwe tests:**
  - elk gewicht in `font.weight` valt binnen het bereik van de familie in `font.family`, volgens `fonts.json` (vangt een nieuw `extrabold` van 800);
  - elke familie uit `fonts.json` staat in `font.family` of vooraan in `font.mono`;
  - de favicon gebruikt `bar` en `accent`, en geen `bar_edge`.
- **Aangepaste tests:**
  - `fonts.test.mjs` voor `buildFontsCss` per familie, en voor de bestanden en licenties uit `fonts.json`;
  - `dist.test.mjs` voor de nieuwe lijst in `dist/fonts/`;
  - de voorbeelden in `tokens.test.mjs` voor de nieuwe font-sleutels.
- **Ongewijzigd:** de contrasttest, de maten van de PNG's en de controle op `{{` in de SVG's.

## Documentatie

- **`README.md`:** de rijen voor de lettertypen en de favicon, en het bijwerken van de lettertypen voor twee pakketten.
- **`LICENSE`:** IBM Plex Sans en IBM Plex Mono vallen onder de OFL, met verwijzing naar de twee licentiebestanden, in plaats van Open Sans.
- **De spec van 21 november:** bovenaan één regel die naar deze spec verwijst. De rest blijft staan als geschiedenis.

## Afnemers

### mvesign-web-www

Een eigen PR, na de release van 2.0.0:

- `"mvesign-brand-assets": "github:mvesign/mvesign-brand-assets#v2.0.0"`;
- de h1 van `--mv-font-weight-extrabold` naar `--mv-font-weight-bold`;
- codeblokken krijgen de achtergrond `--mv-surface` in plaats van die van het GitHub-thema van Shiki, zodat ze bij het palet passen. De kleuren van de code zelf blijven van Shiki.

De deelafbeelding (`og-default.png`) en het woordmerk in de balk werken zonder aanpassing: de balk blijft donker en het woordmerk licht.

### De home server

Geen wijziging nodig om te blijven werken. Renovate opent de major pas na akkoord in het Dependency Dashboard; de eigenaar keurt hem goed. Wat er verandert:

- Homepage, News en Nextcloud krijgen de nieuwe kleuren, lettertypen en logo's. Lichte letters op een donkere balk blijven.
- Nextcloud krijgt `#1E2630` als hoofdkleur in plaats van `#0376A2`.
- De mail van News gebruikt geen webfont. Daar wordt de stack `system-ui, 'Segoe UI', Arial, sans-serif` in plaats van Arial.
- Teksten in de server-repo die "de blauwe balk" of "Open Sans" noemen, kloppen niet meer: de README's van Homepage en News, en een opmerking in `custom.css`. Die werkt de eigenaar bij in de Renovate-PR of later; dat valt buiten deze ronde.

## Volgorde

1. In deze repo: de branch `feat/brand-v2` met deze spec, de wijziging en de tests, versie `2.0.0` en de kop in `CHANGELOG.md`. De eigenaar opent en merget de PR.
2. De tag `v2.0.0` op een bijgewerkte `main` (zie *Een versie maken* in de README). De workflow bouwt het image en maakt de release.
3. De PR voor mvesign-web-www.
4. De home server via Renovate.

## Afgewezen

- **Een witte balk in het lichte thema:** Homepage en News zetten `wordmark.svg` op de balk, en Nextcloud gebruikt de lichte `bar` als hoofdkleur. Met wit vallen de letters weg en worden de knoppen van Nextcloud wit. Een tweede woordmerk met donkere letters zou drie diensten laten aanpassen.
- **Een blauw vlak voor de favicon:** blauw is in 2.0 alleen nog voor links en knoppen; als vlak voelt het zwaarder dan de rest.
- **`extrabold` houden met de waarde 700:** de naam zou liegen. De major komt er toch al door de verdwenen bestanden.
- **Inter met JetBrains Mono, Geist met Geist Mono, of Open Sans met lichtere koppen:** Inter is overal, Geist is sterk verbonden met Vercel, en Open Sans laat code per apparaat anders ogen. Plex is één familie voor tekst en code.
- **Eén `OFL.txt` voor beide lettertypen:** elk pakket heeft zijn eigen copyrightregel, en die moet mee.
- **De bestanden van Open Sans laten staan om een minor te maken:** dat is dood gewicht in elk image en pakket.

## Bronnen

- IBM Plex Sans: https://www.npmjs.com/package/@fontsource-variable/ibm-plex-sans, https://github.com/IBM/plex
- IBM Plex Mono: https://www.npmjs.com/package/@fontsource/ibm-plex-mono
- WCAG 2 contrast: https://www.w3.org/TR/WCAG21/#contrast-minimum
