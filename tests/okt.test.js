import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  nyOkt, spilltid, registrerBrudd, pause, fortsett, posisjon,
  bruddPerIntervall, erFerdig, fullforteIntervaller, tilLoggpost, NEDTELLING_MS,
} from '../js/okt.js';

const klasse = {
  id: 'k1',
  innstillinger: { intervaller: 10, intervallSekunder: 60, maalfelt: 7 },
};
const T0 = 1_000_000;
const S = T0 + NEDTELLING_MS; // spillstart
const MIN = 60_000;

test('spilltid er negativ under nedtellingen', () => {
  const okt = nyOkt(klasse, T0);
  assert.equal(spilltid(okt, T0), -NEDTELLING_MS);
  assert.equal(spilltid(okt, S), 0);
});

test('tiden bygger på klokketid, ikke på hvor ofte den leses', () => {
  const okt = nyOkt(klasse, T0);
  // Ti minutter i bakgrunnen uten én eneste lesing.
  assert.equal(spilltid(okt, S + 10 * MIN), 10 * MIN);
  assert.ok(erFerdig(okt, S + 10 * MIN));
  assert.equal(posisjon(okt, S + 10 * MIN), 10);
});

test('brikken står stille i et minutt med brudd i siste sekund', () => {
  let okt = nyOkt(klasse, T0);
  okt = registrerBrudd(okt, S + MIN - 1);
  assert.equal(posisjon(okt, S + MIN), 0);
  assert.equal(posisjon(okt, S + 2 * MIN), 1);
});

test('brudd nøyaktig i overgangen hører til det nye minuttet', () => {
  let okt = nyOkt(klasse, T0);
  okt = registrerBrudd(okt, S + MIN);
  assert.deepEqual(bruddPerIntervall(okt).slice(0, 2), [0, 1]);
  assert.equal(posisjon(okt, S + 2 * MIN), 1);
});

test('brudd under nedtelling, pause eller etter slutt ignoreres', () => {
  let okt = nyOkt(klasse, T0);
  okt = registrerBrudd(okt, T0 + 100);
  okt = registrerBrudd(okt, S + 10 * MIN);
  okt = pause(okt, S + 5000);
  okt = registrerBrudd(okt, S + 6000);
  assert.equal(okt.brudd.length, 0);
});

test('pause fryser tiden, også etter en oppdatering av siden', () => {
  let okt = nyOkt(klasse, T0);
  okt = pause(okt, S + 30_000);
  const lagret = JSON.parse(JSON.stringify(okt));
  assert.equal(spilltid(lagret, S + 5 * MIN), 30_000);
  const videre = fortsett(lagret, S + 5 * MIN);
  assert.equal(spilltid(videre, S + 5 * MIN + 30_000), MIN);
  assert.equal(fullforteIntervaller(videre, S + 5 * MIN + 30_000), 1);
});

test('loggposten sier om målet ble nådd', () => {
  let okt = nyOkt(klasse, T0);
  for (const m of [0, 1, 2]) okt = registrerBrudd(okt, S + m * MIN + 10);
  const post = tilLoggpost(okt, 'Quiz');
  assert.equal(post.maalNaadd, true); // 7 av 10 felt
  okt = registrerBrudd(okt, S + 3 * MIN + 10);
  assert.equal(tilLoggpost(okt).maalNaadd, false);
  assert.equal(post.intervaller.length, 10);
});

test('bruddbrett: klassen vinner bare under grensen', () => {
  const k = { id: 'k', variant: 'brudd', innstillinger: { ...klasse.innstillinger, bruddgrense: 3 } };
  let okt = nyOkt(k, T0);
  okt = registrerBrudd(okt, S + 1000);
  okt = registrerBrudd(okt, S + 2000);
  assert.equal(tilLoggpost(okt).maalNaadd, true);
  okt = registrerBrudd(okt, S + 3000);
  assert.equal(tilLoggpost(okt).maalNaadd, false);
});

test('lagspill: stjerner telles per lag, og ett lag med nok stjerner holder', () => {
  const k = { id: 'k', variant: 'lag', innstillinger: { ...klasse.innstillinger, antallLag: 2, stjernekrav: 8 } };
  let okt = nyOkt(k, T0);
  for (const m of [0, 1, 2]) okt = registrerBrudd(okt, S + m * MIN + 5000, 1); // lag 2 mister tre minutter
  okt = registrerBrudd(okt, S + 4 * MIN, 0); // lag 1 mister ett
  okt = registrerBrudd(okt, S + 5 * MIN, 2); // lag 3 finnes ikke
  assert.equal(okt.brudd.length, 4);
  assert.equal(posisjon(okt, Infinity, 0), 9);
  assert.equal(posisjon(okt, Infinity, 1), 7);
  const p = tilLoggpost(okt);
  assert.equal(p.maalNaadd, true);
  assert.deepEqual(p.intervaller.slice(0, 5).map((i) => i.brudd), [[0, 1], [0, 1], [0, 1], [0, 0], [1, 0]]);
});

test('økter lagret med bare tid per brudd kan fortsatt leses', () => {
  const okt = { ...nyOkt(klasse, T0), brudd: [5000, MIN + 1] };
  assert.deepEqual(bruddPerIntervall(okt).slice(0, 2), [1, 1]);
});
