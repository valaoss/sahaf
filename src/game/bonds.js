// Bağlar: kasaba itibarı, müdavim ricaları, kitap siparişi ve hatıralar.
// İtibar: dükkân açtığın (gün başına 1), müdavimine tam isabet önerdiğin (1), rica getirdiğin (3), bağış yaptığın (5) kasabada büyür; kademeler küçük ayrıcalıklar açar.
// Rica: müdavim 3 kalbe ulaşınca belirli bir kitabı ister; getirilmeden 4. kalp gelmez. Kitap toptancıdan sipariş edilebilir.
// Hatıra: 5 kalpte müdavim kendine özgü bir eşya bırakır (süs hediyesi olmayanlar); kendi kasabasında kalabalığı artırır.
import { BOOKS, BOOK } from '../data/books.js';
import { GENRES } from '../data/genres.js';
import { REGULARS } from '../data/regulars.js';
import { BAL } from '../data/balance.js';
import { rndPick } from '../core/rng.js';

export const REP_LEVELS = [
  { min: 0, name: 'Yabancı', icon: '🚐', perk: '' },
  { min: 8, name: 'Tanıdık', icon: '👋', perk: 'Pazar tezgâhında %20 indirim' },
  { min: 20, name: 'Sevilen', icon: '💛', perk: 'Müdavimler daha sık uğrar' },
  { min: 40, name: 'Kasabanın sahafı', icon: '🏠', perk: 'Park ücretsiz, kalabalık +%8' },
];
export const repOf = (S, town = S.town) => S.rep[town] || 0;
export function repLevel(S, town = S.town) {
  const r = repOf(S, town);
  let lv = 0;
  REP_LEVELS.forEach((L, i) => { if (r >= L.min) lv = i; });
  return lv;
}
// İtibar ekle; yeni bir kademeye çıkıldıysa o kademe (yoksa null)
export function addRep(S, town, n) {
  const before = repLevel(S, town);
  S.rep[town] = repOf(S, town) + n;
  const now = repLevel(S, town);
  return now > before ? now : null;
}

// --- Rica ---
export const FAVOR_AT = 3;
export const favorOpen = (S, id) => !!S.favors[id] && !S.favors[id].done;
// Müdavimin zevkine (en az iki sevdiği etiket) uyan, mümkünse kendi türünden ve karavanda olmayan bir kitap
export function makeFavor(S, id) {
  const R = REGULARS[id], fit = b => b.tags.filter(t => R.likes.includes(t)).length >= 2;
  const owned = b => S.shelf[b.id] || S.crate.some(e => e.id === b.id);
  const pools = [BOOKS.filter(b => fit(b) && b.genre === R.genre && !owned(b)), BOOKS.filter(b => fit(b) && !owned(b)), BOOKS.filter(fit), BOOKS];
  const pool = pools.find(p => p.length);
  S.favors[id] = { book: rndPick(S, pool).id, day: S.day };
  return S.favors[id];
}

// --- Sipariş: rica ya da hikâye için belirli bir kitap, ertesi sabah kolide ---
export const orderCost = id => GENRES[BOOK[id].genre].price * 2;
export const ordered = (S, id) => S.orders.some(o => o.book === id);
export function orderBook(S, id) {
  if (S.phase !== 'morning') return 'Sipariş sabah verilir.';
  if (!BOOK[id]) return 'Böyle bir kitap yok.';
  if (ordered(S, id)) return 'Bu kitap zaten yolda.';
  if (S.coins < orderCost(id)) return 'Paran yetmiyor.';
  S.coins -= orderCost(id);
  S.totals.spent += orderCost(id);
  S.orders.push({ book: id, day: S.day });
  return null;
}
// Sabah: siparişler koliye gelir (koli doluysa beklerler). Dönüş: gelen kitaplar
export function receiveOrders(S) {
  const got = [];
  S.orders = S.orders.filter(o => {
    if (S.crate.length >= BAL.crateCap) return true;
    S.crate.push({ id: o.book, rare: false, cond: 'iyi' });
    got.push(o.book);
    return false;
  });
  return got;
}

// --- Hatıralar: bu kasabanın müdavimlerinden kalanlar kadar fazladan ziyaretçi ---
export const keepsakeTraffic = (S, town = S.town) => S.keepsakes.filter(id => REGULARS[id]?.town === town).length * BAL.keepsakeTraffic;
