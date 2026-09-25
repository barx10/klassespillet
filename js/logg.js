// Utregninger og eksport for øktloggen. Ingen DOM her, så det kan testes i Node.

export const KARTLEGGINGER_FOR_VURDERING = 3;

export function bruddTotalt(post) {
  return post.intervaller.reduce((sum, i) => sum + i.brudd.reduce((a, b) => a + b, 0), 0);
}

export function minutterMedBrudd(post) {
  return post.intervaller.filter((i) => i.brudd.some((n) => n > 0)).length;
}

export function sortert(okter) {
  return [...okter].sort((a, b) => a.start.localeCompare(b.start));
}

// Oppsummering av de siste kartleggingene (maks fem), eller null om det er for få.
export function kartleggingsoppsummering(okter) {
  const tall = sortert(okter)
    .filter((o) => o.type === 'kartlegging')
    .slice(-5)
    .map(bruddTotalt);
  if (tall.length < KARTLEGGINGER_FOR_VURDERING) return null;
  return {
    antall: tall.length,
    snitt: tall.reduce((a, b) => a + b, 0) / tall.length,
    lavest: Math.min(...tall),
    hoyest: Math.max(...tall),
  };
}

const to = (n) => String(n).padStart(2, '0');
export const dato = (d) => `${d.getFullYear()}-${to(d.getMonth() + 1)}-${to(d.getDate())}`;
export const klokkeslett = (d) => `${to(d.getHours())}:${to(d.getMinutes())}`;
const jaNei = (v) => (v === true ? 'ja' : v === false ? 'nei' : '');

function celle(v) {
  const s = String(v ?? '');
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Semikolon og BOM, slik at norsk Excel åpner fila riktig med dobbeltklikk.
export function tilCsv(klasse) {
  const okter = sortert(klasse.okter);
  const maksMin = Math.max(10, ...okter.map((o) => o.intervaller.length));
  const hode = [
    'klasse', 'dato', 'klokkeslett', 'type', 'variant', 'regelsett', 'brudd totalt', 'minutter med brudd',
    'mål nådd', 'sjekkliste fullført', 'klassens valg',
    ...Array.from({ length: maksMin }, (_, i) => `minutt ${i + 1}`),
  ];
  const rader = okter.map((o) => {
    const d = new Date(o.start);
    return [
      klasse.navn, dato(d), klokkeslett(d), o.type, o.variant ?? '', o.regelsettNavn ?? '',
      bruddTotalt(o), minutterMedBrudd(o),
      jaNei(o.maalNaadd), jaNei(o.sjekklisteFullfort), o.klassensValg ?? '',
      ...Array.from({ length: maksMin }, (_, i) =>
        o.intervaller[i] ? o.intervaller[i].brudd.reduce((a, b) => a + b, 0) : ''),
    ];
  });
  return '﻿' + [hode, ...rader].map((r) => r.map(celle).join(';')).join('\r\n') + '\r\n';
}

const DAG = 86_400_000;

// Elevenes ønsker endrer seg. Ny runde med lapper etter fire uker, eller når
// dere har hatt over to uker uten økter siden forrige runde. Returnerer
// 'fire-uker', 'pause' eller null.
export function trengerNyeForslag(klasse, naa = Date.now()) {
  if (!klasse.sisteBelonningskartlegging || !klasse.klassensValg.length) return null;
  const sist = new Date(`${klasse.sisteBelonningskartlegging}T00:00:00`).getTime();
  if (naa - sist >= 28 * DAG) return 'fire-uker';
  // Lengste opphold uten økter etter forrige runde med lapper, også det som pågår nå.
  const tider = [sist, ...sortert(klasse.okter).map((o) => new Date(o.start).getTime()).filter((t) => t >= sist), naa];
  const lengste = Math.max(...tider.slice(1).map((t, i) => t - tider[i]));
  return lengste > 14 * DAG ? 'pause' : null;
}
