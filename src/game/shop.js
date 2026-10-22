// Sabah işleri (koli almak, yola çıkmak) ve gün içinde müşterinin karar vermesi.
// Eylemler başarısızsa nedenini metin olarak döndürür, başarılıysa null.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { BOOK, BOOKS, booksOf } from '../data/books.js';
import { SPOTS, firstSpot } from '../data/spots.js';
import { REGULARS, HEARTS_MAX, HEARTS_TIP, REGULAR_TIP, GIFT_COINS } from '../data/regulars.js';
import { ARCHETYPES, ARCH_KEYS } from '../data/archetypes.js';
import { DECOR } from '../data/decor.js';
import { rnd, rndInt, rndPick, weighted } from '../core/rng.js';
import { shelfCount, shelfCap, takeBook, seasonOf } from './state.js';
import { effects } from './decor.js';
import { dayMods, weatherOf } from './calendar.js';
import { buildAsk } from './asks.js';
import { remember, pickFresh, weightedFresh } from './memory.js';
export { askText } from './asks.js';

export const boxCost = g => GENRES[g].cost * BAL.boxSize;

export function canBuyBox(S, g) {
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (S.phase !== 'morning') return 'Koli yalnızca sabah alınır.';
  if (shelfCount(S) + BAL.boxSize > shelfCap(S)) return 'Raflarda yer yok.';
  if (S.coins < boxCost(g)) return 'Paran yetmiyor.';
  return null;
}

// Koli: o türden olabildiğince farklı kitaplar (rafta az olan önce); arada bir ilk baskı çıkar.
// Dönen değer: hata metni ya da null; çıkan ilk baskılar S.lastBox.rare içinde
export function buyBox(S, g) {
  const why = canBuyBox(S, g);
  if (why) return why;
  const cost = boxCost(g);
  S.coins -= cost;
  S.totals.spent += cost;
  const got = [], rare = [];
  for (let i = 0; i < BAL.boxSize; i++) {
    const pool = booksOf(g).filter(b => !got.includes(b.id));
    const least = Math.min(...pool.map(b => S.shelf[b.id] || 0));
    const id = rndPick(S, pool.filter(b => (S.shelf[b.id] || 0) === least)).id;
    S.shelf[id] = (S.shelf[id] || 0) + 1;
    if (rnd(S) < BAL.rareChance * dayMods(S.day, S.town).rare) { S.rare[id] = (S.rare[id] || 0) + 1; rare.push(id); }
    got.push(id);
  }
  S.lastBox = { genre: g, books: got, rare };
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

// Kasabanın zevki × mekân × gün × süslerin etkisi
export function demandOf(S, townKey = S.town) {
  const d = { ...TOWNS[townKey].demand }, mul = effects(S).demand;
  const spot = townKey === S.town ? spotOf(S).demand : {};
  for (const g in spot) d[g] *= spot[g];
  const today = dayMods(S.day, townKey).demand;
  for (const g in today) d[g] *= today[g];
  for (const g in mul) d[g] *= mul[g];
  return d;
}

// Kasabada en çok aranan türler (sabah ipucu)
export function topDemand(townKey, n = 2) {
  const d = TOWNS[townKey].demand;
  return Object.keys(d).sort((a, b) => d[b] - d[a]).slice(0, n);
}

// Normal satışa açık kopya (ilk baskılar koleksiyoncuya saklanır)
export const plainCopies = (S, id) => (S.shelf[id] || 0) - (S.rare[id] || 0);
const plainOfGenre = (S, g) => Object.keys(S.shelf).reduce((n, id) => n + (BOOK[id].genre === g ? plainCopies(S, id) : 0), 0);

// Günün havası, mevsimi ve mekânı: cümle bağlamı için
const askCtx = (S, extra) => ({ weather: weatherOf(S.day), season: seasonOf(S.day), scene: spotOf(S).scene, ...extra });

function shuffled(S, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = rndInt(S, i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function makeCustomer(S) {
  const sp = spotOf(S), season = seasonOf(S.day);
  // önce kim olduğu: mekâna ve mevsime göre, yakın zamanda gelen tip daha az olası
  const aw = {};
  const today = dayMods(S.day, S.town);
  for (const k of ARCH_KEYS) { const A = ARCHETYPES[k]; aw[k] = A.weight * (A.where[sp.scene] || 1) * (A.when[season] || 1) * (today.arch[k] || 1); }
  const arch = weightedFresh(S, 'arch', aw, 0.4);
  remember(S, 'arch', arch);
  const A = ARCHETYPES[arch];
  const d = demandOf(S);
  for (const g in A.genres) d[g] *= A.genres[g];
  const c = { id: S.nextId++, arch, wants: weighted(S, d), look: Math.floor(rnd(S) * 1e9), style: A.style };

  if (rnd(S) < BAL.askChance * sp.ask * dayMods(S.day, S.town).ask * A.ask) {
    // koleksiyoncu çoğu zaman ilk baskı ister
    const wantsRare = A.collector && rnd(S) < 0.6;
    // gerçek bir kitaptan yola çıkılır: istek her zaman en az bir kitapla tam karşılanabilir.
    // Çoğu zaman bu kitap raftadır (çeşitli raf ödüllendirilir); değilse mekânın havasına ya da kişinin zevkine uyar.
    const onShelf = Object.keys(wantsRare ? S.rare : S.shelf).filter(id => (wantsRare ? S.rare : S.shelf)[id] > 0).sort();
    let target;
    if (onShelf.length && rnd(S) < BAL.askFromShelf) target = BOOK[pickFresh(S, 'book', onShelf)];
    else {
      const r = rnd(S);
      const pool = r < 0.35 ? BOOKS.filter(b => b.tags.some(t => sp.tags.includes(t)))
        : r < 0.7 ? BOOKS.filter(b => b.tags.some(t => A.likes.includes(t)))
        : booksOf(c.wants);
      target = pickFresh(S, 'book', pool, b => b.id);
    }
    remember(S, 'book', target.id);
    c.wants = target.genre;
    // kişinin sevdiği etiketler öne
    const tags = shuffled(S, target.tags).sort((x, y) => A.likes.includes(y) - A.likes.includes(x));
    const n = wantsRare ? 1 : tags.length > 1 && rnd(S) < 0.65 ? 2 : 1;
    c.ask = { tags: tags.slice(0, n), rare: wantsRare,
      text: buildAsk(S, tags.slice(0, n), askCtx(S, { voice: A.voice, arch, rare: wantsRare })) };
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
    ? pickFresh(S, 'book', shelfFit.sort((a, b) => a.id < b.id ? -1 : 1), b => b.id)
    : pickFresh(S, 'book', BOOKS.filter(b => overlap(b) >= Math.min(best, 2)), b => b.id);
  remember(S, 'book', target.id);
  const tags = target.tags.filter(t => R.likes.includes(t)).slice(0, 2);
  return { id: S.nextId++, reg: id, wants: R.genre, look: R.look, style: R.style,
    ask: { tags, text: buildAsk(S, tags, askCtx(S, { voice: R.voice || 'samimi', bare: true })) } };
}

// Kalp ekle; eşikleri geçince ödül bilgisini döndür
export function addHeart(S, id) { const res = {}; befriend(S, id, res); return res.friend || null; }

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

// Raftaki o türden, normal satışa açık bir kitap (çok olan daha olası)
function pickBookOf(S, g) {
  const w = {};
  for (const id in S.shelf) if (BOOK[id].genre === g && plainCopies(S, id) > 0) w[id] = plainCopies(S, id);
  return Object.keys(w).length ? weighted(S, w) : null;
}

// rareCopy: ilk baskı kopyası satılıyor (koleksiyoncuya, kat kat fiyata)
function sell(S, id, res, rareCopy = false) {
  takeBook(S, id);
  if (rareCopy || plainCopies(S, id) < 0) { S.rare[id]--; if (!S.rare[id]) delete S.rare[id]; }
  const g = BOOK[id].genre, T = S.today;
  res.bought.push(id);
  res.paid += GENRES[g].price * (rareCopy ? BAL.rareMul : 1);
  if (rareCopy) { res.rare = true; S.totals.rareSold++; T.rareSold = (T.rareSold || 0) + 1; }
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
  if (plainOfGenre(S, c.wants) > 0 && rnd(S) < BAL.buyChance) {
    sell(S, pickBookOf(S, c.wants), res);
    res.happy = true;
    if (plainOfGenre(S, c.wants) > 0 && rnd(S) < BAL.extraChance) sell(S, pickBookOf(S, c.wants), res);
  } else {
    if (plainOfGenre(S, c.wants) === 0) T.missed[c.wants] = (T.missed[c.wants] || 0) + 1;
    const avail = {}, d = demandOf(S);
    for (const g of GENRE_KEYS) if (plainOfGenre(S, g) > 0) avail[g] = d[g];
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
    let s = rank[matchGrade(ask, id)];
    if (ask.rare && s && S.rare[id]) s += 2;
    if (s > score) { best = id; score = s; }
  }
  return score > 0 ? best : null;
}

// Öneri: oyuncu raftan bir kitap verdi (ya da null: "elimde yok" / müşteri beklemekten sıkıldı).
// İlk baskı isteyen koleksiyoncu: ilk baskı verilirse kat kat öder; normal baskıda en fazla 'good'.
export function recommend(S, c, id) {
  const T = S.today;
  const res = { bought: [], paid: 0, tip: 0, happy: false, grade: 'miss' };
  if (id && S.shelf[id]) {
    res.grade = matchGrade(c.ask, id);
    const rareCopy = !!c.ask.rare && (S.rare[id] || 0) > 0;
    if (c.ask.rare && !rareCopy && res.grade === 'perfect') res.grade = 'good';
    if (res.grade !== 'miss') {
      sell(S, id, res, rareCopy);
      res.happy = true;
      res.tip = (res.grade === 'perfect' ? BAL.tipPerfect : BAL.tipGood) + effects(S).tip + dayMods(S.day, S.town).tip;
      if (c.reg && (S.friends[c.reg] || 0) >= HEARTS_TIP) res.tip += REGULAR_TIP;
      res.paid += res.tip;
      T.tips += res.tip;
      if (res.grade === 'perfect') {
        S.totals.perfect++;
        // mektuplar için: kime, ne zaman, nerede, hangi kitap
        S.recHistory.push({ day: S.day, town: S.town, spot: S.spot, book: id, arch: c.arch || null, reg: c.reg || null, look: c.look });
        // sınır aşılırsa önce mektubu gitmiş olanlar atılır; bekleyen öneriler korunur
        if (S.recHistory.length > 80) { const i = S.recHistory.findIndex(r => r.sent); S.recHistory.splice(i >= 0 ? i : 0, 1); }
      }
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
