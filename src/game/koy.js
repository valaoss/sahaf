// Mürekkep Koyu kuralları (v3 Faz 6): mahalle kipi, açılış koşulları, güven, müdavimlerin mahalleleri.
// Mahalleler data/districts.js'te; motor onları kasaba gibi işler. Ege kasabaları FEATURES.ege (ya da akdeniz) açıkken geri gelir.
import { FEATURES } from '../data/features.js';
import { DISTRICTS, DISTRICT_KEYS, KOY_HOMES, START_DISTRICT } from '../data/districts.js';
import { TOWNS } from '../data/towns.js';
import { REGULARS } from '../data/regulars.js';

export const koyOn = () => !FEATURES.ege && !FEATURES.akdeniz;
export const isDistrict = k => !!DISTRICTS[k];
export const startTown = () => koyOn() ? START_DISTRICT : 'ayvalik';
// müdavimin uğradığı yer: mahalle kipinde Mürekkep Koyu'ndaki evi (taşınmayanlar hiç uğramaz)
export const homeOf = id => koyOn() ? KOY_HOMES[id] || null : REGULARS[id]?.town;
export const GUVEN_MAX = 100;
export const guvenOf = (S, k) => Math.min(GUVEN_MAX, S.rep[k] || 0);

// Bir günün güven kazancı: dükkân açmak, satış ve memnun pazarlık artırır; kızıp gidenler azaltır
export function guvenGain(T) {
  const g = 1 + (T.soldCount || 0) * 0.25 + (T.happyDeals || 0) * 0.75 - (T.priceLost || 0) * 0.5;
  return Math.max(0, Math.min(6, Math.round(g)));
}

// Açılış koşulları: [{ kind, need, have, ok, town? }] (bedel açılışta ödenir; arayüz metne çevirir)
export function openReqs(S, k) {
  const o = DISTRICTS[k]?.koy.open || {}, out = [];
  if (o.shelfLv) out.push({ kind: 'shelfLv', need: o.shelfLv, have: S.shelfLv, ok: S.shelfLv >= o.shelfLv });
  for (const d in o.rep || {}) out.push({ kind: 'rep', town: d, need: o.rep[d], have: guvenOf(S, d), ok: guvenOf(S, d) >= o.rep[d] });
  if (o.reps) {
    const n = DISTRICT_KEYS.filter(d => guvenOf(S, d) >= o.reps.min).length;
    out.push({ kind: 'reps', need: o.reps.n, min: o.reps.min, have: n, ok: n >= o.reps.n });
  }
  if (o.coins) out.push({ kind: 'coins', need: o.coins, have: S.coins, ok: S.coins >= o.coins });
  return out;
}

export function canOpenDistrict(S, k) {
  if (!isDistrict(k)) return 'Böyle bir mahalle yok.';
  if (S.unlocked.includes(k)) return 'Bu mahalle zaten açık.';
  if (S.phase !== 'morning') return 'Yeni mahalle yalnızca sabah açılır.';
  const reqs = openReqs(S, k);
  if (reqs.some(r => !r.ok && r.kind !== 'coins')) return 'Koşullar henüz tutmuyor.';
  if (reqs.some(r => !r.ok)) return 'Paran yetmiyor.';
  return null;
}

// Mahalleyi aç: bedeli öde, yola aç. S.koyNew: haritada sis kalkma ve yol çizme animasyonu için
export function openDistrict(S, k) {
  const why = canOpenDistrict(S, k);
  if (why) return why;
  const c = DISTRICTS[k].koy.open?.coins || 0;
  S.coins -= c;
  S.totals.spent += c;
  S.unlocked.push(k);
  S.koyNew = k;
  return null;
}

// Haritada gösterilenler: açık mahalleler ve açılabilecek olanlar (sıradaki); açılmışlar dahil hepsi
export const districtsOf = () => DISTRICT_KEYS.filter(k => TOWNS[k]);
