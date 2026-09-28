// Linjediagram: brudd per økt over tid, kartlegging og spill som to serier.
// Øktene står i rekkefølge med lik avstand, fordi de sjelden er jevnt fordelt i tid.

import { bruddTotalt, sortert } from './logg.js';

const NS = 'http://www.w3.org/2000/svg';
const SERIER = [
  { type: 'kartlegging', navn: 'Kartlegging', farge: 'var(--serie-kartlegging)' },
  { type: 'spill', navn: 'Spill', farge: 'var(--serie-spill)' },
];
const DATOFORMAT = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'numeric' });
const LANGDATO = new Intl.DateTimeFormat('nb-NO', {
  weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
});

function el(navn, attr = {}, forelder) {
  const e = document.createElementNS(NS, navn);
  for (const [k, v] of Object.entries(attr)) e.setAttribute(k, v);
  forelder?.append(e);
  return e;
}

// Fire like steg med hele, runde tall, så toppen ligger tett over høyeste verdi.
function pentMaks(v) {
  const steg = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250].find((s) => s * 4 >= v) ?? Math.ceil(v / 400) * 100;
  return steg * 4;
}

// Returnerer en funksjon som rydder opp.
export function lagDiagram(beholder, okter) {
  const punkter = sortert(okter).map((o, i) => ({
    i, type: o.type, verdi: bruddTotalt(o), dato: new Date(o.start),
  }));
  const tilstede = SERIER.filter((s) => punkter.some((p) => p.type === s.type));

  beholder.innerHTML = '';
  const forklaring = document.createElement('ul');
  forklaring.className = 'diagram-forklaring';
  for (const s of tilstede) {
    const li = document.createElement('li');
    const strek = document.createElement('span');
    strek.className = 'diagram-strek';
    strek.style.background = s.farge;
    li.append(strek, document.createTextNode(s.navn));
    forklaring.append(li);
  }
  const flate = document.createElement('div');
  flate.className = 'diagram-flate';
  const tips = document.createElement('div');
  tips.className = 'diagram-tips';
  tips.hidden = true;
  flate.append(tips);
  beholder.append(forklaring, flate);

  let svg;
  let valgt = null;

  function tegn() {
    svg?.remove();
    const B = Math.max(240, flate.clientWidth);
    const H = 300;
    // På mobil er det ikke plass til navnene etter linjene. Forklaringen over tar over.
    const smal = B < 480;
    forklaring.hidden = tilstede.length < 2 && !smal;
    const m = { v: 48, h: smal ? 20 : 124, t: 14, b: 40 };
    const bredde = B - m.v - m.h;
    const hoyde = H - m.t - m.b;
    const maks = pentMaks(Math.max(...punkter.map((p) => p.verdi), 1));
    const x = (i) => m.v + (punkter.length === 1 ? bredde / 2 : (i / (punkter.length - 1)) * bredde);
    const y = (v) => m.t + hoyde - (v / maks) * hoyde;

    svg = el('svg', {
      viewBox: `0 0 ${B} ${H}`, width: B, height: H, class: 'diagram-svg', tabindex: 0, role: 'img',
      'aria-label': `Brudd per økt for ${punkter.length} økter. Bruk piltastene for å lese hver økt. Tabellen under har de samme tallene.`,
    });

    // Rutenett og y-akse
    const akse = el('g', { class: 'diagram-akse' }, svg);
    for (let k = 0; k <= 4; k++) {
      const v = (maks / 4) * k;
      el('line', { x1: m.v, x2: m.v + bredde, y1: y(v), y2: y(v), class: k === 0 ? 'diagram-null' : 'diagram-rute' }, akse);
      el('text', { x: m.v - 12, y: y(v), class: 'diagram-ytall' }, akse).textContent = v;
    }
    // Datoer, bare så mange det er plass til
    const hvert = Math.max(1, Math.ceil(punkter.length / Math.floor(bredde / 64)));
    punkter.forEach((p, n) => {
      if (n % hvert && n !== punkter.length - 1) return;
      if (n !== punkter.length - 1 && punkter.length - 1 - n < hvert) return;
      el('text', { x: x(p.i), y: m.t + hoyde + 26, class: 'diagram-xtall' }, akse).textContent =
        DATOFORMAT.format(p.dato);
    });

    const trad = el('line', { y1: m.t, y2: m.t + hoyde, class: 'diagram-trad', visibility: 'hidden' }, svg);

    // Serier: linje, punkter, og navn ved siste punkt
    const etiketter = [];
    for (const s of tilstede) {
      const egne = punkter.filter((p) => p.type === s.type);
      el('polyline', {
        points: egne.map((p) => `${x(p.i)},${y(p.verdi)}`).join(' '),
        class: 'diagram-linje', stroke: s.farge,
      }, svg);
      for (const p of egne) {
        el('circle', { cx: x(p.i), cy: y(p.verdi), r: 5, class: 'diagram-punkt', fill: s.farge, 'data-i': p.i }, svg);
      }
      const siste = egne.at(-1);
      etiketter.push({ navn: s.navn, y: y(siste.verdi), x: x(punkter.at(-1).i) + 14 });
    }
    etiketter.sort((a, b) => a.y - b.y);
    for (let n = 1; n < etiketter.length; n++) {
      etiketter[n].y = Math.max(etiketter[n].y, etiketter[n - 1].y + 22);
    }
    for (const e of smal ? [] : etiketter) {
      el('text', { x: e.x, y: e.y, class: 'diagram-navn' }, svg).textContent = e.navn;
    }

    const treff = el('rect', { x: m.v - 16, y: 0, width: bredde + 32, height: H, fill: 'transparent' }, svg);

    function vis(i) {
      valgt = i;
      if (i === null) {
        trad.setAttribute('visibility', 'hidden');
        tips.hidden = true;
        svg.querySelectorAll('.diagram-punkt.aktiv').forEach((c) => c.classList.remove('aktiv'));
        return;
      }
      const p = punkter[i];
      trad.setAttribute('x1', x(i));
      trad.setAttribute('x2', x(i));
      trad.setAttribute('visibility', 'visible');
      svg.querySelectorAll('.diagram-punkt').forEach((c) => c.classList.toggle('aktiv', Number(c.dataset.i) === i));
      const serie = SERIER.find((s) => s.type === p.type);
      tips.replaceChildren();
      const verdi = document.createElement('strong');
      verdi.textContent = `${p.verdi} brudd`;
      const rad = document.createElement('span');
      rad.className = 'diagram-tips-rad';
      const strek = document.createElement('span');
      strek.className = 'diagram-strek';
      strek.style.background = serie.farge;
      rad.append(strek, document.createTextNode(serie.navn));
      const dato = document.createElement('span');
      dato.textContent = LANGDATO.format(p.dato);
      tips.append(verdi, rad, dato);
      tips.hidden = false;
      const venstre = x(i) > B / 2;
      tips.style.left = venstre ? '' : `${x(i) + 14}px`;
      tips.style.right = venstre ? `${B - x(i) + 14}px` : '';
      tips.style.top = `${Math.max(0, y(p.verdi) - 40)}px`;
    }

    treff.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * B;
      let naermest = 0;
      for (const p of punkter) if (Math.abs(x(p.i) - px) < Math.abs(x(naermest) - px)) naermest = p.i;
      vis(naermest);
    });
    treff.addEventListener('pointerleave', () => vis(null));
    svg.addEventListener('focus', () => vis(valgt ?? punkter.length - 1));
    svg.addEventListener('blur', () => vis(null));
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') vis(Math.max(0, (valgt ?? 0) - 1));
      else if (e.key === 'ArrowRight') vis(Math.min(punkter.length - 1, (valgt ?? -1) + 1));
      else if (e.key === 'Home') vis(0);
      else if (e.key === 'End') vis(punkter.length - 1);
      else return;
      e.preventDefault();
    });

    flate.prepend(svg);
  }

  const observator = new ResizeObserver(() => tegn());
  observator.observe(flate);
  tegn();
  return () => observator.disconnect();
}
