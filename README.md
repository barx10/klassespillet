# Klassespillet

Good Behavior Game på tavla. Klassen spiller sammen om å følge tre regler i ti minutter. Klarer de det, trekker appen noe fra en liste elevene selv har foreslått.

**Bruk appen:** https://barx10.github.io/klassespillet/

Appen er laget for læreren og tavla. Læreren registrerer brudd fra PC-en, med mus, tastatur eller presentasjonsfjernkontroll, mens klassen ser landskapet og reglene.

## Spillformene

| Spillform | Slik virker den | Klassen vinner når |
|---|---|---|
| Fjelltur | Hele klassen er ett lag. Brikken går ett felt for hvert minutt uten brudd. | Brikken når målfeltet læreren har valgt. I studiene felt 7 |
| Skodde | Hele klassen er ett lag. Hvert brudd teller, og en sky driver inn over fjellet. | Færre brudd enn grensen læreren har valgt. I studiene 10 |
| Stjernehimmel | To eller tre lag. Hvert lag får en stjerne for hvert minutt uten brudd. | Minst ett lag når stjernekravet læreren har valgt |

Fjelltur er lettest å gjennomføre alene og er standard.

## Funksjoner

- Oppsett per klasse med ferdige regelsett, egne regler og en definisjon av hva som er brudd.
- Sjekkliste før hver økt.
- Kartlegging uten spill, så læreren ser om klassen trenger tiltaket.
- Logg med diagram og nedlasting som CSV.
- Påminnelse om å rose, og om å samle nye forslag til klassens valg.
- Lærerveiledning med forskningsgrunnlag og lenker til studiene.
- Elevveiledning som vises på tavla når spillet introduseres.
- Virker uten nett etter første besøk, og kan installeres som app.

## Forskning

Appen bygger på to norske studier fra 2026 i *Norsk Tidsskrift for Atferdsanalyse* og studiene de viser til. Hva forskningen sier, og hva den ikke sier, står i [forskningsgrunnlag.md](forskningsgrunnlag.md). Lærerveiledningen i appen lenker til alle studiene.

## Personvern

Alt lagres bare i nettleseren på maskinen som brukes. Ingenting sendes noe sted, og det er ingen innlogging eller sporing. Appen lagrer ikke elevnavn eller hvem som brøt en regel.

## Utvikling

Appen er ren HTML, CSS og JavaScript uten byggesteg eller avhengigheter.

```sh
npm start   # lokal server på http://localhost:5173
npm test    # testene, med Node sin innebygde testløper
```

| Mappe eller fil | Innhold |
|---|---|
| `index.html` | Siden appen starter fra |
| `js/app.js` | Visningene: velkomst, hjem, oppsett, spill, logg |
| `js/okt.js` | Tidtaking, brudd og vinnerkriterier |
| `js/lager.js` | Lagring i nettleseren og datamodell |
| `js/regler.js` | Regelbiblioteket og forslag til klassens valg |
| `js/landskap.js` | Landskapet, brettet, skyene og stjernebildene |
| `js/logg.js`, `js/diagram.js` | Loggen, CSV og diagrammet |
| `js/veiledning.js`, `js/opplaering.js`, `js/om.js` | Lærer- og elevveiledning, kort gjennomgang og om-vinduet |
| `sw.js` | Frakoblet bruk. Nye filer må legges inn her |
| `tests/` | Testene |
| `plan-klassespillet.md` | Planen og byggerekkefølgen |

Push til `main` publiserer appen på nytt via GitHub Pages.

## Laget av

Kenneth Bareksten, [Lærerliv](https://www.laererliv.no). © Lærerliv 2026.

Skriftene Atkinson Hyperlegible Next og Bricolage Grotesque er lisensiert under SIL Open Font License. Lisensene ligger i `fonts/`.
