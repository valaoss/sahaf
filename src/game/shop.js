// Sabah işleri (koli almak, yola çıkmak) ve gün içinde müşterinin karar vermesi.
// Eylemler başarısızsa nedenini metin olarak döndürür, başarılıysa null.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { BOOK, BOOKS, booksOf } from '../data/books.js';
import { SPOTS, firstSpot } from '../data/spots.js';
import { REGULARS, HEARTS_MAX, HEARTS_TIP, REGULAR_TIP, GIFT_COINS } from '../data/regulars.js';
import { ARCHETYPES, ARCH_KEYS } from '../data/archetypes.js';
import { DECOR, UPGRADES } from '../data/decor.js';
import { rnd, rndInt, rndPick, weighted } from '../core/rng.js';
import { shelfCount, shelfCap, takeBook, seasonOf } from './state.js';
import { effects } from './decor.js';
import { dayMods, weatherOf } from './calendar.js';
import { buildAsk } from './asks.js';
import { kostasDrop } from './story.js';
import { remember, pickFresh, weightedFresh } from './memory.js';
import { crateAdd, crateFree, takeCopy, peekCopy, putBack, refill } from './shelving.js';
import { traitsFor, traitsOf, approach, respond, lineFor, hintFor, stickerOf } from './haggle.js';
import { patronOf, patronAfterSale, patronAfterMiss } from './patrons.js';
import { EVENTS } from '../data/calendar.js';
import { eventOf } from './calendar.js';
import { countryOf, travelInfo, crossBorder, openCountries } from './travel.js';
import { learn, learnOne, learnAll } from './knowledge.js';
import { FAVOR_AT, favorOpen, makeFavor, addRep, repLevel } from './bonds.js';
import { onIsland, roseWithSale, roseDay } from './voyage.js';
import { COUNTRIES } from '../data/countries.js';
import { TALK } from '../data/talk.js';
import { seeded } from '../core/rng.js';
export { askText } from './asks.js';

export const boxCost = g => GENRES[g].cost * BAL.boxSize;

export function canBuyBox(S, g) {
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (S.phase !== 'morning') return 'Koli yalnızca sabah alınır.';
  if (onIsland(S)) return 'Adada toptancı yok: koliyi karşıda al, sonra kayıkla geç.';
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
  if (!openCountries(S).includes(countryOf(key))) return 'Bu ülkeye feribot henüz yok.';
  if (!S.unlocked.includes(key)) return 'Bu kasabanın yolunu henüz bilmiyorsun.';
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
  // doygunluk: bu kasabada son günlerde çok satılan türü arayan azalır
  for (const g in d) d[g] *= satFactor(S, g, townKey);
  return d;
}

// Tür doygunluğu çarpanı (1: taze, 0'a doğru: çok satılmış)
export const satFactor = (S, g, townKey = S.town) => 1 / (1 + (S.sat?.[townKey]?.[g] || 0) / BAL.satScale);

// Her sabah: doygunluk geriler (kasabalar zamanla toparlanır)
export function decaySat(S) {
  for (const t in S.sat) {
    for (const g in S.sat[t]) { S.sat[t][g] *= BAL.satDecay; if (S.sat[t][g] < 0.5) delete S.sat[t][g]; }
    if (!Object.keys(S.sat[t]).length) delete S.sat[t];
  }
}

// --- Giderler ---
// Park ücreti: kalabalık yer pahalı; okuma köşesi bağışlanan kasabada ücretsiz
export const parkFee = (S, spotKey = S.spot) => SPOTS[S.town][spotKey]?.island ? BAL.islandFee : S.donated.includes(S.town) || repLevel(S) >= 3 ? 0
  : Math.round(BAL.parkRate * TOWNS[S.town].traffic * SPOTS[S.town][spotKey].traffic);
// Bakım: takılı süsler (hediyeler bakımsız) ve geliştirmeler
export function upkeepOf(S) {
  let n = 0;
  for (const slot in S.decor.on) { const d = DECOR[S.decor.on[slot]]; if (d && d.price > 0) n += Math.ceil(d.price / BAL.upkeepPer); }
  for (const u of S.upgrades) n += UPGRADES[u]?.upkeep || 0;
  return n;
}

// --- Para harcanacak yerler ---
// Kasabaya okuma köşesi: bir kez; park ücretsiz, kalabalık kalıcı artar
export function donate(S) {
  if (S.phase !== 'morning') return 'Bağış sabah yapılır.';
  if (S.donated.includes(S.town)) return 'Bu kasabada zaten bir okuma köşen var.';
  if (S.coins < BAL.donateCost) return 'Paran yetmiyor.';
  S.coins -= BAL.donateCost;
  S.totals.spent += BAL.donateCost;
  S.donated.push(S.town);
  addRep(S, S.town, 5);
  return null;
}

// Festival sponsorluğu: bugünün ya da yarının festivali (yolu açık kasabada). O gün oradaysan kalabalık artar.
export function sponsorable(S) {
  return [S.day, S.day + 1].map(day => ({ day, ev: eventOf(day) }))
    .filter(x => x.ev && S.unlocked.includes(EVENTS[x.ev].town) && !(x.day === S.day && S.phase !== 'morning'))
    .map(x => ({ day: x.day, ev: x.ev, town: EVENTS[x.ev].town }));
}
export function sponsor(S, day) {
  const x = sponsorable(S).find(o => o.day === day);
  if (!x) return 'Sponsor olunacak bir festival yok.';
  if (S.sponsor && S.sponsor.day >= S.day) return 'Zaten bir festivale sponsorsun.';
  if (S.coins < BAL.sponsorCost) return 'Paran yetmiyor.';
  S.coins -= BAL.sponsorCost;
  S.totals.spent += BAL.sponsorCost;
  S.sponsor = { day: x.day, town: x.town };
  return null;
}
export const sponsoredToday = S => !!S.sponsor && S.sponsor.day === S.day && S.sponsor.town === S.town;

// Rafı tamamla (game/shelving.js refill): etiketli bölümleri kendi türünden kolilerle doldurur
export const refillShelves = S => S.phase !== 'morning' ? [] : refill(S, g => buyBox(S, g));

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
  // adada gezginler, Gül ve Kitap Günü'nde sevgililer
  if (sp.island) aw.turist *= BAL.islandTourists;
  if (roseDay(S)) aw.sevgili *= 3;
  const arch = weightedFresh(S, 'arch', aw, 0.4);
  remember(S, 'arch', arch);
  const A = ARCHETYPES[arch];
  const d = demandOf(S);
  for (const g in A.genres) d[g] *= A.genres[g];
  const c = { id: S.nextId++, arch, wants: weighted(S, d), look: Math.floor(rnd(S) * 1e9), style: A.style };
  // pazarlıktaki gizli özellikleri (game/haggle.js)
  c.tr = traitsFor(S, arch);

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
    ask: { tags, text: buildAsk(S, tags, askCtx(S, { voice: R.voice || 'samimi', bare: true })) }, tr: traitsFor(S, null, true) };
}

// Tanıdık uğradı: görünüşü ve özellikleri aynı; çoğu zaman geçen seferki türden bir kitap arar
export function makePatron(S, id) {
  const P = S.patrons[id], A = ARCHETYPES[P.arch], d = demandOf(S), lastG = BOOK[P.last?.book]?.genre;
  for (const g in A.genres) d[g] *= A.genres[g];
  return { id: S.nextId++, pat: id, arch: P.arch, look: P.look, style: P.style, wants: lastG && rnd(S) < 0.5 ? lastG : weighted(S, d), tr: { ...P.tr } };
}

// Kalp ekle; eşikleri geçince ödül bilgisini döndür
export function addHeart(S, id) { const res = {}; befriend(S, id, res); return res.friend || null; }

function befriend(S, id, res) {
  const before = S.friends[id] || 0;
  if (before >= HEARTS_MAX) return;
  // rica getirilmeden dostluk ilerlemez
  if (before >= FAVOR_AT && favorOpen(S, id)) { res.waiting = id; return; }
  const now = before + 1;
  S.friends[id] = now;
  res.friend = { id, hearts: now };
  if (now === FAVOR_AT && !S.favors[id]) res.friend.favor = makeFavor(S, id).book;
  if (now === HEARTS_MAX && !S.gifts.includes(id)) {
    S.gifts.push(id);
    const R = REGULARS[id];
    if (R.gift && DECOR[R.gift]) { S.decor.owned.push(R.gift); res.friend.gift = R.gift; }
    else { S.keepsakes.push(id); res.friend.keepsake = id; }
  }
}

// Rica getirildi: kitap verilir (satış fiyatının birkaç katı), kalp, itibar; kitabın her şeyi öğrenilir
export function deliverFavor(S, id) {
  const fv = S.favors[id];
  if (!favorOpen(S, id)) return { why: 'Bekleyen bir rica yok.' };
  if (!(plainCopies(S, fv.book) > 0)) return { why: 'Kitap rafta yok.' };
  takeCopy(S, fv.book);
  takeBook(S, fv.book);
  if (!S.shelf[fv.book]) S.featured = S.featured.filter(x => x !== fv.book);
  const coins = GENRES[BOOK[fv.book].genre].price * BAL.favorPay;
  S.coins += coins;
  if (S.today) { S.today.revenue += coins; S.today.favors = (S.today.favors || 0) + 1; }
  fv.done = true;
  learnAll(S, fv.book);
  const res = { coins, book: fv.book, repUp: addRep(S, REGULARS[id].town, 3) };
  befriend(S, id, res);
  return res;
}

// Raftaki o türden, normal satışa açık bir kitap (çok olan daha olası)
function pickBookOf(S, g) {
  const w = {};
  for (const id in S.shelf) if (BOOK[id].genre === g && plainCopies(S, id) > 0) w[id] = plainCopies(S, id) * (S.featured.includes(id) ? 4 : 1);
  return Object.keys(w).length ? weighted(S, w) : null;
}

// Satılacak kopyayı raftan al (müşterinin elinde). wantRare: ilk baskı kopyası. Dönüş: kopyanın yeri, etiketi, durumu, ilk baskı mı
function holdCopy(S, id, wantRare) {
  const cp = takeCopy(S, id, wantRare);
  takeBook(S, id);
  if (!S.shelf[id]) S.featured = S.featured.filter(x => x !== id);
  cp.rare = wantRare || plainCopies(S, id) < 0;
  if (cp.rare) { S.rare[id]--; if (!S.rare[id]) delete S.rare[id]; }
  return cp;
}

// Satış: kopya raftan alınır (pazarlıkta müşterinin elindeki kopya: held), fiyatı yazılır.
// rareCopy: ilk baskı koleksiyoncuya satılıyor (kat kat fiyata) · price: pazarlıkta anlaşılan fiyat (yoksa etiket fiyatı × mul)
function sell(S, id, res, rareCopy = false, mul = 1, held = null, price = null) {
  // hangi kopya satıldı: bölümünün fiyat etiketi ve kitabın durumu fiyatı belirler
  const cp = held || holdCopy(S, id, rareCopy || plainCopies(S, id) <= 0);
  const g = BOOK[id].genre, T = S.today;
  S.soldBooks[id] = (S.soldBooks[id] || 0) + 1;
  // satılan kitap hakkında bir şey öğrenilir (müşteri giderken söyler)
  if (rnd(S) < BAL.learnOnSale && learnOne(S, id).length) T.learned = (T.learned || 0) + 1;
  const sat = (S.sat[S.town] = S.sat[S.town] || {});
  sat[g] = (sat[g] || 0) + 1;
  if (cp.sec >= 0 && T.secSold) T.secSold[cp.sec]++;
  (T.soldIds = T.soldIds || []).push(id);
  // İspanya: kitabın yanına bir gül
  const rose = rareCopy ? 0 : roseWithSale(S);
  if (rose) { res.paid += rose; T.roses = (T.roses || 0) + 1; }
  res.bought.push(id);
  res.paid += price ?? Math.max(1, Math.round(stickerOf(id, { ...cp, rare: rareCopy }) * mul));
  if (rareCopy) { res.rare = true; S.totals.rareSold++; T.rareSold = (T.rareSold || 0) + 1; }
  T.sold[g] = (T.sold[g] || 0) + 1;
}

function settle(S, res) {
  S.coins += res.paid;
  S.today.revenue += res.paid;
  S.today.visitors++;
  return res;
}
// göz atan müşteri giderken: çay köşesi varsa arada bir çay alır
function finish(S, res) {
  if (S.upgrades.includes('cay') && rnd(S) < BAL.teaChance) { res.paid += BAL.teaPrice; res.tea = true; S.today.tea = (S.today.tea || 0) + 1; }
  return settle(S, res);
}

const dealStats = T => (T.deals = T.deals || { n: 0, won: 0, lost: 0, paid: 0, sticker: 0 });

// Pazarlık başlar: kopya müşterinin elindedir (başkasına satılamaz); anlaşılamazsa rafa döner. rec: öneriyle gelen müşterinin bilgisi
function startDeal(S, c, id, a, wantRare, rec = null) {
  const featured = S.featured.includes(id);
  const cp = holdCopy(S, id, wantRare);
  c.deal = { id, cp, P: a.P, O: a.O, R: a.R, W: a.W, B: traitsOf(c).budget, habit: !!a.habit, pat: traitsOf(c).patience, final: false, rounds: 0, soz: null, seen: {}, rec, featured };
  dealStats(S.today).n++;
  return c.deal;
}

// Normal müşteri raflara baktı: beğendiği kitabı pazarlıksız alır, pazarlığa gelir (res.deal; sonuç haggleMove ile) ya da fiyatı görüp vazgeçer.
export function resolveCustomer(S, c) {
  const T = S.today;
  const res = { bought: [], paid: 0, happy: false };
  const base = BAL.buyChance + (featuredOf(S, c.wants).length ? BAL.featureBuy : 0);
  const has = plainOfGenre(S, c.wants) > 0;
  let g = has && rnd(S) < base ? c.wants : null;
  if (!g) {
    if (!has) T.missed[c.wants] = (T.missed[c.wants] || 0) + 1;
    // başka bir türe göz atar: o türün kasabadaki doygunluğu da ilgisini etkiler
    const avail = {}, d = demandOf(S);
    for (const k of GENRE_KEYS) if (plainOfGenre(S, k) > 0) avail[k] = d[k];
    if (Object.keys(avail).length) { const g2 = weighted(S, avail); if (rnd(S) < BAL.altChance * satFactor(S, g2)) g = g2; }
  }
  if (g) {
    const id = pickBookOf(S, g), a = approach(S, c, id, peekCopy(S, id, false));
    if (a.kind === 'offer') { res.deal = startDeal(S, c, id, a, false); return res; }
    if (a.kind === 'leave') T.priceLost = (T.priceLost || 0) + 1;
    else {
      sell(S, id, res);
      res.happy = true;
      // etiketi cebine göre ucuz bulan bir kitap daha alabilir (hacim artar, tür de daha çabuk doyar)
      if (plainOfGenre(S, g) > 0 && rnd(S) < BAL.extraChance * (a.cheap ? BAL.cheapExtra : 1)) sell(S, pickBookOf(S, g), res);
    }
  }
  return finish(S, res);
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
// İsteğe uyan kitap ödemeye razı olduğu fiyatı artırır; etiket yine de yüksekse pazarlığa gelir (res.deal; sonuç haggleMove ile).
// İlk baskı isteyen koleksiyoncu: ilk baskı verilirse kat kat öder; normal baskıda en fazla 'good'.
// opts.tea: çay ikram edildi (alırsa fazladan bahşiş; müdavim 'good'da da ısınır)
// opts.discount: uymayan öneri bile indirimle satılır (bahşiş yok, mutlu değil)
export function recommend(S, c, id, opts = {}) {
  const T = S.today;
  const res = { bought: [], paid: 0, tip: 0, happy: false, grade: 'miss' };
  if (id && S.shelf[id]) {
    res.grade = matchGrade(c.ask, id);
    // öneri: isteğe uyan etiketler artık biliniyor
    res.learned = learn(S, id, c.ask.tags);
    const rareCopy = !!c.ask.rare && (S.rare[id] || 0) > 0;
    if (c.ask.rare && !rareCopy && res.grade === 'perfect') res.grade = 'good';
    if (res.grade === 'miss' && opts.discount && plainCopies(S, id) > 0) {
      sell(S, id, res, false, BAL.discount);
      res.discounted = true;
    }
    if (res.grade !== 'miss') {
      const want = rareCopy || plainCopies(S, id) <= 0;
      const a = approach(S, c, id, peekCopy(S, id, want), res.grade);
      if (a.kind === 'offer') {
        T.recs[res.grade]++;
        res.deal = startDeal(S, c, id, a, want, { grade: res.grade, tea: !!opts.tea, learned: res.learned, rareCopy });
        return res;
      }
      // beğendi ama bütçesinin çok üstünde: almadan gider
      if (a.kind === 'leave') res.tooDear = true;
      else completeRec(S, c, id, res, opts, rareCopy);
    }
  }
  T.recs[res.grade]++;
  regularVisit(S, c, res, opts.tea);
  return settle(S, res);
}

// Öneriye uyan kitap satıldı: (pazarlıksızsa) bahşiş; tam isabette itibar ve mektup kaydı. held/price: pazarlıkta anlaşılan kopya ve fiyat
function completeRec(S, c, id, res, opts, rareCopy, held = null, price = null) {
  const T = S.today;
  sell(S, id, res, rareCopy, 1, held, price);
  res.happy = true;
  if (price === null) {
    res.tip = (res.grade === 'perfect' ? BAL.tipPerfect : BAL.tipGood) + effects(S).tip + dayMods(S.day, S.town).tip + (opts.tea ? BAL.teaTip : 0);
    if (c.reg && (S.friends[c.reg] || 0) >= HEARTS_TIP) res.tip += REGULAR_TIP;
    res.paid += res.tip;
    T.tips += res.tip;
  }
  // pazarlıksız tam isabet: memnun müşteri bazen kartını bırakır
  if (price === null && res.grade === 'perfect') {
    res.patron = patronAfterSale(S, c, id, null, null, {}, true);
    if (res.patron) T.newPatrons = (T.newPatrons || 0) + 1;
  }
  if (res.grade === 'perfect') {
    S.totals.perfect++;
    // müdavimine tam isabet: kasabada adın duyulur
    const up = c.reg ? addRep(S, S.town, 1) : null;
    if (up) T.repUp = up;
    // mektuplar için: kime, ne zaman, nerede, hangi kitap
    S.recHistory.push({ day: S.day, town: S.town, spot: S.spot, book: id, arch: c.arch || null, reg: c.reg || null, look: c.look });
    // sınır aşılırsa önce mektubu gitmiş olanlar atılır; bekleyen öneriler korunur
    if (S.recHistory.length > 80) { const i = S.recHistory.findIndex(r => r.sent); S.recHistory.splice(i >= 0 ? i : 0, 1); }
  }
}

// Müdavim uğradı: tanışılır; uyan kitabı aldıysa ısınır (kalp)
function regularVisit(S, c, res, tea) {
  if (!c.reg) return;
  if (!S.met.includes(c.reg)) S.met.push(c.reg);
  if (res.bought.length && !res.discounted && (res.grade === 'perfect' || (tea && res.grade === 'good'))) befriend(S, c.reg, res);
  (S.today.regulars = S.today.regulars || []).push({ id: c.reg, grade: res.grade });
}

// Pazarlık hamlesi (game/haggle.js respond): accept | mid | hold | refuse. Dönüş: { out, offer?, price?, happy?, line, res? }.
// Pazarlık bittiyse res: satış sonucu (kasaya işlenmiş); anlaşılamadıysa kopya rafa dönmüştür.
export function haggleMove(S, c, move) {
  const d = c.deal;
  if (!d) return null;
  const o = respond(S, c, d, move);
  const kind = o.out === 'deal' ? (o.happy ? 'happy' : 'deal') : o.out;
  o.line = lineFor(S, c, kind, ['counter', 'final', 'sozYes'].includes(o.out) ? o.offer : null);
  if (o.out === 'deal') o.res = closeDeal(S, c, o.price, o.happy);
  else if (o.out === 'leave' || o.out === 'angry') o.res = dropDeal(S, c, !o.polite);
  return o;
}
// Müşterinin pazarlığı açan cümlesi: tanıdıksa önce geçen seferi anar; ilk teklif (parası yetenle cebi dar olan farklı konuşur),
// ardından derdinin ipucu
export function openingLine(S, c) {
  if (!c.deal) return '';
  const P = patronOf(S, c), back = P?.last && BOOK[P.last.book] ? lineFor(S, c, 'back', null, BOOK[P.last.book].title) + ' ' : '';
  return back + lineFor(S, c, c.deal.habit ? 'open' : 'poor', c.deal.O) + ' ' + hintFor(S, c);
}
// Pazarlığa gelen müşteri beklerken gitti (kimse ilgilenmedi): kopya rafa döner
export const abandonDeal = (S, c) => c.deal ? dropDeal(S, c, false) : null;

function closeDeal(S, c, price, happy) {
  const d = c.deal, T = S.today, st = dealStats(T);
  c.deal = null;
  st.won++; st.paid += price; st.sticker += d.P;
  // ucuza aldığını düşünen müşteri anlatır (ertesi gün kalabalık: closeShop'taki ağızdan ağıza)
  if (happy) T.happyDeals = (T.happyDeals || 0) + 1;
  const res = { bought: [], paid: 0, tip: 0, happy: true, haggled: true, pleased: happy, sticker: d.P, soz: d.soz };
  // memnun ayrılan bazen kartını bırakır (tanıdık); tanıdık son alışverişini hatırlar
  res.patron = patronAfterSale(S, c, d.id, price, d.P, d.seen, happy);
  if (res.patron) T.newPatrons = (T.newPatrons || 0) + 1;
  if (!d.rec) { sell(S, d.id, res, false, 1, d.cp, price); return finish(S, res); }
  res.grade = d.rec.grade;
  res.learned = d.rec.learned;
  completeRec(S, c, d.id, res, d.rec, d.rec.rareCopy, d.cp, price);
  regularVisit(S, c, res, d.rec.tea);
  return settle(S, res);
}

// upset: sabrı tükendi ya da fiyatı çok yüksek buldu (ertesi gün anlatır); kibarca vazgeçilen pazarlık iz bırakmaz
function dropDeal(S, c, upset) {
  const d = c.deal, T = S.today;
  c.deal = null;
  putBack(S, d.id, d.cp);
  if (d.featured && !S.featured.includes(d.id) && S.featured.length < BAL.featureMax) S.featured.push(d.id);
  dealStats(T).lost++;
  if (upset) T.priceLost = (T.priceLost || 0) + 1;
  patronAfterMiss(S, c, d.seen);
  const res = { bought: [], paid: 0, tip: 0, happy: false, haggled: true, upset };
  if (d.rec) { res.grade = d.rec.grade; regularVisit(S, c, res, d.rec.tea); }
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
    const cost = Math.max(1, Math.ceil(GENRES[g].cost * BAL.conds[cond].buy * (rare ? BAL.rareMul * 0.8 : 1) * (repLevel(S) >= 1 ? 0.8 : 1)));
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
