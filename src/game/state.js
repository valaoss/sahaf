// Oyun durumu: DOM'a dokunmaz, testler ve denge simülasyonu aynı modülleri kullanır.
import { BAL, SEASONS } from '../data/balance.js';
import { GENRE_KEYS } from '../data/genres.js';
import { seedRng } from '../core/rng.js';

export const SAVE_V = 1;

const emptyStock = () => Object.fromEntries(GENRE_KEYS.map(g => [g, 0]));

export function newGame(seed = Date.now()) {
  const S = {
    v: SAVE_V,
    day: 1,
    phase: 'morning',          // morning → open → evening → (ertesi gün) morning
    coins: BAL.startCoins,
    town: 'ayvalik',
    stock: Object.assign(emptyStock(), BAL.startStock),
    travelled: false,          // bu sabah yola çıkıldı mı
    clock: BAL.dayStart,
    arrivals: [],              // açık gün: henüz gelmemiş müşterilerin saatleri
    today: null,               // açık gün: o günün defteri
    lastDay: null,             // son kapanan günün özeti
    totals: { days: 0, sold: 0, revenue: 0, spent: 0 },
    nextId: 1,
    rng: 0,
  };
  seedRng(S, seed);
  return S;
}

// Kayıttan dönüş: eksik alanları yeni oyunun varsayılanıyla doldur
export function restore(saved) {
  if (!saved || saved.v !== SAVE_V) return null;
  const S = Object.assign(newGame(1), saved);
  S.stock = Object.assign(emptyStock(), saved.stock);
  // gün ortasında kapanan oyun o sabaha döner (sabah kaydı stok ve parayı zaten tutuyor)
  if (S.phase === 'open') { S.phase = 'morning'; S.arrivals = []; S.today = null; S.clock = BAL.dayStart; }
  return S;
}

export const shelfCount = S => GENRE_KEYS.reduce((n, g) => n + S.stock[g], 0);
export const seasonOf = day => SEASONS[Math.floor((day - 1) / BAL.daysPerSeason) % SEASONS.length];
export const dayOfSeason = day => (day - 1) % BAL.daysPerSeason + 1;
