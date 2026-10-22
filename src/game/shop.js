// Sabah işleri (koli almak, yola çıkmak) ve gün içinde müşterinin karar vermesi.
// Eylemler başarısızsa nedenini metin olarak döndürür, başarılıysa null.
import { BAL } from '../data/balance.js';
import { GENRES, GENRE_KEYS } from '../data/genres.js';
import { TOWNS } from '../data/towns.js';
import { rnd, weighted } from '../core/rng.js';
import { shelfCount } from './state.js';

export const boxCost = g => GENRES[g].cost * BAL.boxSize;

export function canBuyBox(S, g) {
  if (!GENRES[g]) return 'Böyle bir tür yok.';
  if (S.phase !== 'morning') return 'Koli yalnızca sabah alınır.';
  if (shelfCount(S) + BAL.boxSize > BAL.shelfCap) return 'Raflarda yer yok.';
  if (S.coins < boxCost(g)) return 'Paran yetmiyor.';
  return null;
}

export function buyBox(S, g) {
  const why = canBuyBox(S, g);
  if (why) return why;
  const cost = boxCost(g);
  S.coins -= cost;
  S.totals.spent += cost;
  S.stock[g] += BAL.boxSize;
  return null;
}

export function canTravel(S, key) {
  if (!TOWNS[key]) return 'Böyle bir kasaba yok.';
  if (S.phase !== 'morning') return 'Yola yalnızca sabah çıkılır.';
  if (key === S.town) return 'Zaten buradasın.';
  if (S.travelled) return 'Bugün zaten yol yaptın.';
  if (S.coins < BAL.travelCost) return 'Yakıt parası yok.';
  return null;
}

export function travel(S, key) {
  const why = canTravel(S, key);
  if (why) return why;
  S.coins -= BAL.travelCost;
  S.totals.spent += BAL.travelCost;
  S.town = key;
  S.travelled = true;
  return null;
}

// Kasa boş, raflar boş: oyun kilitlenmesin diye en ucuz koliyi alacak kadar destek
export function rescue(S) {
  const cheapest = Math.min(...GENRE_KEYS.map(boxCost));
  if (S.phase !== 'morning' || shelfCount(S) > 0 || S.coins >= cheapest) return 0;
  const gift = cheapest - S.coins;
  S.coins += gift;
  return gift;
}

// Kasabada en çok aranan türler (sabah ipucu)
export function topDemand(townKey, n = 2) {
  const d = TOWNS[townKey].demand;
  return Object.keys(d).sort((a, b) => d[b] - d[a]).slice(0, n);
}

export function makeCustomer(S) {
  return { id: S.nextId++, wants: weighted(S, TOWNS[S.town].demand), look: Math.floor(rnd(S) * 1e9) };
}

// Müşteri raflara baktı: ne aldı, ne kadar ödedi, mutlu mu. Stok ve defter burada güncellenir.
export function resolveCustomer(S, c) {
  const T = S.today;
  const res = { bought: [], paid: 0, happy: false };
  const take = g => { S.stock[g]--; res.bought.push(g); res.paid += GENRES[g].price; T.sold[g] = (T.sold[g] || 0) + 1; };
  T.visitors++;
  if (S.stock[c.wants] > 0 && rnd(S) < BAL.buyChance) {
    take(c.wants);
    res.happy = true;
    if (S.stock[c.wants] > 0 && rnd(S) < BAL.extraChance) take(c.wants);
  } else {
    if (S.stock[c.wants] === 0) T.missed[c.wants] = (T.missed[c.wants] || 0) + 1;
    const avail = {};
    for (const g of GENRE_KEYS) if (S.stock[g] > 0) avail[g] = TOWNS[S.town].demand[g];
    if (Object.keys(avail).length && rnd(S) < BAL.altChance) take(weighted(S, avail));
  }
  S.coins += res.paid;
  T.revenue += res.paid;
  return res;
}
