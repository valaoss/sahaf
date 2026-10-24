// Oyun durumu: DOM'a dokunmaz, testler ve denge simülasyonu aynı modülleri kullanır.
import { BAL, SEASONS } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { BOOK, booksOf } from '../data/books.js';
import { DEFAULT_DECOR, SHELF_LEVELS } from '../data/decor.js';
import { SPOTS, firstSpot } from '../data/spots.js';
import { TOWNS, TOWN_KEYS, START_TOWNS } from '../data/towns.js';
import { COUNTRIES } from '../data/countries.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { REGULARS } from '../data/regulars.js';
import { seedRng, rndInt } from '../core/rng.js';
import { learnAll } from './knowledge.js';

// Kayıt şeması sürümü. Yeni sürümde: SAVE_V'yi artır, MIGRATIONS'a bir önceki sürümden taşıyan adımı ekle,
// tests/sim.test.mjs'te o sürümün örnek kaydını yükleyen bir test yaz. Eksik alanları restore() doğrulaması doldurur.
export const SAVE_V = 5;

// Başlangıç rafı: her türden farklı kitaplar
function startShelf(S) {
  const shelf = {};
  for (const g in BAL.startStock) {
    const pool = booksOf(g).map(b => b.id);
    for (let i = 0; i < BAL.startStock[g]; i++) {
      const id = pool.splice(rndInt(S, pool.length), 1)[0];
      shelf[id] = (shelf[id] || 0) + 1;
    }
  }
  return shelf;
}

export function newGame(seed = Date.now()) {
  const S = {
    v: SAVE_V,
    day: 1,
    phase: 'morning',          // morning → open → evening → (ertesi gün) morning
    coins: BAL.startCoins,
    town: 'ayvalik',
    prevTown: 'ayvalik',       // dünkü kasaba (yeni kasaba ilgisi için)
    shelf: {},                 // kitap kimliği → adet
    rare: {},                  // bu kopyalardan kaçı ilk baskı (koleksiyoncuya saklanır)
    featured: [],              // vitrindeki kitaplar (en fazla 3)
    recent: {},                // tekrar bekçisi (game/memory.js)
    recHistory: [],            // tam isabetli öneriler: mektuplar için
    haps: [],                  // açık gün: bugünün olayları [{ t, id }] (game/happenings.js)
    hapDone: [],               // yaşanmış olaylar
    hapLast: {},               // olay → en son yaşandığı gün
    buffs: [],                 // olaylardan kalan etkiler [{ day, traffic }]
    letters: [],               // gelen mektuplar (game/mail.js)
    quest: null,               // aktif ilan
    questsSeen: [],
    questsDone: 0,
    post: null,                // bu sabahın postası { letter, quest }
    shelfLv: 0,
    decor: { owned: Object.values(DEFAULT_DECOR), on: { ...DEFAULT_DECOR } },
    paint: 'nane',
    paints: ['nane'],
    awning: 'mercan',          // tente rengi (data/decor.js AWNINGS)
    awnings: ['mercan'],
    spot: 'iskele',            // kasaba içindeki mekân (data/spots.js)
    friends: {},               // müdavim → kalp (0..5)
    met: [],                   // tanışılan müdavimler
    gifts: [],                 // hediyesini vermiş müdavimler
    pages: [],                 // ana hikâye: bulunan defter sayfaları (data/story.js)
    visited: [],               // dükkân açılan kasabalar
    spotsSeen: [],             // dükkân açılan mekânlar ('kasaba/mekân')
    festKinds: [],             // katılınan festival türleri
    weathersSeen: [],          // dükkân açılan günlerin havaları
    stamps: [],                // pul albümü (data/stamps.js)
    finaleShown: false,        // hikâye kapanış ekranı gösterildi mi
    unlocked: [...START_TOWNS], // gidilebilen kasabalar (diğerleri hikâyeyle açılır)
    kostasFound: [],           // 2. bölüm: bulunan Kostas kitapları (data/kostas.js)
    upgrades: [],              // karavan geliştirmeleri: cay, plak
    regArrivals: [],           // açık gün: gelecek müdavimler [{ t, id }]
    patArrivals: [],           // açık gün: uğrayacak tanıdıklar [{ t, id }]
    patrons: {},               // kartını bırakan tanıdıklar (game/patrons.js)
    genres: ['roman', 'polisiye', 'cocuk'],   // açık türler (game/progress.js)
    apprentice: 0.9,           // çırak eşiği: etiketin bu oranındaki teklifi kabul eder (0 kapalı)
    mezat: null,               // bugünkü mezatta alınanlar { key, sold }
    travelled: false,          // bu sabah yola çıkıldı mı
    clock: BAL.dayStart,
    arrivals: [],              // açık gün: henüz gelmemiş müşterilerin saatleri
    today: null,               // açık gün: o günün defteri
    lastDay: null,             // son kapanan günün özeti
    totals: { days: 0, sold: 0, revenue: 0, spent: 0, perfect: 0, festivals: 0, rareSold: 0, bestDay: 0, bestDayNo: 0 },
    soldBooks: {},             // istatistik: kitap → satış adedi
    townDays: {},              // istatistik: kasaba → dükkân açılan gün
    tut: 0,                    // ilk günlerin rehberi: hangi adımda (game/tutorial)
    crate: [],                 // koli: alınmış ama rafa dizilmemiş kitaplar [{ id, rare }]
    countries: ['tr'],         // açılmış ülkeler (game/travel.js)
    passport: { tr: 1 },       // pasaport damgaları: ülke → ilk girilen gün
    layout: null,              // raf düzeni: 6 bölüm, etiket ve sıra (game/shelving.js)
    sat: {},                   // tür doygunluğu: kasaba → tür → son günlerde satılan (game/shop.js demandOf)
    donated: [],               // okuma köşesi bağışlanan kasabalar
    sponsor: null,             // festival sponsorluğu { day, town }
    known: {},                 // kitap bilgisi: kitap → bilinen etiketler (game/knowledge.js)
    readsToday: 0,             // okuma köşesi: bu sabah okunan kitap
    rep: {},                   // kasaba itibarı: kasaba → puan (game/bonds.js)
    favors: {},                // müdavim ricaları: müdavim → { book, day, done }
    orders: [],                // kitap siparişleri: [{ book, day }] ertesi sabah kolide
    keepsakes: [],             // müdavimlerin bıraktığı hatıralar (müdavim kimlikleri)
    voyage: { stats: {}, pages: {}, auction: null, bq: null, roses: 0, restoredToday: 0 },   // Akdeniz'in işleri (game/voyage.js)
    grandDone: false,          // kütüphanenin açılış töreni yapıldı mı
    nextId: 1,
    rng: 0,
  };
  seedRng(S, seed);
  S.shelf = startShelf(S);
  // teyzenin notları: karavandaki ilk kitapların etiketleri baştan bilinir
  for (const id in S.shelf) learnAll(S, id);
  return S;
}

// v1: raf tür başına sayıydı; her türden o kadar kitaba çevrilir
function migrateV1(saved) {
  const shelf = {};
  for (const g of GENRE_KEYS) {
    const pool = booksOf(g);
    for (let i = 0; i < (saved.stock?.[g] | 0); i++) {
      const id = pool[i % pool.length].id;
      shelf[id] = (shelf[id] || 0) + 1;
    }
  }
  const out = { ...saved, v: 2, shelf, prevTown: saved.town };
  delete out.stock;
  if (out.lastDay) out.lastDay.recs = out.lastDay.recs || { perfect: 0, good: 0, miss: 0 };
  return out;
}

// Adım adım geçişler: sürüm → bir sonrakine taşıyan işlev
const MIGRATIONS = {
  1: migrateV1,
  // v2 → v3 (v2 Faz 0–6: kitap bilgisi, itibar, ricalar, Akdeniz'in işleri…): yeni alanlar restore()'da varsayılanla dolar,
  // eski oyuncu için anlamlı başlangıçlar (bilinen kitaplar, itibar, hatıralar) orada türetilir
  2: saved => ({ ...saved, v: 3 }),
  // v3 → v4 (v3 sadeleştirme: Akdeniz kenara alındı): yurt dışındaki oyuncu Ayvalık'a döner (mekânı restore() düzeltir);
  // bukinist kutusundaki ve müzayededeki kitaplar koliye geri gelir. Pasaport, sayfalar ve ülkeler kayıtta durur.
  // v4 → v5 (v3 Faz 3: araba basamakları): eski raf seviyesi bir basamak yukarı kayar (yeni oyun el arabasıyla başlar);
  // eski oyuncunun bütün türleri açık kalır
  4: saved => ({ ...saved, v: 5, shelfLv: (Number.isFinite(saved.shelfLv) ? saved.shelfLv : 0) + 1, genres: Object.keys(GENRES) }),
  3: saved => {
    const out = { ...saved, v: 4 };
    const abroad = (TOWNS[saved.town]?.country || 'tr') !== 'tr';
    if (abroad) Object.assign(out, { town: 'ayvalik', prevTown: 'ayvalik', spot: null });
    const v = isObj(saved.voyage) ? { ...saved.voyage } : null;
    if (abroad && v) {
      const back = [...(Array.isArray(v.bq?.books) ? v.bq.books : []), ...(v.auction?.book ? [v.auction.book] : [])];
      out.crate = [...(Array.isArray(saved.crate) ? saved.crate : []), ...back.map(id => ({ id, rare: false, cond: 'iyi' }))];
      out.voyage = { ...v, bq: null, auction: null, roses: 0 };
    }
    return out;
  },
};
export function migrate(saved) {
  while (saved.v < SAVE_V && MIGRATIONS[saved.v]) saved = MIGRATIONS[saved.v](saved);
  return saved;
}

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);

// Kayıttaki her alan yeni oyundaki tipine uymalı; uymayan alan (bozuk ya da elle değiştirilmiş kayıt) varsayılana döner.
// Varsayılanı null olan alanlar (quest, post, layout, today, lastDay) ayrıca bakılır.
function sanitize(S, fresh) {
  for (const k in fresh) {
    const d = fresh[k], v = S[k];
    const ok = Array.isArray(d) ? Array.isArray(v) : isObj(d) ? isObj(v)
      : typeof d === 'number' ? Number.isFinite(v) : d === null ? true : typeof v === typeof d;
    if (!ok) S[k] = d;
  }
}

// Kayıttan dönüş: eksik alanları yeni oyunun varsayılanıyla doldur, artık var olmayan kitap/kasaba/ülke izlerini temizle.
// Okunamayan kayıtta null döner (çağıran yedekler); daha yeni bir sürümün kaydına dokunmaz.
export function restore(saved) {
  if (!isObj(saved)) return null;
  saved = migrate(saved);
  if (saved.v !== SAVE_V) return null;
  const fresh = newGame(1);
  const S = Object.assign(newGame(1), saved);
  // kitap bilgisinden önceki kayıtlar: oyuncu o zaman bütün etiketleri görüyordu; elindeki ve sattığı kitapları bilir
  if (!isObj(saved.known)) {
    S.known = {};
    const ids = [...Object.keys(saved.shelf || {}), ...Object.keys(saved.soldBooks || {}), ...(saved.crate || []).map(e => e?.id), ...(saved.recHistory || []).map(r => r?.book)];
    for (const id of ids) if (BOOK[id]) learnAll(S, id);
  }
  sanitize(S, fresh);
  S.totals = Object.assign(fresh.totals, saved.totals);
  sanitize(S.totals, newGame(1).totals);
  if (!Array.isArray(S.decor.owned) || !isObj(S.decor.on)) S.decor = fresh.decor;
  if (!TOWNS[S.town]) S.town = 'ayvalik';
  if (!TOWNS[S.prevTown]) S.prevTown = S.town;
  S.shelfLv = Math.max(0, Math.min(SHELF_LEVELS.length - 1, Math.floor(S.shelfLv)));
  for (const id in S.shelf) if (!BOOK[id] || !(S.shelf[id] >= 1)) delete S.shelf[id]; else S.shelf[id] = Math.floor(S.shelf[id]);
  S.featured = [...new Set(S.featured.filter(id => BOOK[id]))].slice(0, 3);
  S.recHistory = S.recHistory.filter(e => isObj(e) && BOOK[e.book]);
  for (const id in S.soldBooks) if (!BOOK[id]) delete S.soldBooks[id];
  for (const id in S.known) if (!BOOK[id] || !Array.isArray(S.known[id])) delete S.known[id]; else S.known[id] = S.known[id].filter(t => BOOK[id].tags.includes(t));
  S.donated = S.donated.filter(k => TOWNS[k]);
  S.orders = S.orders.filter(o => isObj(o) && BOOK[o.book]);
  S.voyage = Object.assign(newGame(1).voyage, S.voyage);
  if (!isObj(S.voyage.stats)) S.voyage.stats = {};
  if (!isObj(S.voyage.pages)) S.voyage.pages = {};
  if (S.voyage.auction && !BOOK[S.voyage.auction.book]) S.voyage.auction = null;
  if (S.voyage.bq && !(isObj(S.voyage.bq) && Array.isArray(S.voyage.bq.books))) S.voyage.bq = null;
  if (S.voyage.bq) S.voyage.bq.books = S.voyage.bq.books.filter(id => BOOK[id]);
  for (const id in S.favors) if (!isObj(S.favors[id]) || !BOOK[S.favors[id].book]) delete S.favors[id];
  // eski kayıt: dükkân açılan günler itibara sayılır; ₺40 bırakan dostların hatırası verilir
  if (!isObj(saved.rep)) for (const t in S.townDays) if (TOWNS[t]) S.rep[t] = S.townDays[t];
  if (!Array.isArray(saved.keepsakes)) S.keepsakes = S.gifts.filter(id => REGULARS[id] && !REGULARS[id].gift);
  if (S.sponsor && !(isObj(S.sponsor) && TOWNS[S.sponsor.town])) S.sponsor = null;
  // ülkeler ve yollar: kaldırılan şehirler düşer; açık ülkelerin koşulsuz şehirleri (sonradan eklenenler dahil) yola açılır
  S.countries = S.countries.filter(c => COUNTRIES[c]);
  if (!S.countries.includes('tr')) S.countries.unshift('tr');
  S.unlocked = S.unlocked.filter(k => TOWNS[k]);
  for (const k of TOWN_KEYS) if (!TOWNS[k].unlock && S.countries.includes(TOWNS[k].country || 'tr') && !S.unlocked.includes(k)) S.unlocked.push(k);
  if (!S.unlocked.includes(S.town)) S.unlocked.push(S.town);
  if (!S.passport.tr) S.passport.tr = 1;
  // raf düzeni: biçimi bozuksa yeniden kurulur (game/shelving.js syncLayout)
  const L = S.layout;
  if (L && !(isObj(L) && Array.isArray(L.sections) && L.sections.every(sec => isObj(sec) && Array.isArray(sec.books)))) S.layout = null;
  for (const id in S.rare) if (!S.shelf[id] || S.rare[id] <= 0) delete S.rare[id]; else S.rare[id] = Math.min(S.rare[id], S.shelf[id]);
  if (!SPOTS[S.town]?.[S.spot]) S.spot = firstSpot(S.town);
  S.crate = S.crate.filter(e => isObj(e) && BOOK[e.id]);
  // dükkân açıkken kayıt yazılmaz (core/save.js); eski sürümlerden kalma gün ortası kaydı o sabaha döner
  // rehber eklenmeden önce başlamış oyunlarda rehber gösterilmez
  if (saved.tut === undefined && S.totals.days > 0) S.tut = -1;
  S.genres = [...new Set(['roman', 'polisiye', 'cocuk', ...S.genres.filter(g => GENRES[g])])];
  if (![0.8, 0.9, 0].includes(S.apprentice)) S.apprentice = 0.9;
  // tanıdıklar: bozuk kayıt (bilinmeyen tip ya da kasaba, eksik özellik) atılır
  for (const id in S.patrons) { const P = S.patrons[id]; if (!isObj(P) || !ARCHETYPES[P.arch] || !TOWNS[P.town] || !isObj(P.tr) || !isObj(P.seen)) delete S.patrons[id]; }
  if (S.phase === 'open') { S.phase = 'morning'; S.arrivals = []; S.regArrivals = []; S.patArrivals = []; S.haps = []; S.today = null; S.clock = BAL.dayStart; }
  return S;
}

export const shelfCap = S => SHELF_LEVELS[S.shelfLv].cap;
// dükkânın kapanış saati: akşam feneri bir saat uzatır
export const dayEndOf = S => BAL.dayEnd + (S.upgrades?.includes('fener') ? BAL.fenerMinutes : 0);
export const shelfCount = S => Object.values(S.shelf).reduce((n, c) => n + c, 0);
export function genreCount(S, g) {
  let n = 0;
  for (const id in S.shelf) if (BOOK[id].genre === g) n += S.shelf[id];
  return n;
}
export const genreCounts = S => Object.fromEntries(GENRE_KEYS.map(g => [g, genreCount(S, g)]));
export function takeBook(S, id) {
  if (!S.shelf[id]) return false;
  if (--S.shelf[id] === 0) delete S.shelf[id];
  return true;
}
export const seasonOf = day => SEASONS[Math.floor((day - 1) / BAL.daysPerSeason) % SEASONS.length];
export const dayOfSeason = day => (day - 1) % BAL.daysPerSeason + 1;
