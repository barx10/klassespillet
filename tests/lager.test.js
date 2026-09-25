import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrer, nyKlasse } from '../js/lager.js';
import { nyOkt, tilLoggpost } from '../js/okt.js';

test('versjon 1 flyttes til versjon 2 uten å miste regler, belønninger eller logg', () => {
  const v1 = {
    versjon: 1,
    pagaende: null,
    klasser: [{
      id: 'k', navn: '6B', regler: ['A', 'B', 'C'], belonninger: ['Quiz'],
      innstillinger: { intervaller: 10, intervallSekunder: 60, maalfelt: 7 },
      okter: [{ id: 'o', type: 'spill', belonning: 'Quiz', intervaller: [] }],
    }],
  };
  const v2 = migrer(v1);
  const k = v2.klasser[0];
  assert.equal(v2.versjon, 2);
  assert.deepEqual(k.regelsett[0].regler.map((r) => r.tekst), ['A', 'B', 'C']);
  assert.equal(k.regler, undefined);
  assert.deepEqual(k.klassensValg, ['Quiz']);
  assert.equal(k.okter[0].klassensValg, 'Quiz');
  assert.equal(k.okter[0].belonning, undefined);
  assert.equal(migrer(null), null);
});

test('økta husker regelsettet, og loggen får navn og id', () => {
  const klasse = nyKlasse();
  const rs = klasse.regelsett[0];
  const okt = nyOkt(klasse, 0, { sjekkliste: true, regelsett: rs });
  assert.equal(okt.regelsett.regler.length, 3);
  assert.equal(typeof okt.regelsett.regler[0], 'string');
  const p = tilLoggpost(okt, 'Quiz');
  assert.equal(p.regelsettId, rs.id);
  assert.equal(p.regelsettNavn, 'Tavleundervisning');
  assert.equal(p.klassensValg, 'Quiz');
});
