// Brettet er en fjelltur: brikken går fra varde til varde mot toppen.
// Tegnet i et 1600 × 900-koordinatsystem. Fargene kommer fra CSS-variabler,
// så lys og mørk modus bruker samme tegning.

const NS = 'http://www.w3.org/2000/svg';

// Start (indeks 0) og ti felt. Stien slynger seg i to svinger opp fjellsiden.
export const PUNKTER = [
  [150, 822],
  [340, 792], [545, 752], [760, 702], [610, 636], [845, 572],
  [1065, 502], [925, 448], [1130, 372], [1248, 292], [1312, 212],
];

// Catmull-Rom gjennom punktene, ett kubisk segment per steg.
function segment(i) {
  const p = (k) => PUNKTER[Math.max(0, Math.min(PUNKTER.length - 1, k))];
  const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
  const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
  const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
  return `M${p1} C${c1} ${c2} ${p2}`;
}

const HELE_STIEN = PUNKTER.slice(0, -1).map((_, i) => segment(i)).join(' ');

function tre(x, y, s = 1) {
  const h = 110 * s, b = 38 * s;
  return `<g class="tre" transform="translate(${x} ${y})">
    <rect x="${-4 * s}" y="${-14 * s}" width="${8 * s}" height="${16 * s}" />
    <path d="M0 ${-h} L${b * 0.62} ${-h * 0.55} L${b * 0.34} ${-h * 0.55} L${b} ${-12 * s} L${-b} ${-12 * s} L${-b * 0.34} ${-h * 0.55} L${-b * 0.62} ${-h * 0.55} Z" />
  </g>`;
}

function stjerner() {
  // Faste posisjoner, slik at himmelen ser lik ut hver gang.
  let s = '', x = 37;
  for (let i = 0; i < 46; i++) {
    x = (x * 97 + 211) % 1600;
    const y = (x * 13 + i * 71) % 380;
    s += `<circle cx="${x}" cy="${y + 12}" r="${i % 5 === 0 ? 2.6 : 1.5}" />`;
  }
  return s;
}

function felt(i, maalfelt) {
  const [x, y] = PUNKTER[i];
  const maal = i === maalfelt;
  const flagg = maal
    ? `<g class="flagg" transform="translate(${x + 22} ${y - 40})">
        <rect x="0" y="-92" width="6" height="96" rx="3" class="flaggstang" />
        <path d="M6 -90 C 40 -98 58 -78 92 -84 L 92 -44 C 58 -38 40 -58 6 -50 Z" />
      </g>`
    : '';
  return `<g class="felt${maal ? ' felt-maal' : ''}" data-felt="${i}">
    ${flagg}
    <ellipse class="felt-skygge" cx="${x}" cy="${y + 10}" rx="44" ry="14" />
    <circle class="felt-stein" cx="${x}" cy="${y}" r="38" />
    <text class="felt-tall" x="${x}" y="${y + 1}">${i}</text>
  </g>`;
}

// Bruddbrettet: skodde som kryper opp fjellsiden, én sky per brudd.
// Den siste skyen før grensen legger seg over toppen.
const SKY = 'M-120 28 C-150 28 -148 -6 -112 -8 C-110 -40 -66 -50 -48 -26 C-36 -64 22 -70 34 -32 C52 -52 100 -46 100 -10 C134 -12 144 28 112 28 Z';

function skyPlass(i, grense) {
  if (i === grense - 1) return [1318, 196, 1.75];
  const u = grense > 2 ? i / (grense - 2) : 0;
  return [200 + u * 900, 470 - u * 190 + (i % 2 ? -34 : 22), 0.75 + u * 0.35];
}

function skyer(grense) {
  return Array.from({ length: grense }, (_, i) => {
    const [x, y, s] = skyPlass(i, grense);
    return `<g class="sky${i === grense - 1 ? ' sky-topp' : ''}" data-sky="${i}" style="--x: ${x}px; --y: ${y}px">
      <g transform="scale(${(i % 2 ? -1.25 : 1.25) * s} ${0.9 * s})">
        <path class="sky-skygge" d="${SKY}" transform="translate(8 12)" />
        <path class="sky-form" d="${SKY}" />
      </g>
    </g>`;
  }).join('');
}

// Lagspillet: hvert lag har sitt stjernebilde, med én stjerne per minutt.
// Formene er ulike, så lagene skilles uten å bruke farge.
const BILDER = [
  [[-150, 50], [-110, 18], [-64, 30], [-24, 4], [20, -12], [34, -62], [88, -84], [142, -58], [124, -6], [66, 2]],
  [[-150, -40], [-112, 42], [-72, -8], [-34, 62], [6, 2], [46, 70], [86, 8], [118, -52], [150, 10], [128, 82]],
  [[-140, 72], [-122, 12], [-82, -40], [-22, -80], [40, -72], [92, -30], [124, 22], [84, 72], [22, 86], [-40, 58]],
];
const MIDTER = { 2: [[500, 330], [1060, 300]], 3: [[330, 340], [790, 300], [1240, 320]] };
const STJERNE = 'M0 -1 L0.2245 -0.309 L0.951 -0.309 L0.363 0.118 L0.588 0.809 L0 0.382 L-0.588 0.809 L-0.363 0.118 L-0.951 -0.309 L-0.2245 -0.309 Z';

function stjernebilder(antall, intervaller) {
  return MIDTER[antall].map(([cx, cy], l) => {
    const p = BILDER[l].slice(0, intervaller).map(([x, y]) => [cx + x, cy + y]);
    const linjer = p.slice(0, -1).map((a, i) =>
      `<line class="bilde-linje" data-i="${i}" x1="${a[0]}" y1="${a[1]}" x2="${p[i + 1][0]}" y2="${p[i + 1][1]}" />`).join('');
    const punkter = p.map(([x, y], i) => `
      <g class="bilde-punkt kommer" data-i="${i}" transform="translate(${x} ${y})">
        <circle class="bilde-glod" r="30" />
        <circle class="bilde-ring" r="19" />
        <circle class="bilde-prikk" r="4.5" />
        <path class="bilde-stjerne" d="${STJERNE}" transform="scale(20)" />
      </g>`).join('');
    return `<g class="stjernebilde" data-lag="${l}">
      ${linjer}${punkter}
      <text class="bilde-etikett" x="${cx}" y="${cy - 128}"><tspan class="bilde-navn">Lag ${l + 1}</tspan> <tspan class="lag-tall">0</tspan></text>
    </g>`;
  }).join('');
}

// Uten brett (kartlegging) vises bare landskapet: ingen sti, felt eller brikke.
// skyer: bruddgrensen på bruddbrettet. lag: antall lag i lagspillet, som gir nattehimmel.
export function lagLandskap(maalfelt, { brett = true, skyer: grense = 0, lag = 0, intervaller = 10 } = {}) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1600 900');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', brett ? `Fjelltur med ti felt. Målet er felt ${maalfelt}.`
    : grense ? `Fjellet i skodde. Én sky per brudd, og ved ${grense} brudd er toppen skjult.`
      : lag ? `Nattehimmel med ett stjernebilde per lag.` : 'Fjellandskap');
  svg.classList.add('landskap');
  if (lag) svg.classList.add('natt');

  const segmenter = PUNKTER.slice(0, -1)
    .map((_, i) => `<path class="sti-gatt" data-segment="${i}" d="${segment(i)}" />`)
    .join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="himmel" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
        <stop offset="0" stop-color="var(--himmel-topp)" />
        <stop offset="1" stop-color="var(--himmel-bunn)" />
      </linearGradient>
      <linearGradient id="kveld" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
        <stop offset="0.25" stop-color="var(--kveld)" stop-opacity="0" />
        <stop offset="1" stop-color="var(--kveld)" stop-opacity="1" />
      </linearGradient>
      <radialGradient id="stjerneglod">
        <stop offset="0" stop-color="var(--stjerne)" stop-opacity="0.55" />
        <stop offset="1" stop-color="var(--stjerne)" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="solglod">
        <stop offset="0.35" stop-color="var(--sol)" stop-opacity="0.45" />
        <stop offset="1" stop-color="var(--sol)" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="-1200" y="-900" width="4000" height="2700" fill="url(#himmel)" />
    <rect class="kveldslys" x="-1200" y="-900" width="4000" height="2700" fill="url(#kveld)" />
    <g class="stjerner">${stjerner()}</g>
    ${lag ? stjernebilder(lag, intervaller) : ''}

    <g class="sol">
      <circle r="130" fill="url(#solglod)" />
      <circle r="48" class="sol-skive" />
    </g>

    <g class="fjellene">
    <path class="fjell-fjern" d="M-1200 600 L-900 480 L-640 540 L-380 430 L-150 520 L-10 560 L120 470 L210 505 L360 395 L470 455 L560 420 L700 470 L820 400 L900 430 L1010 340 L1090 385 L1180 330 L1250 360 L1400 290 L1500 350 L1610 320 L1800 400 L2000 330 L2250 440 L2800 380 L2800 1800 L-1200 1800 Z" />
    <path class="fjell-midt" d="M-1200 700 L-800 600 L-420 660 L-10 640 L140 560 L260 600 L420 520 L560 575 L660 540 L740 570 L1610 470 L2100 540 L2800 500 L2800 1800 L-1200 1800 Z" />

    <path class="fjell" d="M-1200 1800 L-1200 800 C -700 780 -300 740 -10 728 C 250 708 450 648 640 548 C 820 452 1000 338 1150 258 L1235 206 L1272 222 L1312 168 L1362 208 L1420 192 C 1480 252 1540 300 1610 332 C 1900 460 2300 560 2800 620 L2800 1800 Z" />
    <path class="fjell-skygge" d="M1312 168 L1362 208 L1420 192 C 1480 252 1540 300 1610 332 C 1900 460 2300 560 2800 620 L2800 1800 L1330 1800 L1330 910 C 1360 700 1300 420 1312 168 Z" />
    <path class="sno" d="M1235 206 L1272 222 L1312 168 L1362 208 L1420 192 L1446 222 L1400 246 L1364 232 L1334 258 L1296 236 L1258 250 L1216 228 Z" />
    </g>

    <path class="mark" d="M-1200 1800 L-1200 830 C -600 790 -250 830 -10 812 C 260 770 560 800 900 846 C 1180 884 1400 842 1610 806 C 2000 770 2400 800 2800 790 L2800 1800 Z" />

    <g class="hytte" transform="translate(52 818)">
      <rect x="-44" y="-58" width="88" height="58" class="hytte-vegg" />
      <path d="M-56 -54 L0 -96 L56 -54 Z" class="hytte-tak" />
      <rect x="-12" y="-34" width="22" height="34" class="hytte-dor" />
    </g>

    ${tre(-120, 822, 1.1)} ${tre(-60, 836, 0.8)} ${tre(1470, 842, 1)} ${tre(1532, 832, 1.3)} ${tre(1580, 846, 0.85)} ${tre(1405, 858, 0.75)} ${tre(1690, 812, 1.2)} ${tre(1760, 824, 0.9)}

    ${grense ? `<rect class="skydekke" x="-1200" y="-900" width="4000" height="2700" />${skyer(grense)}` : ''}

    ${brett ? `<path class="sti" d="${HELE_STIEN}" />
    ${segmenter}

    <g class="start">
      <circle cx="${PUNKTER[0][0]}" cy="${PUNKTER[0][1]}" r="14" />
    </g>
    ${PUNKTER.slice(1).map((_, i) => felt(i + 1, maalfelt)).join('')}

    <g class="brikke" transform="translate(${PUNKTER[0][0]} ${PUNKTER[0][1]})">
      <g class="brikke-kropp">
        <ellipse cx="0" cy="18" rx="34" ry="11" class="brikke-skygge" />
        <path d="M-30 14 C-30 2 -18 -2 -14 -12 C-24 -20 -24 -44 0 -48 C 24 -44 24 -20 14 -12 C 18 -2 30 2 30 14 Z" class="brikke-form" />
        <circle cx="-7" cy="-34" r="6" class="brikke-glans" />
      </g>
    </g>` : ''}
  `;
  return svg;
}

// Punktet på stien for en posisjon (0 = start, 1–10 = felt).
export function punkt(felt) {
  return PUNKTER[felt];
}
