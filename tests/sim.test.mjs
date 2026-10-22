// Başsız oyun testleri: gerçek modüller, DOM yok. Kullanım: node tests/sim.test.mjs
import assert from 'node:assert/strict';
import { BAL } from '../src/data/balance.js';
import { GENRES, GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS } from '../src/data/towns.js';
import { BOOKS, BOOK, TAGS, booksOf } from '../src/data/books.js';
import { DECOR, SHELF_LEVELS, PAINTS } from '../src/data/decor.js';
import { newGame, restore, shelfCount, shelfCap, genreCount, seasonOf } from '../src/game/state.js';
import { buyBox, boxCost, travel, rescue, resolveCustomer, recommend, matchGrade, bestBook, makeCustomer, askText, demandOf } from '../src/game/shop.js';
import { effects, equipDecor, upgradeShelf, choosePaint } from '../src/game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning, simulateDay } from '../src/game/day.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓ ' + name); };
const emptyShelf = S => { S.shelf = {}; };

test('veri: her türde 10 kitap, etiketler tanımlı, kimlikler benzersiz', () => {
  for (const g of GENRE_KEYS) assert.equal(booksOf(g).length, 10, g);
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
  const n = S.arrivals.length;
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

console.log(`\n${passed} test geçti`);
