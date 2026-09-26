import { les, skriv, nyKlasse } from './lager.js';
import { BIBLIOTEK, FORSLAG, MAKS_REGLER, fraBibliotek, egetRegelsett, rosForslag } from './regler.js';
import * as Okt from './okt.js';
import { lagLandskap, punkt } from './landskap.js';
import * as Logg from './logg.js';
import { lagDiagram } from './diagram.js';
import { veiledning, elevveiledning } from './veiledning.js';
import { visOpplaering } from './opplaering.js';
import { visOm } from './om.js';

const app = document.getElementById('app');
let tilstand = les();
let stopp = () => {};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const lagre = () => skriv(tilstand);
const klasse = () => tilstand.klasser.find((k) => k.id === tilstand.aktivKlasseId) ?? tilstand.klasser[0];
const regelsettFor = (k) => k.regelsett.find((r) => r.id === k.sisteRegelsettId) ?? k.regelsett[0];
const redusertBevegelse = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches || !klasse()?.innstillinger.animasjon;

// ---------- Tema ----------

function settTema(tema) {
  if (tema) document.documentElement.dataset.tema = tema;
  else delete document.documentElement.dataset.tema;
  localStorage.setItem('klassespillet-tema', tema ?? '');
}
settTema(localStorage.getItem('klassespillet-tema') || null);

function erMorkt() {
  const valgt = document.documentElement.dataset.tema;
  return valgt ? valgt === 'mork' : matchMedia('(prefers-color-scheme: dark)').matches;
}

// ---------- Visninger ----------

// naa er visningen som vises, så veiledningene vet hvor Tilbake skal gå.
// forlat spør først når oppsettet har endringer som ikke er lagret.
let naa = null;
let forlat = (videre) => videre();

function vis(visning) {
  stopp();
  stopp = () => {};
  forlat = (videre) => videre();
  naa = visning;
  app.innerHTML = '';
  document.body.classList.remove('uten-bunntekst');
  visning();
}

const tilLaerer = () => { const fra = naa; vis(() => veiledningSide(fra)); };
const tilElev = () => { const fra = naa; vis(() => elevSide(fra)); };
const opplaering = () => visOpplaering({ tilVeiledning: () => forlat(tilLaerer) });

// Topplinja står på alle sider utenom velkomst og spill. Uten tilbake er
// dette hjem, og da står navnet på appen der Tilbake ellers står.
function topplinje(tilbake) {
  const linje = document.createElement('header');
  linje.className = 'topplinje';
  linje.innerHTML = `
    ${tilbake
      ? '<button class="topp-tilbake" id="topp-tilbake"><span aria-hidden="true">‹</span> Tilbake</button>'
      : '<p class="topp-merke">Klassespillet</p>'}
    <nav class="topp-meny" aria-label="Meny">
      <button class="lenke" id="topp-laerer">Lærerveiledning</button>
      <button class="lenke" id="topp-elev">Elevveiledning</button>
      <button class="lenke" id="topp-tema">${erMorkt() ? 'Lys visning' : 'Mørk visning'}</button>
    </nav>`;
  app.prepend(linje);
  linje.querySelector('#topp-tilbake')?.addEventListener('click', () => forlat(() => vis(tilbake)));
  linje.querySelector('#topp-laerer').onclick = () => forlat(tilLaerer);
  linje.querySelector('#topp-elev').onclick = () => forlat(tilElev);
  linje.querySelector('#topp-tema').onclick = (e) => {
    settTema(erMorkt() ? 'lys' : 'mork');
    e.currentTarget.textContent = erMorkt() ? 'Lys visning' : 'Mørk visning';
  };
}

// Spør før endringer i oppsettet forkastes.
function bekreftForlat(videre) {
  const d = document.createElement('dialog');
  d.className = 'dialog';
  d.innerHTML = `
    <p>Du har endringer som ikke er lagret.</p>
    <form method="dialog" class="hjem-knapper">
      <button class="knapp knapp-hoved" value="bli">Fortsett å redigere</button>
      <button class="knapp knapp-stille" value="forkast">Forkast endringene</button>
    </form>`;
  document.body.append(d);
  d.addEventListener('close', () => {
    d.remove();
    if (d.returnValue === 'forkast') videre();
  });
  d.showModal();
}

// Startsiden før første klasse. Her kan læreren se seg rundt uten å fylle ut noe.
function tomHjem() {
  forHjem(`
        <h1 class="hjem-klasse tom-tittel">Velkommen</h1>
        <p class="hjem-mal">Klassen spiller sammen om å følge tre regler i ti minutter. Klarer de det, trekker dere noe elevene selv har foreslått.</p>
        <div class="hjem-knapper">
          <button class="knapp knapp-hoved" id="ny-klasse">Sett opp klassen</button>
          <button class="knapp knapp-stille" id="gjennomgang">Slik virker det</button>
        </div>
        <p class="hjem-varsel">Vil du lese først? Lærerveiledningen forklarer metoden og forskningen.
          Elevveiledningen kan du vise på tavla når du introduserer spillet.</p>`);
  topplinje(null);
  app.querySelector('#ny-klasse').onclick = () => vis(() => oppsett({ ny: true }));
  app.querySelector('#gjennomgang').onclick = opplaering;
  app.querySelector('#ny-klasse').focus();
}

function hjem() {
  const k = klasse();
  if (!k) return tomHjem();
  if (tilstand.pagaende) return vis(spill);

  const rs = regelsettFor(k);
  const inn = k.innstillinger;
  const variant = k.variant ?? 'rolig';
  const mal = {
    rolig: `Ti minutter. Kom til felt ${inn.maalfelt}, så trekker dere klassens valg.`,
    brudd: `Ti minutter. Hold dere under ${inn.bruddgrense} brudd, så trekker dere klassens valg.`,
    lag: `Ti minutter i ${inn.antallLag === 3 ? 'tre' : 'to'} lag. Får ett lag minst ${inn.stjernekrav} stjerner, trekker hele klassen klassens valg.`,
  }[variant];
  const nye = Logg.trengerNyeForslag(k);
  forHjem(`
        <h1 class="hjem-klasse">${esc(k.navn)}</h1>
        <p class="hjem-mal">${mal}</p>
        <p class="hjem-regelsett">${esc(rs.navn)}</p>
        <ol class="hjem-regler">${rs.regler.map((r) => `<li>${esc(r.tekst)}</li>`).join('')}</ol>
        <div class="hjem-knapper">
          <button class="knapp knapp-hoved" id="start">Start økt</button>
          <button class="knapp knapp-stille" id="kartlegg">Kartlegg</button>
          <button class="knapp knapp-stille" id="logg">Logg</button>
        </div>
        ${k.klassensValg.length === 0 ? '<p class="hjem-varsel">Legg inn klassens valg i oppsettet før dere spiller.</p>' : ''}
        ${nye ? `
          <div class="hjem-varsel paminn-valg">
            <p>${nye === 'pause'
              ? 'Det er over to uker uten økter siden elevene sist foreslo klassens valg. Ønskene kan ha endret seg. Be dem skrive nye lapper.'
              : 'Det er fire uker siden elevene foreslo klassens valg. Be dem skrive nye lapper.'}</p>
            <div class="hjem-lenker">
              <button class="lenke" id="nye-valg">Oppdater listen</button>
              <button class="lenke" id="valg-ok">Listen er fortsatt riktig</button>
            </div>
          </div>` : ''}
        <nav class="hjem-lenker" aria-label="Klassen">
          <button class="lenke" id="endre">Endre oppsett</button>
          <button class="lenke" id="klasser">${tilstand.klasser.length > 1 ? 'Bytt klasse' : 'Ny klasse'}</button>
        </nav>`, { brett: variant === 'rolig' });
  topplinje(null);
  app.querySelector('#start').onclick = () => vis(sjekkliste);
  app.querySelector('#klasser').onclick = () => vis(tilstand.klasser.length > 1 ? klasser : () => oppsett({ ny: true }));
  app.querySelector('#nye-valg')?.addEventListener('click', () => vis(() => oppsett({ fokus: 'klassensValg' })));
  app.querySelector('#valg-ok')?.addEventListener('click', () => {
    k.sisteBelonningskartlegging = Logg.dato(new Date());
    lagre();
    vis(hjem);
  });
  app.querySelector('#kartlegg').onclick = () => vis(kartleggingStart);
  app.querySelector('#logg').onclick = () => vis(logg);
  app.querySelector('#endre').onclick = () => vis(oppsett);
  app.querySelector('#start').focus();
}

// Velkomstskjermen vises hver gang appen åpnes, men ikke midt i en økt.
function velkomst() {
  document.body.classList.add('uten-bunntekst');
  app.innerHTML = `
    <main class="velkomst">
      <div class="velkomst-landskap" aria-hidden="true"></div>
      <section class="velkomst-innhold">
        <h1>Klassespillet</h1>
        <p class="velkomst-ingress">Good Behavior Game på tavla. Ti minutter, tre regler, hele klassen sammen.</p>
        <button class="knapp knapp-hoved" id="videre">Start</button>
        <p class="velkomst-fra">© Lærerliv 2026</p>
      </section>
    </main>`;
  const bilde = lagLandskap(7, { brett: false });
  bilde.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  app.querySelector('.velkomst-landskap').append(bilde);
  app.querySelector('#videre').onclick = () => vis(hjem);
  app.querySelector('#videre').focus();
}

function klasser() {
  app.innerHTML = `
    <main class="oppsett">
      <div class="skjema">
        <h1>Klasser</h1>
        <ul class="klasse-liste">
          ${tilstand.klasser.map((k) => `
            <li><button class="klasse-valg${k === klasse() ? ' aktiv' : ''}" data-id="${k.id}">
              <span class="klasse-navn">${esc(k.navn)}</span>
              <span class="hjelp">${k.okter.length === 1 ? 'Én økt' : `${k.okter.length} økter`} i loggen</span>
            </button></li>`).join('')}
        </ul>
        <div class="hjem-knapper">
          <button class="knapp knapp-stille" id="ny">Ny klasse</button>
        </div>
      </div>
    </main>`;
  app.querySelectorAll('.klasse-valg').forEach((b) => b.addEventListener('click', () => {
    tilstand.aktivKlasseId = b.dataset.id;
    lagre();
    vis(hjem);
  }));
  app.querySelector('#ny').onclick = () => vis(() => oppsett({ ny: true }));
  topplinje(hjem);
  app.querySelector('.klasse-valg.aktiv').focus();
}

// Hjem-oppsettet med landskapet til høyre, brukt av skjermene før en økt.
// Uten brett for skjermer med mye tekst, så feltene ikke kolliderer med den.
function forHjem(innhold, { brett = true } = {}) {
  const k = klasse();
  app.innerHTML = `
    <main class="hjem">
      <div class="hjem-landskap" aria-hidden="true"></div>
      <section class="hjem-innhold">${innhold}</section>
    </main>`;
  const bilde = lagLandskap(k?.innstillinger.maalfelt ?? 7, { brett });
  bilde.setAttribute('preserveAspectRatio', 'xMaxYMid slice');
  app.querySelector('.hjem-landskap').append(bilde);
}

const SJEKKPUNKTER = [
  'Reglene er gjennomgått med eksempler.',
  'Klassen vet hva som skal til for å vinne.',
  'Listen med klassens valg er klar.',
  'Tidspunktet passer: ro etter friminutt, selvstendig arbeid eller tavleundervisning.',
];

// Valg av regelsett før en økt. Reglene vises under, så læreren kan gå gjennom dem.
function regelsettVelger(k) {
  const valgt = regelsettFor(k);
  const regler = (rs) => rs.regler.map((r) => `<li>${esc(r.tekst)}</li>`).join('');
  return `
    <fieldset class="velg-regelsett">
      <legend class="hjelp">Regler for denne økta</legend>
      ${k.regelsett.length > 1
        ? `<div class="regelsett-valg">${k.regelsett.map((rs) => `
            <label><input type="radio" name="regelsett" value="${rs.id}" ${rs === valgt ? 'checked' : ''} /><span>${esc(rs.navn)}</span></label>`).join('')}
          </div>`
        : `<input type="hidden" name="regelsett" value="${valgt.id}" /><p class="hjem-regelsett">${esc(valgt.navn)}</p>`}
      <ol class="hjem-regler">${regler(valgt)}</ol>
    </fieldset>`;
}

function kobleRegelsettVelger(form, k) {
  const liste = form.querySelector('.velg-regelsett .hjem-regler');
  form.querySelectorAll('[name=regelsett]').forEach((r) => r.addEventListener('change', () => {
    const rs = k.regelsett.find((x) => x.id === r.value);
    liste.innerHTML = rs.regler.map((x) => `<li>${esc(x.tekst)}</li>`).join('');
  }));
  return () => {
    const rs = k.regelsett.find((x) => x.id === form.elements.regelsett.value) ?? k.regelsett[0];
    k.sisteRegelsettId = rs.id;
    return rs;
  };
}

function sjekkliste() {
  const k = klasse();
  forHjem(`
    <form class="sjekkliste">
      <h1 class="sjekkliste-tittel">Klar?</h1>
      ${regelsettVelger(k)}
      <fieldset>
        <legend class="hjelp">Kryss av det som stemmer. Avkrysningen lagres i loggen, så du ser senere hvilke økter som var godt forberedt.</legend>
        ${SJEKKPUNKTER.map((t, i) => `
          <label class="sjekkpunkt"><input type="checkbox" name="s${i}" /><span>${esc(t)}</span></label>`).join('')}
      </fieldset>
      <div class="hjem-knapper">
        <button class="knapp knapp-hoved" type="submit">Start økt</button>
        <button class="knapp knapp-stille" type="button" id="tilbake">Tilbake</button>
      </div>
    </form>`, { brett: false });
  const form = app.querySelector('form');
  const hentRegelsett = kobleRegelsettVelger(form, k);
  form.onsubmit = (e) => {
    e.preventDefault();
    const alle = SJEKKPUNKTER.every((_, i) => form.elements[`s${i}`].checked);
    tilstand.pagaende = Okt.nyOkt(k, Date.now(), { sjekkliste: alle, regelsett: hentRegelsett() });
    lagre();
    vis(spill);
  };
  form.querySelector('#tilbake').onclick = () => vis(hjem);
  topplinje(hjem);
  (form.querySelector('[name=regelsett]:checked') ?? form.querySelector('[name=s0]')).focus();
}

function kartleggingStart() {
  const k = klasse();
  const antall = k.okter.filter((o) => o.type === 'kartlegging').length;
  forHjem(`
    <form class="sjekkliste">
      <h1 class="sjekkliste-tittel">Kartlegging</h1>
      <p class="hjem-mal">Ti minutter vanlig undervisning, uten spill. Trykk på brudd-knappen hver gang noen bryter en regel.</p>
      ${regelsettVelger(k)}
      <p class="hjelp">Klassen ser bare landskapet, ikke brettet eller tellingen. Atferd som varer, teller som nytt brudd hvert 15. sekund.
        Gjør tre til fem kartlegginger på ulike dager, så har du tall å vurdere i loggen.
        ${antall ? `Du har gjort ${antall}.` : ''}</p>
      <div class="hjem-knapper">
        <button class="knapp knapp-hoved" type="submit">Start kartlegging</button>
        <button class="knapp knapp-stille" type="button" id="tilbake">Tilbake</button>
      </div>
    </form>`, { brett: false });
  const form = app.querySelector('form');
  const hentRegelsett = kobleRegelsettVelger(form, k);
  form.onsubmit = (e) => {
    e.preventDefault();
    tilstand.pagaende = Okt.nyOkt(k, Date.now(), { type: 'kartlegging', regelsett: hentRegelsett() });
    lagre();
    vis(spill);
  };
  form.querySelector('#tilbake').onclick = () => vis(hjem);
  topplinje(hjem);
  form.querySelector('[type=submit]').focus();
}

const tallValg = (fra, til, valgt) => Array.from({ length: til - fra + 1 }, (_, i) => fra + i)
  .map((n) => `<option ${n === valgt ? 'selected' : ''}>${n}</option>`).join('');

// Oppsettet holder regelsettene i et utkast til læreren trykker Lagre.
// Ferdige regelsett står alltid i lista og velges med en avkrysning.
function oppsett({ ny = !klasse(), fokus = null } = {}) {
  const k = ny ? nyKlasse() : klasse();
  const inn = k.innstillinger;
  const variant = k.variant ?? 'rolig';

  let rader = [
    ...BIBLIOTEK.map((b) => {
      const eget = k.regelsett.find((r) => r.mal === b.mal);
      return { mal: b.mal, valgt: Boolean(eget), sett: structuredClone(eget ?? fraBibliotek(b.mal)) };
    }),
    ...k.regelsett.filter((r) => !r.mal).map((r) => ({ mal: null, valgt: true, sett: structuredClone(r) })),
  ];

  app.innerHTML = `
    <main class="oppsett">
      <form class="skjema" novalidate>
        <h1>${ny ? 'Sett opp klassen' : 'Oppsett'}</h1>
        <p class="skjema-ingress">Skriv aldri elevnavn her. Appen lagrer bare det som står på denne siden, og bare på denne maskinen.
</p>

        <label class="felt-gruppe">
          <span>Klassenavn</span>
          <input name="navn" required maxlength="20" placeholder="For eksempel 9B" value="${esc(k.navn)}" autocomplete="off" />
        </label>

        <fieldset class="felt-gruppe">
          <legend>Regelsett</legend>
          <p class="hjelp">Velg situasjonene du vil spille i. Før hver økt velger du hvilket regelsett som gjelder.
            Hva som teller som brudd, står bare her, ikke på tavla. Atferd som varer, registreres som nytt brudd hvert 15. sekund.</p>
          <div class="regelsett-liste"></div>
          <div><button class="knapp knapp-stille" type="button" id="nytt-regelsett">Lag eget regelsett</button></div>
        </fieldset>

        <fieldset class="felt-gruppe">
          <legend>Spillform</legend>
          <p class="hjelp">Forskningen fant ingen tydelig forskjell mellom spillformene. Velg den du klarer å gjennomføre.</p>
          <div class="variant-liste">
            <div class="regelsett-kort variant-kort">
              <label class="avkrysning"><input type="radio" name="variant" value="rolig" ${variant === 'rolig' ? 'checked' : ''} />
                <span><strong>Rolig brett</strong><span class="hjelp">Brikken går ett felt for hvert minutt uten brudd. Lettest å gjennomføre alene.</span></span></label>
              <div class="variant-felt">
                <label class="felt-rad"><span>Målfelt</span>
                  <select name="maalfelt">${tallValg(1, 10, inn.maalfelt)}</select></label>
                <p class="hjelp">Felt 7 betyr at klassen tåler tre minutter med brudd.</p>
              </div>
            </div>
            <div class="regelsett-kort variant-kort">
              <label class="avkrysning"><input type="radio" name="variant" value="brudd" ${variant === 'brudd' ? 'checked' : ''} />
                <span><strong>Bruddbrett</strong><span class="hjelp">Hvert brudd teller, og en sky driver inn over fjellet. Klassen ser tellingen og får en felles påminnelse, «Husk reglene», uten at noen pekes ut.</span></span></label>
              <div class="variant-felt">
                <label class="felt-rad"><span>Grense</span>
                  <select name="bruddgrense">${tallValg(3, 20, inn.bruddgrense)}</select></label>
                <p class="hjelp">Klassen vinner med færre brudd enn grensen. I studiene var grensen 10.</p>
              </div>
            </div>
            <div class="regelsett-kort variant-kort">
              <label class="avkrysning"><input type="radio" name="variant" value="lag" ${variant === 'lag' ? 'checked' : ''} />
                <span><strong>Lagspill</strong><span class="hjelp">Hvert lag har sitt stjernebilde på nattehimmelen og får en stjerne for hvert minutt uten brudd. Krevende alene, fordi du må registrere brudd på riktig lag mens du underviser.</span></span></label>
              <div class="variant-felt">
                <div class="felt-rader">
                  <label class="felt-rad"><span>Antall lag</span>
                    <select name="antallLag">${tallValg(2, 3, inn.antallLag)}</select></label>
                  <label class="felt-rad"><span>Stjerner for å vinne</span>
                    <select name="stjernekrav">${tallValg(5, 10, inn.stjernekrav)}</select></label>
                </div>
                <p class="hjelp">Hele klassen trekker klassens valg når minst ett lag når kravet.
                  Del klassen etter hvor elevene sitter. Appen lagrer ikke hvem som er på hvilket lag. To lag gir bedre oversikt enn tre.</p>
              </div>
            </div>
          </div>
        </fieldset>

        <div class="felt-gruppe">
          <label for="klassens-valg"><span class="felt-navn">Klassens valg, ett per linje</span></label>
          <textarea id="klassens-valg" name="klassensValg" rows="6">${esc(k.klassensValg.join('\n'))}</textarea>
          <p class="hjelp">Bruk forslagene elevene har skrevet på lapper. Et godt forslag er realistisk, tar rundt ti minutter og gjelder hele klassen.</p>
          <details class="forslag">
            <summary>Startliste du kan velge fra</summary>
            <ul class="forslag-liste">
              ${FORSLAG.map((f) => `<li><button type="button" class="forslag-knapp">${esc(f)}</button></li>`).join('')}
            </ul>
            <p class="hjelp">Sjekk skolens regler for tilsyn før dere går ut tidlig.
              Unngå fritak fra lekser, prøver eller vurdering, mat og godteri, og alt som gir enkeltelever fordeler.</p>
          </details>
        </div>

        <fieldset class="felt-gruppe">
          <legend>Visning</legend>
          <label class="avkrysning"><input type="checkbox" name="visTidtaker" ${inn.visTidtaker ? 'checked' : ''} /> Vis tiden for elevene</label>
          <label class="avkrysning"><input type="checkbox" name="animasjon" ${inn.animasjon ? 'checked' : ''} /> Animer brikken og sola</label>
          <label class="avkrysning"><input type="checkbox" name="rospaaminnelse" ${inn.rospaaminnelse ? 'checked' : ''} /> Minn meg på å rose klassen</label>
          <p class="hjelp">Hvert andre minutt står det en liten påminnelse ved knappene dine, med forslag til ros ut fra reglene. Ros det klassen gjør riktig.</p>
        </fieldset>

        <p class="skjema-feil" role="alert" hidden></p>
        <div class="hjem-knapper">
          <button class="knapp knapp-hoved" type="submit">Lagre</button>
          <button class="knapp knapp-stille" type="button" id="avbryt">Avbryt</button>
        </div>
        ${ny ? '' : `
          <div class="slett-klasse">
            <button class="lenke" type="button" id="slett">Slett ${esc(k.navn)}</button>
            <p class="hjelp">Sletter klassen, regelsettene og hele loggen på denne maskinen.</p>
          </div>`}
      </form>
      <dialog class="dialog" id="bekreft-slett">
        <p>Slette ${esc(k.navn)} og hele loggen? Dette kan ikke angres. Last ned CSV fra loggen først om du vil ta vare på tallene.</p>
        <form method="dialog" class="hjem-knapper">
          <button class="knapp knapp-hoved" value="ja">Slett klassen</button>
          <button class="knapp knapp-stille" value="nei" autofocus>Behold</button>
        </form>
      </dialog>
    </main>`;

  const form = app.querySelector('form');
  const liste = form.querySelector('.regelsett-liste');

  function tegnRegelsett(apne = -1) {
    liste.innerHTML = rader.map((r, i) => {
      const b = BIBLIOTEK.find((x) => x.mal === r.mal);
      const plasser = Array.from({ length: MAKS_REGLER }, (_, j) => r.sett.regler[j] ?? { tekst: '', brudd: '' });
      return `
        <div class="regelsett-kort${r.valgt ? ' valgt' : ''}">
          <div class="regelsett-hode">
            ${b
              ? `<label class="avkrysning"><input type="checkbox" data-bruk="${i}" ${r.valgt ? 'checked' : ''} />
                  <span><strong>${esc(b.navn)}</strong><span class="hjelp">${esc(b.om)}</span></span></label>`
              : `<input data-navn="${i}" value="${esc(r.sett.navn)}" placeholder="Navn, for eksempel Lab-arbeid" aria-label="Navn på eget regelsett" maxlength="40" />
                 <button class="lenke" type="button" data-fjern="${i}">Fjern</button>`}
          </div>
          <details ${i === apne ? 'open' : ''}>
            <summary>Regler og hva som teller som brudd</summary>
            ${b?.merknad ? `<p class="hjelp regelsett-merknad">${esc(b.merknad)}</p>` : ''}
            <ol class="regel-liste">
              ${plasser.map((p, j) => `
                <li>
                  <label class="regel-felt"><span>Regel</span>
                    <textarea data-regel="${i}.${j}" rows="1" aria-label="Regel ${j + 1}"
                      placeholder="${j === 3 ? 'Fjerde regel, valgfri' : 'Skriv det elevene skal gjøre'}">${esc(p.tekst)}</textarea></label>
                  <label class="regel-felt brudd-felt"><span>Brudd</span>
                    <textarea data-brudd="${i}.${j}" rows="1" aria-label="Hva som teller som brudd på regel ${j + 1}"
                      placeholder="Det du registrerer">${esc(p.brudd)}</textarea></label>
                </li>`).join('')}
            </ol>
          </details>
        </div>`;
    }).join('');
  }

  // Leser det som står i feltene tilbake til utkastet, før lista tegnes på nytt eller lagres.
  function lesRegelsett() {
    rader = rader.map((r, i) => ({
      ...r,
      valgt: r.mal ? liste.querySelector(`[data-bruk="${i}"]`).checked : true,
      sett: {
        ...r.sett,
        navn: r.mal ? r.sett.navn : liste.querySelector(`[data-navn="${i}"]`).value.trim(),
        regler: Array.from({ length: MAKS_REGLER }, (_, j) => ({
          tekst: liste.querySelector(`[data-regel="${i}.${j}"]`).value.trim(),
          brudd: liste.querySelector(`[data-brudd="${i}.${j}"]`).value.trim(),
        })).filter((x) => x.tekst || x.brudd),
      },
    }));
  }

  tegnRegelsett();
  // Feltene vokser med teksten, men en regel og et brudd er én linje hver.
  liste.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('textarea')) e.preventDefault();
  });
  liste.addEventListener('change', (e) => {
    if (e.target.dataset.bruk) e.target.closest('.regelsett-kort').classList.toggle('valgt', e.target.checked);
  });
  liste.addEventListener('click', (e) => {
    const i = e.target.dataset.fjern;
    if (i === undefined) return;
    lesRegelsett();
    rader.splice(Number(i), 1);
    tegnRegelsett();
    form.querySelector('#nytt-regelsett').focus();
  });
  form.querySelector('#nytt-regelsett').onclick = () => {
    lesRegelsett();
    rader.push({ mal: null, valgt: true, sett: egetRegelsett() });
    tegnRegelsett(rader.length - 1);
    liste.querySelector(`[data-navn="${rader.length - 1}"]`).focus();
  };

  const valgFelt = form.elements.klassensValg;
  const merkForslag = () => {
    const linjer = valgFelt.value.split('\n').map((s) => s.trim());
    form.querySelectorAll('.forslag-knapp').forEach((b) => { b.disabled = linjer.includes(b.textContent); });
  };
  merkForslag();
  valgFelt.addEventListener('input', merkForslag);
  form.querySelector('.forslag-liste').addEventListener('click', (e) => {
    const b = e.target.closest('.forslag-knapp');
    if (!b) return;
    valgFelt.value = `${valgFelt.value.trimEnd()}${valgFelt.value.trim() ? '\n' : ''}${b.textContent}`;
    merkForslag();
  });

  // Endringer i feltene eller regelsettene gjør at Tilbake spør før de forkastes.
  let endret = false;
  form.addEventListener('input', () => { endret = true; });
  form.addEventListener('change', () => { endret = true; });
  form.addEventListener('click', (e) => { if (e.target.closest('#nytt-regelsett, [data-fjern], .forslag-knapp')) endret = true; });
  forlat = (videre) => (endret ? bekreftForlat(videre) : videre());
  topplinje(hjem);
  form.querySelector('#avbryt').addEventListener('click', () => forlat(() => vis(hjem)));
  const slett = app.querySelector('#bekreft-slett');
  form.querySelector('#slett')?.addEventListener('click', () => slett.showModal());
  slett.addEventListener('close', () => {
    if (slett.returnValue !== 'ja') return;
    tilstand.klasser = tilstand.klasser.filter((x) => x !== k);
    tilstand.aktivKlasseId = tilstand.klasser[0]?.id ?? null;
    lagre();
    vis(hjem);
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    lesRegelsett();
    const f = new FormData(form);
    const navn = f.get('navn').trim();
    const valgte = rader.filter((r) => r.valgt);
    const feil = form.querySelector('.skjema-feil');
    const visFeil = (tekst, felt) => {
      feil.textContent = tekst;
      feil.hidden = false;
      felt.closest('details')?.setAttribute('open', '');
      felt.focus();
    };

    if (!navn) return visFeil('Klassen trenger et navn.', form.elements.navn);
    if (!valgte.length) return visFeil('Velg minst ett regelsett.', liste.querySelector('[data-bruk]'));
    for (const r of valgte) {
      const i = rader.indexOf(r);
      if (!r.sett.navn) return visFeil('Gi det egne regelsettet et navn.', liste.querySelector(`[data-navn="${i}"]`));
      const tomme = r.sett.regler.findIndex((x) => !x.tekst);
      if (r.sett.regler.filter((x) => x.tekst).length < 3 || tomme !== -1) {
        tegnRegelsett(i);
        const j = tomme !== -1 ? tomme : r.sett.regler.length;
        return visFeil(`${r.sett.navn} trenger tre regler. En fjerde er valgfri.`, liste.querySelector(`[data-regel="${i}.${Math.min(j, 3)}"]`));
      }
    }

    k.navn = navn;
    k.regelsett = valgte.map((r) => r.sett);
    const valg = f.get('klassensValg').split('\n').map((s) => s.trim()).filter(Boolean);
    if (valg.length && valg.join() !== k.klassensValg.join()) {
      k.sisteBelonningskartlegging = new Date().toISOString().slice(0, 10);
    }
    k.klassensValg = valg;
    k.variant = f.get('variant');
    inn.maalfelt = Number(f.get('maalfelt'));
    inn.bruddgrense = Number(f.get('bruddgrense'));
    inn.antallLag = Number(f.get('antallLag'));
    inn.stjernekrav = Number(f.get('stjernekrav'));
    inn.visTidtaker = f.has('visTidtaker');
    inn.animasjon = f.has('animasjon');
    inn.rospaaminnelse = f.has('rospaaminnelse');
    if (ny) tilstand.klasser.push(k);
    tilstand.aktivKlasseId = k.id;
    lagre();
    vis(hjem);
  };
  const start = fokus ? form.elements[fokus] : form.elements.navn;
  start.focus();
  if (fokus) start.scrollIntoView({ block: 'center' });
}

// ---------- Spill ----------

function klokke(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const LAGTASTER = [[' ', 'ArrowDown', 'PageDown', '1'], ['ArrowUp', 'PageUp', '2'], ['3']];
const ROS_START = 30_000;
const ROS_HVERT = 120_000;
const ROS_VARER = 12_000;
const PAMINNELSE_VARER = 3500;

// Tellingen på bruddbrettet og regelen for lagspillet. Skyene og
// stjernebildene i landskapet viser resten.
function maaler(okt) {
  if (okt.variant === 'brudd') {
    return `
      <section class="maaler maaler-brudd" aria-label="Brudd">
        <p class="maaler-tall"><span class="maaler-n">0</span> brudd</p>
        <ol class="brudd-rekke" aria-hidden="true">${Array.from({ length: okt.bruddgrense }, (_, i) =>
          `<li class="${i === okt.bruddgrense - 1 ? 'grense' : ''}"></li>`).join('')}<li class="over" hidden></li></ol>
        <p class="maaler-tekst">Under ${okt.bruddgrense} brudd, så trekker dere klassens valg.</p>
        <p class="paminnelse" aria-live="polite">Husk reglene</p>
      </section>`;
  }
  return `
    <section class="maaler maaler-lag">
      <p class="maaler-tekst">Minst ett lag med ${okt.stjernekrav} stjerner, så trekker hele klassen klassens valg.</p>
    </section>`;
}

function spill() {
  let okt = tilstand.pagaende;
  const k = tilstand.klasser.find((x) => x.id === okt.klasseId) ?? klasse();
  const kartlegging = okt.type === 'kartlegging';
  // Økter startet før spillformene fantes, er rolig brett.
  const variant = kartlegging ? null : (okt.variant ?? 'rolig');
  const lag = Okt.antallLag(okt);
  // Økter startet før versjon 2 har ikke regelsettet med seg.
  const rs = okt.regelsett ?? (({ navn, regler }) => ({ navn, regler: regler.map((r) => r.tekst) }))(regelsettFor(k));
  const ros = k.innstillinger.rospaaminnelse && !kartlegging;
  // Brettet trenger hele skjermen, så bunnteksten skjules under økta.
  document.body.classList.add('uten-bunntekst');

  app.innerHTML = `
    <main class="spill${kartlegging ? ' spill-kartlegging' : ` spill-${variant}`}">
      <div class="brett">
        <header class="brett-topp">
          <h1 class="brett-klasse">${esc(k.navn)}</h1>
          <p class="brett-tid" ${k.innstillinger.visTidtaker || kartlegging ? '' : 'hidden'} aria-live="off"></p>
        </header>
        ${variant === 'brudd' || variant === 'lag' ? maaler(okt) : ''}
        <div class="nedtelling" aria-live="assertive"></div>
        <div class="pause-lag" hidden><p>Pause</p></div>
        <section class="resultat" hidden aria-live="polite"></section>
        <aside class="styring" aria-label="Lærerens knapper">
          ${ros ? '<p class="ros" hidden></p>' : ''}
          <span class="markering" aria-hidden="true"></span>
          ${lag > 1
            ? Array.from({ length: lag }, (_, l) => `
              <button class="knapp-brudd" data-lag="${l}" title="${['Mellomrom, pil ned eller 1', 'Pil opp eller 2', '3'][l]}">Brudd lag ${l + 1}</button>`).join('')
            : '<button class="knapp-brudd" data-lag="0" title="Mellomrom, pil ned eller Page Down">Brudd</button>'}
          <button class="knapp-liten" id="pause" title="P">Pause</button>
          <button class="knapp-liten" id="avslutt" title="Esc">Avslutt</button>
        </aside>
      </div>
      ${kartlegging ? '' : `
        <footer class="regler">
          <p class="regler-navn">${esc(rs.navn)}</p>
          <ol style="--antall: ${rs.regler.length}">${rs.regler.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>
        </footer>`}
      <dialog class="dialog" id="bekreft">
        <p>Avslutte ${kartlegging ? 'kartleggingen' : 'økten'} nå? Den blir ikke lagret i loggen.</p>
        <form method="dialog" class="hjem-knapper">
          <button class="knapp knapp-hoved" value="ja">Avslutt ${kartlegging ? 'kartleggingen' : 'økten'}</button>
          <button class="knapp knapp-stille" value="nei" autofocus>Fortsett</button>
        </form>
      </dialog>
    </main>`;

  const brett = app.querySelector('.brett');
  const svg = lagLandskap(okt.maalfelt, {
    brett: variant === 'rolig',
    skyer: variant === 'brudd' ? okt.bruddgrense : 0,
    lag: variant === 'lag' ? lag : 0,
    intervaller: okt.intervaller,
  });
  brett.prepend(svg);
  const brikke = svg.querySelector('.brikke');
  const rosEl = app.querySelector('.ros');
  const paminnelse = app.querySelector('.paminnelse');
  const sol = svg.querySelector('.sol');
  const tidEl = app.querySelector('.brett-tid');
  const nedtelling = app.querySelector('.nedtelling');
  const markering = app.querySelector('.markering');
  const pauseLag = app.querySelector('.pause-lag');
  const bekreft = app.querySelector('#bekreft');

  let vistFelt = null;
  let flytting = null;
  let ferdigVist = false;

  function oppdater(o) {
    okt = o;
    tilstand.pagaende = o;
    lagre();
    tegn();
  }

  function settBrikke(felt) {
    const [x, y] = punkt(felt);
    brikke.setAttribute('transform', `translate(${x} ${y})`);
  }

  function gaaTil(felt) {
    svg.querySelectorAll('.sti-gatt').forEach((s) =>
      s.classList.toggle('gatt', Number(s.dataset.segment) < felt));
    svg.querySelectorAll('.felt').forEach((f) =>
      f.classList.toggle('naadd', Number(f.dataset.felt) <= felt));

    if (vistFelt === null || felt <= vistFelt || redusertBevegelse()) {
      cancelAnimationFrame(flytting);
      settBrikke(felt);
    } else {
      // Rolig gange langs stisegmentet fra forrige felt.
      const seg = svg.querySelector(`[data-segment="${felt - 1}"]`);
      const lengde = seg.getTotalLength();
      const t0 = performance.now();
      const varighet = 2200;
      cancelAnimationFrame(flytting);
      const steg = (naa) => {
        const u = Math.min(1, (naa - t0) / varighet);
        const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        const p = seg.getPointAtLength(e * lengde);
        brikke.setAttribute('transform', `translate(${p.x} ${p.y})`);
        if (u < 1) flytting = requestAnimationFrame(steg);
      };
      flytting = requestAnimationFrame(steg);
    }
    vistFelt = felt;
  }

  function tegn() {
    const naa = Date.now();
    const t = Okt.spilltid(okt, naa);
    const varighet = Okt.varighetMs(okt);
    const andel = Math.max(0, Math.min(1, t / varighet));

    nedtelling.textContent = t < 0 ? Math.ceil(-t / 1000) : '';
    nedtelling.hidden = t >= 0;
    tidEl.textContent = klokke(varighet - Math.max(0, t));

    // Sola vandrer over himmelen, og lyset går mot kveld. På bruddbrettet går
    // den lavere, under tellingen. I lagspillet står månen stille, og
    // stjernebildene viser tiden.
    const solAndel = k.innstillinger.visTidtaker && !kartlegging ? andel : 0.18;
    const [solTopp, solHoyde] = variant === 'brudd' ? [400, 170] : [330, 220];
    sol.setAttribute('transform', variant === 'lag' ? 'translate(1490 250) scale(0.8)'
      : `translate(${220 + solAndel * 1160} ${solTopp - Math.sin(Math.PI * (0.12 + solAndel * 0.76)) * solHoyde})`);
    svg.style.setProperty('--kveld-styrke', k.innstillinger.visTidtaker && !kartlegging ? andel : 0);

    if (variant === 'rolig') {
      const felt = Okt.posisjon(okt, naa);
      if (felt !== vistFelt) gaaTil(felt);
    } else if (variant === 'brudd') {
      tegnBrudd(t);
    } else if (variant === 'lag') {
      tegnLag(naa);
    }

    const prikker = (n) => '•'.repeat(Math.min(n, 5)) + (n > 5 ? '+' : '');
    if (kartlegging) {
      markering.textContent = okt.brudd.length || '';
    } else if (lag > 1) {
      markering.textContent = Array.from({ length: lag }, (_, l) => prikker(Okt.bruddIGjeldendeIntervall(okt, naa, l)) || '·').join(' | ');
    } else {
      markering.textContent = prikker(Okt.bruddIGjeldendeIntervall(okt, naa));
    }

    if (rosEl) {
      const vis = okt.pauseFra === null && t >= ROS_START && t < varighet && (t - ROS_START) % ROS_HVERT < ROS_VARER;
      if (vis && rosEl.hidden) {
        const regel = rs.regler[Math.floor((t - ROS_START) / ROS_HVERT) % rs.regler.length];
        rosEl.innerHTML = `<strong>Hvem følger reglene nå? Si det.</strong> ${esc(rosForslag(regel))}`;
      }
      rosEl.hidden = !vis;
    }

    pauseLag.hidden = okt.pauseFra === null;
    app.querySelector('#pause').textContent = okt.pauseFra === null ? 'Pause' : 'Fortsett';

    if (Okt.erFerdig(okt, naa) && !ferdigVist) {
      ferdigVist = true;
      if (rosEl) rosEl.hidden = true;
      if (kartlegging) visKartleggingFerdig();
      else setTimeout(visResultat, redusertBevegelse() || variant !== 'rolig' ? 0 : 2600);
    }
  }

  function tegnBrudd(t) {
    const n = okt.brudd.length;
    const grense = okt.bruddgrense;
    app.querySelector('.maaler-n').textContent = n;
    app.querySelectorAll('.brudd-rekke li:not(.over)').forEach((li, i) => li.classList.toggle('brukt', i < n));
    const over = app.querySelector('.brudd-rekke .over');
    over.hidden = n <= grense;
    over.textContent = `+${n - grense}`;
    svg.querySelectorAll('.sky').forEach((sky, i) => sky.classList.toggle('kommet', i < n));
    svg.style.setProperty('--skyandel', Math.min(1, n / grense));
    // Påminnelsen står en kort stund etter hvert brudd. Den regnes ut fra klokka, som resten av spillet.
    const siste = okt.brudd.at(-1);
    const tSiste = typeof siste === 'number' ? siste : siste?.t;
    paminnelse.classList.toggle('synlig', siste !== undefined && t - tSiste < PAMINNELSE_VARER && !Okt.erFerdig(okt));
  }

  function tegnLag(naa) {
    const fullfort = Okt.fullforteIntervaller(okt, naa);
    const t = Okt.spilltid(okt, naa);
    const naavaerende = t >= 0 && !Okt.erFerdig(okt, naa) ? Okt.intervallFor(okt, t) : -1;
    svg.querySelectorAll('.stjernebilde').forEach((bilde) => {
      const l = Number(bilde.dataset.lag);
      const telling = Okt.bruddPerIntervall(okt, l);
      const stjerner = Okt.posisjon(okt, naa, l);
      const fikk = (i) => i < fullfort && !telling[i];
      bilde.querySelectorAll('.bilde-punkt').forEach((p, i) => {
        p.setAttribute('class', `bilde-punkt ${fikk(i) ? 'fikk' : telling[i] && i <= Math.max(fullfort - 1, naavaerende) ? 'tapt' : i === naavaerende ? 'naa' : 'kommer'}`);
      });
      bilde.querySelectorAll('.bilde-linje').forEach((linje, i) => linje.classList.toggle('tent', fikk(i) && fikk(i + 1)));
      const vunnet = stjerner >= okt.stjernekrav;
      bilde.classList.toggle('vunnet', vunnet);
      bilde.querySelector('.bilde-navn').textContent = `Lag ${l + 1}${vunnet ? ' ✓' : ''}`;
      bilde.querySelector('.lag-tall').textContent = vunnet ? `${stjerner} stjerner` : `${stjerner} av ${okt.stjernekrav}`;
    });
  }

  function visKartleggingFerdig() {
    const panel = app.querySelector('.resultat');
    app.querySelector('.styring').hidden = true;
    panel.hidden = false;
    const n = okt.brudd.length;
    panel.innerHTML = `
      <h2>Kartlegging ferdig</h2>
      <p>${n === 1 ? 'Ett brudd' : `${n} brudd`} på ti minutter.</p>
      <button class="knapp knapp-hoved" id="ferdig">Se loggen</button>`;
    const knapp = panel.querySelector('#ferdig');
    knapp.onclick = () => {
      k.okter.push(Okt.tilLoggpost(okt));
      tilstand.pagaende = null;
      lagre();
      vis(logg);
    };
    knapp.focus();
  }

  function ikkeNaadd() {
    if (variant === 'brudd') return `Dere hadde ${okt.brudd.length} brudd. Grensen var ${okt.bruddgrense}.`;
    if (variant === 'lag') {
      const s = Array.from({ length: lag }, (_, l) => `lag ${l + 1} fikk ${Okt.posisjon(okt, Infinity, l)}`);
      return `Det trengs ${okt.stjernekrav} stjerner. ${s.join(', ').replace(/^l/, 'L').replace(/, ([^,]*)$/, ' og $1')}.`;
    }
    return `Brikken kom til felt ${Okt.posisjon(okt)}.`;
  }

  function visResultat() {
    const panel = app.querySelector('.resultat');
    const naadd = Okt.maalNaadd(okt);
    app.querySelector('.styring').hidden = true;
    app.querySelector('.spill').classList.add('ferdig');
    panel.hidden = false;

    const avslutt = (valg) => {
      k.okter.push(Okt.tilLoggpost(okt, valg));
      tilstand.pagaende = null;
      lagre();
      vis(hjem);
    };

    if (!naadd || k.klassensValg.length === 0) {
      panel.innerHTML = `
        <h2>${naadd ? 'Dere har tjent klassens valg' : 'Vi prøver igjen neste gang'}</h2>
        <p>${naadd ? 'Listen med klassens valg er tom. Legg den inn i oppsettet.' : ikkeNaadd()}</p>
        <button class="knapp knapp-hoved" id="ferdig">Ferdig</button>`;
      panel.querySelector('#ferdig').onclick = () => avslutt(null);
      panel.querySelector('#ferdig').focus();
      return;
    }

    panel.innerHTML = `
      <h2>Dere har tjent klassens valg</h2>
      <div class="trommel" aria-live="polite"><span class="trommel-tekst">?</span></div>
      <button class="knapp knapp-hoved" id="trekk">Trekk</button>`;
    const knapp = panel.querySelector('#trekk');
    const tekst = panel.querySelector('.trommel-tekst');
    knapp.focus();
    knapp.onclick = () => {
      knapp.disabled = true;
      const liste = k.klassensValg;
      const valgt = liste[Math.floor(Math.random() * liste.length)];
      const ferdig = () => {
        tekst.textContent = valgt;
        panel.classList.add('trukket');
        knapp.textContent = 'Ferdig';
        knapp.disabled = false;
        knapp.onclick = () => avslutt(valgt);
        knapp.focus();
      };
      if (redusertBevegelse() || liste.length === 1) return ferdig();
      // Lista ruller og bremser rolig ned før den stopper på valget.
      const steg = 16;
      let i = Math.floor(Math.random() * liste.length);
      let vent = 90;
      const rull = (igjen) => {
        if (igjen === 0) return ferdig();
        tekst.textContent = liste[i++ % liste.length];
        tekst.animate([{ transform: 'translateY(-40%)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: Math.min(vent, 320), easing: 'ease-out' });
        vent *= 1.17;
        setTimeout(() => rull(igjen - 1), vent);
      };
      rull(steg);
    };
  }

  function veksle() {
    if (Okt.erFerdig(okt)) return;
    oppdater(okt.pauseFra === null ? Okt.pause(okt) : Okt.fortsett(okt));
  }

  function spor() {
    if (bekreft.open) return;
    if (okt.pauseFra === null) oppdater(Okt.pause(okt));
    bekreft.showModal();
  }

  bekreft.addEventListener('close', () => {
    if (bekreft.returnValue === 'ja') {
      tilstand.pagaende = null;
      lagre();
      vis(hjem);
    } else if (okt.pauseFra !== null) {
      oppdater(Okt.fortsett(okt));
    }
  });
  // Esc lukker dialogen uten valg; da fortsetter spillet.
  bekreft.addEventListener('cancel', () => { bekreft.returnValue = 'nei'; });

  app.querySelectorAll('.knapp-brudd').forEach((b) => {
    b.onclick = () => { oppdater(Okt.registrerBrudd(okt, Date.now(), Number(b.dataset.lag))); b.blur(); };
  });
  app.querySelector('#pause').onclick = (e) => { veksle(); e.currentTarget.blur(); };
  app.querySelector('#avslutt').onclick = spor;

  const taster = (e) => {
    if (bekreft.open || !app.querySelector('.resultat').hidden) return;
    const l = LAGTASTER.findIndex((t) => t.includes(e.key));
    if (l !== -1 && (l < lag || ['ArrowUp', 'PageUp'].includes(e.key))) {
      e.preventDefault(); // fjernkontrollen skal ikke rulle siden
      if (l < lag) oppdater(Okt.registrerBrudd(okt, Date.now(), l));
    } else if (e.key === 'p' || e.key === 'P') {
      veksle();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      spor();
    } else if (['ArrowUp', 'PageUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault(); // fjernkontrollen skal ikke rulle siden
    }
  };
  document.addEventListener('keydown', taster);

  // Hold skjermen våken under økten der nettleseren støtter det.
  let vaaken = null;
  const hold = () => navigator.wakeLock?.request('screen').then((l) => { vaaken = l; }).catch(() => {});
  hold();
  const synlig = () => { if (!document.hidden) { hold(); tegn(); } };
  document.addEventListener('visibilitychange', synlig);

  const tikk = setInterval(tegn, 250);
  tegn();

  stopp = () => {
    clearInterval(tikk);
    cancelAnimationFrame(flytting);
    document.removeEventListener('keydown', taster);
    document.removeEventListener('visibilitychange', synlig);
    vaaken?.release().catch(() => {});
  };
}

// ---------- Veiledning ----------

function veiledningSide(tilbake) {
  app.innerHTML = veiledning(klasse());
  topplinje(tilbake);
  app.querySelector('#vis-opplaering').onclick = opplaering;
  app.querySelector('#til-elev').onclick = tilElev;
  // Lenkene i innholdslista ruller innenfor siden uten å endre adressen.
  app.querySelector('.veil-innhold').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const maal = app.querySelector(a.getAttribute('href'));
    maal.scrollIntoView({ behavior: redusertBevegelse() ? 'auto' : 'smooth' });
    maal.querySelector('h2').focus({ preventScroll: true });
  });
  app.querySelectorAll('.veil-tekst h2').forEach((h) => { h.tabIndex = -1; });
  window.scrollTo(0, 0);
  app.querySelector('#topp-tilbake').focus();
}

function elevSide(tilbake) {
  const k = klasse();
  app.innerHTML = elevveiledning(k && {
    variant: k.variant ?? 'rolig', innstillinger: k.innstillinger, regler: regelsettFor(k).regler.map((r) => r.tekst),
  });
  topplinje(tilbake);
  const hel = app.querySelector('#fullskjerm');
  if (!document.fullscreenEnabled) hel.hidden = true;
  hel.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  window.scrollTo(0, 0);
  app.querySelector('#topp-tilbake').focus();
}

// ---------- Logg ----------

function lastNed(navn, innhold) {
  const url = URL.createObjectURL(new Blob([innhold], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: navn });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const TABELLDATO = new Intl.DateTimeFormat('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
const tall = (n) => n.toLocaleString('nb-NO', { maximumFractionDigits: 1 });

function kartleggingsvurdering(okter) {
  const antall = okter.filter((o) => o.type === 'kartlegging').length;
  const o = Logg.kartleggingsoppsummering(okter);
  if (!antall) return '';
  if (!o) {
    return `
      <section class="vurdering">
        <h2>Kartlegging</h2>
        <p>Du har gjort ${antall} av minst ${Logg.KARTLEGGINGER_FOR_VURDERING} kartlegginger. Gjør resten på ulike dager før du vurderer om klassen trenger spillet.</p>
      </section>`;
  }
  return `
    <section class="vurdering">
      <h2>Trenger klassen spillet?</h2>
      <dl class="vurdering-tall">
        <div><dt>Snitt</dt><dd>${tall(o.snitt)}</dd></div>
        <div><dt>Lavest</dt><dd>${o.lavest}</dd></div>
        <div><dt>Høyest</dt><dd>${o.hoyest}</dd></div>
      </dl>
      <p class="hjelp">Brudd per kartlegging, de ${o.antall} siste.</p>
      <p>I studiene lå klassene som fikk tiltaket på 39 til 142 brudd per ti minutter før spillet, og stort sett på 0 til 21 under spillet.
        Tallene ble registrert av trenede observatører i barneskoleklasser. De er ikke en grense for når en klasse trenger spillet.
        Se på om tallene dine er stabile over flere målinger, og vurder selv.</p>
      <p>Et lavt og stabilt nivå tyder på at klassen ikke trenger spillet. Spiller dere, viser diagrammet om bruddene går ned.</p>
      <details class="forbehold">
        <summary>Forbehold og kilder</summary>
        <ul>
          <li>Observatørene i studiene var trent i to uker, satt bakerst og underviste ikke. En lærer som underviser samtidig, registrerer trolig færre brudd enn det som faktisk skjer.</li>
          <li>Tallene kan bare sammenlignes når brudd defineres og registreres likt, blant annet med nytt brudd hvert 15. sekund når atferden varer.</li>
          <li>Alle klassene gikk på barnetrinnet, og spillet ble ledet av studenter, ikke lærere.</li>
          <li>Grunnlaget er fire klasser.</li>
          <li>Stabilitet og trend betyr like mye som nivået. Forskerne utelot også klasser der tallene steg eller svinget mye.</li>
        </ul>
        <p class="hjelp">Stangjordet, Isaksen og Strømgren (2026) og Isaksen mfl. (2026), Norsk Tidsskrift for Atferdsanalyse 53, s. 31–57.</p>
      </details>
    </section>`;
}

function logg() {
  const k = klasse();
  const okter = Logg.sortert(k.okter);
  const jaNei = (v) => (v === true ? 'Ja' : v === false ? 'Nei' : '');

  app.innerHTML = `
    <main class="logg">
      <header class="logg-topp">
        <h1>Logg for ${esc(k.navn)}</h1>
        <div class="hjem-knapper">
          ${okter.length ? '<button class="knapp knapp-stille" id="csv">Last ned CSV</button>' : ''}
        </div>
      </header>
      ${okter.length === 0 ? `
        <section class="logg-tom">
          <p>Ingen økter ennå. Loggen fylles når du fullfører en økt eller en kartlegging.</p>
          <div class="hjem-knapper">
            <button class="knapp knapp-stille" id="kartlegg">Kartlegg klassen</button>
          </div>
        </section>` : `
        ${kartleggingsvurdering(okter)}
        <section class="logg-diagram">
          <h2>Brudd per økt</h2>
          <div class="diagram"></div>
        </section>
        <section class="logg-tabell">
          <h2>Alle økter</h2>
          <div class="tabell-rull">
            <table>
              <thead><tr><th scope="col">Dato</th><th scope="col">Type</th><th scope="col" class="tall">Brudd</th>
                <th scope="col" class="tall">Minutter med brudd</th><th scope="col">Mål nådd</th><th scope="col">Sjekkliste</th><th scope="col">Klassens valg</th></tr></thead>
              <tbody>${[...okter].reverse().map((o) => `
                <tr>
                  <td class="dato">${TABELLDATO.format(new Date(o.start))} ${Logg.klokkeslett(new Date(o.start))}</td>
                  <td>${o.type === 'kartlegging' ? 'Kartlegging' : 'Spill'}
                    ${o.regelsettNavn ? `<span class="tabell-under">${esc(o.regelsettNavn)}</span>` : ''}</td>
                  <td class="tall">${Logg.bruddTotalt(o)}</td>
                  <td class="tall">${Logg.minutterMedBrudd(o)} av ${o.intervaller.length}</td>
                  <td>${jaNei(o.maalNaadd)}</td>
                  <td>${o.sjekklisteFullfort === null ? '' : o.sjekklisteFullfort ? 'Fullført' : 'Ikke fullført'}</td>
                  <td>${esc(o.klassensValg ?? '')}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </section>`}
    </main>`;

  topplinje(hjem);
  app.querySelector('#kartlegg')?.addEventListener('click', () => vis(kartleggingStart));
  app.querySelector('#csv')?.addEventListener('click', () =>
    lastNed(`klassespillet-${k.navn.replace(/[^\p{L}\p{N}]+/gu, '')}-${Logg.dato(new Date())}.csv`, Logg.tilCsv(k)));
  const beholder = app.querySelector('.diagram');
  if (beholder) stopp = lagDiagram(beholder, okter);
  app.querySelector('#topp-tilbake').focus();
}

document.querySelector('#om').onclick = visOm;
vis(tilstand.pagaende ? spill : velkomst);

// Frakoblet bruk. Ikke på localhost, så endringer under utvikling vises med en gang.
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
