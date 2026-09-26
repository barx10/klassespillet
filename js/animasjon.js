// Animasjonen i veiledningene: fjellturen tegnes opp, reglene kommer frem,
// brikken går mot flagget og klassen trekker en lapp. Den er laget av samme
// landskap som spillet, og tegn(t) gir alltid samme bilde for samme tid.
// Derfor kan den både spilles i appen og tas opp bilde for bilde til video.

import { lagLandskap, punkt } from './landskap.js';

const NS = 'http://www.w3.org/2000/svg';
export const VARIGHET = 30000;
const MAALFELT = 7;

// Teksten under animasjonen i appen. Samme tekst som fortellerstemmen i manuset.
export const TEKSTER = [
  [0, 'Klassespillet spiller hele klassen sammen.'],
  [6000, 'Læreren velger tre regler. De står på tavla hele tiden.'],
  [12000, 'I ti minutter jobber vi som vanlig. For hvert minutt alle følger reglene, går brikken ett steg opp.'],
  [19000, 'Når brikken når flagget, trekker vi noe fra listen vi har laget sammen.'],
  [25000, 'Klarer vi det ikke, prøver vi igjen neste gang. Ingen blir pekt ut.'],
];

// Når brikken hopper til hvert felt, i millisekunder.
const HOPP = [13000, 14000, 15000, 16000, 17000, 18000, 20300];
const HOPPTID = 600;

const klem = (x) => Math.max(0, Math.min(1, x));
const andel = (t, fra, til) => klem((t - fra) / (til - fra));
const myk = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
// Litt over 1 før den legger seg, så ting «spretter» inn.
const sprett = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2);
const skaler = (x, y, s) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;

function el(navn, attr = {}, forelder) {
  const e = document.createElementNS(NS, navn);
  for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v);
  forelder?.append(e);
  return e;
}

// Lager tegningen. Landskapet får de øverste 760 enhetene, reglene resten.
export function lagAnimasjon() {
  const svg = el('svg', { viewBox: '0 0 1600 900', class: 'animasjon', role: 'img',
    'aria-label': 'Animasjon: stien til fjelltoppen tegnes, reglene kommer frem, brikken går mot flagget, og klassen trekker en lapp.' });
  const land = lagLandskap(MAALFELT);
  land.removeAttribute('role');
  land.removeAttribute('aria-label');
  for (const [k, v] of Object.entries({ x: 0, y: 0, width: 1600, height: 760, preserveAspectRatio: 'xMidYMax slice' })) land.setAttribute(k, v);
  Object.assign(land.style, { width: '1600px', height: '760px', overflow: 'hidden' });
  svg.append(land);

  // Stien tegnes opp med en maske over den prikkete streken.
  const sti = land.querySelector('.sti');
  const lengde = sti.getTotalLength();
  const maske = el('mask', { id: 'sti-maske', maskUnits: 'userSpaceOnUse', x: -100, y: -100, width: 1800, height: 1100 }, land.querySelector('defs'));
  const maskeSti = el('path', { d: sti.getAttribute('d'), fill: 'none', stroke: '#fff', 'stroke-width': 40,
    'stroke-linecap': 'round', 'stroke-dasharray': `${lengde} ${lengde}` }, maske);
  sti.setAttribute('mask', 'url(#sti-maske)');
  const start = land.querySelector('.start');

  const felt = [...land.querySelectorAll('.felt')].map((g) => ({ g, i: Number(g.dataset.felt), p: punkt(Number(g.dataset.felt)) }));
  const flagg = land.querySelector('.flagg');
  const flaggGrunn = flagg.getAttribute('transform');
  const brikke = land.querySelector('.brikke');
  const sol = land.querySelector('.sol');

  // Konfetti rundt målfeltet. Faste retninger, så hvert bilde blir likt.
  const [mx, my] = punkt(MAALFELT);
  const konfetti = el('g', { class: 'anim-konfetti' }, land);
  const biter = Array.from({ length: 18 }, (_, i) => {
    const v = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
    const r = el('rect', { width: 14, height: 8, rx: 2, class: i % 3 === 0 ? 'rod' : i % 3 === 1 ? 'gul' : 'hvit' }, konfetti);
    return { r, dx: Math.cos(v), dy: Math.sin(v) - 0.6, fart: 120 + (i % 4) * 35 };
  });

  // Krukka med lapper, til venstre på himmelen.
  const krukke = el('g', { class: 'anim-krukke' }, land);
  const lapp = el('g', { class: 'anim-lapp' }, krukke);
  el('rect', { x: -80, y: -52, width: 160, height: 104, rx: 10, class: 'lapp-ark' }, lapp);
  el('path', { d: 'M-50 -16 H50 M-50 12 H30', class: 'lapp-linje' }, lapp);
  el('path', { d: 'M-70 -40 C-72 -70 72 -70 70 -40 L60 60 C58 80 -58 80 -60 60 Z', class: 'krukke-glass' }, krukke);
  el('rect', { x: -78, y: -58, width: 156, height: 22, rx: 8, class: 'krukke-kant' }, krukke);
  for (const [x, y, v] of [[-30, 30, -12], [8, 40, 10], [34, 18, -6], [-8, 8, 16]]) {
    el('rect', { x: x - 20, y: y - 12, width: 40, height: 24, rx: 4, class: 'krukke-lapp', transform: `rotate(${v} ${x} ${y})` }, krukke);
  }
  const KX = 330, KY = 430;

  // To små skyer som driver inn på slutten.
  const skyer = [[1500, 330, 0.8], [760, 280, 0.9]].map(([x, y, s]) => {
    const g = el('g', { class: 'anim-sky' }, land);
    for (const [cx, cy, r] of [[-60, 10, 38], [-10, -12, 52], [50, 4, 40], [0, 20, 44]]) el('circle', { cx, cy, r }, g);
    return { g, x, y, s };
  });

  // Reglene nederst: tre gule sirkler og streker som ikke kan leses.
  const regler = el('g', { class: 'anim-regler' }, svg);
  el('rect', { x: 0, y: 760, width: 1600, height: 140, class: 'regler-band' }, regler);
  const regel = [0, 1, 2].map((i) => {
    const x = 90 + i * 510;
    const g = el('g', {}, regler);
    el('circle', { cx: x, cy: 830, r: 30, class: 'regel-sirkel' }, g);
    const tall = el('text', { x, y: 831, class: 'regel-tall' }, g);
    tall.textContent = i + 1;
    const strek = el('path', { d: `M${x + 60} 830 c 25 -18 50 18 75 0 s 50 -18 75 0 s 50 18 75 0 s 50 -18 75 0 s 50 18 75 0`,
      class: 'regel-strek', pathLength: 1, 'stroke-dasharray': '1 1' }, g);
    return { g, x, strek };
  });

  // Tegner bildet for tiden t, i millisekunder fra start.
  function tegn(t) {
    maskeSti.setAttribute('stroke-dashoffset', lengde * (1 - myk(andel(t, 1000, 5500))));
    start.style.opacity = andel(t, 900, 1200);
    for (const f of felt) {
      const s = sprett(andel(t, 1300 + f.i * 400, 1800 + f.i * 400));
      f.g.setAttribute('transform', skaler(f.p[0], f.p[1], s));
    }
    flagg.setAttribute('transform', `${flaggGrunn} scale(1 ${sprett(andel(t, 19200, 19900))})`);

    // Brikken: dukker opp ved start og hopper ett felt om gangen.
    let naa = 0;
    let [x, y] = punkt(0);
    let loft = 0;
    for (const [k, fra] of HOPP.entries()) {
      const p = andel(t, fra, fra + HOPPTID);
      if (p <= 0) break;
      const a = punkt(k), b = punkt(k + 1), m = myk(p);
      x = a[0] + (b[0] - a[0]) * m;
      y = a[1] + (b[1] - a[1]) * m;
      loft = Math.sin(Math.PI * p) * 46;
      if (p >= 1) naa = k + 1;
    }
    brikke.setAttribute('transform', `translate(${x} ${y - loft}) scale(${sprett(andel(t, 12300, 12900))})`);
    for (const f of felt) f.g.classList.toggle('naadd', f.i <= naa);

    // Sola går sakte over himmelen mens brikken går.
    const s = andel(t, 12000, VARIGHET);
    sol.setAttribute('transform', `translate(${260 + s * 820} ${400 - Math.sin(Math.PI * (0.2 + s * 0.6)) * 140})`);

    const kp = andel(t, 20900, 22900);
    konfetti.style.opacity = kp > 0 && kp < 1 ? 1 - kp * kp : 0;
    for (const [i, b] of biter.entries()) {
      const d = b.fart * (1 - (1 - kp) ** 2);
      b.r.setAttribute('transform', `translate(${mx + b.dx * d} ${my - 60 + b.dy * d + 160 * kp * kp}) rotate(${(i * 47 + kp * 360) % 360})`);
    }

    krukke.setAttribute('transform', `translate(${KX} ${KY}) scale(${sprett(andel(t, 22200, 22800))})`);
    const opp = myk(andel(t, 23000, 23800));
    const brett = myk(andel(t, 23800, 24500));
    lapp.setAttribute('transform', `translate(${opp * 190} ${-opp * 90}) scale(${0.25 + brett * 0.75} ${0.25 + brett * 0.75}) rotate(${(1 - brett) * -14})`);
    lapp.style.opacity = opp > 0 ? 1 : 0;

    for (const [i, sk] of skyer.entries()) {
      const p = myk(andel(t, 25300 + i * 700, 28300 + i * 700));
      sk.g.setAttribute('transform', `translate(${sk.x + (1 - p) * 260} ${sk.y}) scale(${sk.s})`);
      sk.g.style.opacity = p * 0.95;
    }

    regler.setAttribute('transform', `translate(0 ${(1 - myk(andel(t, 6000, 6800))) * 160})`);
    for (const [i, r] of regel.entries()) {
      const fra = 6900 + i * 1300;
      r.g.setAttribute('transform', skaler(r.x, 830, sprett(andel(t, fra, fra + 450))));
      r.strek.setAttribute('stroke-dashoffset', 1 - myk(andel(t, fra + 350, fra + 1150)));
    }
  }

  tegn(0);
  return { svg, tegn };
}

// Avspilleren i veiledningene: tegningen, teksten under og knappene.
// Returnerer en funksjon som stopper animasjonen når siden byttes.
export function lagSpiller(beholder, { redusert = false } = {}) {
  const { svg, tegn } = lagAnimasjon();
  beholder.innerHTML = `
    <figure class="anim">
      <div class="anim-bilde"></div>
      <figcaption class="anim-tekst" aria-live="polite"></figcaption>
      <div class="anim-knapper">
        <button class="knapp knapp-hoved" type="button" data-anim="spill">Spill av</button>
        <button class="knapp knapp-stille" type="button" data-anim="igjen" hidden>Start på nytt</button>
      </div>
    </figure>`;
  beholder.querySelector('.anim-bilde').append(svg);
  const tekst = beholder.querySelector('.anim-tekst');
  const spill = beholder.querySelector('[data-anim=spill]');
  const igjen = beholder.querySelector('[data-anim=igjen]');

  let t = 0, fra = null, ramme = 0, gaar = false;
  const visTekst = () => { tekst.textContent = TEKSTER.findLast(([s]) => s <= t)[1]; };

  // Uten bevegelse vises sluttbildet og hele teksten.
  if (redusert) {
    tegn(VARIGHET);
    tekst.textContent = TEKSTER.map(([, s]) => s).join(' ');
    beholder.querySelector('.anim-knapper').hidden = true;
    return () => {};
  }

  function steg(naa) {
    if (fra === null) fra = naa - t;
    t = Math.min(VARIGHET, naa - fra);
    tegn(t);
    visTekst();
    if (t < VARIGHET) ramme = requestAnimationFrame(steg);
    else stans();
  }
  function start() {
    if (t >= VARIGHET) t = 0;
    gaar = true;
    fra = null;
    spill.textContent = 'Pause';
    igjen.hidden = false;
    ramme = requestAnimationFrame(steg);
  }
  function stans() {
    gaar = false;
    cancelAnimationFrame(ramme);
    spill.textContent = t >= VARIGHET ? 'Spill av igjen' : 'Fortsett';
  }
  spill.onclick = () => (gaar ? stans() : start());
  igjen.onclick = () => { stans(); t = 0; tegn(0); visTekst(); start(); };
  visTekst();
  return () => cancelAnimationFrame(ramme);
}
