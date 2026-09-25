import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trengerNyeForslag } from '../js/logg.js';
import { rosForslag } from '../js/regler.js';

const naa = new Date('2026-10-30T12:00:00').getTime();
const okt = (dato) => ({ start: new Date(`${dato}T09:00:00`).toISOString() });
const klasse = (siste, okter) => ({ sisteBelonningskartlegging: siste, klassensValg: ['Quiz'], okter: okter.map(okt) });

test('påminnelse etter fire uker', () => {
  assert.equal(trengerNyeForslag(klasse('2026-10-02', ['2026-10-29']), naa), 'fire-uker');
  assert.equal(trengerNyeForslag(klasse('2026-10-20', ['2026-10-29']), naa), null);
});

test('påminnelse etter over to uker uten økter, også når pausen pågår', () => {
  assert.equal(trengerNyeForslag(klasse('2026-10-10', ['2026-10-11', '2026-10-28']), naa), 'pause');
  assert.equal(trengerNyeForslag(klasse('2026-10-10', ['2026-10-11']), naa), 'pause');
  assert.equal(trengerNyeForslag(klasse('2026-10-10', ['2026-10-11', '2026-10-20', '2026-10-29']), naa), null);
});

test('ingen påminnelse uten liste', () => {
  assert.equal(trengerNyeForslag({ ...klasse(null, []), klassensValg: [] }, naa), null);
});

test('ros bygges fra regelen', () => {
  assert.equal(rosForslag('Jeg sitter på plassen min.'), 'Nå sitter mange på plassen sin.');
  assert.equal(rosForslag('Jeg rekker opp hånden når jeg vil si noe.'), 'Nå rekker mange opp hånden når de vil si noe.');
  assert.equal(rosForslag('Jeg jobber stille. Jeg hvisker bare om oppgaven.'), 'Nå jobber mange stille.');
  assert.match(rosForslag('Chat og meldinger er lukket.'), /Chat og meldinger er lukket\./);
});
