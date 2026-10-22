// Gün döngüsü: dükkânı aç → saat ilerledikçe müşteri gelir → kapanış özeti → ertesi sabah.
import { BAL } from '../data/balance.js';
import { TOWNS } from '../data/towns.js';
import { rnd, rndInt } from '../core/rng.js';
import { makeCustomer, resolveCustomer } from './shop.js';

export function openShop(S) {
  if (S.phase !== 'morning') return 'Dükkân zaten açık.';
  const len = BAL.dayEnd - BAL.dayStart;
  const n = Math.max(4, TOWNS[S.town].traffic + rndInt(S, BAL.trafficJitter * 2 + 1) - BAL.trafficJitter);
  const times = [];
  for (let i = 0; i < n; i++) {
    // yarısı gün boyuna yayılır, yarısı öğleden sonraya yığılır (iki zarın ortalaması)
    const u = i % 2 ? rnd(S) : (rnd(S) + rnd(S)) / 2 * 0.8 + 0.15;
    times.push(Math.round(BAL.dayStart + 10 + u * (len - 40)));
  }
  times.sort((a, b) => a - b);
  S.phase = 'open';
  S.clock = BAL.dayStart;
  S.arrivals = times;
  S.today = { town: S.town, visitors: 0, sold: {}, missed: {}, revenue: 0 };
  return null;
}

// Saati ilerletir, saati gelen müşterileri döndürür
export function advanceClock(S, minutes) {
  if (S.phase !== 'open') return [];
  S.clock = Math.min(S.clock + minutes, BAL.dayEnd);
  const due = [];
  while (S.arrivals.length && S.arrivals[0] <= S.clock) { S.arrivals.shift(); due.push(makeCustomer(S)); }
  return due;
}

export const closingTime = S => S.phase === 'open' && S.clock >= BAL.dayEnd && !S.arrivals.length;

export function closeShop(S) {
  if (S.phase !== 'open') return null;
  const T = S.today;
  T.soldCount = Object.values(T.sold).reduce((a, b) => a + b, 0);
  S.totals.days++;
  S.totals.sold += T.soldCount;
  S.totals.revenue += T.revenue;
  S.lastDay = T;
  S.today = null;
  S.phase = 'evening';
  return T;
}

export function nextMorning(S) {
  if (S.phase !== 'evening') return;
  S.day++;
  S.phase = 'morning';
  S.travelled = false;
  S.clock = BAL.dayStart;
}

// Başsız tam gün: test ve denge simülasyonu için
export function simulateDay(S) {
  openShop(S);
  for (const c of advanceClock(S, BAL.dayEnd - BAL.dayStart)) resolveCustomer(S, c);
  const T = closeShop(S);
  nextMorning(S);
  return T;
}
