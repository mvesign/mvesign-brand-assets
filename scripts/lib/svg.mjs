// Sjablonen vullen: {{pad.naar.waarde}} wordt een waarde uit dist/tokens.json (via flatten),
// of een eigen waarde zoals {{corner}}. Comments gaan eruit: die zijn voor de bron.

export function flatten(value, prefix = '') {
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item !== null && typeof item === 'object') Object.assign(out, flatten(item, path));
    else out[path] = String(item);
  }
  return out;
}

export function fillTemplate(template, values, name) {
  return template
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
      if (!Object.hasOwn(values, key)) throw new Error(`${name}: onbekende verwijzing {{${key}}}`);
      return values[key];
    });
}
