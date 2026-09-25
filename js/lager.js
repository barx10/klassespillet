// Lagring i localStorage med versjonert datamodell. Ingen personopplysninger:
// bare klassenavn, regelsett, innstillinger, klassens valg og øktlogg.

import { fraBibliotek } from './regler.js';

const NOKKEL = 'klassespillet';
const VERSJON = 2;

export function nyKlasse() {
  return {
    id: crypto.randomUUID(),
    navn: '',
    regelsett: [fraBibliotek('tavle')],
    sisteRegelsettId: null,
    variant: 'rolig',
    innstillinger: {
      intervaller: 10,
      intervallSekunder: 60,
      maalfelt: 7,
      bruddgrense: 10,
      antallLag: 2,
      stjernekrav: 8,
      visTidtaker: true,
      animasjon: true,
      rospaaminnelse: false,
    },
    klassensValg: [],
    sisteBelonningskartlegging: null,
    okter: [],
  };
}

function tomTilstand() {
  return { versjon: VERSJON, klasser: [], pagaende: null };
}

// Versjon 1 hadde tre faste regler og «belønninger». Reglene blir et eget regelsett.
export function migrer(data) {
  if (data?.versjon === 1) {
    for (const k of data.klasser) {
      k.regelsett = [{
        id: crypto.randomUUID(), mal: null, navn: 'Våre regler',
        regler: k.regler.map((tekst) => ({ tekst, brudd: '' })),
      }];
      k.sisteRegelsettId = null;
      delete k.regler;
      k.klassensValg = k.belonninger ?? [];
      delete k.belonninger;
      for (const o of k.okter) {
        o.klassensValg = o.belonning ?? null;
        delete o.belonning;
        o.regelsettId ??= null;
        o.regelsettNavn ??= null;
      }
    }
    data.versjon = 2;
  }
  return data;
}

export function les() {
  try {
    const data = migrer(JSON.parse(localStorage.getItem(NOKKEL)));
    if (!data || data.versjon !== VERSJON) return tomTilstand();
    return { ...tomTilstand(), ...data };
  } catch {
    return tomTilstand();
  }
}

export function skriv(tilstand) {
  localStorage.setItem(NOKKEL, JSON.stringify(tilstand));
}
