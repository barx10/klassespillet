import test from 'node:test';
import assert from 'node:assert/strict';
import { nyKlasse } from '../js/lager.js';
import { nyOkt, registrerBrudd, posisjon, erFerdig, varighetMs, minuttTekst, MIN_MINUTTER, MAKS_MINUTTER } from '../js/okt.js';
import { punkt, PUNKTER } from '../js/landskap.js';

const MIN = 60000;

test('ti felt gir de håndtegnede punktene', () => {
  PUNKTER.forEach((p, i) => assert.deepEqual(punkt(i, 10), p));
  assert.deepEqual(punkt(3), PUNKTER[3]);
});

test('alle spilletider har start og mål på samme sted, med ett felt per minutt', () => {
  for (let n = MIN_MINUTTER; n <= MAKS_MINUTTER; n++) {
    const [sx, sy] = punkt(0, n);
    const [mx, my] = punkt(n, n);
    assert.ok(Math.abs(sx - PUNKTER[0][0]) < 1e-9 && Math.abs(sy - PUNKTER[0][1]) < 1e-9);
    assert.ok(Math.abs(mx - PUNKTER[10][0]) < 1e-9 && Math.abs(my - PUNKTER[10][1]) < 1e-9);
    for (let j = 1; j <= n; j++) {
      const [ax, ay] = punkt(j - 1, n);
      const [bx, by] = punkt(j, n);
      assert.ok(Math.hypot(ax - bx, ay - by) > 30, `felt ${j} av ${n} ligger for tett`);
    }
  }
});

test('økt med 20 minutter varer 20 minutter og brikken går 20 felt', () => {
  const k = nyKlasse();
  k.innstillinger.intervaller = 20;
  k.innstillinger.maalfelt = 15;
  let okt = nyOkt(k, 0);
  const S = okt.start;
  assert.equal(varighetMs(okt), 20 * MIN);
  assert.ok(!erFerdig(okt, S + 19 * MIN));
  assert.ok(erFerdig(okt, S + 20 * MIN));
  assert.equal(posisjon(okt, S + 20 * MIN), 20);
  okt = registrerBrudd(okt, S + 12 * MIN + 5);
  assert.equal(posisjon(okt, S + 20 * MIN), 19);
});

test('minuttTekst', () => {
  assert.equal(minuttTekst(5), 'fem minutter');
  assert.equal(minuttTekst(10), 'ti minutter');
  assert.equal(minuttTekst(15), '15 minutter');
});
