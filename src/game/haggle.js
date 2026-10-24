// Pazarlık: müşterinin gizli özellikleri, bir kitaba biçtiği değer, teklifleri ve tepkileri (veriler data/haggle.js).
// Saf kurallar: kopyayı raftan alma, satış ve defter game/shop.js'te (haggleMove), arayüz ui/panels/haggle.js'te.
// Terimler: P etiket fiyatı · W müşterinin biçtiği değer · R ödemeye razı olduğu en fazla (bütçe ile W'nin küçüğü) · O müşterinin teklifi
import { BAL } from '../data/balance.js';
import { GENRES } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { REGULARS } from '../data/regulars.js';
import { TRAITS, QUIRKS, QUIRK_CHANCE, TASTE, OFFER_MAX, TOO_HIGH, HAPPY_BELOW, TRUST_PER_LEVEL, HABIT, LINES } from '../data/haggle.js';
import { rnd, rndPick } from '../core/rng.js';
import { pickFresh, remember } from './memory.js';
import { repLevel } from './bonds.js';

const span = (S, [lo, hi]) => lo + rnd(S) * (hi - lo);

// Müşterinin gizli özellikleri: tipinin dağılımından çekilir, bazen bir huy düşer; müdavimler az pazarlık eder, daha sabırlıdır
export function traitsFor(S, arch = null, regular = false) {
  const A = ARCHETYPES[arch] || {}, base = { ...TRAITS[A.thrift || 'mid'], ...(A.haggle || {}) };
  const t = { budget: Math.round(span(S, base.budget)), greed: span(S, base.greed), patience: Math.round(span(S, base.patience)),
    resolve: span(S, base.resolve), touchy: span(S, base.touchy), quirk: null };
  if (rnd(S) < QUIRK_CHANCE) {
    const k = rndPick(S, Object.keys(QUIRKS)), Q = QUIRKS[k];
    t.quirk = k;
    if (Q.patienceSet) t.patience = Q.patienceSet;
    if (Q.patienceAdd) t.patience += Q.patienceAdd;
    if (Q.budgetMul) t.budget = Math.round(t.budget * Q.budgetMul);
    if (Q.greedMul) t.greed = Math.min(0.45, t.greed * Q.greedMul);
    if (Q.touchy) t.touchy = Math.min(0.95, t.touchy + Q.touchy);
  }
  if (regular) { t.greed *= 0.5; t.patience += 1; t.touchy *= 0.5; }
  t.patience = Math.max(1, t.patience);
  return t;
}

// Özelliği olmayan müşteri (elle kurulan, eski kayıttan gelen): pazarlık etmez, cüzdanı sınırsız
export const PLAIN_TRAITS = { budget: 1e9, greed: 0, patience: 2, resolve: 0.5, touchy: 0, quirk: null };
export const traitsOf = c => c.tr || PLAIN_TRAITS;

// Kasabada itibarın yüksekse müşteriler daha az pazarlık eder
const greedOf = (S, c) => traitsOf(c).greed * Math.max(0.4, 1 - TRUST_PER_LEVEL * repLevel(S));

// Bir kopyanın etiket fiyatı: tür fiyatı × bölümün fiyat etiketi × durumu (× ilk baskı). cp: game/shelving.js takeCopy/peekCopy
export const stickerOf = (id, cp) => Math.max(1, Math.round(GENRES[BOOK[id].genre].price * BAL.priceTags[cp.price].mul
  * BAL.conds[cp.cond].sell * (cp.rare ? BAL.rareMul : 1)));

// Müşterinin bu kopyaya biçtiği değer: piyasa değeri (etiketsiz) × zevkine uygunluk × kişisel oynama.
// grade: öneriyle gelen kitabın isteğe uyumu · cebine bakmayan müşteri pahalı etiketi kalite sayar
export function worthOf(S, c, id, cp, grade = null) {
  const market = GENRES[BOOK[id].genre].price * BAL.conds[cp.cond].sell * (cp.rare ? BAL.rareMul : 1);
  const taste = grade ? TASTE[grade] || 1 : BOOK[id].genre === c.wants ? TASTE.wanted : TASTE.other;
  const quality = ARCHETYPES[c.arch]?.thrift === 'loose' && cp.price === 'pahali' ? 1.12 : 1;
  return market * taste * quality * span(S, TASTE.noise);
}

// Müşteri bir kopyaya bakar: { kind, P, O, R, W }. kind: buy (pazarlıksız etiket fiyatını öder) | offer (pazarlığa gelir) | leave (vazgeçer).
// grade verilirse (öneri isteyen) pahalı bulsa da pazarlığı dener; ancak bütçesinin çok üstündeyse o da vazgeçer.
export function approach(S, c, id, cp, grade = null) {
  const P = stickerOf(id, cp), W = worthOf(S, c, id, cp, grade), R = Math.min(traitsOf(c).budget, W), g = greedOf(S, c);
  if (P <= R * (1 - g / 2)) {
    // parası yetiyor: çoğu pazarlıksız öder; pazarlıkçı ruhlu olan yine de teklif verir ama etikete razıdır (habit)
    if (P >= 2 && rnd(S) < g * HABIT) return { kind: 'offer', P, O: Math.max(1, Math.min(P - 1, Math.floor(P * (1 - g)))), R, W, habit: true };
    return { kind: 'buy', P, R, W, cheap: P <= R * 0.8 };
  }
  if (P > R * (grade ? 2.5 : OFFER_MAX)) return { kind: 'leave', P, R, W };
  // cebi dar: teklifi gerçek sınırının altında açar; zorlamak sabrını yer
  const O = Math.max(1, Math.min(P - 1, Math.floor(R * (1 - g))));
  if (O >= P) return { kind: 'buy', P, R, W, cheap: false };
  return { kind: 'offer', P, O, R, W, habit: false };
}

// Orta yol: müşterinin teklifiyle etiket fiyatının ortası (en az teklifin bir fazlası)
export const midOf = d => Math.min(d.P, Math.max(d.O + 1, Math.round((d.O + d.P) / 2)));

// Pazarlık hamlesi. move: accept (müşterinin teklifi) | mid (orta yol) | hold (etiket fiyatı) | refuse (vazgeç).
// d: { P, O, R, W, pat, final, rounds } (yerinde değişir).
// Dönüş: { out: deal | counter | final | leave | angry, price?, ask?, happy?, polite?, impatient? }
export function respond(S, c, d, move) {
  d.rounds++;
  if (move === 'refuse') return { out: 'leave', polite: true };
  if (move === 'accept') return { out: 'deal', price: d.O, happy: d.O <= d.W * HAPPY_BELOW };
  const ask = move === 'hold' ? d.P : midOf(d);
  if (ask <= d.R) return { out: 'deal', price: ask, ask, happy: ask <= d.W * HAPPY_BELOW };
  if (d.final) return { out: 'leave', ask, impatient: true };
  const over = ask / d.R, top = Math.max(d.O, Math.floor(d.R));
  // fiyatı çok yüksek bulan alıngan müşteri hemen gider
  if (over > TOO_HIGH && rnd(S) < traitsOf(c).touchy) return { out: 'angry', ask };
  d.pat -= over > TOO_HIGH ? 2 : 1;
  if (d.pat <= 0 || d.O >= top) {
    // sabrı bitti: kararlıysa son sözünü söyler (bütçesinin tamamı), değilse gider
    if (rnd(S) < traitsOf(c).resolve) { d.O = top; d.final = true; return { out: 'final', offer: d.O, ask }; }
    return { out: 'leave', ask, impatient: true };
  }
  d.O = Math.min(top, d.O + Math.max(1, Math.round((top - d.O) * (0.35 + 0.35 * rnd(S)))));
  return { out: 'counter', offer: d.O, ask };
}

// Müşterinin cümlesi: duruma ve konuşma üslubuna göre; kısa aralıkla aynı cümle tekrar etmez
export function lineFor(S, c, kind, price = null) {
  const voice = c.reg ? REGULARS[c.reg]?.voice || 'samimi' : ARCHETYPES[c.arch]?.voice || 'samimi';
  const list = LINES[kind][voice] || LINES[kind].samimi;
  const l = pickFresh(S, 'haggle', list);
  remember(S, 'haggle', l);
  return price == null ? l : l.split('{p}').join('₺' + price);
}
