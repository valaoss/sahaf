// Raf düzeni: karavanda 3 raf × 2 bölüm. Oyuncu kitapları koliden (S.crate) tek tek bölümlere yerleştirir,
// bölümlere tür etiketi asar. Yalnızca rafa konmuş kitap satılır: S.shelf (sayılar) rafın kendisidir,
// S.layout ise o kopyaların hangi bölümde hangi sırada durduğunu tutar.
// Satış, olay, hediye gibi S.shelf'i doğrudan değiştiren her şeyden sonra syncLayout düzeni sayılarla uzlaştırır.
// Her kopyanın durumu (cond: yipranmis | iyi | temiz) ve her bölümün fiyat etiketi (price: ucuz | normal | pahali) satış fiyatını belirler.
import { BOOK } from '../data/books.js';
import { GENRE_KEYS } from '../data/genres.js';
import { BAL } from '../data/balance.js';
import { shelfCap, shelfCount } from './state.js';

export const SECTIONS = 6;
export const sectionCap = S => Math.ceil(shelfCap(S) / SECTIONS);
export const crateFree = S => BAL.crateCap - S.crate.length;

function fresh() {
  return { sections: GENRE_KEYS.slice(0, SECTIONS).map(g => ({ label: g, price: 'normal', books: [] })) };
}

// boş yer: önce etiketi uyan bölüm, sonra etiketsiz, sonra herhangi biri; yer yoksa -1
export function bestSection(S, id, allowFull = false) {
  const L = S.layout, cap = sectionCap(S), g = BOOK[id].genre;
  const free = i => L.sections[i].books.length < cap;
  const order = [...L.sections.keys()];
  const pick = order.find(i => L.sections[i].label === g && free(i)) ?? order.find(i => !L.sections[i].label && free(i)) ?? order.find(free);
  if (pick !== undefined) return pick;
  if (!allowFull) return -1;
  return order.find(i => L.sections[i].label === g) ?? 0;
}

// Düzeni S.shelf / S.rare sayılarıyla uzlaştır: fazlaları sondan çıkar, eksikleri en uygun bölüme koy
export function syncLayout(S) {
  S.crate = S.crate || [];
  if (!S.layout || !Array.isArray(S.layout.sections) || S.layout.sections.length !== SECTIONS
    || S.layout.sections.some(sec => !sec || !Array.isArray(sec.books))) S.layout = fresh();
  const L = S.layout;
  const have = {};
  for (const sec of L.sections) {
    if (!BAL.priceTags[sec.price]) sec.price = 'normal';
    sec.books = sec.books.filter(e => e && BOOK[e.id]);
    for (const e of sec.books) if (!BAL.conds[e.cond]) e.cond = 'iyi';
    for (const e of sec.books) have[e.id] = (have[e.id] || 0) + 1;
  }
  for (const id in have) {
    let extra = have[id] - (S.shelf[id] || 0);
    for (let s = SECTIONS - 1; s >= 0 && extra > 0; s--) {
      const b = L.sections[s].books;
      for (let i = b.length - 1; i >= 0 && extra > 0; i--) if (b[i].id === id) { b.splice(i, 1); extra--; }
    }
  }
  for (const id of Object.keys(S.shelf).sort()) {
    for (let n = have[id] || 0; n < S.shelf[id]; n++) L.sections[bestSection(S, id, true)].books.push({ id, rare: false, cond: 'iyi' });
  }
  // ilk baskı işaretleri: her kitap için S.rare kadar kopya işaretli olsun
  const flags = {};
  for (const sec of L.sections) for (const e of sec.books) {
    flags[e.id] = flags[e.id] || 0;
    e.rare = flags[e.id] < (S.rare[e.id] || 0);
    if (e.rare) flags[e.id]++;
  }
  return L;
}

// koliye ekle (alışveriş)
export function crateAdd(S, id, rare = false, cond = 'iyi') { S.crate.push({ id, rare, cond }); }

// koliden bölüme: pos verilmezse sona
export function shelve(S, ci, sec, pos = null) {
  syncLayout(S);
  const e = S.crate[ci], b = S.layout.sections[sec]?.books;
  if (!e || !b) return 'Böyle bir yer yok.';
  if (b.length >= sectionCap(S)) return 'Bu bölüm dolu.';
  S.crate.splice(ci, 1);
  b.splice(pos === null ? b.length : Math.max(0, Math.min(pos, b.length)), 0, { id: e.id, rare: e.rare, cond: e.cond || 'iyi' });
  S.shelf[e.id] = (S.shelf[e.id] || 0) + 1;
  if (e.rare) S.rare[e.id] = (S.rare[e.id] || 0) + 1;
  return null;
}

// bölümden koliye
export function unshelve(S, sec, i) {
  syncLayout(S);
  const b = S.layout.sections[sec]?.books, e = b?.[i];
  if (!e) return 'Böyle bir kitap yok.';
  if (crateFree(S) <= 0) return 'Koli dolu.';
  b.splice(i, 1);
  S.crate.push({ id: e.id, rare: e.rare, cond: e.cond });
  if (--S.shelf[e.id] <= 0) delete S.shelf[e.id];
  if (e.rare && --S.rare[e.id] <= 0) delete S.rare[e.id];
  if (!S.shelf[e.id]) S.featured = S.featured.filter(x => x !== e.id);
  return null;
}

// bölümden bölüme (ya da aynı bölümde yer değiştirme)
export function moveBook(S, from, i, to, pos = null) {
  syncLayout(S);
  const A = S.layout.sections[from]?.books, B = S.layout.sections[to]?.books;
  if (!A?.[i] || !B) return 'Böyle bir yer yok.';
  if (from !== to && B.length >= sectionCap(S)) return 'Bu bölüm dolu.';
  const [e] = A.splice(i, 1);
  let p = pos === null ? B.length : pos;
  if (from === to && pos !== null && pos > i) p--;
  B.splice(Math.max(0, Math.min(p, B.length)), 0, e);
  return null;
}

// bölümün fiyat etiketi
export function setPrice(S, sec, tag) {
  syncLayout(S);
  if (!S.layout.sections[sec] || !BAL.priceTags[tag]) return 'Böyle bir etiket yok.';
  S.layout.sections[sec].price = tag;
  return null;
}

// Satılan kopyayı raftan al (S.shelf sayısını sell düşürür): müşteri ucuz bölümdekini önce görür.
// wantRare: koleksiyoncuya ilk baskı. Dönüş: o kopyanın bölüm fiyat etiketi ve durumu.
function bestCopy(S, id, wantRare) {
  syncLayout(S);
  let best = null;
  const rank = { ucuz: 0, normal: 1, pahali: 2 };
  S.layout.sections.forEach((sec, si) => sec.books.forEach((e, i) => {
    if (e.id !== id || e.rare !== wantRare) return;
    if (!best || rank[sec.price] < rank[best.sec.price]) best = { sec, si, i };
  }));
  return best;
}
// Dönüş: { price (bölümün etiketi), cond, sec, i (bölüm ve sıra), rare }
export function takeCopy(S, id, wantRare = false) {
  const best = bestCopy(S, id, wantRare);
  if (!best) return { price: 'normal', cond: 'iyi', sec: -1, i: -1, rare: wantRare };
  const [e] = best.sec.books.splice(best.i, 1);
  return { price: best.sec.price, cond: e.cond || 'iyi', sec: best.si, i: best.i, rare: wantRare };
}
// takeCopy'nin seçeceği kopya, rafa dokunmadan (pazarlık öncesi etiket fiyatı için)
export function peekCopy(S, id, wantRare = false) {
  const best = bestCopy(S, id, wantRare);
  if (!best) return { price: 'normal', cond: 'iyi', sec: -1, i: -1, rare: wantRare };
  return { price: best.sec.price, cond: best.sec.books[best.i].cond || 'iyi', sec: best.si, i: best.i, rare: wantRare };
}
// Pazarlıkta anlaşılamadı: müşterinin elindeki kopya rafta eski yerine döner (S.shelf, S.rare ve düzen birlikte)
export function putBack(S, id, cp) {
  syncLayout(S);
  S.shelf[id] = (S.shelf[id] || 0) + 1;
  if (cp.rare) S.rare[id] = (S.rare[id] || 0) + 1;
  const b = S.layout.sections[cp.sec]?.books;
  if (b) b.splice(Math.max(0, Math.min(cp.i, b.length)), 0, { id, rare: !!cp.rare, cond: cp.cond || 'iyi' });
  syncLayout(S);
}

// bir türün raftaki kopyalarının ortalama "almaya karar verme" çarpanı: fiyat etiketine ve müşterinin cebine göre
export function chanceOf(S, g, thrift = 'mid') {
  syncLayout(S);
  let sum = 0, n = 0;
  for (const sec of S.layout.sections) for (const e of sec.books) if (BOOK[e.id].genre === g && !e.rare) { sum += BAL.priceTags[sec.price].chance[thrift] ?? 1; n++; }
  return n ? sum / n : 1;
}

// Rafı tamamla: etiketli bölümlerdeki boşluklar kendi türünden kolilerle doldurulur (en büyük boşluk önce), kitaplar dizilir.
// buy(g): koli alma (game/shop.js buyBox; döngüsel içe aktarmayı önlemek için dışarıdan verilir). Dönüş: alınan türler
export function refill(S, buy) {
  const got = [];
  for (let guard = 0; guard < 24; guard++) {
    syncLayout(S);
    const cap = sectionCap(S), free = {};
    for (const sec of S.layout.sections) if (sec.label) free[sec.label] = (free[sec.label] || 0) + cap - sec.books.length;
    const g = Object.keys(free).filter(k => free[k] >= BAL.boxSize).sort((a, b) => free[b] - free[a] || (a < b ? -1 : 1))[0];
    if (!g || buy(g)) break;
    placeAll(S);
    got.push(g);
  }
  return got;
}

export function setLabel(S, sec, genre) {
  syncLayout(S);
  if (!S.layout.sections[sec]) return 'Böyle bir bölüm yok.';
  S.layout.sections[sec].label = genre && GENRE_KEYS.includes(genre) ? genre : null;
  return null;
}

// "Hepsini diz": kolideki her kitabı en uygun boş bölüme koy; sığmayan kolide kalır
export function placeAll(S) {
  syncLayout(S);
  let n = 0;
  for (let ci = 0; ci < S.crate.length;) {
    const sec = bestSection(S, S.crate[ci].id);
    if (sec < 0 || shelve(S, ci, sec)) break;
    n++;
  }
  return n;
}

// Düzen: etiketi kitabın türüne uyan bölümlerdeki kitapların oranı (0–1)
export function tidiness(S) {
  syncLayout(S);
  let ok = 0, all = 0;
  for (const sec of S.layout.sections) for (const e of sec.books) { all++; if (sec.label === BOOK[e.id].genre) ok++; }
  return all ? ok / all : 0;
}

// rafta ve kolide toplam yer
export const roomLeft = S => shelfCap(S) - shelfCount(S) + crateFree(S);
