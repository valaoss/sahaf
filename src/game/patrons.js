// Tanıdıklar: iyi bir alışverişten sonra kartını bırakan müşteriler (adlı müdavimlerden ayrı; data/regulars.js onlar).
// Kendi kasabalarında arada bir yine uğrarlar; son alışverişlerini ve verdiğin indirimi hatırlarlar.
// Pazarlıkta gözlediğin özellikleri (bütçesi, sabrı, derdi) Defter > Müşteriler'de birikir.
// Durum S.patrons: { [id]: { arch, look, style, town, tr, visits, since, last: { book, price, sticker, day }, seen } }
import { BAL } from '../data/balance.js';
import { BOOK } from '../data/books.js';
import { rnd } from '../core/rng.js';

export const patronOf = (S, c) => (c?.pat && S.patrons[c.pat]) || null;
export const emptySeen = () => ({ budget: null, patience: false, care: false });

// gözlenenler birikir: bütçe (son sözünde söylediği), sabır (sabrı tükendi mi), derdi (söz tam isabet etti mi)
export function mergeSeen(seen, s = {}) {
  if (s.budget) seen.budget = s.budget;
  if (s.patience) seen.patience = true;
  if (s.care) seen.care = true;
  return seen;
}

// İyi bir alışveriş bitti: tanıdıksa son alışverişi ve gözlenenler güncellenir; değilse memnunsa bazen kartını bırakır.
// price: ödenen (pazarlıksız öneri satışında null) · sticker: etiket fiyatı. Dönüş: yeni tanıdığın kimliği ya da null
export function patronAfterSale(S, c, book, price, sticker, seen, pleased) {
  const P = patronOf(S, c), last = { book, price, sticker, day: S.day };
  if (P) { P.visits++; P.last = last; mergeSeen(P.seen, seen); return null; }
  if (c.reg || !c.tr || !pleased || Object.keys(S.patrons).length >= BAL.patronMax || rnd(S) >= BAL.patronChance) return null;
  const id = 'p' + c.id;
  S.patrons[id] = { arch: c.arch, look: c.look, style: c.style, town: S.town, tr: { ...c.tr }, visits: 1, since: S.day, last, seen: mergeSeen(emptySeen(), seen) };
  return id;
}

// Anlaşılamayan pazarlıkta da tanıdık hakkında bir şey öğrenilir
export function patronAfterMiss(S, c, seen) {
  const P = patronOf(S, c);
  if (P) { P.visits++; mergeSeen(P.seen, seen); }
}

// Hafıza: geçen sefer indirim verdiysen o kadar indirimle açar (en fazla %45)
export function memoryGreed(S, c) {
  const L = patronOf(S, c)?.last;
  return L && L.price && L.sticker && L.price < L.sticker ? Math.min(0.45, 1 - L.price / L.sticker) : 0;
}

// Son aldığı kitap (hatıra sözü ve "yine geldim" cümlesi için): tanıdığın son alışverişi ya da müdavime son tam isabet
export function pastBook(S, c) {
  const P = patronOf(S, c);
  if (P?.last && BOOK[P.last.book]) return P.last.book;
  if (c?.reg) { const r = S.recHistory.filter(x => x.reg === c.reg).pop(); return r ? r.book : null; }
  return null;
}

// Gün açılınca: bu kasabanın tanıdıklarından bazıları uğrayacak (en fazla 3)
export function patronArrivals(S, len) {
  return Object.keys(S.patrons).filter(id => S.patrons[id].town === S.town && rnd(S) < BAL.patronVisit).slice(0, 3)
    .map(id => ({ id, t: Math.round(BAL.dayStart + 40 + rnd(S) * (len - 100)) })).sort((a, b) => a.t - b.t);
}
