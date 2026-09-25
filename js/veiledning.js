// Veiledningen. Tallene og påstandene er hentet fra forskningsgrunnlag.md,
// og tall fra studiene står alltid sammen med kilde og forbehold.

import { BIBLIOTEK } from './regler.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

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
      <dl>${rs.regler.map((r) => `
        <div><dt>${esc(r.tekst)}</dt><dd>${r.brudd ? esc(r.brudd) : '<span class="hjelp">Ingen definisjon ennå. Skriv den i oppsettet.</span>'}</dd></div>`).join('')}
      </dl>
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
        <h1>Veiledning</h1>
        <p class="skjema-ingress">Klassespillet bygger på Good Behavior Game. Klassen spiller sammen om å følge tre regler i ti minutter.
          Når de klarer det, trekker dere noe fra en liste elevene selv har foreslått.</p>
        <button class="knapp knapp-hoved" id="tilbake">Tilbake</button>
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
          <p>En økt varer ti minutter, delt i ti minutter som telles hver for seg. Start når klassen har kommet til ro.
            Forskningen fant ingen tydelig forskjell mellom spillformene. Velg den du klarer å gjennomføre mens du underviser.</p>
          <div class="veil-varianter">
            <div>
              <h3>Rolig brett</h3>
              <p>Hele klassen er ett lag. Brikken går ett felt for hvert minutt uten brudd. Klassen ser ikke når du registrerer et brudd,
                bare at brikken blir stående. Kommer brikken til målfeltet, vanligvis felt 7, har klassen vunnet.</p>
              <p class="hjelp">Lettest å gjennomføre alene. Anbefalt å starte med.</p>
            </div>
            <div>
              <h3>Bruddbrett</h3>
              <p>Hele klassen er ett lag. Hvert brudd teller, og klassen ser tellingen. For hvert brudd driver en sky inn over fjellet,
                og ved grensen ligger toppen i skodde. Samtidig står «Husk reglene» på tavla, uten at noen pekes ut.
                Klassen vinner med færre brudd enn grensen, vanligvis 10.</p>
            </div>
            <div>
              <h3>Lagspill</h3>
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
            <div><dt><kbd>Mellomrom</kbd> <kbd>Pil ned</kbd> <kbd>Page Down</kbd></dt><dd>Brudd. I lagspill: brudd på lag 1</dd></div>
            <div><dt><kbd>Pil opp</kbd> <kbd>Page Up</kbd></dt><dd>Brudd på lag 2 i lagspill</dd></div>
            <div><dt><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd></dt><dd>Brudd på lag 1, 2 eller 3 i lagspill</dd></div>
            <div><dt><kbd>P</kbd></dt><dd>Pause og fortsett</dd></div>
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
          <p>Slå på påminnelsen i oppsettet om du vil. Hvert andre minutt står det da en liten boks ved knappene dine, med et forslag ut fra reglene.</p>
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
          <ul class="veil-kilder">
            <li>Stangjordet, P., Isaksen, J. og Strømgren, B. (2026). Effektforskjeller mellom Caught Being Good Game, Good Behavior Board Game og en modifisert versjon av Good Behavior Board Game på elever i grunnskolen. <cite>Norsk Tidsskrift for Atferdsanalyse</cite>, 53, 43–57.</li>
            <li>Isaksen, J., Stangjordet, P., Johannessen, T. M., Majkic, K., Ottersen, K. O. og Viken, K. (2026). Hvilken effekt har Caught Being Good Game og Good Behavior Board Game på forstyrrende atferd og arbeidsro på sjette trinn i barneskolen? <cite>Norsk Tidsskrift for Atferdsanalyse</cite>, 53, 31–42.</li>
            <li>Barrish, H. H., Saunders, M. og Wolf, M. M. (1969). Good Behavior Game. <cite>Journal of Applied Behavior Analysis</cite>, 2, 119–124.</li>
            <li>Funnene om lærerens ros er fra Strømgren og Sørheim (2015) og Viken mfl. (2024), slik de er gjengitt i Stangjordet mfl. (2026).</li>
          </ul>
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
