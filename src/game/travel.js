// Yolculuk: aynı ülkede karayolu (mesafeye göre yakıt), başka ülkeye feribot (pahalı, bir gün sürer, pasaporta damga).
// Ülkeler sırayla açılır (data/countries.js unlock); açılan ülkenin kendi koşulu olmayan şehirleri de yola açılır.
import { TOWNS, TOWN_KEYS } from '../data/towns.js';
import { COUNTRIES, COUNTRY_KEYS } from '../data/countries.js';
import { BAL } from '../data/balance.js';
import { storyDone } from './story.js';
import { FEATURES } from '../data/features.js';

export const countryOf = k => TOWNS[k]?.country || 'tr';
// haritada görünen ve gidilebilen ülkeler: Akdeniz kenara alınınca yalnız Türkiye (data/features.js)
export const openCountries = S => FEATURES.akdeniz ? S.countries : S.countries.filter(c => c === 'tr');

// iki şehir arası kuş uçuşu mesafe (derece; boylam enleme göre kısalır)
export function distance(a, b) {
  const [x1, y1] = TOWNS[a].geo, [x2, y2] = TOWNS[b].geo;
  return Math.hypot((x2 - x1) * Math.cos((y1 + y2) / 2 * Math.PI / 180), y2 - y1);
}

// yol bilgisi: { abroad, cost, days }
export function travelInfo(S, key) {
  // Mürekkep Koyu içinde araba itilerek gidilir: ücretsiz
  if (TOWNS[key]?.koy && TOWNS[S.town]?.koy) return { abroad: false, cost: 0, days: 0 };
  const abroad = countryOf(key) !== countryOf(S.town), d = distance(S.town, key);
  const cost = abroad ? Math.min(BAL.ferryMax, Math.max(BAL.ferryMin, Math.round(BAL.ferryMin + d * BAL.ferryPerDeg)))
    : Math.max(BAL.travelCost, Math.round(d * BAL.roadPerDeg));
  return { abroad, cost, days: abroad ? 1 : 0 };
}

const visitedIn = (S, c) => S.visited.filter(k => countryOf(k) === c).length;

function countryReady(S, c) {
  const u = COUNTRIES[c].unlock;
  if (!u) return true;
  if (u.story && !storyDone(S)) return false;
  if (u.visited && visitedIn(S, u.visited.country) < u.visited.n) return false;
  if (u.stamps && Object.keys(S.passport).length < u.stamps) return false;
  return true;
}

// gün sonunda: yeni açılan ülkeler (şehirleri de yola açılır). Dönüş: açılan ülke kodları
export function checkCountries(S) {
  const opened = [];
  for (const c of COUNTRY_KEYS) {
    if (S.countries.includes(c) || !countryReady(S, c)) continue;
    S.countries.push(c);
    opened.push(c);
    for (const k of TOWN_KEYS) if (countryOf(k) === c && !TOWNS[k].unlock && !S.unlocked.includes(k)) S.unlocked.push(k);
  }
  return opened;
}

// feribotla varınca: yolculuk günü geçer, ilk kez girilen ülkenin damgası basılır
export function crossBorder(S, key) {
  S.day += 1;
  const c = countryOf(key);
  const fresh = !S.passport[c];
  if (fresh) S.passport[c] = S.day;
  return fresh ? c : null;
}
