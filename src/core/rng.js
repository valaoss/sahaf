// Tohumlu RNG: durumu oyun durumunun içinde (S.rng) tutulur, aynı tohum aynı günü üretir.
// Kozmetik şeyler (bulut, kıvılcım) Math.random kullanabilir; ekonomiyi etkileyen her şey buradan geçer.

export function seedRng(S, seed) { S.rng = (seed ^ 0x9e3779b9) >>> 0 || 1; }

export function rnd(S) {
  let a = (S.rng + 0x6D2B79F5) | 0;
  S.rng = a >>> 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rndInt = (S, n) => Math.floor(rnd(S) * n);
export const rndPick = (S, arr) => arr[rndInt(S, arr.length)];

// {anahtar: ağırlık} içinden ağırlığa göre seç
export function weighted(S, weights) {
  let total = 0;
  for (const k in weights) total += weights[k];
  let r = rnd(S) * total;
  for (const k in weights) { r -= weights[k]; if (r < 0) return k; }
  return Object.keys(weights).pop();
}

// Sahne çizimi için durumdan bağımsız küçük tohumlu üreteç
export function seeded(seed) {
  let s = seed % 2147483647 || 7;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
