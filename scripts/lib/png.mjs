// SVG naar PNG met resvg. De wasm-versie geeft op Windows en Linux dezelfde bytes, zodat
// de CI de PNG's in Git kan vergelijken met een nieuwe build.
import { readFile } from 'node:fs/promises';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

let ready;

export async function renderPng(svg, width) {
  ready ??= readFile(new URL(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))).then((wasm) => initWasm(wasm));
  await ready;
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/** Breedte en hoogte uit de IHDR-chunk, die altijd direct na de handtekening komt. */
export function pngSize(png) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}
