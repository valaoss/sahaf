// Sabah işleri (koli almak, yola çıkmak) ve gün içinde müşterinin karar vermesi.
// Eylemler başarısızsa nedenini metin olarak döndürür, başarılıysa null.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { BOOK, BOOKS, booksOf, TAGS, ASK_ONE, ASK_TWO } from '../data/books.js';
import { SPOTS, firstSpot } from '../data/spots.js';
import { REGULARS, HEARTS_MAX, HEARTS_TIP, REGULAR_TIP, GIFT_COINS } from '../data/regulars.js';
import { DECOR } from '../data/decor.js';
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
  S.spot = firstSpot(key);
  S.travelled = true;
  return null;
}

export const spotOf = S => SPOTS[S.town][S.spot];

export function chooseSpot(S, key) {
  if (S.phase !== 'morning') return 'Mekân yalnızca sabah değişir.';
  if (!SPOTS[S.town][key]) return 'Bu kasabada böyle bir yer yok.';
  S.spot = key;
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

// Kasabanın zevki × mekân × süslerin etkisi
export function demandOf(S, townKey = S.town) {
  const d = { ...TOWNS[townKey].demand }, mul = effects(S).demand;
  const spot = townKey === S.town ? spotOf(S).demand : {};
  for (const g in spot) d[g] *= spot[g];
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
  if (rnd(S) < BAL.askChance * spotOf(S).ask) {
    // gerçek bir kitaptan yola çıkılır: istek her zaman en az bir kitapla tam karşılanabilir.
    // Çoğu zaman bu kitap rafta olandır (çeşitli raf ödüllendirilir), bazen raf dışındandır;
    // raf dışındaysa yarı yarıya mekânın havasına uyan bir kitaptır (iskelede deniz, kalede savaş…).
    const onShelf = Object.keys(S.shelf);
    let target;
    if (onShelf.length && rnd(S) < BAL.askFromShelf) target = BOOK[rndPick(S, onShelf.sort())];
    else {
      const moody = BOOKS.filter(b => b.tags.some(t => spotOf(S).tags.includes(t)));
      target = rnd(S) < 0.5 ? rndPick(S, moody) : rndPick(S, booksOf(c.wants));
    }
    c.wants = target.genre;
    const tags = target.tags.slice();
    for (let i = tags.length - 1; i > 0; i--) { const j = rndInt(S, i + 1); [tags[i], tags[j]] = [tags[j], tags[i]]; }
    const n = tags.length > 1 && rnd(S) < 0.65 ? 2 : 1;
    c.ask = { tags: tags.slice(0, n), text: askText(tags.slice(0, n), arr => rndPick(S, arr)) };
  }
  return c;
}

// Müdavim: zevkine en çok uyan kitaplardan birinden yola çıkan bir istek
export function makeRegular(S, id) {
  const R = REGULARS[id];
  const overlap = b => b.tags.filter(t => R.likes.includes(t)).length;
  const best = Math.max(...BOOKS.map(overlap));
  // raftakilerden uyanı varsa çoğunlukla onu ister (karşılanabilir kalsın)
  const shelfFit = Object.keys(S.shelf).map(i => BOOK[i]).filter(b => overlap(b) >= 2);
  const target = shelfFit.length && rnd(S) < BAL.askFromShelf
    ? rndPick(S, shelfFit.sort((a, b) => a.id < b.id ? -1 : 1))
    : rndPick(S, BOOKS.filter(b => overlap(b) >= Math.min(best, 2)));
  const tags = target.tags.filter(t => R.likes.includes(t)).slice(0, 2);
  return { id: S.nextId++, reg: id, wants: R.genre, look: R.look, style: R.style,
    ask: { tags, text: askText(tags, arr => rndPick(S, arr)) } };
}

// Kalp ekle; eşikleri geçince ödül bilgisini döndür
function befriend(S, id, res) {
  const before = S.friends[id] || 0;
  if (before >= HEARTS_MAX) return;
  const now = before + 1;
  S.friends[id] = now;
  res.friend = { id, hearts: now };
  if (now === HEARTS_MAX && !S.gifts.includes(id)) {
    S.gifts.push(id);
    const R = REGULARS[id];
    if (R.gift && DECOR[R.gift]) { S.decor.owned.push(R.gift); res.friend.gift = R.gift; }
    else { S.coins += GIFT_COINS; res.friend.coins = GIFT_COINS; }
  }
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
      if (c.reg && (S.friends[c.reg] || 0) >= HEARTS_TIP) res.tip += REGULAR_TIP;
      res.paid += res.tip;
      T.tips += res.tip;
      if (res.grade === 'perfect') S.totals.perfect++;
    }
  }
  if (c.reg) {
    if (!S.met.includes(c.reg)) S.met.push(c.reg);
    if (res.grade === 'perfect') befriend(S, c.reg, res);
    (T.regulars = T.regulars || []).push({ id: c.reg, grade: res.grade });
  }
  T.recs[res.grade]++;
  return settle(S, res);
}
