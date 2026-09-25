import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const rot = new URL('../', import.meta.url);
const sw = readFileSync(new URL('sw.js', rot), 'utf8');
const filer = [...sw.matchAll(/^\s+'([^']+)',$/gm)].map((m) => m[1]);

test('service workeren lagrer alle filene appen trenger', () => {
  for (const f of filer) assert.ok(f === './' || existsSync(new URL(f, rot)), `${f} finnes ikke`);
  for (const mappe of ['js', 'fonts', 'ikoner', 'css']) {
    // Lisensfilene til skriftene trengs ikke frakoblet.
    for (const f of readdirSync(new URL(`${mappe}/`, rot)).filter((f) => !f.endsWith('.txt'))) {
      assert.ok(filer.includes(`${mappe}/${f}`), `${mappe}/${f} mangler i sw.js`);
    }
  }
});
