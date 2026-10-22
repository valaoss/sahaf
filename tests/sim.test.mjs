// Başsız oyun testleri: gerçek modüller, DOM yok. Kullanım: node tests/sim.test.mjs
import assert from 'node:assert/strict';
import { BAL, SEASONS } from '../src/data/balance.js';
import { GENRES, GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS } from '../src/data/towns.js';
import { BOOKS, BOOK, TAGS, booksOf } from '../src/data/books.js';
import { DECOR, SHELF_LEVELS, PAINTS } from '../src/data/decor.js';
import { newGame, restore, shelfCount, shelfCap, genreCount, seasonOf } from '../src/game/state.js';
import { buyBox, boxCost, travel, rescue, resolveCustomer, recommend, matchGrade, bestBook, makeCustomer, makeRegular, askText, demandOf, chooseSpot } from '../src/game/shop.js';
import { SPOTS } from '../src/data/spots.js';
import { ARCHETYPES, ARCH_KEYS } from '../src/data/archetypes.js';
import { HAPPENINGS } from '../src/data/happenings.js';
import { VISITORS } from '../src/data/visitors.js';
import { HAP, chooseHappening, dueHappening } from '../src/game/happenings.js';
import { offerQuest, settleQuest, questText } from '../src/game/mail.js';
import { TOWN_KEYS } from '../src/data/towns.js';
import { WEATHER, EVENTS, EVENT_CHANCE, SEASON } from '../src/data/calendar.js';
import { PAGES, FINALE_REWARD } from '../src/data/story.js';
import { composeBar, midiToHz, TEMPO, BEATS_PER_BAR } from '../src/audio/compose.js';
import { STAMPS, STAMP_REWARD } from '../src/data/stamps.js';
import { checkStamps, stampProgress } from '../src/game/stamps.js';
import { checkStory, nextPage, progressOf } from '../src/game/story.js';
import { weatherOf, eventOf, dayMods, specialOf } from '../src/game/calendar.js';
import { REGULARS, REGULAR_KEYS, HEARTS_MAX, HEARTS_TIP, REGULAR_TIP, GIFT_COINS } from '../src/data/regulars.js';
import { effects, equipDecor, upgradeShelf, choosePaint } from '../src/game/decor.js';
import { openShop, advanceClock, closingTime, closeShop, nextMorning, simulateDay } from '../src/game/day.js';

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓ ' + name); };
const emptyShelf = S => { S.shelf = {}; };

test('veri: her türde 40 kitap, etiketler tanımlı, kimlikler benzersiz, her etiket en az 12 kitapta', () => {
  for (const g of GENRE_KEYS) assert.equal(booksOf(g).length, 40, g);
  for (const t in TAGS) assert.ok(BOOKS.filter(b => b.tags.includes(t)).length >= 12, t);
  for (const t in TAGS) assert.ok(Array.isArray(TAGS[t].say) && TAGS[t].say.length >= 3, t);
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
  const hc = BAL.hapChance; BAL.hapChance = 0;   // olaylar ayrı testte; burada defter sade kalsın
  for (let seed = 1; seed <= 50; seed++) {
    const S = newGame(seed);
    const before = S.coins, stockBefore = shelfCount(S);
    const T = simulateDay(S);
    assert.ok(Object.values(S.shelf).every(n => n > 0));
    const soldValue = Object.entries(T.sold).reduce((a, [g, n]) => a + n * GENRES[g].price, 0);
    assert.equal(T.revenue, soldValue + T.tips);
    assert.equal(S.coins, before + T.revenue + T.stamps.length * STAMP_REWARD, 'satış + pul ödülü');
    assert.equal(shelfCount(S), stockBefore - T.soldCount);
    assert.ok(T.visitors >= TOWNS.ayvalik.traffic - BAL.trafficJitter);
    assert.equal(S.day, 2);
  }
  BAL.hapChance = hc;
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
  const count = {}, expect = {};
  let events = 0, streak = 0, maxStreak = 0, prev = null;
  for (let d = 2; d <= 2000; d++) {
    const w = weatherOf(d);
    assert.equal(w, weatherOf(d), 'sabit');
    assert.ok(WEATHER[w]);
    count[w] = (count[w] || 0) + 1;
    // beklenen: o günün mevsimindeki ağırlık
    const sw = SEASON[seasonOf(d)].weather, tot = Object.values(sw).reduce((a, b) => a + b, 0);
    for (const k in sw) expect[k] = (expect[k] || 0) + sw[k] / tot;
    streak = w === prev ? streak + 1 : 1; prev = w; maxStreak = Math.max(maxStreak, streak);
    const e = eventOf(d);
    if (e) { events++; assert.ok(EVENTS[e]); }
  }
  for (const k in WEATHER) assert.ok(Math.abs(count[k] - expect[k]) / 1999 < 0.04, `${k}: ${count[k]} ~ ${expect[k].toFixed(0)}`);
  // kışın yağmur yazdan çok daha sık
  const rainy = s => [...Array(1400).keys()].map(i => i + 2).filter(d => seasonOf(d) === s && weatherOf(d) === 'yagmurlu').length;
  assert.ok(rainy('Kış') > rainy('Yaz') * 4, `kış ${rainy('Kış')} / yaz ${rainy('Yaz')}`);
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

test('ana hikâye: sayfalar sırayla açılır, finalde ödül', () => {
  const S = newGame(3);
  assert.equal(checkStory(S), 'miras');
  assert.equal(checkStory(S), null, 'dört kasaba gezilmeden ikinci sayfa yok');
  assert.equal(nextPage(S).id, 'dostlar');
  S.visited = ['ayvalik', 'cunda', 'foca'];
  assert.deepEqual(progressOf(S), { now: 3, of: 4 });
  S.visited.push('alacati');
  S.totals.perfect = 50; S.totals.sold = 999; S.totals.festivals = 3; S.shelfLv = 2; S.friends.hasan = 4;
  // koşullar çoktan tutsa da günde bir sayfa açılır
  assert.equal(checkStory(S), 'dostlar');
  assert.equal(checkStory(S), 'liste');
  for (const id of ['fener', 'zarf', 'iz', 'gizligoz']) assert.equal(checkStory(S), id);
  assert.equal(checkStory(S, { town: 'foca', spot: 'kale' }), null, 'final yalnız Cunda tepesinde');
  const coins = S.coins;
  assert.equal(checkStory(S, { town: 'cunda', spot: 'tepe' }), 'kutuphane');
  assert.equal(S.coins, coins + FINALE_REWARD.coins);
  assert.ok(S.decor.owned.includes(FINALE_REWARD.decor));
  assert.equal(nextPage(S), null);
  assert.equal(S.pages.length, PAGES.length);
});

test('ana hikâye: normal oyunda ilerler (gün kapanışında kontrol)', () => {
  const S = newGame(12);
  for (let d = 0; d < 12; d++) {
    travel(S, TOWN_KEYS[(d + 1) % 4]);
    simulateDay(S);
  }
  assert.ok(S.pages.length >= 2, 'miras ve dört kasaba: ' + S.pages.join(','));
  assert.ok(S.visited.length === 4);
});

test('müzik: her mevsimde sabit, ölçüye sığan, duyulabilir aralıkta notalar', () => {
  for (const season of Object.keys(TEMPO)) {
    assert.deepEqual(composeBar(5, season), composeBar(5, season), 'aynı ölçü aynı notalar');
    let bells = 0;
    for (let bar = 0; bar < 32; bar++) {
      const notes = composeBar(bar, season);
      assert.ok(notes.some(n => n.inst === 'bass' && n.t === 0), 'her ölçü bas ile başlar');
      for (const n of notes) {
        assert.ok(['bass', 'pluck', 'pad', 'bell'].includes(n.inst));
        assert.ok(n.t >= 0 && n.t < BEATS_PER_BAR, 'ölçü içinde');
        assert.ok(n.midi >= 24 && n.midi <= 100, 'aralık ' + n.midi);
        assert.ok(n.vel > 0 && n.vel <= 1);
        const hz = midiToHz(n.midi);
        assert.ok(hz > 30 && hz < 3000);
      }
      bells += notes.filter(n => n.inst === 'bell').length;
    }
    assert.ok(bells > 0, 'ara sıra melodi');
  }
  assert.equal(Math.round(midiToHz(69)), 440);
});

test('pullar: veri tutarlı, koşul tutunca bir kez verilir, ödül kasaya', () => {
  assert.equal(new Set(STAMPS.map(s => s.id)).size, STAMPS.length);
  const S = newGame(2);
  for (const st of STAMPS) assert.ok(stampProgress(S, st).of > 0, st.id);
  assert.deepEqual(checkStamps(S), [], 'yeni oyunda pul yok');
  const coins = S.coins;
  S.paints = Object.keys(PAINTS);
  S.shelfLv = 2;
  assert.deepEqual(checkStamps(S).sort(), ['gokkusagi', 'raflar']);
  assert.equal(S.coins, coins + 2 * STAMP_REWARD);
  assert.deepEqual(checkStamps(S), [], 'aynı pul iki kez verilmez');
  assert.deepEqual(stampProgress(S, STAMPS.find(s => s.id === 'elli')), { now: 0, of: 50 });
});

test('pullar: normal oyunda gün kapanınca kazanılır; mekân, hava ve festival izlenir', () => {
  const S = newGame(31);
  const T = simulateDay(S);
  assert.ok(T.stamps.includes('ilkgun'));
  assert.ok(S.spotsSeen.includes('ayvalik/iskele'));
  assert.ok(S.weathersSeen.includes('gunesli'));
  // festival olan bir güne atla, o kasabaya git
  const d = [...Array(300).keys()].map(i => i + 2).find(x => eventOf(x));
  S.day = d;
  S.coins += 100;
  travel(S, EVENTS[eventOf(d)].town) ;
  simulateDay(S);
  assert.ok(S.festKinds.includes(eventOf(d)));
  assert.ok(S.stamps.includes('festival'));
});

// --- Faz A: çeşitlilik ---
function manyAsks(seed, n, setup = () => {}) {
  const S = newGame(seed);
  setup(S);
  const asks = [];
  for (let i = 0; i < n; i++) {
    if (i % 40 === 0) { S.day = 2 + (i / 40 | 0); S.town = TOWN_KEYS[(i / 40 | 0) % 4]; S.spot = Object.keys(SPOTS[S.town])[(i / 160 | 0) % Object.keys(SPOTS[S.town]).length]; }
    const c = makeCustomer(S);
    if (c.ask) asks.push(c);
  }
  return { S, asks };
}

test('çeşitlilik: istek cümleleri çok farklı, tekrar penceresinde aynı cümle yok', () => {
  const { asks } = manyAsks(77, 6000);
  const texts = asks.map(c => c.ask.text);
  assert.ok(texts.length > 1000, 'yeterli istek: ' + texts.length);
  const ratio = new Set(texts).size / texts.length;
  assert.ok(ratio > 0.85, 'benzersiz oran ' + ratio.toFixed(3));
  let clash = 0;
  for (let i = 1; i < texts.length; i++) if (texts.slice(Math.max(0, i - 40), i).includes(texts[i])) clash++;
  assert.equal(clash, 0, 'son 40 istekte aynı cümle');
  for (const t of texts) assert.ok(!/[{}]/.test(t) && /^[A-ZÇĞİÖŞÜ]/.test(t) && /[.!?…]$/.test(t), t);
});

test('çeşitlilik: hedef kitap kısa aralıkla tekrar etmez, müşteri tipleri mevsime göre değişir', () => {
  const { asks } = manyAsks(5, 3000);
  let near = 0;
  const targets = asks.map(c => c.ask.tags.join('+') + c.wants);
  for (let i = 1; i < asks.length; i++) if (targets.slice(Math.max(0, i - 3), i).includes(targets[i])) near++;
  assert.ok(near / asks.length < 0.08, 'art arda aynı istek: ' + near);
  const count = (season, arch) => {
    const S = newGame(9);
    S.day = { 'Yaz': 8, 'Kış': 22 }[season];
    S.spot = 'carsi';
    let n = 0;
    for (let i = 0; i < 2000; i++) if (makeCustomer(S).arch === arch) n++;
    return n;
  };
  assert.ok(count('Yaz', 'turist') > count('Kış', 'turist') * 3, 'yazın turist çok');
  for (const k of ARCH_KEYS) assert.ok(['resmi', 'samimi', 'genc', 'cocuk', 'turist'].includes(ARCHETYPES[k].voice), k);
});

test('ilk baskı: kolilerden arada çıkar, normal müşteriye satılmaz, koleksiyoncu kat kat öder', () => {
  const S = newGame(14);
  S.coins = 1e6; S.shelfLv = 2;
  let rare = 0, books = 0;
  for (let i = 0; i < 400; i++) {
    S.shelf = {}; S.rare = {};
    buyBox(S, GENRE_KEYS[i % 6]);
    rare += S.lastBox.rare.length; books += 5;
  }
  assert.ok(Math.abs(rare / books - BAL.rareChance) < 0.02, 'oran ' + rare / books);
  // yalnız ilk baskı varsa normal müşteri o türü bulamaz
  openShop(S);
  S.shelf = { hobbit: 1 }; S.rare = { hobbit: 1 };
  const r = resolveCustomer(S, { id: 1, wants: 'fantastik', look: 1 });
  assert.equal(r.bought.length, 0);
  assert.equal(S.shelf.hobbit, 1);
  // koleksiyoncu: ilk baskıya kat kat, normal baskıya en fazla 'good'
  const ask = { tags: ['macera'], rare: true };
  const ok = recommend(S, { id: 2, arch: 'koleksiyoncu', ask, look: 1 }, 'hobbit');
  assert.equal(ok.grade, 'perfect');
  assert.equal(ok.paid, GENRES.fantastik.price * BAL.rareMul + BAL.tipPerfect);
  assert.equal(S.rare.hobbit, undefined);
  assert.equal(S.totals.rareSold, 1);
  S.shelf = { hobbit: 1 };
  assert.equal(recommend(S, { id: 3, arch: 'koleksiyoncu', ask, look: 1 }, 'hobbit').grade, 'good');
});

test('ilk baskı: koleksiyoncu istekleri karşılanabilir, müdavim istekleri tekrar etmez', () => {
  const { asks } = manyAsks(3, 8000);
  const rareAsks = asks.filter(c => c.ask.rare);
  assert.ok(rareAsks.length > 5, 'koleksiyoncu istekleri: ' + rareAsks.length);
  for (const c of rareAsks) { assert.equal(c.arch, 'koleksiyoncu'); assert.equal(c.ask.tags.length, 1); }
  const S = newGame(4);
  const texts = Array.from({ length: 30 }, () => makeRegular(S, 'hasan').ask.text);
  assert.ok(new Set(texts).size >= 25, 'müdavim cümleleri: ' + new Set(texts).size);
});

// --- Faz B: sürprizler ---
test('olaylar: veri tutarlı (kimlik, seçenek, sonuç metni, bilinen etkiler)', () => {
  const FX = ['coins', 'crowd', 'lose', 'gain', 'gainTag', 'rare', 'heart', 'buff', 'chance', 'fail'];
  assert.ok(HAPPENINGS.length >= 28);
  assert.equal(new Set(HAPPENINGS.map(h => h.id)).size, HAPPENINGS.length);
  for (const h of HAPPENINGS) {
    assert.ok(h.title && h.text && h.icon && h.choices.length >= 1, h.id);
    for (const c of h.choices) {
      assert.ok(c.label && c.result, h.id);
      for (const k in c.fx) assert.ok(FX.includes(k), h.id + ':' + k);
      if (c.fx.chance !== undefined) assert.ok(c.failResult, h.id + ' şanslı seçimin başarısız metni');
    }
  }
});

test('olaylar: günde ortalama ~1, koşullara uyar, aynı olay kısa sürede tekrar etmez', () => {
  const S = newGame(19);
  S.coins = 1e5;
  const seen = [];
  let total = 0;
  for (let d = 0; d < 120; d++) {
    if (d % 3 === 0) travel(S, TOWN_KEYS[(d / 3) % 4]);
    buyBox(S, GENRE_KEYS[d % 6]);
    openShop(S);
    for (const h of S.haps) {
      const H = HAP[h.id], w = H.when || {};
      if (w.weather) assert.equal(weatherOf(S.day), w.weather, h.id);
      if (w.season) assert.equal(seasonOf(S.day), w.season, h.id);
      if (w.minDay) assert.ok(S.day >= w.minDay, h.id);
      const last = seen.filter(x => x.id === h.id).pop();
      if (last) assert.ok(S.day - last.day >= 6, h.id + ' bekleme süresi');
      if (H.once || w.once) assert.ok(!last, h.id + ' bir kerelik');
      seen.push({ id: h.id, day: S.day });
      total++;
    }
    while (!closingTime(S)) {
      advanceClock(S, 30).forEach(c => c.ask ? recommend(S, c, bestBook(S, c.ask)) : resolveCustomer(S, c));
      for (let h; (h = dueHappening(S));) chooseHappening(S, h, d % 2);
    }
    closeShop(S); nextMorning(S);
  }
  assert.ok(total / 120 > 0.4 && total / 120 < 1.1, 'günde olay: ' + (total / 120).toFixed(2));
  assert.ok(new Set(seen.map(x => x.id)).size >= 20, 'farklı olay: ' + new Set(seen.map(x => x.id)).size);
});

test('olaylar: etkiler uygulanır (para, kalabalık, kayıp, ilk baskı, yarına ilgi)', () => {
  const S = newGame(6);
  openShop(S);
  const arrivals = S.arrivals.length, books = shelfCount(S), coins = S.coins;
  const r1 = chooseHappening(S, 'muzisyen', 0);
  assert.equal(S.arrivals.length, arrivals + 4);
  assert.ok(r1.tags.includes('👣 +4'));
  chooseHappening(S, 'bagis', 0);
  assert.equal(shelfCount(S), books - 3);
  const r2 = chooseHappening(S, 'imza', 1);
  assert.ok(r2.rare && S.rare[r2.rare] >= 1);
  chooseHappening(S, 'film', 0);
  assert.equal(S.coins, coins + 30);
  assert.ok(S.buffs.some(b => b.day === S.day + 1 && b.traffic === 1.3));
  assert.ok(S.hapDone.includes('film') && S.hapLast.film === S.day);
});

test('olaylar: yarına kalan ilgi ertesi gün kalabalığı artırır', () => {
  let boosted = 0, plain = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const A = newGame(seed), B = newGame(seed);
    A.buffs.push({ day: 1, traffic: 1.4 });
    openShop(A); openShop(B);
    boosted += A.arrivals.length; plain += B.arrivals.length;
  }
  assert.ok(boosted > plain * 1.25, `${boosted} > ${plain}`);
});

test('mektuplar: yalnız gerçekten tam isabet önerilen kitaplara, en az 5 gün sonra', () => {
  const S = newGame(8);
  S.coins = 1e5;
  // her tam isabeti kayıt dışında da izle (geçmiş sınırlı)
  const perfectBooks = new Set();
  for (let d = 0; d < 40; d++) {
    GENRE_KEYS.forEach(g => buyBox(S, g));
    simulateDay(S);
    for (const r of S.recHistory) perfectBooks.add(r.book + '@' + r.day);
  }
  assert.ok(S.letters.length >= 3, 'mektup sayısı: ' + S.letters.length);
  for (const L of S.letters) {
    assert.ok(L.recDay >= 1 && L.day - L.recDay >= 5, 'en az 5 gün');
    assert.ok(perfectBooks.has(L.book + '@' + L.recDay), 'gerçekten önerilmiş: ' + L.book);
    assert.ok(L.text.includes(BOOK[L.book].title) && !/[{}]/.test(L.text), L.text);
    assert.ok(/^[A-ZÇĞİÖŞÜ«]/.test(L.text), 'büyük harfle başlar: ' + L.text);
    assert.ok(!/[^.!?] (Geçen|İki|Üç) (hafta|ay)/.test(L.text), 'cümle ortasında küçük harf: ' + L.text);
  }
  assert.equal(new Set(S.letters.map(l => l.id)).size, S.letters.length, 'aynı şablon tekrar etmez');
});

test('ilanlar: çıkar, teslim edilince ödül, süre dolunca kalkar', () => {
  const S = newGame(2);
  S.day = 4;
  let q = null;
  for (let i = 0; i < 40 && !q; i++) q = offerQuest(S);
  assert.ok(q, 'ilan çıktı');
  assert.ok(!/[{}]/.test(questText(q)), questText(q));
  assert.equal(offerQuest(S), null, 'aktif ilan varken yenisi yok');
  const ids = q.kind === 'book' ? [q.book] : BOOKS.filter(b => q.kind === 'tag' ? b.tags.includes(q.tag) : b.genre === q.genre).slice(0, q.n).map(b => b.id);
  for (const id of ids) S.shelf[id] = (S.shelf[id] || 0) + (q.kind === 'book' ? q.n : 1);
  const coins = S.coins;
  const r = settleQuest(S, { town: q.town || S.town });
  assert.ok(r && r.done);
  assert.equal(S.coins, coins + q.coins);
  assert.equal(S.quest, null);
  assert.equal(S.questsDone, 1);
  const P = newGame(3);
  P.day = 5;
  let q2 = null;
  for (let i = 0; i < 40 && !q2; i++) q2 = offerQuest(P);
  P.shelf = {};
  P.day = q2.deadline;
  assert.deepEqual(settleQuest(P, { town: 'yok' }), { done: false, vid: q2.vid });
  for (const V of VISITORS) assert.ok(['book', 'tag', 'genre'].includes(V.kind), V.id);
});

test('özel günler: doğru günde, bütün kasabalarda; fuar ilk baskıyı artırır', () => {
  const day = (season, n) => SEASONS.indexOf(season) * BAL.daysPerSeason + n;
  assert.equal(specialOf(day('İlkbahar', 3)).id, 'cocukbayrami');
  assert.equal(specialOf(day('Kış', 7)).id, 'yilbasi');
  assert.equal(specialOf(day('İlkbahar', 4)), null);
  for (const t of TOWN_KEYS) assert.equal(dayMods(day('Yaz', 4), t).special, 'kitapfuari');
  const rareRate = d => {
    const S = newGame(5); S.day = d; S.coins = 1e6; S.shelfLv = 2;
    let r = 0;
    for (let i = 0; i < 300; i++) { S.shelf = {}; S.rare = {}; buyBox(S, 'roman'); r += S.lastBox.rare.length; }
    return r;
  };
  assert.ok(rareRate(day('Yaz', 4)) > rareRate(day('Yaz', 3)) * 2, 'fuarda ilk baskı');
});

test('müdavim hikâyeleri: her kalp için bir satır', () => {
  for (const id of REGULAR_KEYS) assert.equal(REGULARS[id].story.length, HEARTS_MAX, id);
});

console.log(`\n${passed} test geçti`);
