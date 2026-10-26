// Denge simülasyonu: farklı oyun tarzlarıyla 60 gün oynar, kasanın nasıl büyüdüğünü yazdırır.
// İlk tabloda öneri isteyene raftaki en uygun kitap verilir (her şeyi bilen oyuncu); gerçekçi oyuncu bölümünde bilgisi sınırlıdır.
// Kullanım: npm run sim · yalnız bir bölüm: -- kisa (ilk tablo) | gercek | pazarlik | bilgi
import { GENRE_KEYS } from '../src/data/genres.js';
import { TOWNS, TOWN_KEYS } from '../src/data/towns.js';
import { SHELF_LEVELS } from '../src/data/decor.js';
import { newGame, genreCount, shelfCount, shelfCap } from '../src/game/state.js';
import { BAL } from '../src/data/balance.js';
import { buyBox, travel, rescue, demandOf, donate, sponsor, sponsorable, refillShelves } from '../src/game/shop.js';
import { placeAll, setPrice, SECTIONS } from '../src/game/shelving.js';
import { equipDecor, upgradeShelf, buyUpgrade } from '../src/game/decor.js';
import { BOOK } from '../src/data/books.js';
import { GENRES } from '../src/data/genres.js';
import { UPGRADES } from '../src/data/decor.js';
import { genreOpen, unlockGenre } from '../src/game/progress.js';
import { ARCHETYPES } from '../src/data/archetypes.js';
import { knownTags, knowsAll, readBook, readsLeft } from '../src/game/knowledge.js';
import { favorOpen, ordered, orderBook } from '../src/game/bonds.js';
import { simulateDay, HAGGLE_DEFAULT } from '../src/game/day.js';
import { sozOptions, sozFit } from '../src/game/haggle.js';
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
    const g = GENRE_KEYS.filter(k => genreOpen(S, k)).sort((a, b) => genreCount(S, a) / d[a] - genreCount(S, b) / d[b])[0];
    if (buyShelved(S, g)) break;
  }
}
// Hep aynı türü alır
function stockLazy(S) { while (!buyShelved(S, 'roman')); }

// Kenara para ayırıp sırayla alır: kasabada aranan kilitli tür, araba basamağı, satış araçları, süsler (koliye yetecek para kalır)
// önce araba (sıradaki basamağa para biriktirir); öteki alımlar o basamağın parasına dokunmaz
function invest(S) {
  const d = demandOf(S), next = SHELF_LEVELS[S.shelfLv + 1];
  if (next && S.coins > next.price + 100) upgradeShelf(S);
  const spare = () => S.coins - (SHELF_LEVELS[S.shelfLv + 1]?.price || 0) * 0.6;
  for (const g of GENRE_KEYS.filter(k => !genreOpen(S, k)).sort((a, b) => d[b] - d[a])) if (spare() > GENRES[g].unlock + 100) unlockGenre(S, g);
  for (const k of ['paket', 'cay', 'fener']) if (spare() > UPGRADES[k].price + 150) buyUpgrade(S, k);
  if (S.coins > 240) equipDecor(S, 'bayrak');
  if (S.coins > 300) equipDecor(S, 'lamba');
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
    // ilk harcamanın (koli dışı) ve araba basamaklarının günü (ulaşılamadıysa sayılmaz)
    const firstBuy = [], lvDay = [[], [], [], []];
    for (let r = 0; r < RUNS; r++) {
      const S = newGame(4000 + r), rec = reader(4000 + r);
      let bought = false;
      for (let d = 0; d < DAYS; d++) {
        rescue(S);
        const own = S.upgrades.length + S.genres.length + S.shelfLv + S.decor.owned.length;
        play(S, d);
        if (!bought && S.upgrades.length + S.genres.length + S.shelfLv + S.decor.owned.length > own) { bought = true; firstBuy.push(d + 1); }
        if (!lvDay[S.shelfLv].done) for (let l = 1; l <= S.shelfLv; l++) if (lvDay[l].length < r + 1) lvDay[l].push(d + 1);
        const T = simulateDay(S, () => 0, rec, { favors: true });
        perfect += T.recs.perfect; asked += T.recs.perfect + T.recs.good + T.recs.miss; favors += T.favors || 0;
        curve[d] += S.coins / RUNS;
      }
      spent += S.totals.spent / RUNS;
    }
    rows[name] = curve[DAYS - 1];
    const pts = [7, 14, 30, 60].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ');
    const avg = a => a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(0) : '–';
    const steps = firstBuy.length ? ` | ilk alım ${avg(firstBuy)}.g, araba ${[1, 2, 3].map(l => `${avg(lvDay[l])}.g (${lvDay[l].length}/${RUNS})`).join(' → ')}` : '';
    console.log(`${name.padEnd(38)} ${pts} | tam isabet %${Math.round(100 * perfect / Math.max(1, asked))}, ${(favors / RUNS).toFixed(1)} rica, ₺${Math.round(spent)} harcama${steps}`);
  }
  const lazy = rows['hep roman'], smart = rows['akıllı, tek kasaba'];
  console.log(`  → tembel oyuncu akıllıdan %${Math.round(100 * (1 - lazy / smart))} geride`);
}
if (ONLY === 'gercek') process.exit(0);

// --- Pazarlık (-- pazarlik): aynı gerçekçi oyuncu (akıllı stok, tek kasaba), pazarlığa gelen müşteriye farklı tavırlar.
// Bot müşterinin sınırını görmez; yalnız teklife, tura ve "son söz"e bakar.
const HAGGLE = {
  'hep kabul': () => 'accept',
  'hep fiyatında': () => 'hold',
  'orta yol, sonra kabul': HAGGLE_DEFAULT,
  // müşteriyi okuyan: görünüşünden tipini tanır (cebine bakmayan → fiyatında dur; cebine bakan → kabul ya da orta yol)
  'tipe bakan': (S, c, d) => { const th = ARCHETYPES[c.arch]?.thrift || 'mid'; if (d.final || d.rounds >= 2) return 'accept'; if (th === 'loose') return d.rounds === 0 ? 'hold' : 'accept'; if (th === 'tight') return d.O >= d.P * 0.7 || d.rounds ? 'accept' : 'mid'; return d.rounds === 0 ? 'mid' : 'accept'; },
  // cümleyi okuyan: parası yeten (alışkanlıktan pazarlık eden) müşteride fiyatında durur, cebi dar olana orta yol
  'cümleye bakan': (S, c, d) => d.habit ? 'hold' : d.final || d.rounds ? 'accept' : 'mid',
  // söz kullanan: ipucundan derdini okur; derdine dokunan bir sözü varsa önce onu söyler, sonra cümleye bakar
  'söz + cümle': (S, c, d) => {
    if (!d.soz && d.rounds === 0) { const s = sozOptions(S, c, d).find(o => sozFit(c, o) === 1); if (s) return 'soz:' + s.kind; }
    return d.habit ? 'hold' : d.final || (d.rounds && d.soz !== null && d.rounds > 1) || (d.rounds && !d.soz) ? 'accept' : 'mid';
  },
  'teklife bakan': (S, c, d) => d.final || d.O >= d.P * 0.88 || d.rounds >= 2 ? 'accept' : d.rounds === 0 && d.O >= d.P * 0.75 ? 'hold' : 'mid',
};
if (!ONLY || ONLY === 'pazarlik') {
  console.log('\nPazarlık tavrı (gerçekçi oyuncu, akıllı stok, tek kasaba):');
  const rows = {};
  for (const [name, haggle] of Object.entries(HAGGLE)) {
    const curve = Array(DAYS).fill(0);
    let n = 0, won = 0, paid = 0, sticker = 0, sold = 0, visitors = 0;
    for (let r = 0; r < RUNS; r++) {
      const S = newGame(4000 + r), rec = reader(4000 + r);
      for (let d = 0; d < DAYS; d++) {
        rescue(S);
        careful(S);
        stockSmart(S);
        const T = simulateDay(S, () => 0, rec, { favors: true, haggle });
        if (T.deals) { n += T.deals.n; won += T.deals.won; paid += T.deals.paid; sticker += T.deals.sticker; }
        sold += T.soldCount; visitors += T.visitors;
        curve[d] += S.coins / RUNS;
      }
    }
    rows[name] = curve[DAYS - 1];
    const pts = [7, 14, 30, 60].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ');
    console.log(`${name.padEnd(24)} ${pts} | günde ${(n / RUNS / DAYS).toFixed(1)} pazarlık, %${Math.round(100 * won / Math.max(1, n))} anlaşma, etiketin %${Math.round(100 * paid / Math.max(1, sticker))}'i, satış/ziyaretçi %${Math.round(100 * sold / visitors)}`);
  }
  const base = rows['hep kabul'];
  for (const k of Object.keys(rows).slice(1)) console.log(`  → ${k}: hep kabul edenden %${Math.round(100 * (rows[k] / base - 1))}`);
}

// Akdeniz bölümü v3 sadeleştirmesiyle kaldırıldı (ülkeler kenarda: data/features.js).

// --- Mahalleler (-- mahalle): aynı orta oyun oyuncusu (kitap arabası, bütün türler açık) 20 gün tek bir mahallede.
// Sonra 60 günlük gerçekçi oyunda mahalle açan ve her sabah yer seçen oyuncu, hep İskele'de kalanla karşılaştırılır.
if (!ONLY || ONLY === 'mahalle') {
  const { DISTRICTS, DISTRICT_KEYS } = await import('../src/data/districts.js');
  const { openDistrict } = await import('../src/game/koy.js');
  const { dayMods } = await import('../src/game/calendar.js');
  console.log('\nMahalleler (orta oyun: kitap arabası, bütün türler açık, güven 30; 20 gün, günlük ortalama):');
  const res = {};
  for (const k of DISTRICT_KEYS) {
    let net = 0, rev = 0, rent = 0, vis = 0, sold = 0, deals = 0, paid = 0, sticker = 0, dear = 0;
    for (let r = 0; r < RUNS; r++) {
      // aynı mahalle, bütün bölümlerde pahalı etiket
      const X = newGame(6000 + r), xr = reader(6000 + r);
      Object.assign(X, { coins: 400, shelfLv: 1, genres: [...GENRE_KEYS], unlocked: [...DISTRICT_KEYS] });
      for (const d of DISTRICT_KEYS) X.rep[d] = 30;
      if (k !== X.town) travel(X, k);
      for (let d = 0; d < 20; d++) { rescue(X); careful(X); tagAll('pahali')(X); stockSmart(X); const T = simulateDay(X, () => 0, xr, { favors: true }); dear += T.revenue - T.costs.park; }
      const S = newGame(6000 + r), rec = reader(6000 + r);
      Object.assign(S, { coins: 400, shelfLv: 1, genres: [...GENRE_KEYS], unlocked: [...DISTRICT_KEYS] });
      for (const d of DISTRICT_KEYS) S.rep[d] = 30;
      if (k !== S.town) travel(S, k);
      for (let d = 0; d < 20; d++) {
        rescue(S); careful(S); stockSmart(S);
        const T = simulateDay(S, () => 0, rec, { favors: true });
        rev += T.revenue; rent += T.costs.park; vis += T.visitors; sold += T.soldCount;
        if (T.deals) { deals += T.deals.n; paid += T.deals.paid; sticker += T.deals.sticker; }
      }
    }
    const n = RUNS * 20;
    res[k] = (rev - rent) / n;
    console.log(`${DISTRICTS[k].name.padEnd(18)} günde ${(vis / n).toFixed(1)} ziyaretçi, ${(sold / n).toFixed(1)} satış (₺${(rev / Math.max(1, sold)).toFixed(1)}/kitap), ${(deals / n).toFixed(1)} pazarlık (etiketin %${Math.round(100 * paid / Math.max(1, sticker))}'i) | ciro ₺${(rev / n).toFixed(0)} − kira ₺${(rent / n).toFixed(0)} = ₺${(res[k]).toFixed(0)} · pahalı etiketle ₺${(dear / n).toFixed(0)}`);
  }
  const v = Object.values(res);
  console.log(`  → en iyi ile en kötü mahalle arası günlük fark ₺${(Math.max(...v) - Math.min(...v)).toFixed(0)} (%${Math.round(100 * (Math.max(...v) / Math.min(...v) - 1))})`);

  // her sabah: açık mahalleler arasında bugünkü kalabalığa, cüzdana ve kiraya göre en iyisi; parası yetince yeni mahalle açar
  // beklenen net: bugünkü kalabalık × kitap başına değer − kira (doymuş türler de hesaba katılır: dün satılan yerde talep düşük)
  const score = (S, k) => Math.min(TOWNS[k].traffic * dayMods(S.day, k).traffic, 34) * 9 * DISTRICTS[k].koy.worth * Math.min(1.2, DISTRICTS[k].koy.purse) - DISTRICTS[k].koy.rent - (k === S.town ? 0 : 12);
  const chooser = S => {
    // açılış bedeli bir haftalık kazançtan azsa ve araba birikimine dokunmuyorsa aç
    for (const k of DISTRICT_KEYS) { const c = DISTRICTS[k].koy.open?.coins || 0; if (c && c * 0.5 + 250 < S.coins - (SHELF_LEVELS[S.shelfLv + 1]?.price || 0) * 0.5) openDistrict(S, k); else if (!c) openDistrict(S, k); }
    const best = S.unlocked.filter(k => DISTRICTS[k]).sort((a, b) => score(S, b) - score(S, a))[0];
    if (best && best !== S.town) travel(S, best);
    // değerli mahallede pahalı, öğrencide ucuz etiket
    const w = DISTRICTS[S.town].koy.worth;
    tagAll(w >= 1.1 ? 'pahali' : w < 0.95 ? 'ucuz' : 'normal')(S);
  };
  const PLAY = { 'hep İskele': () => {}, 'mahalle açar ve seçer': chooser };
  console.log('\nGerçekçi oyuncu, 60 gün (akıllı stok + yatırım):');
  const fin = {};
  for (const [name, move] of Object.entries(PLAY)) {
    const curve = Array(DAYS).fill(0), opened = [];
    for (let r = 0; r < RUNS; r++) {
      const S = newGame(7000 + r), rec = reader(7000 + r);
      for (let d = 0; d < DAYS; d++) {
        rescue(S); careful(S); move(S); invest(S); stockSmart(S);
        simulateDay(S, () => 0, rec, { favors: true });
        curve[d] += S.coins / RUNS;
      }
      opened.push(S.unlocked.filter(k => DISTRICTS[k]).length);
    }
    fin[name] = curve[DAYS - 1];
    console.log(`${name.padEnd(24)} ${[7, 14, 30, 60].map(d => `${d}.g ₺${Math.round(curve[d - 1])}`).join(' · ')} | ortalama ${(opened.reduce((a, b) => a + b, 0) / RUNS).toFixed(1)} mahalle açık`);
  }
  console.log(`  → yer seçen oyuncu hep İskele'de kalandan %${Math.round(100 * (fin['mahalle açar ve seçer'] / fin['hep İskele'] - 1))}`);
}
if (ONLY === 'mahalle') process.exit(0);

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
