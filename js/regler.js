// Regelbiblioteket og startlisten for klassens valg. Tekstene står i planen, avsnitt 5.9 og 5.10.

export const MAKS_REGLER = 4;

export const BIBLIOTEK = [
  {
    mal: 'tavle',
    navn: 'Tavleundervisning',
    om: 'Læreren eller en elev har ordet.',
    regler: [
      { tekst: 'Jeg er stille når noen har ordet.', brudd: 'Prat, hvisking eller lyd når andre har ordet.' },
      { tekst: 'Jeg rekker opp hånden når jeg vil si noe.', brudd: 'Å snakke uten ordet, også om fag.' },
      { tekst: 'Jeg sitter vendt mot tavla.', brudd: 'Å snu seg for å prate, eller sitte med ryggen til.' },
    ],
  },
  {
    mal: 'pc',
    navn: 'Selvstendig arbeid på PC',
    om: 'Elevene jobber alene på egen PC.',
    merknad: 'Studiene målte bare atferd som synes fra der læreren står, ikke skjermbruk. Reglene virker bare om du faktisk ser skjermene, for eksempel når du går rundt bak elevene. Er du usikker, registrerer du ikke brudd.',
    regler: [
      { tekst: 'Jeg har bare skolearbeidet åpent.', brudd: 'Spill, video, sosiale medier eller andre sider.' },
      { tekst: 'Chat og meldinger er lukket.', brudd: 'Å skrive eller lese meldinger.' },
      { tekst: 'Jeg sitter på plassen min.', brudd: 'Å forlate plassen uten lov.' },
    ],
  },
  {
    mal: 'uten-pc',
    navn: 'Selvstendig arbeid uten PC',
    om: 'Elevene jobber alene med bok eller ark.',
    regler: [
      { tekst: 'Jeg jobber stille. Jeg hvisker bare om oppgaven.', brudd: 'Prat som flere enn sidemann hører, eller om annet.' },
      { tekst: 'Jeg rekker opp hånden når jeg trenger hjelp.', brudd: 'Å rope på eller gå til læreren uten lov.' },
      { tekst: 'Jeg sitter på plassen min.', brudd: 'Å forlate plassen uten lov.' },
    ],
  },
  {
    mal: 'oppstart',
    navn: 'Oppstart av time',
    om: 'De første minuttene av timen.',
    regler: [
      { tekst: 'Jeg sitter på plassen min når timen starter.', brudd: 'Å ikke sitte på plassen når timen starter.' },
      { tekst: 'PC-en er lukket til læreren sier noe annet.', brudd: 'Åpen skjerm.' },
      { tekst: 'Jeg er stille når læreren gir beskjed.', brudd: 'Prat eller lyd mens læreren gir beskjed.' },
    ],
  },
];

export function fraBibliotek(mal) {
  const b = BIBLIOTEK.find((r) => r.mal === mal);
  return { id: crypto.randomUUID(), mal, navn: b.navn, regler: b.regler.map((r) => ({ ...r })) };
}

export function egetRegelsett() {
  return {
    id: crypto.randomUUID(), mal: null, navn: '',
    regler: [{ tekst: '', brudd: '' }, { tekst: '', brudd: '' }, { tekst: '', brudd: '' }],
  };
}

export const FORSLAG = [
  'Gå ut fem minutter før friminutt',
  'Klassen velger musikk på høyttaler under neste arbeidsøkt',
  'Egen musikk med hodetelefoner under selvstendig arbeid',
  'Ti minutter quiz, klassen mot læreren',
  'Ti minutter ordlek eller gjettelek for hele klassen',
  'Fri plassering i rommet under neste arbeidsøkt',
  'Klassen bestemmer sittekart for én time',
  'Klassen velger mellom to oppgavesett',
  'Klassen stiller læreren spørsmål i fem minutter',
  'Et kort, lærergodkjent videoklipp elevene foreslår',
  'Neste økt holdes ute',
];

// Gjør en regel om til en setning læreren kan si: «Jeg sitter på plassen min.»
// blir «Jeg ser at mange sitter på plassen sin. Flott!» Regler som ikke starter
// med «Jeg», roses som de står.
export function rosForslag(regel) {
  const forste = regel.split('.')[0].trim();
  const m = forste.match(/^Jeg (\S+)(.*)$/);
  if (!m) return `Flott! ${forste}.`;
  const resten = m[2]
    .replace(/\bmin\b/g, 'sin').replace(/\bmitt\b/g, 'sitt').replace(/\bmine\b/g, 'sine')
    .replace(/\bmeg\b/g, 'seg').replace(/\bjeg\b/g, 'de');
  return `Jeg ser at mange ${m[1]}${resten}. Flott!`;
}
