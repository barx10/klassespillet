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

import { intervallFor, lengderMs, totalPoeng, tilLoggpost, bruddPerIntervall, fullforteIntervaller, totalPoengFor, totalMinutterFor } from '../js/okt.js';

const klasseMed = (extra) => {
  const k = nyKlasse();
  Object.assign(k.innstillinger, extra);
  return k;
};

test('variable intervaller: 1, 3 og 2 minutter', () => {
  const k = klasseMed({ intervaller: 3, lengder: [1, 3, 2], maalfelt: 3, stjernekrav: 3 });
  const okt = nyOkt(k, 0);
  assert.deepEqual(lengderMs(okt), [MIN, 3 * MIN, 2 * MIN]);
  assert.equal(varighetMs(okt), 6 * MIN);
  assert.equal(intervallFor(okt, 0), 0);
  assert.equal(intervallFor(okt, MIN - 1), 0);
  assert.equal(intervallFor(okt, MIN), 1); // grensen hører til det nye intervallet
  assert.equal(intervallFor(okt, 4 * MIN - 1), 1);
  assert.equal(intervallFor(okt, 4 * MIN), 2);
  assert.equal(intervallFor(okt, 6 * MIN), 3);
  assert.equal(intervallFor(okt, -5), -1);
  const S = okt.start;
  assert.equal(fullforteIntervaller(okt, S + 3 * MIN), 1);
  assert.equal(fullforteIntervaller(okt, S + 4 * MIN), 2);
  // brudd i det tredje intervallet havner der, ikke i det andre
  const med = registrerBrudd(okt, S + 4 * MIN + 10);
  assert.deepEqual(bruddPerIntervall(med), [0, 0, 1]);
  assert.equal(posisjon(med, S + 6 * MIN), 2);
});

test('bonusintervaller gir dobbelt poeng', () => {
  const inn = { intervaller: 4, lengder: null, bonus: [false, true, false, true] };
  assert.equal(totalPoengFor(inn), 6);
  assert.equal(totalMinutterFor(inn), 4);
  const k = klasseMed({ ...inn, maalfelt: 5, stjernekrav: 5 });
  let okt = nyOkt(k, 0);
  const S = okt.start;
  assert.equal(totalPoeng(okt), 6);
  assert.equal(posisjon(okt, S + 4 * MIN), 6);
  okt = registrerBrudd(okt, S + 1 * MIN + 5); // bruddet i bonusintervallet koster to poeng
  assert.equal(posisjon(okt, S + 4 * MIN), 4);
  const post = tilLoggpost(okt);
  assert.deepEqual(post.poeng, [1, 2, 1, 2]);
  assert.equal(post.lengderSekunder, undefined);
});

test('totalMinutterFor uten variable lengder er antall intervaller', () => {
  assert.equal(totalMinutterFor({ intervaller: 12, lengder: null, bonus: null }), 12);
  assert.equal(totalMinutterFor({ intervaller: 3, lengder: [2, 2, 3], bonus: null }), 7);
});
