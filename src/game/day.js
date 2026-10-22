// Gün döngüsü: dükkânı aç → saat ilerledikçe müşteri gelir → kapanış özeti → ertesi sabah.
import { BAL } from '../data/balance.js';
import { TOWNS } from '../data/towns.js';
import { rnd, rndInt } from '../core/rng.js';
import { REGULARS, REGULAR_KEYS, VISIT_CHANCE } from '../data/regulars.js';
import { makeCustomer, makeRegular, resolveCustomer, recommend, bestBook, spotOf } from './shop.js';
import { effects } from './decor.js';
import { dayMods, weatherOf } from './calendar.js';
import { checkStory } from './story.js';

export function openShop(S) {
  if (S.phase !== 'morning') return 'Dükkân zaten açık.';
  const len = BAL.dayEnd - BAL.dayStart;
  // yeni gelinen kasabada karavanı merak edenler de uğrar
  const newTown = S.town !== S.prevTown;
  // hava ve etkinlik kalabalığı çarpar; süs ve yeni kasaba ilgisi üstüne eklenir
  const mods = dayMods(S.day, S.town);
  const base = Math.round(TOWNS[S.town].traffic * spotOf(S).traffic * mods.traffic) + effects(S).traffic + (newTown ? BAL.newTownTraffic : 0);
  const n = Math.max(4, base + rndInt(S, BAL.trafficJitter * 2 + 1) - BAL.trafficJitter);
  const times = [];
  for (let i = 0; i < n; i++) {
    // yarısı gün boyuna yayılır, yarısı öğleden sonraya yığılır (iki zarın ortalaması)
    const u = i % 2 ? rnd(S) : (rnd(S) + rnd(S)) / 2 * 0.8 + 0.15;
    times.push(Math.round(BAL.dayStart + 10 + u * (len - 40)));
  }
  times.sort((a, b) => a - b);
  S.phase = 'open';
  if (!S.visited.includes(S.town)) S.visited.push(S.town);
  S.clock = BAL.dayStart;
  S.arrivals = times;
  // kasabanın müdavimleri bazı günler uğrar
  S.regArrivals = REGULAR_KEYS.filter(id => REGULARS[id].town === S.town && rnd(S) < VISIT_CHANCE)
    .map(id => ({ id, t: Math.round(BAL.dayStart + 30 + rnd(S) * (len - 90)) })).sort((a, b) => a.t - b.t);
  S.today = { town: S.town, spot: S.spot, newTown, weather: weatherOf(S.day), event: mods.event, visitors: 0, sold: {}, missed: {}, revenue: 0, tips: 0, recs: { perfect: 0, good: 0, miss: 0 } };
  return null;
}

// Saati ilerletir, saati gelen müşterileri döndürür
export function advanceClock(S, minutes) {
  if (S.phase !== 'open') return [];
  S.clock = Math.min(S.clock + minutes, BAL.dayEnd);
  const due = [];
  while (S.arrivals.length && S.arrivals[0] <= S.clock) { S.arrivals.shift(); due.push(makeCustomer(S)); }
  while (S.regArrivals.length && S.regArrivals[0].t <= S.clock) due.push(makeRegular(S, S.regArrivals.shift().id));
  return due;
}

export const closingTime = S => S.phase === 'open' && S.clock >= BAL.dayEnd && !S.arrivals.length && !S.regArrivals.length;

export function closeShop(S) {
  if (S.phase !== 'open') return null;
  const T = S.today;
  T.soldCount = Object.values(T.sold).reduce((a, b) => a + b, 0);
  S.totals.days++;
  S.totals.sold += T.soldCount;
  S.totals.revenue += T.revenue;
  if (T.event) S.totals.festivals++;
  T.page = checkStory(S, T);
  S.lastDay = T;
  S.prevTown = S.town;
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
  // öneri isteyene raftaki en uygun kitap verilir (dikkatli oyuncu)
  for (const c of advanceClock(S, BAL.dayEnd - BAL.dayStart)) {
    if (c.ask) recommend(S, c, bestBook(S, c.ask)); else resolveCustomer(S, c);
  }
  const T = closeShop(S);
  nextMorning(S);
  return T;
}
