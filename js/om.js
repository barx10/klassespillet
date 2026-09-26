// Om-vinduet: hva appen er, og hvem som har laget den.

export function visOm() {
  document.querySelector('.om')?.remove();
  const tilbakeFokus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog om';
  dialog.setAttribute('aria-labelledby', 'om-tittel');
  dialog.innerHTML = `
    <h2 id="om-tittel">Om Klassespillet</h2>
    <p>Klassespillet er et digitalt brett for Good Behavior Game. Klassen spiller sammen om å følge tre regler i ti minutter.
      Klarer de det, trekker dere noe fra en liste elevene selv har foreslått. Alt lagres bare i nettleseren på denne maskinen.</p>
    <div class="om-person">
      <h3>Kenneth Bareksten</h3>
      <p>Lærer og hobbyprogrammerer som lager digitale verktøy for å gjøre hverdagen litt enklere og mer kreativ.</p>
      <p><a href="https://www.laererliv.no" target="_blank" rel="noopener">www.laererliv.no</a><br />
        <a href="mailto:kenneth@laererliv.no">kenneth@laererliv.no</a></p>
    </div>
    <form method="dialog" class="hjem-knapper">
      <button class="knapp knapp-hoved">Lukk</button>
    </form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (tilbakeFokus?.isConnected) tilbakeFokus.focus();
  });
  dialog.showModal();
  dialog.querySelector('button').focus();
}
