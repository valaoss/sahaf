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
import { kostasDrop } from './story.js';
import { remember, pickFresh, weightedFresh } from './memory.js';
import { crateAdd, crateFree, takeCopy, chanceOf } from './shelving.js';
import { countryOf, travelInfo, crossBorder } from './travel.js';
import { COUNTRIES } from '../data/countries.js';
import { TALK } from '../data/talk.js';
import { seeded } from '../core/rng.js';
export { askText } from './asks.js';

export const boxCost = g => GENRES[g].cost * BAL.boxSize;

export function canBuyBox(S, g) {
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (S.phase !== 'morning') return 'Koli yalnızca sabah alınır.';
  if (crateFree(S) < BAL.boxSize) return shelfCount(S) < shelfCap(S) ? 'Koli dolu: önce kitapları rafa diz.' : 'Karavanda yer yok.';
  if (S.coins < boxCost(g)) return 'Paran yetmiyor.';
  return null;
}

// Koli: o türden olabildiğince farklı kitaplar (rafta az olan önce); arada bir ilk baskı çıkar.
// Kitaplar koliye (S.crate) gelir; oyuncu rafa dizer (game/shelving.js).
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
    // rafta ve kolide az olan önce
    const owned = id => (S.shelf[id] || 0) + S.crate.filter(e => e.id === id).length;
    const least = Math.min(...pool.map(b => owned(b.id)));
    const id = rndPick(S, pool.filter(b => owned(b.id) === least)).id;
    const isRare = rnd(S) < BAL.rareChance * dayMods(S.day, S.town).rare;
    crateAdd(S, id, isRare);
    if (isRare) rare.push(id);
    got.push(id);
  }
  S.lastBox = { genre: g, books: got, rare, kostas: kostasDrop(S, g) };
  return null;
}

export function canTravel(S, key) {
  if (!TOWNS[key]) return 'Böyle bir kasaba yok.';
  if (S.phase !== 'morning') return 'Yola yalnızca sabah çıkılır.';
  if (!S.unlocked.includes(key)) return S.countries.includes(countryOf(key)) ? 'Bu kasabanın yolunu henüz bilmiyorsun.' : 'Bu ülkeye feribot henüz yok.';
  if (key === S.town) return 'Zaten buradasın.';
  if (S.travelled) return 'Bugün zaten yol yaptın.';
  const info = travelInfo(S, key);
  if (S.coins < info.cost) return info.abroad ? 'Feribot biletine paran yetmiyor.' : 'Yakıt parası yok.';
  return null;
}

// Dönüş: hata metni ya da null. Başka ülkeye gidilince S.lastTrip.abroad ve yeni damga (S.lastTrip.stamp)
export function travel(S, key) {
  const why = canTravel(S, key);
  if (why) return why;
  const info = travelInfo(S, key);
  S.coins -= info.cost;
  S.totals.spent += info.cost;
  S.town = key;
  S.spot = firstSpot(key);
  S.travelled = true;
  // feribot: yolculuk günü geçer, ilk girişte pasaport damgası
  S.lastTrip = { cost: info.cost, abroad: info.abroad, stamp: info.abroad ? crossBorder(S, key) : null };
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
  for (const id of S.featured) if (S.shelf[id]) d[BOOK[id].genre] *= 1 + BAL.featureDemand;
  return d;
}

// Vitrin: sabah raftan en fazla üç kitap öne çıkarılır
export function toggleFeature(S, id) {
  if (S.phase !== 'morning') return 'Vitrin sabah düzenlenir.';
  const i = S.featured.indexOf(id);
  if (i >= 0) { S.featured.splice(i, 1); return null; }
  if (!S.shelf[id]) return 'Bu kitap rafta yok.';
  if (S.featured.length >= BAL.featureMax) return 'Vitrine en fazla üç kitap sığar.';
  S.featured.push(id);
  return null;
}
const featuredOf = (S, g) => S.featured.filter(id => S.shelf[id] && BOOK[id].genre === g);

// Kasabada en çok aranan türler (sabah ipucu)
export function topDemand(townKey, n = 2) {
  const d = TOWNS[townKey].demand;
  return Object.keys(d).sort((a, b) => d[b] - d[a]).slice(0, n);
}

// Normal satışa açık kopya (ilk baskılar koleksiyoncuya saklanır)
export const plainCopies = (S, id) => (S.shelf[id] || 0) - (S.rare[id] || 0);
const plainOfGenre = (S, g) => Object.keys(S.shelf).reduce((n, id) => n + (BOOK[id].genre === g ? plainCopies(S, id) : 0), 0);

// Günün havası, mevsimi ve mekânı: cümle bağlamı için
const askCtx = (S, extra) => ({ weather: weatherOf(S.day), season: seasonOf(S.day), scene: spotOf(S).scene, greet: countryOf(S.town) !== 'tr' ? COUNTRIES[countryOf(S.town)].greet : null, ...extra });

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
    const shown = S.featured.filter(id => S.shelf[id] && (!wantsRare || S.rare[id]));
    if (shown.length && rnd(S) < 0.25) target = BOOK[pickFresh(S, 'book', shown)];
    else if (onShelf.length && rnd(S) < BAL.askFromShelf) target = BOOK[pickFresh(S, 'book', onShelf)];
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
  for (const id in S.shelf) if (BOOK[id].genre === g && plainCopies(S, id) > 0) w[id] = plainCopies(S, id) * (S.featured.includes(id) ? 4 : 1);
  return Object.keys(w).length ? weighted(S, w) : null;
}

// rareCopy: ilk baskı kopyası satılıyor (koleksiyoncuya, kat kat fiyata)
function sell(S, id, res, rareCopy = false, mul = 1) {
  // hangi kopya satıldı: bölümünün fiyat etiketi ve kitabın durumu fiyatı belirler
  const cp = takeCopy(S, id, rareCopy || plainCopies(S, id) <= 0);
  takeBook(S, id);
  if (!S.shelf[id]) S.featured = S.featured.filter(x => x !== id);
  if (rareCopy || plainCopies(S, id) < 0) { S.rare[id]--; if (!S.rare[id]) delete S.rare[id]; }
  const g = BOOK[id].genre, T = S.today;
  S.soldBooks[id] = (S.soldBooks[id] || 0) + 1;
  res.bought.push(id);
  res.paid += Math.max(1, Math.round(GENRES[g].price * BAL.priceTags[cp.price].mul * BAL.conds[cp.cond].sell * (rareCopy ? BAL.rareMul : 1) * mul));
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
  if (plainOfGenre(S, c.wants) > 0 && rnd(S) < (BAL.buyChance + (featuredOf(S, c.wants).length ? BAL.featureBuy : 0)) * chanceOf(S, c.wants)) {
    sell(S, pickBookOf(S, c.wants), res);
    res.happy = true;
    if (plainOfGenre(S, c.wants) > 0 && rnd(S) < BAL.extraChance) sell(S, pickBookOf(S, c.wants), res);
  } else {
    if (plainOfGenre(S, c.wants) === 0) T.missed[c.wants] = (T.missed[c.wants] || 0) + 1;
    const avail = {}, d = demandOf(S);
    for (const g of GENRE_KEYS) if (plainOfGenre(S, g) > 0) avail[g] = d[g];
    if (Object.keys(avail).length && rnd(S) < BAL.altChance) sell(S, pickBookOf(S, weighted(S, avail)), res);
  }
  if (S.upgrades.includes('cay') && rnd(S) < BAL.teaChance) { res.paid += BAL.teaPrice; res.tea = true; T.tea = (T.tea || 0) + 1; }
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
// opts.tea: çay ikram edildi (alırsa fazladan bahşiş; müdavim 'good'da da ısınır)
// opts.discount: uymayan öneri bile indirimle satılır (bahşiş yok, mutlu değil)
export function recommend(S, c, id, opts = {}) {
  const T = S.today;
  const res = { bought: [], paid: 0, tip: 0, happy: false, grade: 'miss' };
  if (id && S.shelf[id]) {
    res.grade = matchGrade(c.ask, id);
    const rareCopy = !!c.ask.rare && (S.rare[id] || 0) > 0;
    if (c.ask.rare && !rareCopy && res.grade === 'perfect') res.grade = 'good';
    if (res.grade === 'miss' && opts.discount && plainCopies(S, id) > 0) {
      sell(S, id, res, false, BAL.discount);
      res.discounted = true;
    }
    if (res.grade !== 'miss') {
      sell(S, id, res, rareCopy);
      res.happy = true;
      res.tip = (res.grade === 'perfect' ? BAL.tipPerfect : BAL.tipGood) + effects(S).tip + dayMods(S.day, S.town).tip + (opts.tea ? BAL.teaTip : 0);
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
    if (res.grade === 'perfect' || (opts.tea && res.grade === 'good')) befriend(S, c.reg, res);
    (T.regulars = T.regulars || []).push({ id: c.reg, grade: res.grade });
  }
  T.recs[res.grade]++;
  return settle(S, res);
}

// --- Pazar tezgâhı: her sabah kasabada tek tek seçilen kitaplar ---
// Liste gün ve kasabadan sabit üretilir (oyunun zarını harcamaz); alınanlar S.stall.sold'da tutulur.
const COND_KEYS = ['yipranmis', 'iyi', 'temiz'];
export const COND_NAME = { yipranmis: 'Yıpranmış', iyi: 'İyi', temiz: 'Temiz' };
export function stallOf(S) {
  const key = S.day + '/' + S.town;
  if (!S.stall || S.stall.key !== key) S.stall = { key, sold: [] };
  const r = seeded(S.day * 7919 + Object.keys(TOWNS).indexOf(S.town) * 131 + 17);
  const d = demandOf(S), gs = GENRE_KEYS, tot = gs.reduce((n, g) => n + d[g], 0);
  const items = [], used = new Set();
  for (let i = 0; i < BAL.stallSize; i++) {
    let x = r() * tot, g = gs[0];
    for (const k of gs) { x -= d[k]; if (x <= 0) { g = k; break; } }
    const pool = booksOf(g).filter(b => !used.has(b.id));
    const b = pool[Math.floor(r() * pool.length)];
    used.add(b.id);
    let w = r() * COND_KEYS.reduce((n, k) => n + BAL.conds[k].w, 0), cond = 'iyi';
    for (const k of COND_KEYS) { w -= BAL.conds[k].w; if (w <= 0) { cond = k; break; } }
    const rare = r() < BAL.stallRare * dayMods(S.day, S.town).rare;
    const cost = Math.max(1, Math.ceil(GENRES[g].cost * BAL.conds[cond].buy * (rare ? BAL.rareMul * 0.8 : 1)));
    items.push({ i, id: b.id, cond, rare, cost, sold: S.stall.sold.includes(i) });
  }
  return items;
}

export function buyStall(S, i) {
  if (S.phase !== 'morning') return 'Pazar yalnızca sabah kurulur.';
  const it = stallOf(S)[i];
  if (!it) return 'Böyle bir kitap yok.';
  if (it.sold) return 'Bu kitap satıldı.';
  if (crateFree(S) < 1) return 'Koli dolu: önce kitapları rafa diz.';
  if (S.coins < it.cost) return 'Paran yetmiyor.';
  S.coins -= it.cost;
  S.totals.spent += it.cost;
  S.stall.sold.push(i);
  crateAdd(S, it.id, it.rare, it.cond);
  return null;
}

// --- Sohbet: "Biraz daha anlatır mısın?" müşterinin sevdiği türü ve aradığının bir yönünü söyletir ---
export function talkHint(S, c) {
  if (c.talked) return null;
  c.talked = true;
  if (S.phase === 'open') S.clock = Math.min(BAL.dayEnd, S.clock + BAL.talkMinutes);
  const voice = (c.arch && ARCHETYPES[c.arch]?.voice) || 'samimi';
  const lines = TALK.genre[voice] || TALK.genre.samimi;
  let text = pickFresh(S, 'talk', lines).replace(/\{g\}/g, GENRES[c.wants].name.toLowerCase());
  remember(S, 'talk', text);
  return { text, genre: c.wants };
}
export const teaLine = S => { const l = pickFresh(S, 'talk', TALK.tea); remember(S, 'talk', l); return l; };
