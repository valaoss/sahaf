// Gün döngüsü: dükkânı aç → saat ilerledikçe müşteri gelir → kapanış özeti → ertesi sabah.
import { BAL } from '../data/balance.js';
import { TOWNS } from '../data/towns.js';
import { rnd, rndInt } from '../core/rng.js';
import { REGULARS, REGULAR_KEYS, VISIT_CHANCE } from '../data/regulars.js';
import { makeCustomer, makeRegular, resolveCustomer, recommend, bestBook, spotOf, rescue, parkFee, upkeepOf, decaySat, sponsoredToday } from './shop.js';
import { effects } from './decor.js';
import { dayMods, weatherOf } from './calendar.js';
import { checkStory, checkUnlocks } from './story.js';
import { checkStamps } from './stamps.js';
import { morningLetter, offerQuest, settleQuest } from './mail.js';
import { scheduleHappenings, dueHappening, chooseHappening, buffFor, HAP } from './happenings.js';
import { tidiness, placeAll } from './shelving.js';
import { checkCountries } from './travel.js';
import { satFactor } from './shop.js';
import { addRep, repLevel, receiveOrders, keepsakeTraffic } from './bonds.js';
import { onIsland, resolveAuction, roseDay, checkVoyage, checkGrand, voyageMorning, stat } from './voyage.js';

export function openShop(S) {
  if (S.phase !== 'morning') return 'Dükkân zaten açık.';
  const len = BAL.dayEnd - BAL.dayStart;
  // yeni gelinen kasabada karavanı merak edenler de uğrar
  const newTown = S.town !== S.prevTown;
  // hava ve etkinlik kalabalığı çarpar; süs ve yeni kasaba ilgisi üstüne eklenir
  const mods = dayMods(S.day, S.town);
  // düzenli raf (etiketine uygun bölümler) biraz daha kalabalık çeker
  const tidy = 1 + BAL.tidyBonus * tidiness(S);
  // okuma köşesi bağışlanan kasaba ve sponsor olunan festival daha kalabalık
  // en yüksek itibar (kasabanın sahafı) da kalabalığı artırır; hatıralar kendi kasabalarında birer ziyaretçi getirir
  const civic = (S.donated.includes(S.town) ? BAL.donateTraffic : 1) * (sponsoredToday(S) ? BAL.sponsorTraffic : 1) * (repLevel(S) >= 3 ? 1.08 : 1)
    * (roseDay(S) ? BAL.roseDayTraffic : 1);
  const base = Math.round(TOWNS[S.town].traffic * spotOf(S).traffic * mods.traffic * buffFor(S) * tidy * civic) + effects(S).traffic + keepsakeTraffic(S) + (newTown ? BAL.newTownTraffic : 0);
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
  const spotKey = S.town + '/' + S.spot, w = weatherOf(S.day);
  if (!S.spotsSeen.includes(spotKey)) S.spotsSeen.push(spotKey);
  if (!S.weathersSeen.includes(w)) S.weathersSeen.push(w);
  S.clock = BAL.dayStart;
  S.arrivals = times;
  // kasabanın müdavimleri bazı günler uğrar
  // sevilen bir kasabada müdavimler daha sık uğrar
  const visit = VISIT_CHANCE * (repLevel(S) >= 2 ? 1.5 : 1);
  S.regArrivals = REGULAR_KEYS.filter(id => REGULARS[id].town === S.town && rnd(S) < visit)
    .map(id => ({ id, t: Math.round(BAL.dayStart + 30 + rnd(S) * (len - 90)) })).sort((a, b) => a.t - b.t);
  scheduleHappenings(S);
  S.today = { town: S.town, spot: S.spot, newTown, weather: weatherOf(S.day), event: mods.event, visitors: 0, sold: {}, missed: {}, revenue: 0, tips: 0, recs: { perfect: 0, good: 0, miss: 0 },
    secSold: [0, 0, 0, 0, 0, 0], sponsored: sponsoredToday(S), costs: { park: parkFee(S), upkeep: upkeepOf(S) },
    island: onIsland(S), roseDay: roseDay(S) };
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

export const closingTime = S => S.phase === 'open' && S.clock >= BAL.dayEnd && !S.arrivals.length && !S.regArrivals.length && !S.haps.length;

export function closeShop(S) {
  if (S.phase !== 'open') return null;
  const T = S.today;
  T.soldCount = Object.values(T.sold).reduce((a, b) => a + b, 0);
  // giderler: park (sabah, mekâna göre belirlendi) ve bakım; kasa eksiye düşmez
  const due = T.costs.park + T.costs.upkeep, paid = Math.min(S.coins, due);
  S.coins -= paid;
  S.totals.spent += paid;
  T.costs.paid = paid;
  T.net = T.revenue - paid;
  // fiyat ünü: vazgeçenler ve ikna olanlar ertesi gün bu kasabada konuşur
  const word = Math.min(BAL.wordMax, Math.max(BAL.wordMin, 1 + BAL.wordOfMouth * ((T.priceWon || 0) - (T.priceLost || 0))));
  if (word !== 1) S.buffs.push({ day: S.day + 1, traffic: word, town: T.town, word: true });
  T.word = word;
  // bu kasabada doymuş türler (gün sonu teşhisi)
  T.saturated = Object.keys(S.sat[S.town] || {}).filter(g => satFactor(S, g) < 0.6);
  S.totals.days++;
  S.totals.sold += T.soldCount;
  S.totals.revenue += T.revenue;
  if (T.revenue > S.totals.bestDay) { S.totals.bestDay = T.revenue; S.totals.bestDayNo = S.day; }
  S.townDays[T.town] = (S.townDays[T.town] || 0) + 1;
  if (T.event) {
    S.totals.festivals++;
    if (!S.festKinds.includes(T.event)) S.festKinds.push(T.event);
  }
  // Akdeniz'in işleri: ada günü, müzayede, solan güller
  if (T.island) S.voyage.stats.islandDays = stat(S, 'islandDays') + 1;
  T.auction = resolveAuction(S);
  T.rosesLeft = S.voyage.roses;
  S.voyage.roses = 0;
  // itibar: dükkân açılan her gün bir puan
  const up = addRep(S, T.town, 1);
  if (up) T.repUp = up;
  T.quest = settleQuest(S, T);
  T.page = checkStory(S, T);
  T.unlocked = checkUnlocks(S);
  T.countries = checkCountries(S);
  T.voyage = checkVoyage(S);
  T.grand = checkGrand(S, T);
  T.stamps = checkStamps(S);
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
  // sabah postası: geçmiş önerilerden mektup, gazetede yeni ilan
  S.post = { letter: morningLetter(S), quest: offerQuest(S), orders: receiveOrders(S), bq: voyageMorning(S) };
  decaySat(S);
  if (S.sponsor && S.sponsor.day < S.day) S.sponsor = null;
  S.readsToday = 0;
}

// Feribotla varış: denizde bir gün geçti (game/travel.js crossBorder), bu sabahın işleri yapılır.
// Yolda kaçan günün "yarın kalabalık" etkisi varış gününe kayar. Dönüş: kasa boşsa belediye desteği (₺)
export function afterFerry(S) {
  for (const b of S.buffs) if (b.day === S.day - 1) b.day = S.day;
  S.post = { letter: morningLetter(S), quest: offerQuest(S), orders: receiveOrders(S), bq: voyageMorning(S) };
  decaySat(S);
  if (S.sponsor && S.sponsor.day < S.day) S.sponsor = null;
  S.readsToday = 0;
  return rescue(S);
}

// Başsız tam gün: test ve denge simülasyonu için. rec(S, ask, wants): öneri isteyene verilecek kitap (varsayılan: her şeyi bilen)
export function simulateDay(S, pick = () => 0, rec = (S, ask) => bestBook(S, ask)) {
  placeAll(S);
  openShop(S);
  // yarım saatlik adımlar: olaylar zamanında çıksın; öneri isteyene raftaki en uygun kitap, olayda pick(seçenekler)
  while (!closingTime(S)) {
    for (const c of advanceClock(S, 30)) {
      if (c.ask) recommend(S, c, rec(S, c.ask, c.wants)); else resolveCustomer(S, c);
    }
    for (let h; (h = dueHappening(S));) chooseHappening(S, h, pick(HAP[h].choices.length));
  }
  const T = closeShop(S);
  nextMorning(S);
  return T;
}
