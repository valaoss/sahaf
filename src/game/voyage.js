// Akdeniz'in işleri: her ülkenin kendine özgü bir mekaniği ve yan hikâyesi (data/voyage.js).
// Yunanistan ada günü · İtalya müzayede · Fransa bukinist kutusu · İspanya gül ve kitap · Mısır el yazması onarımı.
// Durum S.voyage: { stats, pages, auction, bq, roses, restoredToday }; tören S.grandDone.
import { VOYAGE, VOYAGE_KEYS, GRAND } from '../data/voyage.js';
import { BOOK } from '../data/books.js';
import { GENRES } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { SPOTS } from '../data/spots.js';
import { BAL } from '../data/balance.js';
import { rnd, rndInt } from '../core/rng.js';
import { takeBook } from './state.js';
import { takeCopy, syncLayout } from './shelving.js';
import { storyDone } from './story.js';

const country = S => TOWNS[S.town]?.country || 'tr';
const morning = S => S.phase !== 'morning' ? 'Bu iş sabah yapılır.' : null;
export const stat = (S, key) => S.voyage.stats[key] || 0;
const bump = (S, key, n = 1) => { S.voyage.stats[key] = stat(S, key) + n; };

// --- Yunanistan: ada günü (mekânın island bayrağı; ücret ve toptancı kuralı game/shop.js'te) ---
export const onIsland = S => !!SPOTS[S.town]?.[S.spot]?.island;

// --- İtalya: müzayede. Sabah raftaki bir ilk baskı müzayedeye verilir, akşam satılır. ---
export function auctionLot(S, id) {
  const why = morning(S);
  if (why) return why;
  if (country(S) !== 'it') return 'Müzayede yalnız İtalya\'da.';
  if (S.voyage.auction) return 'Bugün zaten bir kitap müzayedede.';
  if (!(S.rare[id] > 0) || !(S.shelf[id] > 0)) return 'Müzayedeye yalnız raftaki bir ilk baskı verilir.';
  takeCopy(S, id, true);
  takeBook(S, id);
  if (!--S.rare[id]) delete S.rare[id];
  if (!S.shelf[id]) S.featured = S.featured.filter(x => x !== id);
  S.voyage.auction = { book: id, day: S.day };
  return null;
}
// Akşam: açık artırma (ilk baskı fiyatının 0.8–2.4 katı). Dönüş: { book, price } ya da null
export function resolveAuction(S) {
  const lot = S.voyage.auction;
  if (!lot) return null;
  const base = GENRES[BOOK[lot.book].genre].price * BAL.rareMul;
  const price = Math.round(base * (BAL.auctionMin + rnd(S) * BAL.auctionSpread));
  S.coins += price;
  S.voyage.auction = null;
  bump(S, 'auctions');
  return { book: lot.book, price };
}

// --- Fransa: bukinist kutusu. Bir haftalığına kiralanır; içindeki kitaplar her gece satılır. ---
export function rentBq(S) {
  const why = morning(S);
  if (why) return why;
  if (country(S) !== 'fr') return 'Bukinist kutusu yalnız Fransa\'da kiralanır.';
  if (S.voyage.bq) return 'Kutun zaten var.';
  if (S.coins < BAL.bqRent) return 'Paran yetmiyor.';
  S.coins -= BAL.bqRent;
  S.totals.spent += BAL.bqRent;
  S.voyage.bq = { until: S.day + BAL.bqDays - 1, books: [] };
  return null;
}
// Kolideki kitapları kutuya koy (ilk baskılar hariç). Dönüş: konan kitap sayısı
export function fillBq(S) {
  const bq = S.voyage.bq;
  if (!bq) return 0;
  let n = 0;
  for (let i = 0; i < S.crate.length && bq.books.length < BAL.bqCap;) {
    if (S.crate[i].rare) { i++; continue; }
    bq.books.push(S.crate.splice(i, 1)[0].id);
    n++;
  }
  return n;
}
// Her gece: kutudan 2–4 kitap satılır; süre dolunca kalanlar koliye (yer yoksa rafa) döner.
export function bqNight(S) {
  const bq = S.voyage.bq;
  if (!bq) return null;
  const sold = bq.books.splice(0, Math.min(bq.books.length, 2 + rndInt(S, 3)));
  const coins = sold.reduce((n, id) => n + GENRES[BOOK[id].genre].price, 0);
  S.coins += coins;
  S.totals.sold += sold.length;
  for (const id of sold) S.soldBooks[id] = (S.soldBooks[id] || 0) + 1;
  bump(S, 'bqSold', sold.length);
  const ended = S.day > bq.until;
  if (ended) {
    for (const id of bq.books) { if (S.crate.length < BAL.crateCap) S.crate.push({ id, rare: false, cond: 'iyi' }); else S.shelf[id] = (S.shelf[id] || 0) + 1; }
    S.voyage.bq = null;
  }
  return { sold: sold.length, coins, ended };
}

// --- İspanya: gül ve kitap. Sabah alınan güller satışla gider; akşam solar. Haftada bir Gül ve Kitap Günü. ---
export const roseDay = (S, day = S.day) => country(S) === 'es' && day % 7 === 0;
export function buyRoses(S, n) {
  const why = morning(S);
  if (why) return why;
  if (country(S) !== 'es') return 'Gül yalnız İspanya\'da satılır.';
  n = Math.min(n, BAL.roseMax - S.voyage.roses);
  if (n <= 0) return 'Kovada yer kalmadı.';
  if (S.coins < n * BAL.rosePrice) return 'Paran yetmiyor.';
  S.coins -= n * BAL.rosePrice;
  S.totals.spent += n * BAL.rosePrice;
  S.voyage.roses += n;
  return null;
}
// satışta (game/shop.js sell): gül varsa kitabın yanına bir gül, bahşiş. Dönüş: bahşiş
export function roseWithSale(S) {
  if (!S.voyage.roses || country(S) !== 'es') return 0;
  S.voyage.roses--;
  bump(S, 'roseSold');
  return BAL.roseTip;
}

// --- Mısır: el yazması onarımı. Yıpranmış ya da iyi kopya temize çevrilir (günde birkaç). ---
// from: "c:3" (kolide) | "s:bölüm:sıra" (rafta)
export function restoreCopy(S, from) {
  const why = morning(S);
  if (why) return why;
  if (country(S) !== 'eg') return 'Kâğıt ustası yalnız Mısır\'da.';
  if (S.voyage.restoredToday >= BAL.restorePerDay) return 'Usta bugünlük yoruldu; yarın yine.';
  const [k, x, y] = from.split(':');
  const e = k === 'c' ? S.crate[+x] : syncLayout(S).sections[+x]?.books[+y];
  if (!e) return 'Böyle bir kitap yok.';
  if (e.cond === 'temiz') return 'Bu kopya zaten temiz.';
  if (S.coins < BAL.restoreCost) return 'Paran yetmiyor.';
  S.coins -= BAL.restoreCost;
  S.totals.spent += BAL.restoreCost;
  e.cond = 'temiz';
  S.voyage.restoredToday++;
  bump(S, 'restored');
  return null;
}

// --- Yan hikâyeler ve tören ---
export const voyagePages = (S, c) => S.voyage.pages[c] || 0;
// İlk sayfa o ülkede ilk dükkânla, sonrakiler eşikle (günde ülke başına en fazla bir sayfa). Dönüş: [{ c, i }]
export function checkVoyage(S) {
  const out = [];
  for (const c of VOYAGE_KEYS) {
    const V = VOYAGE[c], n = voyagePages(S, c);
    if (n >= V.pages.length) continue;
    const ok = n === 0 ? S.visited.some(k => (TOWNS[k].country || 'tr') === c) : stat(S, V.stat) >= V.need[n];
    if (!ok) continue;
    S.voyage.pages[c] = n + 1;
    out.push({ c, i: n });
  }
  return out;
}
export const voyageDone = S => VOYAGE_KEYS.every(c => voyagePages(S, c) >= VOYAGE[c].pages.length);
// Tören: beş hikâye ve ana hikâye bitmiş, gün Cunda tepesinde kapanıyor
export function checkGrand(S, T) {
  if (S.grandDone || !voyageDone(S) || !storyDone(S) || !T || T.town !== 'cunda' || T.spot !== 'tepe') return false;
  S.grandDone = true;
  S.coins += GRAND.coins;
  return true;
}

// Gün değişince (sabah ve feribot): kutunun gece satışı, onarım hakkı
export function voyageMorning(S) {
  S.voyage.restoredToday = 0;
  return bqNight(S);
}
