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

- Én lærer, én klasse, 2. til 10. trinn.
- Nettleser på digital tavle, ofte Windows. Læreren står ikke nødvendigvis ved tavla.
- Brukes ved oppstart av time eller under selvstendig arbeid, ti minutter om gangen.
- Klassen ser skjermen hele tiden. Alt som vises, ser elevene.

## 4. Spillvarianter

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
- Regler: tre ferdige regler, redigerbare:
  1. Jeg sitter på plassen min.
  2. Jeg rekker opp hånden når jeg vil si noe.
  3. Jeg holder hender og føtter for meg selv.
- Variant, mål og grense.
- Belønningsliste: læreren legger inn forslagene elevene har skrevet på lapper. Hjelpetekst: belønningen skal være realistisk, ta rundt ti minutter og inkludere hele klassen.
- Valg: vis eller skjul tidtaker for elevene.

### 5.2 Sjekkliste før økt

Vises før start, kan hakes av på sekunder:

- Reglene er gjennomgått med eksempler.
- Klassen vet hva som skal til for å vinne.
- Belønningene er klare.
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
- Mål nådd: belønning trekkes tilfeldig fra listen med en enkel animasjon.
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
      "regler": ["...", "...", "..."],
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
      "belonninger": ["...", "..."],
      "sisteBelonningskartlegging": "2026-09-25",
      "okter": [
        {
          "id": "uuid",
          "type": "spill | kartlegging",
          "variant": "rolig",
          "start": "ISO-tid",
          "varighetSekunder": 600,
          "intervaller": [{ "brudd": [0, 0] }],
          "maalNaadd": true,
          "sjekklisteFullfort": true,
          "belonning": "..."
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
Oppsett av én klasse, regler, spillvisning med automatisk brikkeflytt, bruddknapp og tastatursnarveier, belønningstrekning. Tilstand lagres. Dette er nok til å teste i eget klasserom.

**Fase 2: Logg og kartlegging**
Øktlogg, kartleggingsmodus, diagram, CSV-eksport, sjekkliste.

**Fase 3: Flere varianter og klasser**
Bruddbrett, Lagspill, flere klasser, rospåminnelse, påminnelse om belønningskartlegging.

**Fase 4: Veiledning og publisering**
Veiledningsside, frakoblet bruk, publisering.

## 10. Testkrav

- Tidtaker holder riktig tid når fanen er i bakgrunnen i ti minutter.
- Oppdatering av siden midt i en økt gjenoppretter økten.
- Brikken flytter seg ikke i et minutt der det ble registrert brudd, også når bruddet kom i siste sekund.
- Et brudd registrert nøyaktig i overgangen mellom to minutter havner i riktig intervall.
- Presentasjonsfjernkontroll fungerer (test med PageDown og piltaster).
- Ingen personopplysninger i localStorage eller eksport.
- Lesbar fra ti meters avstand på digital tavle.

## 11. Åpne spørsmål

- Skal appen ha en egen visning for ungdomstrinnet med mer nøktern grafikk?
- Skal læreren kunne bruke mobilen som fjernkontroll? Det krever synkronisering mellom enheter og dermed en server. Utsettes.
- Skal loggen kunne deles med kontaktlærer eller rådgiver? I så fall bare som eksportfil.
