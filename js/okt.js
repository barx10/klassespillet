// Ren øktlogikk. Alt utledes av klokketid, så ingenting driver når fanen
// ligger i bakgrunnen, og en oppdatering av siden gjenoppretter økten.

export const NEDTELLING_MS = 3000;

// type er 'spill' eller 'kartlegging'. sjekkliste er true/false for spill
// (alt avkrysset eller ikke) og null for kartlegging. Regelsettet kopieres inn,
// så brettet viser de samme reglene selv om oppsettet endres under økten.
// variant er 'rolig' (brikken går per rolige minutt), 'brudd' (hvert brudd teller mot
// en grense) eller 'lag' (en stjerne per rolige minutt for hvert lag).
export function nyOkt(klasse, naa = Date.now(), { type = 'spill', sjekkliste = null, regelsett = null } = {}) {
  const { intervaller, intervallSekunder, maalfelt, bruddgrense = 10, antallLag = 2, stjernekrav = 8 } = klasse.innstillinger;
  const variant = type === 'spill' ? (klasse.variant ?? 'rolig') : null;
  return {
    klasseId: klasse.id,
    type,
    variant,
    sjekkliste,
    regelsett: regelsett && { id: regelsett.id, navn: regelsett.navn, regler: regelsett.regler.map((r) => r.tekst) },
    opprettet: new Date(naa).toISOString(),
    // Spillet starter når nedtellingen er ferdig. Kartlegging starter med en gang.
    start: type === 'spill' ? naa + NEDTELLING_MS : naa,
    intervaller,
    intervallMs: intervallSekunder * 1000,
    maalfelt,
    bruddgrense,
    antallLag: variant === 'lag' ? antallLag : 1,
    stjernekrav,
    pauseTotalMs: 0,
    pauseFra: null,
    brudd: [], // { t: spilltid i ms, lag } for hvert registrerte brudd
  };
}

export function varighetMs(okt) {
  return okt.intervaller * okt.intervallMs;
}

// Spilltid i ms. Negativ under nedtellingen.
export function spilltid(okt, naa = Date.now()) {
  const ref = okt.pauseFra ?? naa;
  return Math.min(ref - okt.start - okt.pauseTotalMs, varighetMs(okt));
}

export function erFerdig(okt, naa = Date.now()) {
  return spilltid(okt, naa) >= varighetMs(okt);
}

// Intervall k dekker [k·intervallMs, (k+1)·intervallMs). Et brudd nøyaktig
// på grensen hører til det nye minuttet.
export function intervallFor(okt, t) {
  return Math.floor(t / okt.intervallMs);
}

// Økter lagret før lagspill fantes, har bare tiden for hvert brudd.
const tidFor = (b) => (typeof b === 'number' ? b : b.t);
const lagFor = (b) => (typeof b === 'number' ? 0 : b.lag);
export const antallLag = (okt) => okt.antallLag ?? 1;

export function registrerBrudd(okt, naa = Date.now(), lag = 0) {
  if (okt.pauseFra !== null || lag >= antallLag(okt)) return okt;
  const t = naa - okt.start - okt.pauseTotalMs;
  if (t < 0 || t >= varighetMs(okt)) return okt;
  return { ...okt, brudd: [...okt.brudd, { t, lag }] };
}

export function pause(okt, naa = Date.now()) {
  if (okt.pauseFra !== null || erFerdig(okt, naa)) return okt;
  return { ...okt, pauseFra: naa };
}

export function fortsett(okt, naa = Date.now()) {
  if (okt.pauseFra === null) return okt;
  return { ...okt, pauseTotalMs: okt.pauseTotalMs + (naa - okt.pauseFra), pauseFra: null };
}

// lag = null teller alle lag sammen.
export function bruddPerIntervall(okt, lag = null) {
  const telling = Array(okt.intervaller).fill(0);
  for (const b of okt.brudd) if (lag === null || lagFor(b) === lag) telling[intervallFor(okt, tidFor(b))]++;
  return telling;
}

export function fullforteIntervaller(okt, naa = Date.now()) {
  return Math.max(0, Math.min(okt.intervaller, intervallFor(okt, spilltid(okt, naa))));
}

// Brikken går ett felt frem for hvert fullførte minutt uten brudd. Med lag
// er dette antall stjerner laget har fått.
export function posisjon(okt, naa = Date.now(), lag = null) {
  const telling = bruddPerIntervall(okt, lag);
  let felt = 0;
  for (let k = 0; k < fullforteIntervaller(okt, naa); k++) if (telling[k] === 0) felt++;
  return felt;
}

export function bruddIGjeldendeIntervall(okt, naa = Date.now(), lag = null) {
  const t = spilltid(okt, naa);
  if (t < 0 || erFerdig(okt, naa)) return 0;
  return bruddPerIntervall(okt, lag)[intervallFor(okt, t)];
}

// Vinnerkriteriene fra de norske studiene.
export function maalNaadd(okt, naa = Infinity) {
  if (okt.variant === 'brudd') return okt.brudd.length < okt.bruddgrense;
  if (okt.variant === 'lag') {
    return Array.from({ length: antallLag(okt) }, (_, l) => posisjon(okt, naa, l)).some((n) => n >= okt.stjernekrav);
  }
  return posisjon(okt, naa) >= okt.maalfelt;
}

export function tilLoggpost(okt, klassensValg = null) {
  const perLag = Array.from({ length: antallLag(okt) }, (_, l) => bruddPerIntervall(okt, l));
  return {
    id: crypto.randomUUID(),
    type: okt.type ?? 'spill',
    variant: okt.variant,
    regelsettId: okt.regelsett?.id ?? null,
    regelsettNavn: okt.regelsett?.navn ?? null,
    start: new Date(okt.start).toISOString(),
    varighetSekunder: varighetMs(okt) / 1000,
    intervaller: perLag[0].map((_, k) => ({ brudd: perLag.map((l) => l[k]) })),
    maalNaadd: okt.type === 'kartlegging' ? null : maalNaadd(okt),
    sjekklisteFullfort: okt.sjekkliste ?? null,
    klassensValg,
  };
}
