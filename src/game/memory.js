// Tekrar bekçisi: son görülen cümleleri, kitapları, müşteri tiplerini ve olayları bir pencerede tutar.
// Seçimler bu pencereyi atlayarak yapılır; böylece oyuncu kısa aralıkla aynı şeyi görmez.
import { rndPick, weighted } from '../core/rng.js';

export const WINDOW = { text: 40, book: 20, arch: 4, hap: 12, letter: 30 };

function bucket(S, kind) {
  S.recent = S.recent || {};
  return (S.recent[kind] = S.recent[kind] || []);
}

export function remember(S, kind, key) {
  const b = bucket(S, kind);
  b.push(key);
  while (b.length > (WINDOW[kind] || 20)) b.shift();
}

export const seenRecently = (S, kind, key) => bucket(S, kind).includes(key);

// Pencerede olmayanlardan seç; hepsi yakın zamanda görüldüyse yine de birini ver
export function pickFresh(S, kind, list, key = x => x) {
  const fresh = list.filter(x => !seenRecently(S, kind, key(x)));
  return rndPick(S, fresh.length ? fresh : list);
}

// Ağırlıklı seçim: yakın zamanda görülenin ağırlığı kısılır (tamamen yasaklanmaz)
export function weightedFresh(S, kind, weights, damp = 0.25) {
  const w = {};
  for (const k in weights) w[k] = weights[k] * (seenRecently(S, kind, k) ? damp : 1);
  return weighted(S, w);
}
