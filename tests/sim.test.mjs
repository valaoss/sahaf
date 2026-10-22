// Başsız oyun testleri: gerçek modüller, DOM yok. Kullanım: node tests/sim.test.mjs
import assert from 'node:assert/strict';
import { BAL } from '../src/data/balance.js';
import { GENRES, GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS } from '../src/data/towns.js';
import { BOOKS, BOOK, TAGS, booksOf } from '../src/data/books.js';
import { DECOR, SHELF_LEVELS, PAINTS } from '../src/data/decor.js';
import { newGame, restore, shelfCount, shelfCap, genreCount, seasonOf } from '../src/game/state.js';
import { buyBox, boxCost, travel, rescue, resolveCustomer, recommend, matchGrade, bestBook, makeCustomer, makeRegular, askText, demandOf, chooseSpot } from '../src/game/shop.js';
import { SPOTS } from '../src/data/spots.js';
import { TOWN_KEYS } from '../src/data/towns.js';
import { WEATHER, EVENTS, EVENT_CHANCE } from '../src/data/calendar.js';
import { weatherOf, eventOf, dayMods } from '../src/game/calendar.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX, HEARTS_TIP, REGULAR_TIP, GIFT_COINS } from '../src/data/regulars.js';
import { effects, equipDecor, upgradeShelf, choosePaint } from '../src/game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning, simulateDay } from '../src/game/day.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓ ' + name); };
const emptyShelf = S => { S.shelf = {}; };

test('veri: her türde 20 kitap, etiketler tanımlı, kimlikler benzersiz', () => {
  for (const g of GENRE_KEYS) assert.equal(booksOf(g).length, 20, g);
  assert.equal(new Set(BOOKS.map(b => b.id)).size, BOOKS.length);
  for (const b of BOOKS) for (const t of b.tags) assert.ok(TAGS[t], `${b.id}: ${t}`);
  for (const k in DECOR) assert.ok(['roof', 'table', 'ground'].includes(DECOR[k].slot));
});

test('yeni oyun başlangıç değerleri', () => {
  const S = newGame(1);
  assert.equal(S.coins, BAL.startCoins);
  assert.equal(shelfCount(S), 15);
  assert.equal(genreCount(S, 'roman'), 5);
  assert.equal(Object.keys(S.shelf).length, 15, 'başlangıç kitapları farklı');
  assert.equal(shelfCap(S), SHELF_LEVELS[0].cap);
  assert.equal(seasonOf(1), 'İlkbahar');
  assert.equal(seasonOf(BAL.daysPerSeason + 1), 'Yaz');
});

test('koli: para düşer, o türden farklı kitaplar gelir', () => {
  const S = newGame(1);
  assert.equal(buyBox(S, 'siir'), null);
  assert.equal(S.coins, BAL.startCoins - boxCost('siir'));
  assert.equal(genreCount(S, 'siir'), BAL.boxSize);
  assert.equal(booksOf('siir').filter(b => S.shelf[b.id]).length, BAL.boxSize);
  assert.equal(S.totals.spent, boxCost('siir'));
});

test('koli: raf kapasitesi, para ve saat sınırları', () => {
  const S = newGame(1);
  S.coins = 10000;
  while (!buyBox(S, 'cocuk'));
  assert.equal(shelfCount(S), shelfCap(S));
  assert.equal(buyBox(S, 'cocuk'), 'Raflarda yer yok.');
  const P = newGame(1); P.coins = 1;
  assert.equal(buyBox(P, 'tarih'), 'Paran yetmiyor.');
  openShop(P);
  assert.equal(buyBox(P, 'tarih'), 'Koli yalnızca sabah alınır.');
});

test('yolculuk: ücret, günde bir kez, yalnız sabah, yeni kasaba ilgisi', () => {
  const S = newGame(1);
  assert.equal(travel(S, 'ayvalik'), 'Zaten buradasın.');
  assert.equal(travel(S, 'foca'), null);
  assert.equal(S.town, 'foca');
  assert.equal(S.coins, BAL.startCoins - BAL.travelCost);
  assert.equal(travel(S, 'cunda'), 'Bugün zaten yol yaptın.');
  const T = simulateDay(S);
  assert.equal(T.newTown, true);
  assert.ok(T.visitors >= TOWNS.foca.traffic + BAL.newTownTraffic - BAL.trafficJitter);
  assert.equal(simulateDay(S).newTown, false, 'ertesi gün aynı kasabada bonus yok');
  assert.equal(travel(S, 'cunda'), null);
});

test('müşteri: aradığı varsa alır, yoksa kaçan talep yazılır', () => {
  const S = newGame(3);
  openShop(S);
  emptyShelf(S);
  const r = resolveCustomer(S, { id: 1, wants: 'polisiye', look: 1 });
  assert.equal(r.paid, 0);
  assert.equal(S.today.missed.polisiye, 1);
  for (const b of booksOf('polisiye')) S.shelf[b.id] = 5;
  let paid = 0;
  for (let i = 0; i < 40; i++) paid += resolveCustomer(S, { id: i, wants: 'polisiye', look: 1 }).paid;
  assert.ok(paid >= 40 * 0.6 * GENRES.polisiye.price);
  assert.ok(Object.values(S.shelf).every(n => n > 0));
});

test('öneri: eşleşme dereceleri ve bahşiş', () => {
  const ask = { tags: ['deniz', 'yalniz'] };
  assert.equal(matchGrade(ask, 'yasliadam'), 'perfect');
  assert.equal(matchGrade(ask, 'defne'), 'good');
  assert.equal(matchGrade(ask, 'garip'), 'miss');
  const S = newGame(2);
  openShop(S);
  S.shelf = { yasliadam: 1, garip: 1 };
  const c = { id: 1, wants: 'roman', look: 1, ask };
  const before = S.coins;
  assert.equal(bestBook(S, ask), 'yasliadam');
  const miss = recommend(S, c, 'garip');
  assert.equal(miss.paid, 0);
  assert.equal(S.shelf.garip, 1, 'uymayan kitap rafta kalır');
  const r = recommend(S, c, 'yasliadam');
  assert.equal(r.grade, 'perfect');
  assert.equal(r.paid, GENRES.roman.price + BAL.tipPerfect);
  assert.equal(S.coins, before + r.paid);
  assert.equal(S.shelf.yasliadam, undefined);
  assert.deepEqual(S.today.recs, { perfect: 1, good: 0, miss: 1 });
  assert.equal(recommend(S, c, null).grade, 'miss', 'elimde yok');
});

test('öneri isteği: gerçek bir kitaba dayanır, cümle düzgün', () => {
  const S = newGame(11);
  let asks = 0;
  for (let i = 0; i < 400; i++) {
    const c = makeCustomer(S);
    if (!c.ask) continue;
    asks++;
    assert.ok(BOOKS.some(b => matchGrade(c.ask, b.id) === 'perfect'));
    assert.ok(!/[{}]/.test(c.ask.text) && /^[A-ZÇĞİÖŞÜ]/.test(c.ask.text), c.ask.text);
  }
  assert.ok(asks > 400 * BAL.askChance * 0.6 && asks < 400 * BAL.askChance * 1.4);
  assert.equal(askText(['kisa'], a => a[0]), 'Kısa bir kitap var mı?');
});

test('öneri isteği: çoğu raftaki bir kitapla tam karşılanabilir', () => {
  const S = newGame(21);
  let asks = 0, solvable = 0;
  for (let i = 0; i < 2000; i++) {
    const c = makeCustomer(S);
    if (!c.ask) continue;
    asks++;
    if (Object.keys(S.shelf).some(id => matchGrade(c.ask, id) === 'perfect')) solvable++;
  }
  assert.ok(solvable / asks >= BAL.askFromShelf, `${solvable}/${asks}`);
});

test('süs: satın al, tak, etkiler toplanır; yalnız sabah', () => {
  const S = newGame(1);
  S.coins = 500;
  assert.equal(equipDecor(S, 'ayicik'), null);
  assert.equal(S.coins, 500 - DECOR.ayicik.price);
  assert.equal(demandOf(S).cocuk, TOWNS.ayvalik.demand.cocuk * 1.6);
  assert.equal(equipDecor(S, 'bos'), null, 'sahip olunan süse ücretsiz dönülür');
  assert.equal(equipDecor(S, 'ayicik'), null);
  assert.equal(S.coins, 500 - DECOR.ayicik.price, 'ikinci takışta para gitmez');
  equipDecor(S, 'lamba'); equipDecor(S, 'firildak');
  const e = effects(S);
  assert.equal(e.traffic, 6);
  assert.equal(e.patience, 1.2);
  const P = newGame(1); P.coins = 0;
  assert.equal(equipDecor(P, 'lamba'), 'Paran yetmiyor.');
  openShop(S);
  assert.equal(equipDecor(S, 'mum'), 'Dükkân açıkken düzenleme yapılmaz.');
});

test('yükseltme: raf büyür, boya değişir', () => {
  const S = newGame(1);
  S.coins = 1000;
  assert.equal(upgradeShelf(S), null);
  assert.equal(shelfCap(S), 40);
  assert.equal(upgradeShelf(S), null);
  assert.equal(upgradeShelf(S), 'Raflar zaten en büyük hâlinde.');
  assert.equal(S.coins, 1000 - SHELF_LEVELS[1].price - SHELF_LEVELS[2].price);
  assert.equal(choosePaint(S, 'pembe'), null);
  assert.equal(S.paint, 'pembe');
  assert.equal(choosePaint(S, 'nane'), null);
  assert.equal(choosePaint(S, 'pembe'), null);
  assert.equal(S.coins, 1000 - SHELF_LEVELS[1].price - SHELF_LEVELS[2].price - PAINTS.pembe.price);
});

test('tam gün: stok eksiye düşmez, defter tutarlı, para korunur', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const S = newGame(seed);
    const before = S.coins, stockBefore = shelfCount(S);
    const T = simulateDay(S);
    assert.ok(Object.values(S.shelf).every(n => n > 0));
    const soldValue = Object.entries(T.sold).reduce((a, [g, n]) => a + n * GENRES[g].price, 0);
    assert.equal(T.revenue, soldValue + T.tips);
    assert.equal(S.coins, before + T.revenue);
    assert.equal(shelfCount(S), stockBefore - T.soldCount);
    assert.ok(T.visitors >= TOWNS.ayvalik.traffic - BAL.trafficJitter);
    assert.equal(S.day, 2);
  }
});

test('aynı tohum aynı günü üretir', () => {
  const a = simulateDay(newGame(42)), b = simulateDay(newGame(42));
  assert.deepEqual(a, b);
});

test('saat parça parça ilerleyince de bütün müşteriler gelir', () => {
  const S = newGame(9);
  openShop(S);
  const n = S.arrivals.length + S.regArrivals.length;
  let seen = 0;
  while (!closingTime(S)) seen += advanceClock(S, 0.7).length;
  assert.equal(seen, n);
  assert.ok(closeShop(S));
  assert.equal(S.phase, 'evening');
  nextMorning(S);
  assert.equal(S.phase, 'morning');
});

test('kayıt: gün ortası sabaha döner, v1 kayıt göç eder, bilinmeyen sürüm reddedilir', () => {
  const S = newGame(5);
  openShop(S);
  const R = restore(JSON.parse(JSON.stringify(S)));
  assert.equal(R.phase, 'morning');
  assert.equal(R.today, null);
  assert.equal(restore({ v: 0 }), null);
  const old = { v: 1, day: 4, phase: 'morning', coins: 90, town: 'foca', stock: { roman: 3, tarih: 12, siir: 0 },
    totals: { days: 3, sold: 30, revenue: 200, spent: 80 } };
  const M = restore(old);
  assert.equal(M.v, 2);
  assert.equal(genreCount(M, 'roman'), 3);
  assert.equal(genreCount(M, 'tarih'), 12);
  assert.equal(M.coins, 90);
  assert.equal(M.prevTown, 'foca');
  assert.deepEqual(M.decor.on, newGame(1).decor.on);
  assert.ok(Object.keys(M.shelf).every(id => BOOK[id]));
});

test('iflas koruması: kasa ve raf boşsa en ucuz koli kadar destek', () => {
  const S = newGame(1);
  emptyShelf(S);
  S.coins = 3;
  const gift = rescue(S);
  assert.equal(S.coins, Math.min(...GENRE_KEYS.map(boxCost)));
  assert.ok(gift > 0);
  assert.equal(rescue(S), 0);
});

test('mekân: sabah seçilir, kalabalığı ve zevki değiştirir, yolculukta ilk mekâna döner', () => {
  for (const t in SPOTS) for (const k in SPOTS[t]) {
    const sp = SPOTS[t][k];
    assert.ok(['sahil', 'carsi', 'tepe'].includes(sp.scene), k);
    for (const tag of sp.tags) assert.ok(TAGS[tag], k + ':' + tag);
    for (const g in sp.demand) assert.ok(GENRES[g], k + ':' + g);
  }
  const S = newGame(4);
  assert.equal(S.spot, 'iskele');
  assert.equal(chooseSpot(S, 'kale'), 'Bu kasabada böyle bir yer yok.');
  assert.equal(chooseSpot(S, 'carsi'), null);
  assert.equal(demandOf(S).cocuk, TOWNS.ayvalik.demand.cocuk * SPOTS.ayvalik.carsi.demand.cocuk);
  let busy = 0, calm = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const A = newGame(seed); chooseSpot(A, 'carsi'); busy += simulateDay(A).visitors;
    calm += simulateDay(newGame(seed)).visitors;
  }
  assert.ok(busy > calm, `çarşı ${busy} > iskele ${calm}`);
  travel(S, 'cunda');
  assert.equal(S.spot, 'liman');
  openShop(S);
  assert.equal(chooseSpot(S, 'tepe'), 'Mekân yalnızca sabah değişir.');
});

test('müdavim: zevkine uyan, karşılanabilir istek; kasabasında uğrar', () => {
  for (const id of REGULAR_KEYS) {
    const S = newGame(7);
    const c = makeRegular(S, id);
    assert.equal(c.reg, id);
    assert.ok(c.ask.tags.length >= 1 && c.ask.tags.every(t => REGULARS[id].likes.includes(t)), id);
    assert.ok(BOOKS.some(b => matchGrade(c.ask, b.id) === 'perfect'), id);
  }
  let seen = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const T = simulateDay(newGame(seed));
    seen += (T.regulars || []).length;
    for (const r of T.regulars || []) assert.equal(REGULARS[r.id].town, 'ayvalik');
  }
  assert.ok(seen > 20 && seen < 60, 'iki müdavim, %45 ihtimal: ' + seen);
});

test('dostluk: tam isabet kalp verir, 3 kalpte ek bahşiş, 5 kalpte hediye', () => {
  const S = newGame(8);
  openShop(S);
  const give = id => {
    const c = makeRegular(S, id);
    const book = BOOKS.find(b => matchGrade(c.ask, b.id) === 'perfect');
    S.shelf = { [book.id]: 1 };
    return recommend(S, c, book.id);
  };
  let r;
  for (let i = 1; i <= HEARTS_TIP; i++) r = give('hasan');
  assert.equal(S.friends.hasan, HEARTS_TIP);
  r = give('hasan');
  assert.equal(r.tip, BAL.tipPerfect + REGULAR_TIP, '3 kalpten sonra ek bahşiş');
  r = give('hasan');
  assert.equal(S.friends.hasan, HEARTS_MAX);
  assert.equal(r.friend.gift, 'zeytin');
  assert.ok(S.decor.owned.includes('zeytin'));
  assert.equal(give('hasan').friend, undefined, 'en fazla 5 kalp');
  for (let i = 0; i < HEARTS_MAX; i++) r = give('melis');
  assert.equal(r.friend.coins, GIFT_COINS, 'süs hediyesi olmayan para verir');
  const c = makeRegular(S, 'ruya');
  S.shelf = { garip: 1 };
  recommend(S, c, 'garip');
  assert.equal(S.friends.ruya, undefined, 'uymayan öneri kalp vermez');
  assert.ok(S.met.includes('ruya'));
});

test('hediye süs satın alınamaz, alınınca takılır', () => {
  const S = newGame(1);
  S.coins = 999;
  assert.equal(equipDecor(S, 'fok'), 'Bu bir hediye: bir müdavimle dost olunca gelir.');
  S.decor.owned.push('fok');
  assert.equal(equipDecor(S, 'fok'), null);
  assert.equal(S.coins, 999);
  assert.equal(effects(S).traffic, DECOR.fok.effect.traffic);
});

test('takvim: hava ve etkinlik günden sabit, dağılım makul, etkinlik yalnız kendi kasabasında', () => {
  assert.equal(weatherOf(1), 'gunesli');
  const count = {};
  let events = 0, streak = 0, maxStreak = 0, prev = null;
  for (let d = 2; d <= 2000; d++) {
    const w = weatherOf(d);
    assert.equal(w, weatherOf(d), 'sabit');
    assert.ok(WEATHER[w]);
    count[w] = (count[w] || 0) + 1;
    streak = w === prev ? streak + 1 : 1; prev = w; maxStreak = Math.max(maxStreak, streak);
    const e = eventOf(d);
    if (e) { events++; assert.ok(EVENTS[e]); }
  }
  for (const k in WEATHER) assert.ok(Math.abs(count[k] / 1999 * 100 - WEATHER[k].weight) < 5, k + ' ' + count[k]);
  assert.ok(Math.abs(events / 1999 - EVENT_CHANCE) < 0.05, 'etkinlik oranı');
  assert.ok(maxStreak <= 16, 'aynı hava çok uzun sürmesin (%50 güneşte 2000 günde ~11 beklenir): ' + maxStreak);
  const d = [...Array(200).keys()].map(i => i + 2).find(x => eventOf(x));
  const town = EVENTS[eventOf(d)].town, other = TOWN_KEYS.find(t => t !== town);
  assert.equal(dayMods(d, town).event, eventOf(d));
  assert.equal(dayMods(d, other).event, null);
  assert.ok(dayMods(d, town).traffic > dayMods(d, other).traffic);
});

test('takvim: festival günü o kasabada daha çok ziyaretçi', () => {
  const days = [...Array(400).keys()].map(i => i + 2).filter(x => eventOf(x) && WEATHER[weatherOf(x)].traffic === 1).slice(0, 15);
  let fest = 0, calm = 0;
  for (const d of days) {
    const town = EVENTS[eventOf(d)].town, other = TOWN_KEYS.find(t => t !== town && TOWNS[t].traffic === TOWNS[town].traffic) || TOWN_KEYS.find(t => t !== town);
    const A = newGame(d); A.day = d; A.town = A.prevTown = town; A.spot = Object.keys(SPOTS[town])[0];
    const B = newGame(d); B.day = d; B.town = B.prevTown = other; B.spot = Object.keys(SPOTS[other])[0];
    fest += simulateDay(A).visitors / (TOWNS[town].traffic * SPOTS[town][A.spot].traffic);
    calm += simulateDay(B).visitors / (TOWNS[other].traffic * SPOTS[other][B.spot].traffic);
  }
  assert.ok(fest > calm * 1.25, `${fest.toFixed(1)} > ${calm.toFixed(1)}`);
});

test('müdavim hikâyeleri: her kalp için bir satır', () => {
  for (const id of REGULAR_KEYS) assert.equal(REGULARS[id].story.length, HEARTS_MAX, id);
});

console.log(`\n${passed} test geçti`);
