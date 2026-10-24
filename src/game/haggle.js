// Pazarlık: müşterinin gizli özellikleri, bir kitaba biçtiği değer, teklifleri ve tepkileri (veriler data/haggle.js).
// Saf kurallar: kopyayı raftan alma, satış ve defter game/shop.js'te (haggleMove), arayüz ui/panels/haggle.js'te.
// Terimler: P etiket fiyatı · W müşterinin biçtiği değer · B bütçesi · R ödemeye razı olduğu en fazla (B ile W'nin küçüğü) · O müşterinin teklifi
// Söz: oyuncunun kitap hakkında bildiği bir şey (konusu, durumu, ilk baskı, okuduğu, geçen seferki kitap). Müşterinin derdine dokunursa değeri artar.
import { BAL } from '../data/balance.js';
import { GENRES } from '../data/genres.js';
import { BOOK } from '../data/books.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { REGULARS } from '../data/regulars.js';
import { TRAITS, QUIRKS, QUIRK_CHANCE, TASTE, OFFER_MAX, TOO_HIGH, HAPPY_BELOW, TRUST_PER_LEVEL, HABIT, LINES, HINTS, CARE_WEIGHTS, SOZ, SOZ_LIFT, SOZ_MAX } from '../data/haggle.js';
import { rnd, rndPick, weighted } from '../core/rng.js';
import { knownTags, knowsAll } from './knowledge.js';
import { memoryGreed, pastBook } from './patrons.js';
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
  // derdi: bu kitapta neye önem verdiği (müdavim konuya ya da tavsiyeye bakar)
  t.care = regular ? (rnd(S) < 0.5 ? 'konu' : 'tavsiye') : weighted(S, CARE_WEIGHTS[arch] || CARE_WEIGHTS[A.thrift || 'mid']);
  return t;
}

// Özelliği olmayan müşteri (elle kurulan, eski kayıttan gelen): pazarlık etmez, cüzdanı sınırsız
export const PLAIN_TRAITS = { budget: 1e9, greed: 0, patience: 2, resolve: 0.5, touchy: 0, quirk: null, care: 'konu' };
export const traitsOf = c => c.tr || PLAIN_TRAITS;

// Kasabada itibarın yüksekse müşteriler daha az pazarlık eder; tanıdık geçen sefer aldığı indirimi hatırlar
const greedOf = (S, c) => Math.max(traitsOf(c).greed * Math.max(0.4, 1 - TRUST_PER_LEVEL * repLevel(S)), memoryGreed(S, c));
const likesOf = c => (c.reg ? REGULARS[c.reg]?.likes : ARCHETYPES[c.arch]?.likes) || [];

// Bir kopyanın etiket fiyatı: tür fiyatı × bölümün fiyat etiketi × durumu (× ilk baskı). cp: game/shelving.js takeCopy/peekCopy
// own: oyuncunun o kopyaya yazdığı fiyat kartı (game/shelving.js setBookPrice)
export const stickerOf = (id, cp) => cp.own || Math.max(1, Math.round(GENRES[BOOK[id].genre].price * BAL.priceTags[cp.price].mul
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

// Bu pazarlıkta söylenebilecek sözler (kitap hakkında bildiklerin), en fazla SOZ_MAX: { kind, tag?, book? }
export function sozOptions(S, c, d) {
  const out = [], known = knownTags(S, d.id), likes = likesOf(c), past = pastBook(S, c);
  if (d.cp?.rare) out.push({ kind: 'nadirlik' });
  if (d.cp?.cond === 'temiz') out.push({ kind: 'kondisyon' });
  if (known.length) out.push({ kind: 'konu', tag: known.find(t => likes.includes(t)) || known[0] });
  if (knowsAll(S, d.id)) out.push({ kind: 'kisisel' });
  if (past && past !== d.id) out.push({ kind: 'hatira', book: past });
  if (S.upgrades?.includes('paket')) out.push({ kind: 'hediye' });
  // hediye sözü paket köşesinin işi: varsa her zaman kartlarda (yer açmak için sondan bir öncekinin yerine)
  if (out.length > SOZ_MAX && out[out.length - 1].kind === 'hediye') out.splice(SOZ_MAX - 1, out.length - SOZ_MAX);
  return out.slice(0, SOZ_MAX);
}

// Söz derdine ne kadar dokunur: 1 tam, 0.5 biraz, 0 hiç. Konu sözü kişinin sevdiği etiketse ucuzluk derdinde değilse biraz dokunur.
export function sozFit(c, s) {
  const care = traitsOf(c).care;
  let fit = SOZ[s.kind]?.[care] || 0;
  if (s.kind === 'konu' && fit < 1 && care !== 'ucuzluk' && likesOf(c).includes(s.tag)) fit = Math.max(fit, 0.5);
  return fit;
}

// Söz söylendi (pazarlıkta bir kez): dokunduysa biçtiği değer artar, sabrı uzar; etiket artık rahat ödenebiliyorsa ikna olur
function speak(S, c, d, kind) {
  const s = sozOptions(S, c, d).find(o => o.kind === kind);
  if (d.soz || !s) return { out: 'sozNo', offer: d.O, fit: 0 };
  d.soz = kind;
  const fit = sozFit(c, s);
  if (!fit) return { out: 'sozNo', offer: d.O, fit };
  const rareHit = kind === 'nadirlik' && ARCHETYPES[c.arch]?.collector;
  d.W *= 1 + (rareHit ? SOZ_LIFT.rare : fit === 1 ? SOZ_LIFT.full : SOZ_LIFT.half);
  d.B = d.B ?? traitsOf(c).budget;
  if (fit === 1) { d.B = Math.round(d.B * SOZ_LIFT.stretch); (d.seen = d.seen || {}).care = true; }
  d.R = Math.min(d.B, d.W);
  d.pat += 1;
  const g = greedOf(S, c);
  if (d.P <= d.R * (1 - g / 2)) return { out: 'deal', price: d.P, ask: d.P, happy: d.P <= d.W * HAPPY_BELOW, fit, convinced: true };
  d.O = Math.max(d.O, Math.min(d.P - 1, Math.floor(d.R * (1 - g / 2))));
  d.final = false;
  return { out: 'sozYes', offer: d.O, fit };
}

// Pazarlık hamlesi. move: accept (müşterinin teklifi) | mid (orta yol) | hold (etiket fiyatı) | refuse (vazgeç) | soz:<tür> (söz söyle).
// d: { P, O, R, W, B, pat, final, rounds, soz, seen } (yerinde değişir).
// Dönüş: { out: deal | counter | final | leave | angry | sozYes | sozNo, price?, ask?, happy?, polite?, impatient?, fit? }
export function respond(S, c, d, move) {
  d.rounds++;
  if (move.startsWith('soz:')) return speak(S, c, d, move.slice(4));
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
    // gözlenen: son sözü bütçesini, gidişi sabrını gösterir
    d.seen = d.seen || {};
    if (rnd(S) < traitsOf(c).resolve) { d.O = top; d.final = true; d.seen.budget = top; return { out: 'final', offer: d.O, ask }; }
    d.seen.patience = true;
    return { out: 'leave', ask, impatient: true };
  }
  d.O = Math.min(top, d.O + Math.max(1, Math.round((top - d.O) * (0.35 + 0.35 * rnd(S)))));
  return { out: 'counter', offer: d.O, ask };
}

// Müşterinin cümlesi: duruma ve konuşma üslubuna göre; kısa aralıkla aynı cümle tekrar etmez. {p} fiyat, {b} kitap adı
const voiceOf = c => c.reg ? REGULARS[c.reg]?.voice || 'samimi' : ARCHETYPES[c.arch]?.voice || 'samimi';
function pickLine(S, table, c) {
  const list = table[voiceOf(c)] || table.samimi;
  const l = pickFresh(S, 'haggle', list);
  remember(S, 'haggle', l);
  return l;
}
export function lineFor(S, c, kind, price = null, book = null) {
  let l = pickLine(S, LINES[kind], c);
  if (price != null) l = l.split('{p}').join('₺' + price);
  if (book) l = l.split('{b}').join(book);
  return l;
}
// Derdinin ipucu: ilk teklifin ardından söylenir
export const hintFor = (S, c) => pickLine(S, HINTS[traitsOf(c).care] || HINTS.konu, c);
