# Klassespillet (arbeidsnavn)

Byggeplan for et digitalt spillbrett til digital tavle, basert på Good Behavior Game og de norske variantene undersøkt ved Universitetet i Innlandet. Planen er skrevet for å gis til Claude Code som prosjektkontekst.

## 1. Mål

Et verktøy som gjør det mulig for en lærer å gjennomføre en ti minutters økt med Good Behavior Game alene, mens hun underviser, uten forberedelse og uten å registrere personopplysninger.

Forskningen viser at spillet virker, men i alle de norske studiene ble det drevet av studenter, ikke lærere. Forfatterne etterlyser selv kunnskap om hvordan lærere får det til på egen hånd. Det er problemet verktøyet skal løse.

## 2. Forskningsgrunnlag

- Barrish, Saunders og Wolf (1969): originalstudien. Klassen delt i to lag, strek ved regelbrudd, laget med færrest streker får privilegier.
- Isaksen mfl. (2026), Norsk Tidsskrift for Atferdsanalyse 53, s. 31–42: én klasse på 6. trinn. Lagvariant og brettvariant virket like godt. Effekten forsvant når spillet ble tatt bort, også etter tre måneders pause.
- Stangjordet, Isaksen og Strømgren (2026), NTA 53, s. 43–57: tre klasser (2 på 3. trinn, 1 på 6. trinn). Tre varianter, ingen tydelig forskjell. Nedgang i regelbrudd på opptil 95 prosent. 80 prosent av elevene opplevde det roligere, 98 prosent ville spille minst én gang om dagen.
- Merk: klassen på 6. trinn ser ut til å være den samme i begge artiklene. Grunnlaget er fire klasser, ikke fem.

Konsekvenser for designet:

1. Variant spiller liten rolle. Velg den læreren klarer å gjennomføre.
2. Effekten krever vedlikehold. Verktøyet skal støtte jevnlig bruk, ikke nedtrapping.
3. Lærerens positive tilbakemeldinger økte bare når lærerne fikk opplæring. Verktøyet trenger en veiledning, ikke bare en påminnelse.
4. Svak gjennomføring kan forklare manglende effekt. Sjekkliste før økt.
5. Halvparten av klassene i studien trengte ikke tiltaket. Kartleggingsmodus.

## 3. Bruker og situasjon

- Én lærer, én klasse. Primærmålgruppe er 8. til 10. trinn. Design, språk og grafikk skal være nøkternt og ikke barnslig.
- Elevene har egen PC. Mye av uroen er digital og skjer på skjermen.
- Nettleser på digital tavle, ofte Windows. Læreren står ikke nødvendigvis ved tavla.
- Brukes ved oppstart av time eller under selvstendig arbeid, ti minutter om gangen.
- Klassen ser skjermen hele tiden. Alt som vises, ser elevene.

## 4. Spillvarianter

Navn i appen fra 26.09.2026: Rolig brett heter Fjelltur, Bruddbrett heter Skodde, og Lagspill heter Stjernehimmel. Navnene er de samme for lærer og elever. Den interne verdien `variant` er uendret (`rolig`, `brudd`, `lag`).

Alle varianter: ti intervaller på ett minutt, tre regler, belønning trekkes når målet er nådd.

### 4.1 Rolig brett (standard, modifisert Good Behavior Board Game)

- Hele klassen er ett lag.
- Brettet har ti felt. Målfeltet er felt sju (justerbart).
- Ved slutten av hvert minutt flyttes brikken ett felt frem hvis ingen regelbrudd ble registrert i minuttet.
- Læreren trykker én knapp ved regelbrudd. Klassen får ingen påminnelse. Bruddet synes bare ved at brikken står stille når minuttet er over.
- Mål nådd når brikken står på eller forbi målfeltet etter ti minutter.

Dette er standard fordi den er enklest for læreren (én knapp, ingen telling, ingen lag) og belønner det elevene gjør riktig.

### 4.2 Bruddbrett (Good Behavior Board Game)

- Hele klassen er ett lag.
- Hvert regelbrudd teller. Klassen vinner hvis antall brudd holder seg under grensen (standard 10) på ti minutter.
- Ved brudd gis en kollektiv påminnelse på skjermen, for eksempel «Husk reglene», uten å peke ut noen.

### 4.3 Lagspill (Caught Being Good Game)

- To lag (standard). Tre lag som tilvalg, men to ga bedre oversikt i studiene.
- Hvert lag får én stjerne for hvert minutt uten regelbrudd på laget. Maks ti.
- Minst ett lag må ha åtte stjerner for å utløse belønning for hele klassen.
- Læreren har én bruddknapp per lag.

## 5. Funksjoner

### 5.1 Oppsett (gjøres én gang per klasse)

- Klassenavn uten personopplysninger, for eksempel «8A».
- Regelsett: læreren velger ett eller flere ferdige regelsett fra regelbiblioteket (5.9) og kan redigere dem. Hvert regelsett hører til en undervisningssituasjon. Før hver økt velges hvilket regelsett som gjelder.
- Variant, mål og grense.
- Klassens valg (belønningslisten): læreren legger inn forslagene elevene har skrevet på lapper, eventuelt supplert fra forslagslisten (5.10). Hjelpetekst: forslaget skal være realistisk, ta rundt ti minutter og inkludere hele klassen.
- Valg: vis eller skjul tidtaker for elevene.

### 5.2 Sjekkliste før økt

Vises før start, kan hakes av på sekunder:

- Reglene er gjennomgått med eksempler.
- Klassen vet hva som skal til for å vinne.
- Listen med klassens valg er klar.
- Tidspunkt passer (ro etter friminutt, selvstendig arbeid eller tavleundervisning).

Avhukingen lagres i loggen som mål på gjennomføring.

### 5.3 Spillvisning

- Stort brett som fyller tavla, lesbart fra bakerste rad.
- Reglene alltid synlige.
- Nedtelling 3, 2, 1 ved start.
- Bruddknapp: stor på skjermen, men gir ingen synlig reaksjon for klassen i Rolig brett. Bare en liten, nøytral markering i hjørnet som læreren kan se.
- Tastatursnarveier, slik at læreren kan bruke en presentasjonsfjernkontroll fra hvor som helst i rommet. Fjernkontroller sender piltaster og Page Up/Page Down:
  - Mellomrom, pil ned eller Page Down: regelbrudd (lag 1)
  - Pil opp eller Page Up: regelbrudd lag 2 (bare i Lagspill)
  - P: pause
  - Esc: avbryt med bekreftelse
- Aldri vis hvem som brøt regelen. Verktøyet skal ikke registrere det.
- Veiledningstekst: atferd som varer, registreres som nytt brudd hvert 15. sekund.

### 5.4 Avslutning

- Resultat vises for klassen.
- Mål nådd: klassens valg trekkes tilfeldig fra listen med en enkel animasjon.
- Hvilken elev som trekker, avgjøres fysisk (ispinner med navn eller lignende). Verktøyet lagrer ikke elevnavn.
- Mål ikke nådd: nøytral tekst, for eksempel «Vi prøver igjen neste gang». Ingen skam.

### 5.5 Rospåminnelse (valgfri)

- Diskret signal til læreren med jevne mellomrom under og etter økten: «Hvem følger reglene nå? Si det.»
- Forslag til konkret ros knyttet til en regel: «Nå rekker mange opp hånden.»
- Av som standard, anbefalt i veiledningen.

### 5.6 Kartleggingsmodus

- Ti minutter uten spill, uten synlig brett. Læreren teller brudd med samme knapp.
- Etter tre til fem kartlegginger vises et enkelt diagram med tolkningshjelp: lavt og stabilt nivå tyder på at klassen ikke trenger spillet.

### 5.7 Logg

- Per økt: dato, klokkeslett, variant, antall brudd eller tapte intervaller, mål nådd, sjekkliste fullført.
- Linjediagram over tid, med kartlegging og spill i ulik farge.
- Eksport til CSV.
- Påminnelse om ny belønningskartlegging når det har gått fire uker siden sist, eller etter en pause på over to uker uten økter.

### 5.8 Veiledning

Egen side i appen, kort og konkret:

- Slik spiller du, per variant.
- Hvorfor du skal rose, og hvordan (differensiell forsterkning forklart uten fagsjargong).
- Hvordan du lager regler og samler inn belønningsforslag.
- Hva forskningen viser og ikke viser: ingen dokumentert effekt på karakterer, fravær eller varighet etter spillet. Effekten faller når spillet tas bort.

### 5.9 Regelbibliotek

Prinsipper:

- Tre regler per regelsett, maks fire. Studiene brukte tre. Flere regler gjør registreringen upålitelig.
- Reglene beskriver ønsket atferd, ikke forbud.
- Hver regel har en definisjon av hva som teller som brudd. Definisjonen vises i oppsett og veiledning, ikke på tavla.
- Brettet viser regelsettets navn og de tre reglene.

**Tavleundervisning** (læreren eller en elev har ordet)

1. Jeg er stille når noen har ordet.
   Brudd: all prat, hvisking eller lyd med gjenstander mens læreren eller en medelev har ordet.
2. Jeg rekker opp hånden når jeg vil si noe.
   Brudd: å snakke uten å ha fått ordet, også faglig.
3. Jeg sitter vendt mot tavla.
   Brudd: å snu seg mot sidemann eller eleven bak for å prate, eller å sitte med ryggen til tavla.

**Selvstendig arbeid på PC**

1. Jeg har bare skolearbeidet åpent.
   Brudd: spill, sosiale medier, video eller nettsider som ikke hører til oppgaven.
2. Chat og meldinger er lukket.
   Brudd: å skrive eller lese meldinger i Teams eller andre kanaler.
3. Jeg sitter på plassen min.
   Brudd: å forlate plassen uten tillatelse.

**Selvstendig arbeid uten PC**

1. Jeg jobber stille. Jeg hvisker bare om oppgaven.
   Brudd: prat som er hørbar for andre enn sidemann, eller prat om annet enn oppgaven.
2. Jeg rekker opp hånden når jeg trenger hjelp.
   Brudd: å rope på læreren eller gå til læreren uten tillatelse.
3. Jeg sitter på plassen min.
   Brudd: som over.

**Oppstart av time**

1. Jeg sitter på plassen min når timen starter.
2. PC-en er lukket til læreren sier noe annet.
   Brudd: åpen skjerm.
3. Jeg er stille når læreren gir beskjed.

**Egendefinert**: læreren kan lage egne regelsett med samme struktur (navn, tre regler, definisjon av brudd).

Merknad til PC-reglene: de norske studiene målte atferd som læreren kan se fra der hun står. Skjermbruk er vanskeligere å registrere. Reglene virker bare hvis læreren faktisk ser skjermene, for eksempel ved å gå rundt bak elevene eller ved å plassere pultene slik at skjermene vender mot læreren. Veiledningen skal si dette tydelig. Ved usikkerhet registreres ikke brudd. Verktøyet skal ikke kobles til skjermovervåking eller skolens administrasjonssystemer.

Merknad til gruppearbeid: studiene gjaldt selvstendig arbeid og tavleundervisning. Gruppearbeid er ikke undersøkt og har derfor ikke eget regelsett i første versjon.

### 5.10 Klassens valg

Ordet «belønning» brukes ikke i grensesnittet. Forslag til navn: «Klassens valg». Når målet er nådd, vises «Dere har tjent klassens valg».

Elevene skal foreslå selv. Listen under er en startliste læreren kan velge fra, tilpasset 8. til 10. trinn:

- Gå ut fem minutter før friminutt (sjekk skolens regler for tilsyn).
- Klassen velger musikk på høyttaler under neste arbeidsøkt.
- Egen musikk med hodetelefoner under selvstendig arbeid.
- Ti minutter quiz, klassen mot læreren.
- Ti minutter ordlek eller gjettelek for hele klassen (Alias, Hvem er jeg, 20 spørsmål).
- Fri plassering i rommet under neste arbeidsøkt.
- Klassen bestemmer sittekart for én time.
- Klassen velger mellom to oppgavesett eller rekkefølgen på oppgavene.
- Klassen stiller læreren spørsmål i fem minutter, læreren svarer ærlig innenfor rimelighetens grenser.
- Et kort, lærergodkjent videoklipp elevene foreslår.
- Neste økt holdes ute, om faget og været tillater det.

Ikke med i listen, og frarådet i hjelpeteksten:

- Fritak fra lekser, prøver eller vurdering. Det kobler ro til faglig innhold og reiser spørsmål om likebehandling.
- Mat og godteri.
- Noe som gir enkeltelever fordeler.

## 6. Ikke med

- Elevnavn, bilder eller andre personopplysninger.
- Innlogging, brukerkontoer, skylagring.
- Registrering av hvilken elev som brøt regelen.
- Analyseverktøy eller sporing.
- Lyd som standard.
- Mat og godteri som foreslått belønning.

## 7. Teknisk

- Statisk nettapp: HTML, CSS og JavaScript uten rammeverk. Ingen byggesteg nødvendig.
- Lagring i localStorage, med versjonert datamodell.
- Installerbar og frakoblet bruk (manifest og service worker), slik at den virker på skolenettet uten nett.
- Tidtaker basert på faktisk klokketid (Date.now eller performance.now), ikke opptelling av setInterval, så den ikke driver når fanen er i bakgrunnen.
- Tilstanden i en pågående økt lagres fortløpende, slik at en utilsiktet oppdatering av siden ikke ødelegger økten.
- Publisering: Vercel eller GitHub Pages. Kan senere bygges inn på laererliv.no.

### Datamodell (utgangspunkt)

```json
{
  "versjon": 1,
  "klasser": [
    {
      "id": "uuid",
      "navn": "8A",
      "regelsett": [
        {
          "id": "uuid",
          "navn": "Tavleundervisning",
          "regler": [
            { "tekst": "Jeg er stille når noen har ordet.", "brudd": "..." }
          ]
        }
      ],
      "variant": "rolig | brudd | lag",
      "innstillinger": {
        "intervaller": 10,
        "intervallSekunder": 60,
        "maalfelt": 7,
        "bruddgrense": 10,
        "antallLag": 2,
        "stjernekrav": 8,
        "visTidtaker": true,
        "rospaaminnelse": false
      },
      "klassensValg": ["...", "..."],
      "sisteBelonningskartlegging": "2026-09-25",
      "okter": [
        {
          "id": "uuid",
          "type": "spill | kartlegging",
          "variant": "rolig",
          "regelsettId": "uuid",
          "start": "ISO-tid",
          "varighetSekunder": 600,
          "intervaller": [{ "brudd": [0, 0] }],
          "maalNaadd": true,
          "sjekklisteFullfort": true,
          "klassensValg": "..."
        }
      ]
    }
  ]
}
```

## 8. Universell utforming

- Høy kontrast, stor skrift, fungerer i både lys og mørk modus.
- Ingen blinkende elementer.
- Brikkeflytt med rolig animasjon, kan skrus av.
- Alle funksjoner tilgjengelige med tastatur.
- Bokmål. Nynorsk som mulig senere tillegg.

## 9. Byggerekkefølge

**Fase 1: Rolig brett alene**
Oppsett av én klasse, regelbibliotek med de fire ferdige regelsettene, spillvisning med automatisk brikkeflytt, bruddknapp og tastatursnarveier, belønningstrekning. Tilstand lagres. Dette er nok til å teste i eget klasserom.

**Fase 2: Logg og kartlegging**
Øktlogg, kartleggingsmodus, diagram, CSV-eksport, sjekkliste.

**Fase 3: Flere varianter og klasser**
Bruddbrett, Lagspill, flere klasser, rospåminnelse, påminnelse om belønningskartlegging.

**Fase 4: Veiledning og publisering**
Veiledningsside, frakoblet bruk, publisering.

Status 26.09.2026: fase 1–4 er ferdige. Rolig brett, bruddbrett (skyer) og lagspill (stjernebilder på nattehimmel) har hver sin grafikk. Appen er publisert på https://barx10.github.io/klassespillet/ fra repoet barx10/klassespillet. Push til `main` publiserer på nytt. Planfilene er holdt utenfor repoet.

**Fase 5: Profil og opplæring (start her)**
- Opplæringsmodal for lærere: kort gjennomgang første gang appen åpnes, og som kan åpnes igjen senere. Den skal vise veien til oppsett, spill, brudd og trekning, og henvise til veiledningen for detaljer. Må være tastaturvennlig og kunne lukkes med Esc.
- Om-modal: om nettsiden, hvem som har laget den og logoen. Logofil og tekst om personen må komme fra brukeren.
- Bunntekst med «© Lærerliv 2026» nederst på sidene. Den skal ikke vises på spillbrettet, der plassen er til reglene.
- Sjekk mobil og stående skjerm for bruddbrett og lagspill. Det er ikke gjort ennå.
- Nye filer, for eksempel logoen, må legges inn i `sw.js`. Testen i `tests/frakoblet.test.js` fanger det opp.

Status fase 5: opplæringen (`js/opplaering.js`), om-vinduet (`js/om.js`) og bunnteksten er på plass. Mobil og stående skjerm er sjekket, og knappene og tellingen er rettet for smale skjermer. Logoen ligger i `ikoner/logo.png` og vises i om-vinduet.

Navigasjon etter fase 5: velkomstskjerm hver gang appen åpnes. Topplinje på alle sider utenom velkomst og spill, med Tilbake, Lærerveiledning, Elevveiledning og lys/mørk visning. Startsiden uten klasse lar læreren se seg rundt uten å fylle ut noe. Oppsettet spør før endringer forkastes. Elevveiledningen er lik for alle klasser: fem steg og de tre spillbrettene, uten tall, regler eller hva som er brudd, siden læreren velger det.

## 10. Testkrav

- Tidtaker holder riktig tid når fanen er i bakgrunnen i ti minutter.
- Oppdatering av siden midt i en økt gjenoppretter økten.
- Brikken flytter seg ikke i et minutt der det ble registrert brudd, også når bruddet kom i siste sekund.
- Et brudd registrert nøyaktig i overgangen mellom to minutter havner i riktig intervall.
- Presentasjonsfjernkontroll fungerer (test med PageDown og piltaster).
- Ingen personopplysninger i localStorage eller eksport.
- Lesbar fra ti meters avstand på digital tavle.

## 11. Åpne spørsmål

- Skal læreren kunne bruke mobilen som fjernkontroll? Det krever synkronisering mellom enheter og dermed en server. Utsettes.
- Skal loggen kunne deles med kontaktlærer eller rådgiver? I så fall bare som eksportfil.
