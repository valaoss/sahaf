// Müzik besteleyici: ses çalmaz, yalnızca nota listesi üretir (test edilebilir).
// Dört akorlu, 8 ölçülük sakin bir döngü; melodi akorun pentatonik notalarından, ölçü numarasıyla tohumlanır.
import { seeded } from '../core/rng.js';

const A4 = 440;
export const midiToHz = m => A4 * 2 ** ((m - 69) / 12);

// Akorlar: kök (MIDI) + akor notaları. Mevsime göre hafif farklı renk.
const PROGRESSIONS = {
  'İlkbahar': [[48, [0, 4, 7, 11]], [45, [0, 3, 7, 10]], [41, [0, 4, 7, 11]], [43, [0, 4, 7, 9]]],   // Cmaj7 Am7 Fmaj7 G6
  'Yaz':      [[50, [0, 4, 7, 11]], [47, [0, 3, 7, 10]], [43, [0, 4, 7, 11]], [45, [0, 4, 7, 9]]],   // Dmaj7 Bm7 Gmaj7 A6
  'Sonbahar': [[45, [0, 3, 7, 10]], [41, [0, 4, 7, 11]], [48, [0, 4, 7, 11]], [43, [0, 4, 7, 10]]],  // Am7 Fmaj7 Cmaj7 G7
  'Kış':      [[45, [0, 3, 7, 10]], [43, [0, 4, 7, 10]], [41, [0, 4, 7, 11]], [40, [0, 3, 7, 10]]],  // Am7 G7 Fmaj7 Em7
};
// Kasaba motifleri: pentatonik basamaklar (0–4), sekiz ölçüde bir çan sesiyle çalınır; kasabayı kulaktan tanıtır
export const MOTIFS = {
  ayvalik: [0, 2, 4, 2],
  cunda: [4, 3, 1, 0],
  foca: [0, 1, 2, 4],
  alacati: [2, 4, 3, 4],
  bozcaada: [1, 3, 4, 3],
  sirince: [4, 2, 1, 2],
  dikili: [0, 4, 2, 0],
  urla: [2, 1, 3, 1],
  assos: [4, 1, 0, 3],
  bodrum: [0, 4, 3, 1],
  antalya: [2, 3, 4, 0],
  istanbul: [4, 2, 3, 1],
  kapadokya: [1, 2, 4, 2],
  venedik: [4, 3, 1, 2],
  roma: [0, 4, 2, 3],
  napoli: [2, 4, 4, 1],
  palermo: [1, 3, 0, 4],
  marsilya: [0, 3, 2, 4],
  nis: [4, 2, 0, 1],
  barselona: [2, 4, 1, 3],
  valensiya: [0, 2, 3, 2],
  malaga: [4, 3, 0, 2],
  iskenderiye: [1, 4, 3, 0],
  kahire: [3, 1, 4, 2],
  midilli: [2, 0, 4, 2],
  atina: [0, 2, 4, 4],
  selanik: [4, 3, 2, 0],
  santorini: [1, 4, 2, 3],
};

// Plak çalar temaları: akor dizisi, tempo farkı, arpej yoğunluğu (rest: tıngırtıyı atlama ihtimali)
export const THEMES = {
  akustik: { name: 'Akustik', tempo: 0, rest: 0.22 },
  caz:     { name: 'Caz', tempo: 10, rest: 0.3,
    prog: [[50, [0, 3, 7, 10, 14]], [43, [0, 4, 7, 10, 14]], [48, [0, 4, 7, 11, 14]], [45, [0, 4, 7, 10, 13]]] },  // Dm9 G9 Cmaj9 A7b9
  ninni:   { name: 'Ninni', tempo: -18, rest: 0.55,
    prog: [[48, [0, 4, 7, 11]], [41, [0, 4, 7, 11]], [45, [0, 3, 7, 10]], [43, [0, 5, 7, 10]]] },                     // Cmaj7 Fmaj7 Am7 Gsus
};

export const TEMPO = { 'İlkbahar': 76, 'Yaz': 84, 'Sonbahar': 72, 'Kış': 66 };
export const BEATS_PER_BAR = 4;

// Bir ölçünün notaları: { t (vuruş), dur (vuruş), midi, inst: 'bass' | 'pluck' | 'pad' | 'bell', vel }
// opts: { town (motif), lively (festival: daha dolu arpej), night (akşam: çan yok, daha yumuşak), theme (plak çalar) }
export function composeBar(bar, season = 'İlkbahar', opts = {}) {
  const th = THEMES[opts.theme] || THEMES.akustik;
  const prog = th.prog || PROGRESSIONS[season] || PROGRESSIONS['İlkbahar'];
  const [root, chord] = prog[Math.floor(bar / 2) % prog.length];
  const r = seeded(bar * 131 + 17);
  const notes = [];
  // bas: ölçü başında kök, üçüncü vuruşta beşli
  notes.push({ t: 0, dur: 2, midi: root - 12, inst: 'bass', vel: 0.9 });
  notes.push({ t: 2, dur: 2, midi: root - 12 + 7, inst: 'bass', vel: 0.7 });
  // pad: ölçünün tamamı, iki ölçüde bir
  if (bar % 2 === 0) for (const iv of chord.slice(0, 3)) notes.push({ t: 0, dur: 8, midi: root + 12 + iv, inst: 'pad', vel: 0.5 });
  // arpej: sekizlik gitar tıngırtısı, arada boşluk bırakır
  for (let i = 0; i < 8; i++) {
    if (r() < (opts.lively ? th.rest * 0.3 : th.rest)) continue;
    const iv = chord[(i + (r() < 0.3 ? 1 : 0)) % chord.length];
    notes.push({ t: i / 2, dur: 1.5, midi: root + 12 + iv + (i >= 4 && r() < 0.4 ? 12 : 0), inst: 'pluck', vel: 0.45 + r() * 0.3 });
  }
  // kasaba motifi: sekiz ölçüde bir, kasabanın imzası
  const penta = [0, 2, 4, 7, 9].map(x => root + 24 + x);
  if (opts.town && MOTIFS[opts.town] && bar % 8 === 7 && !opts.night) {
    MOTIFS[opts.town].forEach((deg, i) => notes.push({ t: 0.5 + i * 0.75, dur: 1.2, midi: penta[deg], inst: 'bell', vel: 0.45 }));
  } else if (bar % 4 === 3 && !opts.night) {
    // melodi: dört ölçüde bir küçük bir motif (çan sesi), pentatonik notalardan
    let t = 0.5;
    for (let k = 0; k < 3 + Math.floor(r() * 3) && t < 4; k++) {
      notes.push({ t, dur: 1, midi: penta[Math.floor(r() * penta.length)], inst: 'bell', vel: 0.35 + r() * 0.2 });
      t += r() < 0.5 ? 0.5 : 1;
    }
  }
  if (opts.night) for (const n of notes) n.vel *= 0.7;
  return notes;
}
