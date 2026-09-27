// Veiledningen. Tallene og påstandene er hentet fra forskningsgrunnlag.md,
// og tall fra studiene står alltid sammen med kilde og forbehold.

import { BIBLIOTEK } from './regler.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Kildene i forskningsgrunnlag.md, med lenke til fulltekst. KILDER er de to artiklene
// tallene er hentet fra. OMTALTE er studier som bare er gjengitt i dem.
const KILDER = [
  ['Stangjordet, P., Isaksen, J. og Strømgren, B. (2026). Effektforskjeller mellom Caught Being Good Game, Good Behavior Board Game og en modifisert versjon av Good Behavior Board Game på elever i grunnskolen.',
    'Norsk Tidsskrift for Atferdsanalyse', '53, 43–57.', 'https://nta.atferd.no/getFile.ashx?IdFile=3100'],
  ['Isaksen, J., Stangjordet, P., Johannessen, T. M., Majkic, K., Ottersen, K. O. og Viken, K. (2026). Hvilken effekt har Caught Being Good Game og Good Behavior Board Game på forstyrrende atferd og arbeidsro på sjette trinn i barneskolen?',
    'Norsk Tidsskrift for Atferdsanalyse', '53, 31–42.', 'https://nta.atferd.no/getFile.ashx?IdFile=3099'],
];

const OMTALTE = [
  ['Viken, K., Johannessen, T. M., Fredheim, O. R., Vorum, I., Ottersen, K.-O. og Isaksen, J. (2024). Hvilken effekt har Caught Being Good Game på forstyrrende atferd i klasserommet?',
    'Norsk Tidsskrift for Atferdsanalyse', '51, 205–222.', 'https://nta.atferd.no/getFile.ashx?IdFile=2920'],
  ['Strømgren, B. og Sørheim, D. G. (2015). Evaluering av the Good Behavior Board Game, en variant av the Good Behavior Game.',
    'Norsk Tidsskrift for Atferdsanalyse', '42, 1–19.', 'https://nta.atferd.no/getFile.ashx?IdFile=1270'],
  ['Berge, V. R. og Ødegård, E. P. (2024). Good Behavior Game med elementer fra PAX: Et tilpasset klasseromstiltak.',
    'Norsk Tidsskrift for Atferdsanalyse', '51, 57–69.', 'https://nta.atferd.no/getFile.ashx?IdFile=2910'],
  ['Barrish, H. H., Saunders, M. og Wolf, M. M. (1969). Good Behavior Game: Effects of individual contingencies for group consequences on disruptive behavior in a classroom.',
    'Journal of Applied Behavior Analysis', '2, 119–124.', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1311049/'],
  ['Cipani, E. (2010). The Class-wide Good Behavior Board Game.', 'ERIC', 'ED512078.', 'https://files.eric.ed.gov/fulltext/ED512078.pdf'],
  ['Ford, W. B., Radley, K. C., Tingstrom, D. H. og Dufrene, B. A. (2020). Efficacy of a no-team version of the Good Behavior Game in high school classrooms.',
    'Journal of Positive Behavior Interventions', '22(3), 181–190.', 'https://doi.org/10.1177/1098300719890059'],
  ['Bowman-Perrott, L., Burke, M. D., Zaini, S., Zhang, N. og Vannest, K. (2016). Promoting positive behavior using the Good Behavior Game: A meta-analysis of single-case research.',
    'Journal of Positive Behavior Interventions', '18(3), 180–190.', 'https://doi.org/10.1177/1098300715592355'],
  ['Kellam, S. G., Mackenzie, A. C., Brown, C. H., Poduska, J. M., Wang, W., Petras, H. og Wilcox, H. C. (2011). The Good Behavior Game and the future of prevention and treatment.',
    'Addiction Science & Clinical Practice', '6(1), 73–84.', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3188824/'],
  ['Kellam, S. G., Wang, W., Mackenzie, A. C. L., Brown, C. H., Ompad, D. C., Or, F., Ialongo, N. S., Poduska, J. M. og Windham, A. (2014). The impact of the Good Behavior Game, a universal classroom-based preventive intervention in first and second grades, on high-risk sexual behaviors and drug abuse and dependence disorders into young adulthood.',
    'Prevention Science', '15(1), 6–18.', 'https://doi.org/10.1007/s11121-012-0296-z'],
];

const kilde = ([ref, tidsskrift, rest, url]) =>
  `<li>${esc(ref)} <cite>${esc(tidsskrift)}</cite>, ${esc(rest)} <a href="${url}" target="_blank" rel="noopener">Les artikkelen</a></li>`;

export const AVSNITT = [
  ['for-start', 'Før første økt'],
  ['spille', 'Slik spiller du'],
  ['registrere', 'Slik registrerer du brudd'],
  ['rose', 'Ros det som går bra'],
  ['valg', 'Klassens valg'],
  ['regler', 'Reglene og hva som er brudd'],
  ['forskning', 'Hva forskningen viser'],
  ['personvern', 'Personvern'],
];

function regelsett(liste) {
  return liste.map((rs) => `
    <div class="veil-regelsett">
      <h3>${esc(rs.navn)}</h3>
      ${rs.merknad ? `<p class="hjelp">${esc(rs.merknad)}</p>` : ''}
      <ol>${rs.regler.map((r) => `
        <li><strong>${esc(r.tekst)}</strong>
          <span class="veil-brudd">${r.brudd ? `Brudd: ${esc(r.brudd)}` : 'Ingen definisjon ennå. Skriv den i oppsettet.'}</span></li>`).join('')}
      </ol>
    </div>`).join('');
}

// klasse kan være null før første oppsett. Da vises regelbiblioteket.
export function veiledning(klasse) {
  const sett = klasse?.regelsett.length
    ? klasse.regelsett.map((rs) => ({ ...rs, merknad: BIBLIOTEK.find((b) => b.mal === rs.mal)?.merknad }))
    : BIBLIOTEK;

  return `
    <main class="veiledning">
      <header class="veil-topp">
        <h1>Lærerveiledning</h1>
        <p class="skjema-ingress">Klassespillet bygger på Good Behavior Game. Klassen spiller sammen om å følge tre regler i ti minutter.
          Når de klarer det, trekker dere noe fra en liste elevene selv har foreslått.</p>
        <div class="hjem-knapper">
          <button class="knapp knapp-stille" id="vis-opplaering">Kort gjennomgang</button>
          <button class="knapp knapp-stille" id="til-elev">Elevveiledning til tavla</button>
        </div>
      </header>

      <nav class="veil-innhold" aria-label="Innhold">
        <ol>${AVSNITT.map(([id, navn]) => `<li><a href="#${id}">${navn}</a></li>`).join('')}</ol>
      </nav>

      <div class="veil-tekst">
        <section id="for-start">
          <h2>Før første økt</h2>
          <ol class="veil-steg">
            <li><strong>Kartlegg klassen.</strong> Tell brudd i ti minutter vanlig undervisning, uten spill, på tre til fem ulike dager.
              I den ene norske studien trengte halvparten av klassene som ble kartlagt, ikke tiltaket. Kartleggingen hjelper deg å se om din klasse gjør det.</li>
            <li><strong>Velg regler.</strong> Bruk et ferdig regelsett eller lag et eget. Tre regler er nok. Flere gjør det vanskeligere å registrere likt.</li>
            <li><strong>Samle forslag til klassens valg.</strong> La elevene skrive forslag på lapper, og legg inn dem som passer.</li>
            <li><strong>Gå gjennom reglene med eksempler.</strong> Vis hva som er et brudd og hva som ikke er det. Forklar hva som skal til for å vinne.</li>
          </ol>
          <p>Sjekklisten før hver økt tar deg gjennom det viktigste. Den lagres i loggen, så du senere ser hvilke økter som var godt forberedt.</p>
        </section>

        <section id="spille">
          <h2>Slik spiller du</h2>
          <div class="anim-plass"></div>
          <p>En økt varer ti minutter, delt i ti minutter som telles hver for seg. Start når klassen har kommet til ro.
            Forskningen fant ingen tydelig forskjell mellom spillformene. Velg den du klarer å gjennomføre mens du underviser.</p>
          <div class="veil-varianter">
            <div>
              <h3>Fjelltur</h3>
              <p>Hele klassen er ett lag. Brikken går ett felt for hvert minutt uten brudd. Klassen ser ikke når du registrerer et brudd,
                bare at brikken blir stående. Kommer brikken til målfeltet du har valgt i oppsettet, har klassen vunnet. I studiene var målet felt 7.</p>
              <p class="hjelp">Lettest å gjennomføre alene. Anbefalt å starte med.</p>
            </div>
            <div>
              <h3>Skodde</h3>
              <p>Hele klassen er ett lag. Hvert brudd teller, og klassen ser tellingen. For hvert brudd driver en sky inn over fjellet,
                og ved grensen ligger toppen i skodde. Samtidig står «Husk reglene» på tavla, uten at noen pekes ut.
                Klassen vinner med færre brudd enn grensen du har valgt i oppsettet. I studiene var grensen 10.</p>
            </div>
            <div>
              <h3>Stjernehimmel</h3>
              <p>Klassen deles i to eller tre lag etter hvor elevene sitter. Hvert lag har sitt eget stjernebilde på nattehimmelen,
                og får en stjerne for hvert minutt uten brudd på laget.
                Når minst ett lag har 8 stjerner, trekker hele klassen.</p>
              <p class="hjelp">Krevende alene, fordi du må registrere brudd på riktig lag. To lag gir bedre oversikt enn tre.</p>
            </div>
          </div>
          <p>Når dere ikke vinner, står det «Vi prøver igjen neste gang». Si det samme selv, uten å lete etter skyldige.</p>
          <p>Effekten i studiene falt hver gang spillet ble tatt bort. Planlegg for jevnlig bruk, ikke for å trappe ned.</p>
        </section>

        <section id="registrere">
          <h2>Slik registrerer du brudd</h2>
          <ul>
            <li>Registrer bare det som står i definisjonen av regelen. Er du usikker, lar du det være.</li>
            <li>Atferd som varer, teller som nytt brudd hvert 15. sekund. Det er slik bruddene ble talt i studiene.</li>
            <li>Si aldri høyt hvem som brøt regelen. Appen lagrer det heller ikke.</li>
            <li>Blir timen avbrutt, avslutter du økta. Den blir da ikke lagret i loggen.</li>
          </ul>
          <h3>Fjernkontroll og tastatur</h3>
          <p>En presentasjonsfjernkontroll sender piltaster og Page Up og Page Down. Da kan du registrere fra hvor som helst i rommet.</p>
          <dl class="veil-taster">
            <div><dt><kbd>Mellomrom</kbd> <kbd>Pil ned</kbd> <kbd>Page Down</kbd></dt><dd>Brudd. På stjernehimmelen: brudd på lag 1</dd></div>
            <div><dt><kbd>Pil opp</kbd> <kbd>Page Up</kbd></dt><dd>Brudd på lag 2 på stjernehimmelen</dd></div>
            <div><dt><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></dt><dd>Brudd på lag 1, 2 eller 3 på stjernehimmelen</dd></div>
            <div><dt><kbd>P</kbd></dt><dd>Pause og fortsett</dd></div>
            <div><dt><kbd>F</kbd></dt><dd>Fullskjerm av og på</dd></div>
            <div><dt><kbd>Esc</kbd></dt><dd>Avslutt, med bekreftelse</dd></div>
          </dl>
          <p class="hjelp">Prikkene ved bruddknappen viser hvor mange brudd du har registrert i minuttet som pågår. De er små, så klassen legger ikke merke til dem.</p>
        </section>

        <section id="rose">
          <h2>Ros det som går bra</h2>
          <p>Spillet virker best når du samtidig legger merke til det klassen gjør riktig, og sier det høyt.
            I de eldre norske studiene roste lærerne mer bare der de hadde fått opplæring i dette. En påminnelse alene er altså ikke nok.</p>
          <ul>
            <li><strong>Vær konkret.</strong> Si hva du ser, knyttet til en regel: «Nå rekker mange opp hånden.» Ikke bare «Flott».</li>
            <li><strong>Ros klassen eller laget, ikke enkeltelever.</strong> Da slipper ingen å stå fram.</li>
            <li><strong>Ros oftere enn du retter.</strong> Småting som ikke er brudd, trenger ingen kommentar.</li>
            <li><strong>Ros rett etter.</strong> Jo nærmere det skjer, jo tydeligere er koblingen.</li>
          </ul>
          <p>Slå på påminnelsen i oppsettet om du vil. Hvert andre minutt står det da en liten, dempet tekst ved knappene dine, med en setning du kan si ut fra reglene. Si den bare når den stemmer.</p>
        </section>

        <section id="valg">
          <h2>Klassens valg</h2>
          <p>La elevene skrive forslag på lapper. Et godt forslag er realistisk, tar rundt ti minutter og gjelder hele klassen.
            Når klassen vinner, trekker appen ett av dem. Hvem som trykker på Trekk, avgjør dere i klasserommet, for eksempel med ispinner.</p>
          <p>Unngå fritak fra lekser, prøver eller vurdering. Det kobler ro til faglig innhold og gir spørsmål om likebehandling.
            Unngå også mat og godteri, og alt som gir enkeltelever fordeler.</p>
          <p>Ønskene endrer seg. Appen minner deg på å samle nye forslag etter fire uker, og etter pauser på over to uker.</p>
        </section>

        <section id="regler">
          <h2>Reglene og hva som er brudd</h2>
          <p>Definisjonene står bare her og i oppsettet, ikke på tavla. Gå gjennom dem med klassen med eksempler før dere spiller.</p>
          ${regelsett(sett)}
        </section>

        <section id="forskning">
          <h2>Hva forskningen viser</h2>
          <p>To norske studier fra 2026 prøvde ut spillet i fire klasser på barnetrinnet. Bruddene gikk ned med 84 til 96 prosent mens spillet pågikk,
            og det var ingen tydelig forskjell mellom spillformene. I den ene studien svarte 80 prosent av elevene at det var roligere i klassen under spillet.</p>
          <p>Bruddene steg igjen hver gang spillet ble tatt bort. Etter tre måneders pause var nivået høyere enn før første runde.</p>
          <h3>Det forskningen ikke gir svar på</h3>
          <ul>
            <li>Om spillet virker på ungdomstrinnet. Ingen av de norske studiene gjaldt det.</li>
            <li>Om lærere klarer å gjennomføre spillet selv. I studiene ble det ledet av studenter.</li>
            <li>Effekt på karakterer, fravær eller hvor mye elevene får gjort.</li>
            <li>Hvor lenge roen varer etter økta, og hvor ofte dere bør spille.</li>
            <li>Effekt på skjermbruk og meldinger, og i gruppearbeid.</li>
            <li>Hvor mange brudd som betyr at en klasse trenger spillet. Det vurderer du selv ut fra kartleggingen.</li>
          </ul>
          <p class="hjelp">Grunnlaget er fire klasser. Klassen på 6. trinn er med i begge artiklene, så de er ikke to uavhengige bekreftelser.</p>
          <h3>Kilder</h3>
          <p class="hjelp">Tallene i veiledningen er hentet fra disse to artiklene. Begge er gratis PDF-er fra Norsk Tidsskrift for Atferdsanalyse.</p>
          <ul class="veil-kilder">${KILDER.map(kilde).join('')}</ul>
          <h3>Studier omtalt i artiklene</h3>
          <p class="hjelp">Disse studiene er gjengitt i de to artiklene over. Funnene om lærerens ros er fra Strømgren og Sørheim (2015) og Viken mfl. (2024).
            Langtidsstudiene til Kellam mfl. gjelder 1. og 2. trinn i USA og sier ikke noe om hva spillet gir i norske klasser.</p>
          <ul class="veil-kilder">${OMTALTE.map(kilde).join('')}</ul>
        </section>

        <section id="personvern">
          <h2>Personvern</h2>
          <p>Appen lagrer klassenavn, regler, innstillinger, klassens valg og loggen over økter. Alt ligger bare i nettleseren på denne maskinen.
            Ingenting sendes noe sted, og det er ingen innlogging eller sporing.</p>
          <p>Skriv aldri elevnavn i appen. Appen registrerer ikke hvem som brøt en regel, og lagrer ikke hvem som er på hvilket lag.</p>
          <p>Tømmer du nettleserdataene, forsvinner loggen. Last ned CSV fra loggen om du vil ta vare på tallene. Klasser slettes fra oppsettet.</p>
        </section>
      </div>
    </main>`;
}

// Elevveiledningen vises på tavla når læreren introduserer spillet. Den er
// lik for alle klasser: reglene, målet og spillbrettet velger læreren, og
// hva som teller som brudd, går læreren gjennom muntlig med eksempler.
const ELEV_STEG = [
  ['Reglene', 'Læreren velger reglene vi skal følge. De står nederst på tavla hele tiden, så alle kan se dem.'],
  ['Ti minutter', 'Vi jobber som vanlig. Læreren følger med og holder telling.'],
  ['Målet', 'Før vi starter, forteller læreren hva som skal til for å klare det.'],
  ['Klassens valg', 'Klarer vi det, trekker vi noe fra listen dere har laget. Alle får være med på det som blir trukket.'],
  ['Vi prøver igjen', 'Klarer vi det ikke, prøver vi igjen neste gang. Ingen blir pekt ut, og ingen får skylda.'],
];

const ELEV_BRETT = [
  ['Fjelltur', 'Hele klassen er ett lag. For hvert minutt alle følger reglene, går brikken ett steg opp mot fjellet. Når brikken når flagget, har vi klart det.'],
  ['Skodde', 'Hele klassen er ett lag. Hver gang en regel blir brutt, driver en sky inn over fjellet. Er toppen fortsatt fri for skodde når tiden er ute, har vi klart det.'],
  ['Stjernehimmel', 'Klassen deles i lag. Hvert lag har sitt eget stjernebilde. For hvert minutt laget følger reglene, tennes en stjerne. Når ett lag har nok stjerner, har hele klassen klart det.'],
];

export function elevveiledning() {
  return `
    <main class="elev">
      <header class="elev-topp">
        <h1>Slik spiller vi</h1>
        <button class="knapp knapp-stille" id="fullskjerm">Fullskjerm</button>
      </header>
      <div class="anim-plass"></div>
      <ol class="elev-steg">
        ${ELEV_STEG.map(([tittel, tekst]) => `<li><h2>${tittel}</h2><p>${tekst}</p></li>`).join('')}
      </ol>
      <h2 class="elev-under">Tre spillbrett</h2>
      <ul class="elev-brett">
        ${ELEV_BRETT.map(([tittel, tekst]) => `<li><h3>${tittel}</h3><p>${tekst}</p></li>`).join('')}
      </ul>
    </main>`;
}
