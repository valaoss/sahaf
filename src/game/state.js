// Oyun durumu: DOM'a dokunmaz, testler ve denge simülasyonu aynı modülleri kullanır.
import { BAL, SEASONS } from '../data/balance.js';
import { GENRE_KEYS } from '../data/genres.js';
import { BOOK, booksOf } from '../data/books.js';
import { DEFAULT_DECOR, SHELF_LEVELS } from '../data/decor.js';
import { SPOTS, firstSpot } from '../data/spots.js';
import { seedRng, rndInt } from '../core/rng.js';

export const SAVE_V = 2;

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
    recent: {},                // tekrar bekçisi (game/memory.js)
    recHistory: [],            // tam isabetli öneriler: mektuplar için
    shelfLv: 0,
    decor: { owned: Object.values(DEFAULT_DECOR), on: { ...DEFAULT_DECOR } },
    paint: 'nane',
    paints: ['nane'],
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
    regArrivals: [],           // açık gün: gelecek müdavimler [{ t, id }]
    travelled: false,          // bu sabah yola çıkıldı mı
    clock: BAL.dayStart,
    arrivals: [],              // açık gün: henüz gelmemiş müşterilerin saatleri
    today: null,               // açık gün: o günün defteri
    lastDay: null,             // son kapanan günün özeti
    totals: { days: 0, sold: 0, revenue: 0, spent: 0, perfect: 0, festivals: 0, rareSold: 0 },
    nextId: 1,
    rng: 0,
  };
  seedRng(S, seed);
  S.shelf = startShelf(S);
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
  const out = { ...saved, v: SAVE_V, shelf, prevTown: saved.town };
  delete out.stock;
  if (out.lastDay) out.lastDay.recs = out.lastDay.recs || { perfect: 0, good: 0, miss: 0 };
  return out;
}

// Kayıttan dönüş: eksik alanları yeni oyunun varsayılanıyla doldur
export function restore(saved) {
  if (!saved) return null;
  if (saved.v === 1) saved = migrateV1(saved);
  if (saved.v !== SAVE_V) return null;
  const S = Object.assign(newGame(1), saved);
  S.totals = Object.assign(newGame(1).totals, saved.totals);
  for (const id in S.shelf) if (!BOOK[id] || S.shelf[id] <= 0) delete S.shelf[id];
  for (const id in S.rare) if (!S.shelf[id] || S.rare[id] <= 0) delete S.rare[id]; else S.rare[id] = Math.min(S.rare[id], S.shelf[id]);
  if (!SPOTS[S.town]?.[S.spot]) S.spot = firstSpot(S.town);
  S.regArrivals = S.regArrivals || [];
  // gün ortasında kapanan oyun o sabaha döner (sabah kaydı stok ve parayı zaten tutuyor)
  if (S.phase === 'open') { S.phase = 'morning'; S.arrivals = []; S.regArrivals = []; S.today = null; S.clock = BAL.dayStart; }
  return S;
}

export const shelfCap = S => SHELF_LEVELS[S.shelfLv].cap;
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
