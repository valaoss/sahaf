// Sabah işleri (koli almak, yola çıkmak) ve gün içinde müşterinin karar vermesi.
// Eylemler başarısızsa nedenini metin olarak döndürür, başarılıysa null.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { BOOK, booksOf, TAGS, ASK_ONE, ASK_TWO } from '../data/books.js';
import { rnd, rndInt, rndPick, weighted } from '../core/rng.js';
import { shelfCount, shelfCap, genreCount, takeBook } from './state.js';
import { effects } from './decor.js';

export const boxCost = g => GENRES[g].cost * BAL.boxSize;

export function canBuyBox(S, g) {
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (S.phase !== 'morning') return 'Koli yalnızca sabah alınır.';
  if (shelfCount(S) + BAL.boxSize > shelfCap(S)) return 'Raflarda yer yok.';
  if (S.coins < boxCost(g)) return 'Paran yetmiyor.';
  return null;
}

// Koli: o türden olabildiğince farklı kitaplar (rafta az olan önce)
export function buyBox(S, g) {
  const why = canBuyBox(S, g);
  if (why) return why;
  const cost = boxCost(g);
  S.coins -= cost;
  S.totals.spent += cost;
  const got = [];
  for (let i = 0; i < BAL.boxSize; i++) {
    const pool = booksOf(g).filter(b => !got.includes(b.id));
    const least = Math.min(...pool.map(b => S.shelf[b.id] || 0));
    const id = rndPick(S, pool.filter(b => (S.shelf[b.id] || 0) === least)).id;
    S.shelf[id] = (S.shelf[id] || 0) + 1;
    got.push(id);
  }
  return null;
}

export function canTravel(S, key) {
  if (!TOWNS[key]) return 'Böyle bir kasaba yok.';
  if (S.phase !== 'morning') return 'Yola yalnızca sabah çıkılır.';
  if (key === S.town) return 'Zaten buradasın.';
  if (S.travelled) return 'Bugün zaten yol yaptın.';
  if (S.coins < BAL.travelCost) return 'Yakıt parası yok.';
  return null;
}

export function travel(S, key) {
  const why = canTravel(S, key);
  if (why) return why;
  S.coins -= BAL.travelCost;
  S.totals.spent += BAL.travelCost;
  S.town = key;
  S.travelled = true;
  return null;
}

// Kasa boş, raflar boş: oyun kilitlenmesin diye en ucuz koliyi alacak kadar destek
export function rescue(S) {
  const cheapest = Math.min(...GENRE_KEYS.map(boxCost));
  if (S.phase !== 'morning' || shelfCount(S) > 0 || S.coins >= cheapest) return 0;
  const gift = cheapest - S.coins;
  S.coins += gift;
  return gift;
}

// Kasabanın zevki × süslerin etkisi
export function demandOf(S, townKey = S.town) {
  const d = { ...TOWNS[townKey].demand }, mul = effects(S).demand;
  for (const g in mul) d[g] *= mul[g];
  return d;
}

// Kasabada en çok aranan türler (sabah ipucu)
export function topDemand(townKey, n = 2) {
  const d = TOWNS[townKey].demand;
  return Object.keys(d).sort((a, b) => d[b] - d[a]).slice(0, n);
}

const cap = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
export function askText(tags, pick) {
  const [a, b] = tags.map(t => TAGS[t].say);
  return pick(tags.length > 1 ? ASK_TWO : ASK_ONE)
    .replace('{A}', cap(a)).replace('{a}', a).replace('{b}', b || '');
}

export function makeCustomer(S) {
  const c = { id: S.nextId++, wants: weighted(S, demandOf(S)), look: Math.floor(rnd(S) * 1e9) };
  if (rnd(S) < BAL.askChance) {
    // gerçek bir kitaptan yola çıkılır: istek her zaman en az bir kitapla tam karşılanabilir.
    // Çoğu zaman bu kitap rafta olandır (çeşitli raf ödüllendirilir), bazen raf dışındandır.
    const onShelf = Object.keys(S.shelf);
    const target = onShelf.length && rnd(S) < BAL.askFromShelf ? BOOK[rndPick(S, onShelf.sort())] : rndPick(S, booksOf(c.wants));
    c.wants = target.genre;
    const tags = target.tags.slice();
    for (let i = tags.length - 1; i > 0; i--) { const j = rndInt(S, i + 1); [tags[i], tags[j]] = [tags[j], tags[i]]; }
    const n = tags.length > 1 && rnd(S) < 0.65 ? 2 : 1;
    c.ask = { tags: tags.slice(0, n), text: askText(tags.slice(0, n), arr => rndPick(S, arr)) };
  }
  return c;
}

// Raftaki o türden bir kitap (çok olan daha olası)
function pickBookOf(S, g) {
  const w = {};
  for (const id in S.shelf) if (BOOK[id].genre === g) w[id] = S.shelf[id];
  return Object.keys(w).length ? weighted(S, w) : null;
}

function sell(S, id, res) {
  takeBook(S, id);
  const g = BOOK[id].genre, T = S.today;
  res.bought.push(id);
  res.paid += GENRES[g].price;
  T.sold[g] = (T.sold[g] || 0) + 1;
}

function settle(S, res) {
  S.coins += res.paid;
  S.today.revenue += res.paid;
  S.today.visitors++;
  return res;
}

// Normal müşteri raflara baktı: ne aldı, ne kadar ödedi, mutlu mu. Stok ve defter burada güncellenir.
export function resolveCustomer(S, c) {
  const T = S.today;
  const res = { bought: [], paid: 0, happy: false };
  if (genreCount(S, c.wants) > 0 && rnd(S) < BAL.buyChance) {
    sell(S, pickBookOf(S, c.wants), res);
    res.happy = true;
    if (genreCount(S, c.wants) > 0 && rnd(S) < BAL.extraChance) sell(S, pickBookOf(S, c.wants), res);
  } else {
    if (genreCount(S, c.wants) === 0) T.missed[c.wants] = (T.missed[c.wants] || 0) + 1;
    const avail = {}, d = demandOf(S);
    for (const g of GENRE_KEYS) if (genreCount(S, g) > 0) avail[g] = d[g];
    if (Object.keys(avail).length && rnd(S) < BAL.altChance) sell(S, pickBookOf(S, weighted(S, avail)), res);
  }
  return settle(S, res);
}

// İsteğe uygunluk: istenen her etiket kitapta varsa 'perfect', biri varsa 'good'
export function matchGrade(ask, id) {
  const hit = ask.tags.filter(t => BOOK[id].tags.includes(t)).length;
  return hit === ask.tags.length ? 'perfect' : hit ? 'good' : 'miss';
}

// Rafta isteğe en uygun kitap (simülasyon ve testler için; oyuncuya ipucu verilmez)
export function bestBook(S, ask) {
  const rank = { perfect: 2, good: 1, miss: 0 };
  let best = null, score = -1;
  for (const id in S.shelf) {
    const s = rank[matchGrade(ask, id)];
    if (s > score) { best = id; score = s; }
  }
  return score > 0 ? best : null;
}

// Öneri: oyuncu raftan bir kitap verdi (ya da null: "elimde yok" / müşteri beklemekten sıkıldı)
export function recommend(S, c, id) {
  const T = S.today;
  const res = { bought: [], paid: 0, tip: 0, happy: false, grade: 'miss' };
  if (id && S.shelf[id]) {
    res.grade = matchGrade(c.ask, id);
    if (res.grade !== 'miss') {
      sell(S, id, res);
      res.happy = true;
      res.tip = (res.grade === 'perfect' ? BAL.tipPerfect : BAL.tipGood) + effects(S).tip;
      res.paid += res.tip;
      T.tips += res.tip;
      if (res.grade === 'perfect') S.totals.perfect++;
    }
  }
  T.recs[res.grade]++;
  return settle(S, res);
}
