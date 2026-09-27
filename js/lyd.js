// Lyden til animasjonen: musikk fra lyd/musikk.mp3 og små lydeffekter laget
// med nettleserens lydmotor. Mangler musikkfila, spilles bare effektene.
// Nettleseren tillater lyd først når noen har trykket, så alt lages ved første
// «Spill av».

const MUSIKK = 'lyd/musikk.mp3';
const MUSIKK_STYRKE = 0.5;
const EFFEKT_STYRKE = 0.35;
const UTTONING = 2500;

export function lagLyd(varighet) {
  let ctx = null, hoved = null, musikkGain = null, buffer = null, kilde = null;
  let lastet = null;
  // Øker ved hver pause, så en start som venter på fila ikke spiller etterpå.
  let runde = 0;

  function klargjor() {
    if (ctx) return;
    ctx = new AudioContext();
    hoved = ctx.createGain();
    hoved.connect(ctx.destination);
    musikkGain = ctx.createGain();
    musikkGain.gain.value = MUSIKK_STYRKE;
    musikkGain.connect(hoved);
    lastet = fetch(MUSIKK)
      .then((svar) => (svar.ok ? svar.arrayBuffer() : Promise.reject()))
      .then((data) => ctx.decodeAudioData(data))
      .then((b) => { buffer = b; })
      .catch(() => {});
  }

  function stoppMusikk() {
    kilde?.stop();
    kilde = null;
  }

  // Musikken starter der animasjonen står, og tones ut mot slutten.
  async function spill(t) {
    klargjor();
    const denne = ++runde;
    await ctx.resume();
    await lastet;
    if (denne !== runde) return;
    stoppMusikk();
    if (!buffer || t >= varighet) return;
    kilde = ctx.createBufferSource();
    kilde.buffer = buffer;
    kilde.connect(musikkGain);
    const naa = ctx.currentTime;
    const igjen = (varighet - t) / 1000;
    const utStart = Math.max(0, igjen - UTTONING / 1000);
    musikkGain.gain.cancelScheduledValues(naa);
    musikkGain.gain.setValueAtTime(MUSIKK_STYRKE * Math.min(1, igjen / (UTTONING / 1000)), naa);
    musikkGain.gain.setValueAtTime(MUSIKK_STYRKE * Math.min(1, igjen / (UTTONING / 1000)), naa + utStart);
    musikkGain.gain.linearRampToValueAtTime(0, naa + igjen);
    kilde.start(naa, (t / 1000) % buffer.duration, igjen);
  }

  function pause() {
    runde++;
    stoppMusikk();
  }

  function demp(av) {
    klargjor();
    hoved.gain.value = av ? 0 : 1;
  }

  function tone(frekvens, start, lengde, { type = 'sine', styrke = 1, til = frekvens } = {}) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(frekvens, start);
    o.frequency.exponentialRampToValueAtTime(til, start + lengde);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(EFFEKT_STYRKE * styrke, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + lengde);
    o.connect(g).connect(hoved);
    o.start(start);
    o.stop(start + lengde + 0.05);
  }

  // Hver landing er en liten «plopp», én tone høyere for hvert felt.
  const SKALA = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
  function hopp(felt) {
    if (!ctx) return;
    const f = 392 * 2 ** (SKALA[Math.min(felt, SKALA.length - 1)] / 12);
    tone(f * 0.7, ctx.currentTime, 0.18, { til: f });
  }

  // Brikken når flagget: en kort fanfare som stiger.
  function maal() {
    if (!ctx) return;
    const s = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, s + i * 0.11, i === 3 ? 0.6 : 0.2, { type: 'triangle', styrke: 0.8 }));
  }

  // Lappen: papir som rasler, og en lys klokke når den foldes ut.
  function lapp() {
    if (!ctx) return;
    const s = ctx.currentTime;
    const lengde = 0.45;
    const data = ctx.createBuffer(1, ctx.sampleRate * lengde, ctx.sampleRate);
    const d = data.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const stoy = ctx.createBufferSource();
    stoy.buffer = data;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = EFFEKT_STYRKE * 0.6;
    stoy.connect(filter).connect(g).connect(hoved);
    stoy.start(s);
    tone(1319, s + 0.75, 0.9, { styrke: 0.6 });
    tone(1976, s + 0.75, 0.7, { styrke: 0.3 });
  }

  return { spill, pause, demp, hopp, maal, lapp };
}
