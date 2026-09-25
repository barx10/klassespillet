import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bruddTotalt, minutterMedBrudd, kartleggingsoppsummering, tilCsv } from '../js/logg.js';
import { nyOkt, registrerBrudd, tilLoggpost } from '../js/okt.js';

const post = (type, start, brudd) => ({
  id: start, type, variant: type === 'spill' ? 'rolig' : null, start,
  varighetSekunder: 600,
  intervaller: brudd.map((n) => ({ brudd: [n] })),
  maalNaadd: type === 'spill' ? true : null,
  sjekklisteFullfort: type === 'spill' ? false : null,
  regelsettNavn: 'Tavleundervisning',
  klassensValg: null,
});

test('teller brudd og minutter med brudd', () => {
  const p = post('spill', '2026-09-01T08:00:00.000Z', [0, 3, 0, 1, 0, 0, 0, 0, 0, 0]);
  assert.equal(bruddTotalt(p), 4);
  assert.equal(minutterMedBrudd(p), 2);
});

test('kartleggingsoppsummering krever minst tre kartlegginger og bruker de fem siste', () => {
  const k = (dag, n) => post('kartlegging', `2026-09-0${dag}T08:00:00.000Z`, [n, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(kartleggingsoppsummering([k(1, 4), k(2, 6), post('spill', '2026-09-03T08:00:00.000Z', [9])]), null);
  const alle = [k(7, 20), k(1, 100), k(2, 4), k(3, 6), k(4, 5), k(5, 5)];
  assert.deepEqual(kartleggingsoppsummering(alle), { antall: 5, snitt: 8, lavest: 4, hoyest: 20 });
});

test('kartlegging får type og ingen målvurdering i loggen', () => {
  const klasse = { id: 'k', innstillinger: { intervaller: 10, intervallSekunder: 60, maalfelt: 7 } };
  let okt = nyOkt(klasse, 0, { type: 'kartlegging' });
  assert.equal(okt.start, 0); // ingen nedtelling
  okt = registrerBrudd(okt, 1000);
  const p = tilLoggpost(okt);
  assert.equal(p.type, 'kartlegging');
  assert.equal(p.maalNaadd, null);
  assert.equal(p.sjekklisteFullfort, null);
  const spill = tilLoggpost(nyOkt(klasse, 0, { sjekkliste: true }));
  assert.equal(spill.sjekklisteFullfort, true);
});

test('CSV bruker semikolon, BOM og siterer felt med spesialtegn', () => {
  const p = { ...post('spill', '2026-09-01T08:00:00.000Z', [0, 2, 0, 0, 0, 0, 0, 0, 0, 0]), klassensValg: 'Quiz; "lag mot lag"' };
  const csv = tilCsv({ navn: '6B', okter: [p] });
  assert.ok(csv.startsWith('﻿klasse;dato;'));
  const [hode, rad] = csv.slice(1).trim().split('\r\n');
  assert.equal(hode.split(';').length, 21);
  assert.match(rad, /^6B;2026-09-01;\d\d:00;spill;rolig;Tavleundervisning;2;1;ja;nei;"Quiz; ""lag mot lag""";0;2;0/);
});
