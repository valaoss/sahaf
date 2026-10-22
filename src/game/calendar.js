// Günün havası ve etkinliği: gün numarasından sabit üretilir (kayıttan ve RNG'den bağımsız).
import { seeded } from '../core/rng.js';
import { WEATHER, EVENTS, EVENT_CHANCE, GOSSIP, SEASON, SPECIAL } from '../data/calendar.js';
import { seasonOf, dayOfSeason } from './state.js';

// ardışık günler birbirine benzemesin: gün numarasını karıştırıp tohum yap
function dayRng(day, salt) {
  let n = (day * 31 + salt) | 0;
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return seeded(((n ^ (n >>> 16)) >>> 0) % 2147483646 + 1);
}

// table: { anahtar: ağırlık }
function pickWeighted(r, table) {
  const keys = Object.keys(table);
  let x = r() * keys.reduce((n, k) => n + table[k], 0);
  for (const k of keys) { x -= table[k]; if (x < 0) return k; }
  return keys[0];
}

// ilk gün hep güneşli: yeni oyuncu sakin bir başlangıç yapsın
export const weatherOf = day => day === 1 ? 'gunesli' : pickWeighted(dayRng(day, 13), SEASON[seasonOf(day)].weather);

export function eventOf(day) {
  const r = dayRng(day, 5);
  if (r() >= EVENT_CHANCE) return null;
  const keys = Object.keys(EVENTS);
  return keys[Math.floor(r() * keys.length)];
}

export const gossipOf = day => GOSSIP[Math.floor(dayRng(day, 3)() * GOSSIP.length)];

// Bugün bütün kasabalarda özel bir gün mü?
export const specialOf = day => SPECIAL[seasonOf(day)]?.[dayOfSeason(day)] || null;

// Bugün bu kasabada geçerli çarpanlar
export function dayMods(day, town) {
  const w = WEATHER[weatherOf(day)], se = SEASON[seasonOf(day)], ek = eventOf(day), e = ek && EVENTS[ek].town === town ? EVENTS[ek] : null;
  const demand = { ...(w.demand || {}) };
  for (const g in e?.demand || {}) demand[g] = (demand[g] || 1) * e.demand[g];
  const sp = specialOf(day);
  for (const g in sp?.demand || {}) demand[g] = (demand[g] || 1) * sp.demand[g];
  return {
    traffic: w.traffic * se.traffic * (e ? e.traffic : 1) * (sp ? sp.traffic : 1),
    ask: w.ask * se.ask * (e ? e.ask : 1) * (sp ? sp.ask : 1),
    special: sp ? sp.id : null,
    arch: sp?.arch || {},
    rare: sp?.rare || 1,
    tip: sp?.tip || 0,
    demand,
    event: e ? ek : null,
  };
}
