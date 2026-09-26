// Kort gjennomgang for læreren. Åpnes fra startsiden før første klasse og
// fra lærerveiledningen. Detaljene står i veiledningen.

export const STEG = [
  ['Sett opp klassen', `
    <p>Skriv klassenavnet, velg regler og spillform, og legg inn forslagene elevene har til klassens valg.
      Det gjør du én gang per klasse. Senere finner du det under «Endre oppsett».</p>
    <p class="hjelp">Skriv aldri elevnavn i appen.</p>`],
  ['Start en økt', `
    <p>Trykk <strong>Start økt</strong> og gå gjennom sjekklisten. Tavla viser landskapet og reglene, og økta varer i ti minutter.</p>
    <p class="hjelp">Vil du først se hvordan klassen har det uten spill, trykker du «Kartlegg».</p>`],
  ['Registrer brudd', `
    <p>Trykk <strong>Brudd</strong> hver gang noen bryter en regel. Med tastatur eller fjernkontroll bruker du mellomrom, pil ned eller Page Down.
      Si aldri høyt hvem det gjaldt.</p>
    <p class="hjelp"><kbd>P</kbd> setter på pause. <kbd>Esc</kbd> avslutter økta.</p>`],
  ['Trekk klassens valg', `
    <p>Når klassen når målet, trykker en elev på <strong>Trekk</strong>, og appen trekker ett av forslagene.
      Klarer de det ikke, står det «Vi prøver igjen neste gang».</p>
    <p class="hjelp">Ros det som går bra underveis. Veiledningen forklarer hvordan.</p>`],
];

// tilVeiledning kalles når læreren velger å lese mer. Dialogen lukkes først.
export function visOpplaering({ tilVeiledning } = {}) {
  document.querySelector('.opplaering')?.remove();
  const tilbakeFokus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog opplaering';
  dialog.setAttribute('aria-labelledby', 'opplaering-tittel');
  document.body.append(dialog);
  let steg = 0;

  function tegn() {
    const [tittel, tekst] = STEG[steg];
    const siste = steg === STEG.length - 1;
    dialog.innerHTML = `
      <p class="opplaering-steg">Steg ${steg + 1} av ${STEG.length}</p>
      <h2 id="opplaering-tittel">${tittel}</h2>
      <div class="opplaering-tekst">${tekst}</div>
      <div class="hjem-knapper">
        <button class="knapp knapp-hoved" id="opplaering-neste">${siste ? 'Kom i gang' : 'Neste'}</button>
        ${steg > 0 ? '<button class="knapp knapp-stille" id="opplaering-forrige">Forrige</button>' : ''}
      </div>
      <div class="hjem-lenker">
        ${tilVeiledning ? '<button class="lenke" id="opplaering-veiledning">Les lærerveiledningen</button>' : ''}
        ${siste ? '' : '<button class="lenke" id="opplaering-lukk">Hopp over</button>'}
      </div>`;
    dialog.querySelector('#opplaering-neste').onclick = () => {
      if (siste) return dialog.close();
      steg += 1;
      tegn();
    };
    dialog.querySelector('#opplaering-forrige')?.addEventListener('click', () => {
      steg -= 1;
      tegn();
    });
    dialog.querySelector('#opplaering-lukk')?.addEventListener('click', () => dialog.close());
    dialog.querySelector('#opplaering-veiledning')?.addEventListener('click', () => {
      dialog.close();
      tilVeiledning();
    });
    dialog.querySelector('#opplaering-neste').focus();
  }

  // Esc lukker dialogen av seg selv.
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (tilbakeFokus?.isConnected) tilbakeFokus.focus();
  });
  tegn();
  dialog.showModal();
  dialog.querySelector('#opplaering-neste').focus();
}
