// Başsız oyun testleri: gerçek modüller, DOM yok. Kullanım: node tests/sim.test.mjs
import assert from 'node:assert/strict';
import { BAL } from '../src/data/balance.js';
import { GENRES, GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS } from '../src/data/towns.js';
import { newGame, restore, shelfCount, seasonOf } from '../src/game/state.js';
import { buyBox, boxCost, travel, rescue, resolveCustomer } from '../src/game/shop.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning, simulateDay } from '../src/game/day.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓ ' + name); };

test('yeni oyun başlangıç değerleri', () => {
  const S = newGame(1);
  assert.equal(S.coins, BAL.startCoins);
  assert.equal(shelfCount(S), 15);
  assert.equal(S.phase, 'morning');
  assert.equal(seasonOf(1), 'İlkbahar');
  assert.equal(seasonOf(BAL.daysPerSeason + 1), 'Yaz');
});

test('koli almak parayı düşer, rafı doldurur', () => {
  const S = newGame(1);
  assert.equal(buyBox(S, 'siir'), null);
  assert.equal(S.coins, BAL.startCoins - boxCost('siir'));
  assert.equal(S.stock.siir, BAL.boxSize);
  assert.equal(S.totals.spent, boxCost('siir'));
});

test('koli: raf kapasitesi, para ve saat sınırları', () => {
  const S = newGame(1);
  S.coins = 10000;
  while (!buyBox(S, 'cocuk'));
  assert.equal(shelfCount(S), BAL.shelfCap);
  assert.equal(buyBox(S, 'cocuk'), 'Raflarda yer yok.');
  const P = newGame(1); P.coins = 1;
  assert.equal(buyBox(P, 'tarih'), 'Paran yetmiyor.');
  openShop(P);
  assert.equal(buyBox(P, 'tarih'), 'Koli yalnızca sabah alınır.');
});

test('yolculuk: ücret, günde bir kez, yalnız sabah', () => {
  const S = newGame(1);
  assert.equal(travel(S, 'ayvalik'), 'Zaten buradasın.');
  assert.equal(travel(S, 'foca'), null);
  assert.equal(S.town, 'foca');
  assert.equal(S.coins, BAL.startCoins - BAL.travelCost);
  assert.equal(travel(S, 'cunda'), 'Bugün zaten yol yaptın.');
  simulateDay(S);
  assert.equal(travel(S, 'cunda'), null);
});

test('müşteri: aradığı varsa alır, yoksa kaçan talep yazılır', () => {
  const S = newGame(3);
  openShop(S);
  S.stock = Object.fromEntries(GENRE_KEYS.map(g => [g, 0]));
  const r = resolveCustomer(S, { id: 1, wants: 'polisiye', look: 1 });
  assert.equal(r.paid, 0);
  assert.equal(S.today.missed.polisiye, 1);
  S.stock.polisiye = 50;
  let paid = 0;
  for (let i = 0; i < 200; i++) paid += resolveCustomer(S, { id: i, wants: 'polisiye', look: 1 }).paid;
  assert.ok(paid > 200 * BAL.buyChance * GENRES.polisiye.price * 0.8 || S.stock.polisiye === 0);
});

test('tam gün: stok eksiye düşmez, defter tutarlı, para korunur', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const S = newGame(seed);
    const before = S.coins, stockBefore = shelfCount(S);
    const T = simulateDay(S);
    for (const g of GENRE_KEYS) assert.ok(S.stock[g] >= 0);
    const soldValue = Object.entries(T.sold).reduce((a, [g, n]) => a + n * GENRES[g].price, 0);
    assert.equal(T.revenue, soldValue);
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

test('kayıt: gün ortası kayıt sabaha döner, eski sürüm reddedilir', () => {
  const S = newGame(5);
  openShop(S);
  const R = restore(JSON.parse(JSON.stringify(S)));
  assert.equal(R.phase, 'morning');
  assert.equal(R.today, null);
  assert.equal(restore({ v: 0 }), null);
});

test('iflas koruması: kasa ve raf boşsa en ucuz koli kadar destek', () => {
  const S = newGame(1);
  S.stock = Object.fromEntries(GENRE_KEYS.map(g => [g, 0]));
  S.coins = 3;
  const gift = rescue(S);
  assert.equal(S.coins, Math.min(...GENRE_KEYS.map(boxCost)));
  assert.ok(gift > 0);
  assert.equal(rescue(S), 0);
});

console.log(`\n${passed} test geçti`);
