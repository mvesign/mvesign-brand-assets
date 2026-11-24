"""Maakt de logo-sjablonen src/logo/favicon.svg en src/logo/wordmark.svg.

Draai dit alleen als de vorm van het logo verandert; scripts/generate.mjs gebruikt de
sjablonen bij elke build, en de CI draait dit script niet. Het zet de letters van IBM
Plex Sans (gewicht 700) om in paden, zodat een SVG geen lettertype nodig heeft. De kleuren
blijven verwijzingen ({{color.light.bar}}); die vult scripts/generate.mjs uit
src/tokens.json, net als {{corner}}, de straal van de hoeken van de favicon.

Nodig: Python 3 met fontTools en brotli (voor woff2). Vanuit de root van de repository:

    python -m pip install "fonttools>=4.50,<5" brotli
    python scripts/outline-text.py
"""

from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "src" / "fonts" / "ibm-plex-sans-latin-wght-normal.woff2"
LOGO = ROOT / "src" / "logo"
WEIGHT = 700


def number(value):
    """Twee decimalen, zonder nullen achteraan en zonder '-0'."""
    text = f"{value:.2f}".rstrip("0").rstrip(".")
    return "0" if text in ("-0", "") else text


def outline(font, text, size, tracking, dx=0.0, dy=0.0):
    """De letters van `text` als SVG-paden, `size` px groot, met `tracking` em tussen de
    letters. De eerste letter begint op x = dx, de basislijn ligt op y = dy, en y wijst
    omlaag. Geeft een lijst (letter, pad) en de omhullende (xmin, ymin, xmax, ymax)."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    units = font["head"].unitsPerEm
    scale = size / units
    x = 0.0
    paths, boxes = [], []
    for char in text:
        name = cmap[ord(char)]
        transform = (scale, 0, 0, -scale, dx + x * scale, dy)
        pen = SVGPathPen(glyphs, ntos=number)
        glyphs[name].draw(TransformPen(pen, transform))
        bounds = BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(bounds, transform))
        paths.append((char, pen.getCommands()))
        boxes.append(bounds.bounds)
        x += font["hmtx"][name][0] + tracking * units
    box = (
        min(b[0] for b in boxes),
        min(b[1] for b in boxes),
        max(b[2] for b in boxes),
        max(b[3] for b in boxes),
    )
    return paths, box


def favicon(font):
    """64 x 64. "mv" is 31 px groot met -1 px tussen de letters, en staat in het midden
    van het vlak (x 32, y 32)."""
    size, tracking = 31, -1 / 31
    _, (xmin, ymin, xmax, ymax) = outline(font, "mv", size, tracking)
    paths, _ = outline(font, "mv", size, tracking, 32 - (xmin + xmax) / 2, 32 - (ymin + ymax) / 2)
    return "\n".join([
        "<!-- Favicon van mvesign: een vlak in de kleur van de balk, met afgeronde hoeken, en mv",
        "     in goud. Gemaakt met scripts/outline-text.py. scripts/generate.mjs vult de kleuren",
        "     uit src/tokens.json, en {{corner}} met de straal van de hoeken. -->",
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">',
        '  <clipPath id="mv-favicon-shape"><rect width="64" height="64" rx="{{corner}}"/></clipPath>',
        '  <g clip-path="url(#mv-favicon-shape)">',
        '    <rect width="64" height="64" fill="{{color.light.bar}}"/>',
        "  </g>",
        '  <g fill="{{color.light.accent}}">',
        *[f'    <path d="{d}"/>' for _, d in paths],
        "  </g>",
        "</svg>",
        "",
    ])


def wordmark(font):
    """mvesign, 100 px groot, met -0,01 em tussen de letters. De viewBox sluit precies om
    de letters. De m en de v staan in een eigen groep (class mv)."""
    size, tracking = 100, -0.01
    _, (xmin, ymin, xmax, ymax) = outline(font, "mvesign", size, tracking)
    paths, _ = outline(font, "mvesign", size, tracking, -xmin, -ymin)
    width, height = number(xmax - xmin), number(ymax - ymin)
    return "\n".join([
        "<!-- Woordmerk van mvesign: licht, voor op de donkere balk. De m en de v staan in een",
        "     groep met class mv, zodat een pagina die de SVG in de HTML zet ze bij aanwijzen",
        "     goud kan maken. Gemaakt met scripts/outline-text.py. scripts/generate.mjs vult",
        "     de kleuren uit src/tokens.json. -->",
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">',
        '  <g class="mv" fill="{{color.light.on_bar}}">',
        *[f'    <path d="{d}"/>' for _, d in paths[:2]],
        "  </g>",
        '  <g fill="{{color.light.on_bar}}">',
        *[f'    <path d="{d}"/>' for _, d in paths[2:]],
        "  </g>",
        "</svg>",
        "",
    ])


def main():
    font = instantiateVariableFont(TTFont(FONT), {"wght": WEIGHT})
    LOGO.mkdir(parents=True, exist_ok=True)
    for name, build in (("favicon.svg", favicon), ("wordmark.svg", wordmark)):
        target = LOGO / name
        target.write_text(build(font), encoding="utf-8", newline="\n")
        print(f"geschreven: {target.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
