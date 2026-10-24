// Denge simülasyonu: farklı oyun tarzlarıyla 60 gün oynar, kasanın nasıl büyüdüğünü yazdırır.
// İlk tabloda öneri isteyene raftaki en uygun kitap verilir (her şeyi bilen oyuncu); gerçekçi oyuncu bölümünde bilgisi sınırlıdır.
// Kullanım: npm run sim · yalnız bir bölüm: -- kisa (ilk tablo) | gercek | bilgi
import { GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS, TOWN_KEYS } from '../src/data/towns.js';
import { SHELF_LEVELS } from '../src/data/decor.js';
import { newGame, genreCount, shelfCount, shelfCap } from '../src/game/state.js';
import { BAL } from '../src/data/balance.js';
import { buyBox, travel, rescue, demandOf, donate, sponsor, sponsorable, refillShelves } from '../src/game/shop.js';
import { placeAll, setPrice, SECTIONS } from '../src/game/shelving.js';
import { equipDecor, upgradeShelf, buyUpgrade } from '../src/game/decor.js';
import { BOOK } from '../src/data/books.js';
import { knownTags, knowsAll, readBook, readsLeft } from '../src/game/knowledge.js';
import { favorOpen, ordered, orderBook } from '../src/game/bonds.js';
import { simulateDay } from '../src/game/day.js';
import { eventOf } from '../src/game/calendar.js';
import { EVENTS } from '../src/data/calendar.js';

const DAYS = 60, RUNS = 30;

// İyi oyuncu gibi: rafta yer varken koli al ve hemen diz (kolide bekleyen kitap satılmaz)
function buyShelved(S, g) {
  if (shelfCount(S) + BAL.boxSize > shelfCap(S)) return 'dolu';
  const why = buyBox(S, g);
  placeAll(S);
  return why;
}

// Rafları kasabanın zevkine göre doldurur: en çok aranıp rafta en az olan türü alır
function stockSmart(S) {
  const d = demandOf(S);
  for (;;) {
    const g = GENRE_KEYS.slice().sort((a, b) => genreCount(S, a) / d[a] - genreCount(S, b) / d[b])[0];
    if (buyShelved(S, g)) break;
  }
}
// Hep aynı türü alır
function stockLazy(S) { while (!buyShelved(S, 'roman')); }

// Kenara para ayırıp sırayla raf, ziyaretçi süsü ve masa süsü alır
function invest(S) {
  const next = SHELF_LEVELS[S.shelfLv + 1];
  if (next && S.coins > next.price + 60) upgradeShelf(S);
  if (S.coins > 140) equipDecor(S, 'bayrak');
  if (S.coins > 160) equipDecor(S, 'lamba');
  if (S.coins > 160) equipDecor(S, 'mum');
}

// bütün bölümlere aynı fiyat etiketi
const tagAll = tag => S => { for (let i = 0; i < SECTIONS; i++) setPrice(S, i, tag); };
// yolu açık bir kasabada bugün festival varsa oraya git (yarınkine sponsor ol)
function festival(S, sponsorToo) {
  const e = eventOf(S.day);
  if (e && S.unlocked.includes(EVENTS[e].town)) travel(S, EVENTS[e].town);
  if (sponsorToo && S.coins > 400) { const x = sponsorable(S).find(o => o.day === S.day + 1); if (x) sponsor(S, x.day); }
}
// parası birikince bulunduğu kasabaya okuma köşesi bağışlar
const donor = S => { if (S.coins > BAL.donateCost + 300) donate(S); };

const STYLES = {
  'hiç koli almaz': () => {},
  'hep roman': stockLazy,
  'akıllı, tek kasaba': stockSmart,
  'akıllı, pahalı etiket': S => { tagAll('pahali')(S); stockSmart(S); },
  'akıllı, ucuz etiket': S => { tagAll('ucuz')(S); stockSmart(S); },
  'rafı tamamla düğmesi': S => { refillShelves(S); },
  'akıllı, 3 günde bir gezer': (S, day) => { if (day % 3 === 2) travel(S, S.unlocked[(day / 3 + 1) % S.unlocked.length | 0]); stockSmart(S); },
  'akıllı + yatırım': (S) => { invest(S); stockSmart(S); },
  'yatırım + festival peşinde': (S) => { festival(S, false); invest(S); stockSmart(S); },
  'yatırım + festival + sponsor': (S) => { festival(S, true); invest(S); stockSmart(S); },
  'yatırım + gezer + bağışçı': (S, day) => { if (day % 3 === 2) travel(S, S.unlocked[(day / 3 + 1) % S.unlocked.length | 0]); invest(S); donor(S); stockSmart(S); },
};

const ONLY = process.argv[2];
if (!ONLY || ONLY === 'kisa') for (const [name, play] of Object.entries(STYLES)) {
  const curve = Array(DAYS).fill(0);
  let sold = 0, missed = 0, perfect = 0, tips = 0, costs = 0, lost = 0, won = 0;
  for (let r = 0; r < RUNS; r++) {
    const S = newGame(1000 + r);
    for (let d = 0; d < DAYS; d++) {
      rescue(S);
      play(S, d);
      const T = simulateDay(S);
      sold += T.soldCount;
      missed += Object.values(T.missed).reduce((a, b) => a + b, 0);
      perfect += T.recs.perfect;
      tips += T.tips;
      costs += T.costs.paid; lost += T.priceLost || 0; won += T.priceWon || 0;
      curve[d] += S.coins / RUNS;
    }
  }
  const pts = [7, 14, 30, 60].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ');
  const per = x => (x / RUNS / DAYS).toFixed(1);
  console.log(`${name.padEnd(28)} ${pts} | günde ${per(sold)} satış, ${per(missed)} kaçan, ${per(perfect)} tam öneri, ₺${per(tips)} bahşiş, ₺${per(costs)} gider, fiyat −${per(lost)}/+${per(won)}`);
}
if (ONLY === 'kisa') process.exit(0);
// --- Gerçekçi oyuncu (-- gercek): her şeyi bilmez. Bildiği etiketlere bakar; bilmediğini tanıtımdan sezer (kitapta olan etiketi
// %60 doğru görür, olmayanı %15 yanlışlıkla sanır). Sabahları okuma köşesinde okur, ricaları sipariş edip getirir.
function reader(seed) {
  let x = seed >>> 0 || 1;
  const r = () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296;
  return (S, ask, wants) => {
    let best = null, score = -1;
    for (const id of Object.keys(S.shelf).sort()) {
      const k = knownTags(S, id), b = BOOK[id];
      let s = b.genre === wants ? 1 : 0;
      for (const t of ask.tags) s += k.includes(t) || (b.tags.includes(t) ? r() < 0.6 : r() < 0.15) ? 2 : 0;
      if (s > score) { best = id; score = s; }
    }
    return best;
  };
}
// sabah: rica kitaplarını sipariş et, bilmediği kitapları oku
function careful(S) {
  for (const id in S.favors) if (favorOpen(S, id)) {
    const b = S.favors[id].book;
    if (!S.shelf[b] && !S.crate.some(e => e.id === b) && !ordered(S, b)) orderBook(S, b);
  }
  for (const id of Object.keys(S.shelf).sort()) if (readsLeft(S) && !knowsAll(S, id)) readBook(S, id);
}
const tourEvery3 = (S, day) => { if (day % 3 === 2) travel(S, S.unlocked[(day / 3 + 1) % S.unlocked.length | 0]); };
const richUpgrades = S => { if (S.coins > 500) buyUpgrade(S, 'cay'); if (S.coins > 600) buyUpgrade(S, 'koltuk'); };
const REAL = {
  'hep roman': S => { careful(S); stockLazy(S); },
  'akıllı, tek kasaba': S => { careful(S); stockSmart(S); },
  'akıllı + yatırım': S => { careful(S); invest(S); stockSmart(S); },
  'tam oyuncu (gezer, bağışlar, sponsor)': (S, day) => { careful(S); festival(S, true); tourEvery3(S, day); invest(S); richUpgrades(S); donor(S); stockSmart(S); },
};
if (!ONLY || ONLY === 'gercek') {
  console.log('\nGerçekçi oyuncu (tanıtımı okur, sabah okur, ricaları getirir):');
  const rows = {};
  for (const [name, play] of Object.entries(REAL)) {
    const curve = Array(DAYS).fill(0);
    let perfect = 0, asked = 0, favors = 0, spent = 0;
    for (let r = 0; r < RUNS; r++) {
      const S = newGame(4000 + r), rec = reader(4000 + r);
      for (let d = 0; d < DAYS; d++) {
        rescue(S);
        play(S, d);
        const T = simulateDay(S, () => 0, rec, { favors: true });
        perfect += T.recs.perfect; asked += T.recs.perfect + T.recs.good + T.recs.miss; favors += T.favors || 0;
        curve[d] += S.coins / RUNS;
      }
      spent += S.totals.spent / RUNS;
    }
    rows[name] = curve[DAYS - 1];
    const pts = [7, 14, 30, 60].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ');
    console.log(`${name.padEnd(38)} ${pts} | tam isabet %${Math.round(100 * perfect / Math.max(1, asked))}, ${(favors / RUNS).toFixed(1)} rica, ₺${Math.round(spent)} harcama`);
  }
  const lazy = rows['hep roman'], smart = rows['akıllı, tek kasaba'];
  console.log(`  → tembel oyuncu akıllıdan %${Math.round(100 * (1 - lazy / smart))} geride`);
}
if (ONLY === 'gercek') process.exit(0);

// Akdeniz bölümü v3 sadeleştirmesiyle kaldırıldı (ülkeler kenarda: data/features.js).

// Kitap bilgisi: her şeyi bilen oyuncu ile yalnız öğrendiği etiketlere bakan oyuncu (tanıtımı okumaz: alt sınır).
// Bilgili oyuncu sabahları okuma köşesinde bilmediği iki kitabı okur. Tam isabet oranı dönem dönem.
if (ONLY && ONLY !== 'bilgi') process.exit(0);
console.log('\nÖneri bilgisi (tam isabet / öneri isteyen):');
const { knownBest, knownCount } = await import('../src/game/knowledge.js');
for (const [name, rec, reads] of [['her şeyi bilen', null, false], ['yalnız öğrendikleri', knownBest, false], ['öğrendikleri + okuma', knownBest, true]]) {
  const span = [[1, 5], [6, 15], [16, 30], [31, 60]], hit = span.map(() => [0, 0]);
  let known = 0;
  for (let r = 0; r < 15; r++) {
    const S = newGame(3000 + r);
    for (let d = 1; d <= DAYS; d++) {
      rescue(S); invest(S); stockSmart(S);
      if (reads) for (const id of Object.keys(S.shelf).sort()) if (!knowsAll(S, id)) readBook(S, id);
      const T = simulateDay(S, () => 0, rec || undefined);
      const i = span.findIndex(([a, b]) => d >= a && d <= b), asked = T.recs.perfect + T.recs.good + T.recs.miss;
      hit[i][0] += T.recs.perfect; hit[i][1] += asked;
    }
    known += knownCount(S);
  }
  console.log(`${name.padEnd(24)} ${span.map(([a, b], i) => `${a}–${b}. gün %${Math.round(100 * hit[i][0] / Math.max(1, hit[i][1]))}`).join(' · ')} | 60. günde ${Math.round(known / 15)} kitap tanınıyor`);
}
